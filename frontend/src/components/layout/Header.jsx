import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, History, Home, GitCompareArrows, Shield, Menu, X } from 'lucide-react'

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const closeMobile = () => setMobileOpen(false);

    const firstLetter = user?.email?.[0]?.toUpperCase() || '?';

    // Shared link style for desktop
    const desktopLinkStyle = (path) => ({
        color: isActive(path) ? '#6366f1' : '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        padding: '4px 0',
        borderBottom: isActive(path) ? '2px solid #6366f1' : '2px solid transparent',
        transition: 'color 0.2s, border-color 0.2s',
        whiteSpace: 'nowrap',
    });

    // Mobile link style — full-width, tall tap target
    const mobileLinkStyle = (path) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 20px',
        color: isActive(path) ? '#818cf8' : '#cbd5e1',
        fontWeight: 600,
        fontSize: '1rem',
        textDecoration: 'none',
        borderRadius: '12px',
        background: isActive(path) ? 'rgba(99,102,241,0.12)' : 'transparent',
        transition: 'background 0.2s, color 0.2s',
        borderLeft: isActive(path) ? '3px solid #6366f1' : '3px solid transparent',
    });

    return (
        <div style={{ marginBottom: '36px', position: 'relative' }}>

            {/* ── TOP NAV BAR ── */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                marginBottom: '36px',
                position: 'relative',
                zIndex: 50,
            }}>

                {/* Logo */}
                <Link to="/" onClick={closeMobile} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Y</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem' }}>YT Vibe Check</span>
                </Link>

                {/* ── DESKTOP LINKS (hidden on small screens via inline media approach) ── */}
                <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link to="/" style={desktopLinkStyle('/')}
                        onMouseEnter={e => { if (!isActive('/')) e.currentTarget.style.color = '#f1f5f9' }}
                        onMouseLeave={e => { if (!isActive('/')) e.currentTarget.style.color = '#94a3b8' }}>
                        <Home size={15} /> Home
                    </Link>

                    {user && (
                        <>
                            <Link to="/history" style={desktopLinkStyle('/history')}
                                onMouseEnter={e => { if (!isActive('/history')) e.currentTarget.style.color = '#f1f5f9' }}
                                onMouseLeave={e => { if (!isActive('/history')) e.currentTarget.style.color = '#94a3b8' }}>
                                <History size={15} /> History
                            </Link>
                            <Link to="/compare" style={desktopLinkStyle('/compare')}
                                onMouseEnter={e => { if (!isActive('/compare')) e.currentTarget.style.color = '#f1f5f9' }}
                                onMouseLeave={e => { if (!isActive('/compare')) e.currentTarget.style.color = '#94a3b8' }}>
                                <GitCompareArrows size={15} /> Compare
                            </Link>
                            {user.is_admin && (
                                <Link to="/admin" style={desktopLinkStyle('/admin')}
                                    onMouseEnter={e => { if (!isActive('/admin')) e.currentTarget.style.color = '#f1f5f9' }}
                                    onMouseLeave={e => { if (!isActive('/admin')) e.currentTarget.style.color = '#94a3b8' }}>
                                    <Shield size={15} /> Admin
                                </Link>
                            )}
                        </>
                    )}

                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Avatar */}
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                                boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
                                flexShrink: 0,
                            }}>
                                {firstLetter}
                            </div>
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </span>
                            <button onClick={logout} style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                color: '#94a3b8', background: 'transparent', border: 'none',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                padding: '6px 10px', borderRadius: '8px',
                                transition: 'color 0.2s, background 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}>
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/login" style={{
                                color: '#94a3b8', textDecoration: 'none', fontWeight: 600,
                                fontSize: '0.875rem', padding: '7px 16px', borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'color 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                                Login
                            </Link>
                            <Link to="/signup" style={{
                                color: '#fff', textDecoration: 'none', fontWeight: 700,
                                fontSize: '0.875rem', padding: '7px 16px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                boxShadow: '0 3px 12px rgba(99,102,241,0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── HAMBURGER BUTTON (mobile only) ── */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(prev => !prev)}
                    aria-label="Toggle navigation menu"
                    style={{
                        display: 'none',           /* shown via CSS below */
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '42px', height: '42px',
                        background: mobileOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#f1f5f9',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* ── MOBILE DROPDOWN MENU ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mobile-dropdown"
                        style={{
                            position: 'absolute',
                            top: '72px',           /* sits right below the nav bar */
                            left: 0,
                            right: 0,
                            zIndex: 999,
                            background: 'rgba(10,10,26,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '10px',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* User info strip */}
                        {user && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', marginBottom: '8px',
                                background: 'rgba(99,102,241,0.08)',
                                borderRadius: '12px',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                                }}>
                                    {firstLetter}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.email}
                                    </p>
                                    {user.is_admin && (
                                        <p style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600, margin: '2px 0 0' }}>🛡️ Admin</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Nav links */}
                        <Link to="/" onClick={closeMobile} style={mobileLinkStyle('/')}>
                            <Home size={18} /> Home
                        </Link>

                        {user ? (
                            <>
                                <Link to="/history" onClick={closeMobile} style={mobileLinkStyle('/history')}>
                                    <History size={18} /> History
                                </Link>
                                <Link to="/compare" onClick={closeMobile} style={mobileLinkStyle('/compare')}>
                                    <GitCompareArrows size={18} /> Compare
                                </Link>
                                {user.is_admin && (
                                    <Link to="/admin" onClick={closeMobile} style={mobileLinkStyle('/admin')}>
                                        <Shield size={18} /> Admin
                                    </Link>
                                )}
                                {/* Divider */}
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
                                <button
                                    onClick={() => { logout(); closeMobile(); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '14px 20px', width: '100%',
                                        color: '#f87171', fontWeight: 600, fontSize: '1rem',
                                        background: 'transparent', border: 'none',
                                        borderRadius: '12px', cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        textAlign: 'left',
                                    }}
                                    onTouchStart={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
                                <Link to="/login" onClick={closeMobile} style={{ ...mobileLinkStyle('/login'), color: '#94a3b8' }}>
                                    Login
                                </Link>
                                <Link to="/signup" onClick={closeMobile} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '10px', padding: '14px 20px', margin: '8px 0 4px',
                                    color: '#fff', fontWeight: 700, fontSize: '1rem',
                                    textDecoration: 'none', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                }}>
                                    Sign Up — It's Free
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop to close menu on mobile */}
            {mobileOpen && (
                <div
                    onClick={closeMobile}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 998,
                        background: 'rgba(0,0,0,0.4)',
                    }}
                />
            )}

            {/* ── TITLE SECTION ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center' }}
            >
                <h1 className="gradient-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                    YouTube Sentiment Dashboard
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
                    AI-powered analysis to uncover the true vibe of any video.
                </p>
            </motion.div>

            {/* ── RESPONSIVE CSS ── */}
            <style>{`
                /* Mobile: hide desktop nav, show hamburger */
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                }
                /* Desktop: show nav, hide hamburger */
                @media (min-width: 769px) {
                    .mobile-menu-btn {
                        display: none !important;
                    }
                    .mobile-dropdown {
                        display: none !important;
                    }
                }
                /* Touch-friendly active state for mobile links */
                .mobile-dropdown a:active,
                .mobile-dropdown button:active {
                    background: rgba(99,102,241,0.15) !important;
                }
            `}</style>
        </div>
    )
}
