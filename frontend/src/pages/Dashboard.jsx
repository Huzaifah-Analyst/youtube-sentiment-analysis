import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, Title } from '@tremor/react'
import { motion } from 'framer-motion'
import KPIStrip from '../components/dashboard/KPIStrip'
import SentimentDonut from '../components/dashboard/SentimentDonut'
import SentimentTrendLine from '../components/dashboard/SentimentTrendLine'
import WordCloudComponent from '../components/dashboard/WordCloudComponent'
import NGramBarChart from '../components/dashboard/NGramBarChart'
import RadarChartComponent from '../components/dashboard/RadarChartComponent'
import SearchBar from '../components/input/SearchBar'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../components/ui/Toast'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

// KPI Card with icon and gradient accent
function KPICard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '20px',
      flex: 1,
      minWidth: '160px',
    }} className="card-glow">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${color}33, ${color}22)`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem'
        }}>{icon}</div>
        <p style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, margin: 0 }}>{label}</p>
      </div>
      <p style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{sub}</p>}
    </div>
  )
}

// Skeleton card for loading state
function SkeletonCard({ height = 200 }) {
  return (
    <div className="skeleton" style={{
      width: '100%', height,
      borderRadius: '16px',
    }} />
  )
}

function SkeletonResults() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px' }}>
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SkeletonCard height={280} />
        <SkeletonCard height={280} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
      </div>
      <SkeletonCard height={260} />
    </div>
  )
}

function Dashboard() {
  const { token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isHistorical, setIsHistorical] = useState(false)

  useEffect(() => {
    if (location.state?.historicalData) {
      setData(location.state.historicalData)
      setIsHistorical(true)
    }
  }, [location.state])

  const handleReset = () => {
    setData(null)
    setIsHistorical(false)
    navigate('/', { replace: true })
  }

  const handleExportCSV = () => {
    if (!data || !data.comments) return;
    const headers = ['comment_text', 'sentiment_label', 'emotion_label'];
    const csvContent = [
      headers.join(','),
      ...data.comments.map(c => `"${(c.text || '').replace(/"/g, '""')}","${c.sentiment || 'neutral'}","${c.emotion || 'neutral'}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = data.video_info?.title ? data.video_info.title.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : 'video';
    link.setAttribute('download', `${safeTitle}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleAnalyze = async (url) => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze`, {
        video_url: url
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setData(response.data)
      showToast('Analysis complete! 🎉', 'success')
      if (token) {
        setTimeout(() => showToast('Saved to history!', 'indigo'), 800)
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'An error occurred while analyzing.'
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg))
      showToast('Analysis failed!', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Derive KPI values from data
  const kpiCards = data ? [
    {
      icon: '💬',
      label: 'Comments Analyzed',
      value: data.comments?.length || 0,
      sub: data.filtered_count ? `${data.filtered_count} filtered` : undefined,
      color: '#6366f1'
    },
    {
      icon: '📊',
      label: 'Polarity Score',
      value: data.kpi?.sentiment_score >= 0 ? `+${data.kpi.sentiment_score}` : data.kpi?.sentiment_score,
      sub: data.kpi?.sentiment_score >= 0.3 ? 'Positive leaning' : data.kpi?.sentiment_score <= -0.3 ? 'Negative leaning' : 'Mixed',
      color: data.kpi?.sentiment_score >= 0 ? '#10b981' : '#ef4444'
    },
    {
      icon: '✅',
      label: 'Positive %',
      value: `${data.sentiment_distribution?.positive ?? 0}%`,
      sub: 'of analyzed comments',
      color: '#10b981'
    },
    {
      icon: '⚠️',
      label: 'Toxic %',
      value: `${data.toxic_percentage ?? 0}%`,
      sub: 'anger + disgust',
      color: data.toxic_percentage > 35 ? '#ef4444' : data.toxic_percentage > 20 ? '#f59e0b' : '#10b981'
    }
  ] : []

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {isHistorical && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
            padding: '16px 20px',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>📂</span>
            <p style={{ margin: 0, fontWeight: 500 }}>Viewing Historical Analysis — Click 'New Analysis' to analyze a new video</p>
          </div>
          <button
            onClick={handleReset}
            className="btn-gradient"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            New Analysis
          </button>
        </motion.div>
      )}

      {!isHistorical && <SearchBar onAnalyze={handleAnalyze} loading={loading} />}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            padding: '14px 20px',
            borderRadius: '14px',
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Skeleton Loader */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            textAlign: 'center', padding: '24px 0 32px',
            color: '#6366f1', fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <div style={{
              width: '20px', height: '20px',
              border: '3px solid rgba(99,102,241,0.3)',
              borderTopColor: '#6366f1',
              borderRadius: '50%'
            }} className="spin" />
            Analyzing comments… this may take a moment
          </div>
          <SkeletonResults />
        </motion.div>
      )}

      {!data && !loading && !error && !isHistorical && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 32px' }}
        >
          <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '28px' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
              animation: 'orb-float 4s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute', inset: '12px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px'
            }}>
              📊
            </div>
          </div>
          <h2 style={{
            fontSize: '1.6rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '12px', textAlign: 'center'
          }}>
            Audience Sentiment Awaits
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '420px', textAlign: 'center', lineHeight: 1.6 }}>
            Enter a YouTube URL above to analyze audience sentiment — word cloud, emotion radar, trend lines and more.
          </p>
        </motion.div>
      )}

      {data && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Toxicity warning */}
          {data.toxic_percentage > 35 && (
            <motion.div variants={itemVariants} style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
              padding: '14px 20px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>High Toxicity Detected</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#d97706' }}>
                  This video's comments show elevated levels of anger and disgust ({data.toxic_percentage}%).
                </p>
              </div>
            </motion.div>
          )}

          {/* KPI Cards row */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {kpiCards.map((card, idx) => (
              <KPICard key={idx} {...card} />
            ))}
          </motion.div>

          {/* Results header with spam filter badge + export */}
          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.4rem', margin: 0 }}>Analysis Results</h2>
              {(data.filtered_count > 0 || data.total_fetched) && (
                <span style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a5b4fc',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  📊 Analyzed {data.comments?.length} comments
                  {data.filtered_count > 0 && ` (${data.filtered_count} filtered)`}
                </span>
              )}
            </div>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#6ee7b7',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
            >
              📥 Download CSV
            </button>
          </motion.div>

          {/* Video info + KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
            <motion.div variants={itemVariants}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
                height: '100%'
              }} className="card-glow">
                <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img
                    src={data.video_info.thumbnail}
                    alt="Thumbnail"
                    style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {data.video_info.title}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>{data.video_info.channel}</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <KPIStrip kpi={data.kpi} totalComments={data.video_info.total_comments} />
            </motion.div>
          </div>

          {/* Donut + Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <motion.div variants={itemVariants}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px'
              }} className="card-glow">
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Sentiment Distribution</p>
                <SentimentDonut distribution={data.sentiment_distribution} score={data.kpi.sentiment_score} />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px'
              }} className="card-glow">
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Sentiment Trend</p>
                <SentimentTrendLine data={data.trend_data} />
              </div>
            </motion.div>
          </div>

          {/* Word Cloud + N-Grams */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <motion.div variants={itemVariants}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px'
              }} className="card-glow">
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Topic Word Cloud</p>
                <WordCloudComponent data={data.word_cloud_data} />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px'
              }} className="card-glow">
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Top Phrases (N-Grams)</p>
                <NGramBarChart data={data.ngram_data} />
              </div>
            </motion.div>
          </div>

          {/* Emotion Radar */}
          <motion.div variants={itemVariants}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }} className="card-glow">
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>Emotion Radar</p>
              <RadarChartComponent data={data.emotion_distribution} />
            </div>
          </motion.div>

          {/* ML Badge */}
          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '999px',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#818cf8', fontSize: '0.8rem', fontWeight: 500
            }}>
              <span>🤖</span>
              <span>AI Model: RoBERTa (HuggingFace)</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard
