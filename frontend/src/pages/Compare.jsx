import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Title } from '@tremor/react'
import { GitCompareArrows, Trophy, Loader2, AlertCircle, BarChart2, Zap } from 'lucide-react'
import SentimentDonut from '../components/dashboard/SentimentDonut'
import RadarChartComponent from '../components/dashboard/RadarChartComponent'
import NGramBarChart from '../components/dashboard/NGramBarChart'
import { useAuth } from '../context/AuthContext'

// ─── tiny helpers ────────────────────────────────────────────────────────────

const BLUE_PANEL = {
  background: 'rgba(30,58,138,0.10)',
  border: '2px solid rgba(99,102,241,0.45)',
  borderRadius: '18px',
  padding: '24px',
  boxShadow: '0 0 24px rgba(99,102,241,0.08)',
}

const PURPLE_PANEL = {
  background: 'rgba(88,28,135,0.10)',
  border: '2px solid rgba(139,92,246,0.45)',
  borderRadius: '18px',
  padding: '24px',
  boxShadow: '0 0 24px rgba(139,92,246,0.08)',
}

const CARD = {
  background: 'rgba(17,24,39,0.6)',
  border: '1px solid rgba(55,65,81,0.5)',
  borderRadius: '12px',
  padding: '16px',
  backdropFilter: 'blur(12px)',
  marginBottom: '16px',
}

function ScoreBadge({ value }) {
  const positive = value > 0
  const neutral = value === 0
  const color = positive ? '#34d399' : neutral ? '#9ca3af' : '#f87171'
  return (
    <span style={{ color, fontWeight: 700, fontSize: '1.5rem' }}>
      {value > 0 ? '+' : ''}{value}
    </span>
  )
}

function ToxicBadge({ pct }) {
  const color = pct > 20 ? '#f87171' : pct > 10 ? '#fb923c' : '#34d399'
  return (
    <span style={{ color, fontWeight: 700, fontSize: '1.4rem' }}>{pct}%</span>
  )
}

// ─── single video panel ───────────────────────────────────────────────────────

