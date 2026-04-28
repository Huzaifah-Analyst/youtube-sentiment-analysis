import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const OrbBackground = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
    <div style={{
      position: 'absolute', top: '-20%', left: '-15%',
      width: '500px', height: '500px',
      background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float 12s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', right: '-10%',
      width: '420px', height: '420px',
      background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float-2 15s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', top: '60%', left: '60%',
      width: '300px', height: '300px',
      background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float-3 18s ease-in-out infinite',
    }} />
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShake(false);

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(15,15,30,0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#f1f5f9',
    padding: '12px 16px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', position: 'relative' }}>
      <OrbBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
      >
        <div
          className={shake ? 'shake' : ''}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🎬</span>
            </div>
            <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.6rem', margin: '0 0 6px' }}>Welcome Back</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Sign in to your YT Vibe Check account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                className="input-glow"
              />
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                className="input-glow"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                  Signing In…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
