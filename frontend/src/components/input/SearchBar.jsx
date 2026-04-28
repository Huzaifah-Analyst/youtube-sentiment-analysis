import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play } from 'lucide-react'

export default function SearchBar({ onAnalyze, loading }) {
    const [url, setUrl] = useState('')
    const [focused, setFocused] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (url.trim()) onAnalyze(url.trim())
    }

    const examples = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ maxWidth: '720px', margin: '0 auto 40px' }}
        >
            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                {/* Glow backdrop */}
                <div style={{
                    position: 'absolute', inset: '-2px',
                    borderRadius: '18px',
                    background: focused
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    filter: 'blur(8px)',
                    transition: 'opacity 0.4s ease',
                    opacity: focused ? 1 : 0.5,
                    zIndex: 0,
                }} />

                {/* Input row */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(15,15,30,0.9)',
                    border: focused
                        ? '1.5px solid rgba(99,102,241,0.7)'
                        : '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '6px 6px 6px 18px',
                    boxShadow: focused
                        ? '0 0 0 3px rgba(99,102,241,0.18), 0 8px 32px rgba(0,0,0,0.4)'
                        : '0 4px 24px rgba(0,0,0,0.3)',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                    backdropFilter: 'blur(12px)',
                }}>
                    <Search style={{ color: focused ? '#818cf8' : '#64748b', flexShrink: 0, transition: 'color 0.2s' }} size={20} />

                    <input
                        type="text"
                        placeholder="Paste YouTube URL here…"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        disabled={loading}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#f1f5f9',
                            fontSize: '0.95rem',
                            padding: '10px 14px',
                            fontFamily: 'inherit',
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '11px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                            ...(loading || !url.trim()
                                ? { background: 'rgba(99,102,241,0.2)', color: '#64748b' }
                                : {
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff',
                                    boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
                                }
                            ),
                        }}
                        onMouseEnter={e => {
                            if (!loading && url.trim()) {
                                e.currentTarget.style.transform = 'scale(1.04)'
                                e.currentTarget.style.boxShadow = '0 6px 22px rgba(99,102,241,0.6)'
                            }
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = url.trim() ? '0 4px 16px rgba(99,102,241,0.45)' : 'none'
                        }}
                    >
                        {loading ? (
                            <>
                                <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#a5b4fc', borderRadius: '50%' }} className="spin" />
                                Analyzing…
                            </>
                        ) : (
                            <>
                                Analyze
                                <Play size={15} style={{ fill: 'currentColor' }} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Example links */}
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ color: '#475569', fontSize: '0.82rem' }}>Try:</span>
                {examples.map((ex, i) => (
                    <button
                        key={i}
                        onClick={() => { setUrl(ex); onAnalyze(ex); }}
                        disabled={loading}
                        style={{
                            background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            color: '#6366f1', fontSize: '0.82rem', fontWeight: 600,
                            textDecoration: 'underline', textDecorationStyle: 'dotted',
                            padding: '2px 0',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#6366f1'}
                    >
                        Example {i + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    )
}