function VideoPanel({ data, error, loading, label, panelStyle, accentColor }) {
  if (loading) {
    return (
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: accentColor }} />
        <p style={{ color: '#9ca3af', fontWeight: 500 }}>Analyzing {label}…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <AlertCircle size={36} style={{ color: '#f87171' }} />
        <p style={{ color: '#f87171', fontWeight: 600, textAlign: 'center' }}>{label} failed</p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', maxWidth: '300px' }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { video_info, kpi, sentiment_distribution, emotion_distribution, toxic_percentage, ngram_data } = data
  const topNgrams = ngram_data?.slice(0, 3) ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={panelStyle}
    >
      {/* Video info */}
      <div style={{ ...CARD, display: 'flex', gap: '14px', alignItems: 'center' }}>
        <img
          src={video_info.thumbnail}
          alt="Thumbnail"
          style={{ width: '96px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ color: '#f3f4f6', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {video_info.title}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px' }}>{video_info.channel}</p>
          <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            💬 {video_info.total_comments?.toLocaleString()} comments
          </p>
        </div>
      </div>

      {/* Polarity score */}
      <div style={{ ...CARD, textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Polarity Score</p>
        <ScoreBadge value={kpi.sentiment_score} />
      </div>

      {/* Donut */}
      <div style={CARD}>
        <p style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '8px', fontSize: '0.875rem' }}>Sentiment Distribution</p>
        <SentimentDonut distribution={sentiment_distribution} score={kpi.sentiment_score} />
      </div>

      {/* Top 3 N-grams */}
      <div style={CARD}>
        <p style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>Top 3 Phrases</p>
        {topNgrams.length > 0 ? topNgrams.map((ng, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: accentColor + '33', color: accentColor, fontWeight: 700, fontSize: '0.75rem', borderRadius: '4px', padding: '2px 6px', minWidth: '22px', textAlign: 'center' }}>
              #{idx + 1}
            </span>
            <span style={{ color: '#d1d5db', fontSize: '0.875rem', flex: 1 }}>{ng.text}</span>
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>×{ng.count}</span>
          </div>
        )) : <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No phrases found</p>}
      </div>

      {/* Emotion Radar */}
      <div style={CARD}>
        <p style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '8px', fontSize: '0.875rem' }}>Emotion Radar</p>
        <RadarChartComponent data={emotion_distribution} />
      </div>

      {/* Toxicity */}
      <div style={{ ...CARD, textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Toxicity</p>
        <ToxicBadge pct={toxic_percentage} />
        {toxic_percentage > 20 && (
          <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>⚠️ High toxicity detected</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({ v1, v2 }) {
  if (!v1 || !v2) return null

  const metrics = [
    {
      label: 'Positive %',
      v1Val: v1.sentiment_distribution.positive,
      v2Val: v2.sentiment_distribution.positive,
      unit: '%',
      higherIsBetter: true,
    },
    {
      label: 'Negative %',
      v1Val: v1.sentiment_distribution.negative,
      v2Val: v2.sentiment_distribution.negative,
      unit: '%',
      higherIsBetter: false,
    },
    {
      label: 'Neutral %',
      v1Val: v1.sentiment_distribution.neutral,
      v2Val: v2.sentiment_distribution.neutral,
      unit: '%',
      higherIsBetter: null, // no winner
    },
    {
      label: 'Polarity Score',
      v1Val: v1.kpi.sentiment_score,
      v2Val: v2.kpi.sentiment_score,
      unit: '',
      higherIsBetter: true,
      showSign: true,
    },
    {
      label: 'Toxicity %',
      v1Val: v1.toxic_percentage,
      v2Val: v2.toxic_percentage,
      unit: '%',
      higherIsBetter: false,
    },
    {
      label: 'Total Comments',
      v1Val: v1.video_info.total_comments,
      v2Val: v2.video_info.total_comments,
      unit: '',
      higherIsBetter: null,
    },
  ]

  const getWinner = (row) => {
    if (row.higherIsBetter === null) return null
    if (row.v1Val === row.v2Val) return 'tie'
    if (row.higherIsBetter) return row.v1Val > row.v2Val ? 'v1' : 'v2'
    return row.v1Val < row.v2Val ? 'v1' : 'v2'
  }

  const fmt = (val, row) => {
    const prefix = row.showSign && val > 0 ? '+' : ''
    return `${prefix}${val}${row.unit}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        background: 'rgba(17,24,39,0.7)',
        border: '1px solid rgba(55,65,81,0.6)',
        borderRadius: '16px',
        padding: '28px',
        backdropFilter: 'blur(16px)',
        marginTop: '32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Trophy size={20} style={{ color: '#fbbf24' }} />
        <h3 style={{ color: '#f9fafb', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Comparison Summary</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr>
              {['Metric', 'Video 1', 'Video 2', 'Winner'].map(h => (
                <th key={h} style={{ textAlign: h === 'Metric' ? 'left' : 'center', padding: '10px 14px', color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(55,65,81,0.6)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, idx) => {
              const winner = getWinner(row)
              const v1Better = winner === 'v1'
              const v2Better = winner === 'v2'
              const rowBg = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              return (
                <tr key={row.label} style={{ background: rowBg }}>
                  <td style={{ padding: '12px 14px', color: '#e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>{row.label}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: v1Better ? '#34d399' : '#d1d5db', fontWeight: v1Better ? 700 : 400, fontSize: '0.9rem' }}>
                    {fmt(row.v1Val, row)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: v2Better ? '#34d399' : '#d1d5db', fontWeight: v2Better ? 700 : 400, fontSize: '0.9rem' }}>
                    {fmt(row.v2Val, row)}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {winner === 'v1' && <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', fontWeight: 600, fontSize: '0.8rem', padding: '3px 10px', borderRadius: '999px' }}>V1 ✅</span>}
                    {winner === 'v2' && <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', fontWeight: 600, fontSize: '0.8rem', padding: '3px 10px', borderRadius: '999px' }}>V2 ✅</span>}
                    {winner === 'tie' && <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Tie</span>}
                    {winner === null && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function Compare() {
  const { token } = useAuth()
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)   // { video1, video2, errors? }
  const [globalError, setGlobalError] = useState('')

  const handleCompare = async () => {
    if (!url1.trim() || !url2.trim()) {
      setGlobalError('Please enter both YouTube URLs.')
      return
    }
    setLoading(true)
    setGlobalError('')
    setData(null)

    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/compare`,
        { url1: url1.trim(), url2: url2.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      setData(resp.data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Comparison failed.'
      setGlobalError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const hasResults = data && (data.video1 || data.video2)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '36px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitCompareArrows size={22} color="#fff" />
          </div>
          <h2 style={{ color: '#f9fafb', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
            Multi-Video Comparison
          </h2>
        </div>
        <p style={{ color: '#9ca3af', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
          Analyze two YouTube videos side-by-side and compare their audience sentiment, emotions, and engagement.
        </p>
      </motion.div>

      {/* URL input section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(17,24,39,0.6)',
          border: '1px solid rgba(55,65,81,0.5)',
          borderRadius: '20px',
          padding: '28px',
          backdropFilter: 'blur(16px)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          {/* URL 1 */}
          <div>
            <label style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              🔵 Video 1
            </label>
            <input
              id="compare-url-1"
              type="text"
              value={url1}
              onChange={e => setUrl1(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{
                width: '100%',
                background: 'rgba(31,41,55,0.7)',
                border: '1px solid rgba(59,130,246,0.4)',
                borderRadius: '10px',
                color: '#f3f4f6',
                padding: '12px 16px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              disabled={loading}
              onKeyDown={e => e.key === 'Enter' && handleCompare()}
            />
          </div>

          {/* VS divider */}
          <div style={{ textAlign: 'center', paddingTop: '24px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))',
              border: '2px solid rgba(139,92,246,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#e0e7ff', fontWeight: 900, fontSize: '1rem',
              boxShadow: '0 0 20px rgba(139,92,246,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              letterSpacing: '0.05em',
            }}>VS</div>
          </div>

          {/* URL 2 */}
          <div>
            <label style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              🟣 Video 2
            </label>
            <input
              id="compare-url-2"
              type="text"
              value={url2}
              onChange={e => setUrl2(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{
                width: '100%',
                background: 'rgba(31,41,55,0.7)',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: '10px',
                color: '#f3f4f6',
                padding: '12px 16px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              disabled={loading}
              onKeyDown={e => e.key === 'Enter' && handleCompare()}
            />
          </div>
        </div>

        {/* Compare button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            id="compare-submit-btn"
            onClick={handleCompare}
            disabled={loading || !url1.trim() || !url2.trim()}
            style={{
              background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 40px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading || !url1.trim() || !url2.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              opacity: !url1.trim() || !url2.trim() ? 0.5 : 1,
              boxShadow: '0 4px 24px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing both videos…</>
            ) : (
              <><GitCompareArrows size={18} /> Compare Videos</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Global error */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '14px 20px', color: '#f87171', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <AlertCircle size={18} />
            {globalError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results split screen */}
      {hasResults && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {/* Per-video error banners */}
          {data.errors?.video1 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '12px 18px', color: '#f87171', marginBottom: '16px', fontSize: '0.875rem' }}>
              ⚠️ <strong>Video 1 failed:</strong> {data.errors.video1}
            </div>
          )}
          {data.errors?.video2 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '12px 18px', color: '#f87171', marginBottom: '16px', fontSize: '0.875rem' }}>
              ⚠️ <strong>Video 2 failed:</strong> {data.errors.video2}
            </div>
          )}

          {/* Split columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontWeight: 700, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(59,130,246,0.3)' }}>
                  🔵 VIDEO 1
                </span>
              </div>
              <VideoPanel
                data={data.video1}
                error={data.errors?.video1}
                loading={false}
                label="Video 1"
                panelStyle={BLUE_PANEL}
                accentColor="#3b82f6"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ background: 'rgba(168,85,247,0.2)', color: '#c4b5fd', fontWeight: 700, fontSize: '0.8rem', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(168,85,247,0.3)' }}>
                  🟣 VIDEO 2
                </span>
              </div>
              <VideoPanel
                data={data.video2}
                error={data.errors?.video2}
                loading={false}
                label="Video 2"
                panelStyle={PURPLE_PANEL}
                accentColor="#8b5cf6"
              />
            </div>
          </div>

          {/* Comparison table */}
          <ComparisonTable v1={data.video1} v2={data.video2} />
        </motion.div>
      )}

      {/* Empty state */}
      {!hasResults && !loading && !globalError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}
        >
          <BarChart2 size={56} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Enter two URLs above and click <strong style={{ color: '#8b5cf6' }}>Compare Videos</strong> to start.</p>
        </motion.div>
      )}
    </div>
  )
}
