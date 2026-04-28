import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, BarChart2, Trash2 } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      setError("Failed to load history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete analysis record.");
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay > 30) return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const getSentimentInfo = (resultsJson) => {
    try {
      const data = JSON.parse(resultsJson);
      const pos = data.sentiment_distribution.positive;
      const neg = data.sentiment_distribution.negative;
      if (pos > neg) return { label: '😊 Positive', bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: 'rgba(16,185,129,0.3)' };
      if (neg > pos) return { label: '😠 Negative', bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' };
      return { label: '😐 Neutral', bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' };
    } catch {
      return { label: 'Unknown', bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.2)' };
    }
  };

  const extractVideoId = (url) => {
    const patterns = [
      /(?:v=|\/)([0-9A-Za-z_-]{11}).*/,
      /(?:youtu\.be\/)([0-9A-Za-z_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url?.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px',
        border: '4px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1',
        borderRadius: '50%'
      }} className="spin" />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading your history…</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.8rem', margin: '0 0 6px' }}>Analysis History</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>All your past YouTube analyses</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '80px 40px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📭</div>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.3rem', marginBottom: '10px' }}>No analyses yet</h3>
          <p style={{ color: '#64748b', marginBottom: '28px' }}>Go analyze your first video to see results here!</p>
          <button
            onClick={() => navigate('/')}
            className="btn-gradient"
            style={{ padding: '10px 28px' }}
          >
            ✨ Analyze First Video
          </button>
        </motion.div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 160px 140px 160px',
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {['Thumb', 'Video', 'Analyzed', 'Sentiment', 'Actions'].map(h => (
              <span key={h} style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {history.map((item, idx) => {
            const sentiment = getSentimentInfo(item.results_json);
            const videoId = extractVideoId(item.video_url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

            return (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 160px 140px 160px',
                  padding: '16px 24px',
                  borderBottom: idx < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Thumbnail */}
                <div>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Thumb"
                      style={{ width: '68px', height: '46px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ width: '68px', height: '46px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎬</div>
                  )}
                </div>

                {/* Title */}
                <div style={{ paddingRight: '16px' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {item.video_title}
                  </p>
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6366f1', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View on YouTube <ExternalLink size={10} />
                  </a>
                </div>

                {/* Date */}
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>{getRelativeTime(item.analyzed_at)}</p>
                </div>

                {/* Sentiment badge */}
                <div>
                  <span style={{
                    background: sentiment.bg,
                    color: sentiment.color,
                    border: `1px solid ${sentiment.border}`,
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    {sentiment.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const data = JSON.parse(item.results_json);
                      navigate('/', { state: { historicalData: data } });
                    }}
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <BarChart2 size={13} /> View
                  </button>
                  <button
                    onClick={() => deleteAnalysis(item.id)}
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default History;
