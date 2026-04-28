import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const OrbBackground = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
    <div style={{
      position: 'absolute', top: '-20%', right: '-15%',
      width: '500px', height: '500px',
      background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float 14s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', left: '-10%',
      width: '440px', height: '440px',
      background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float-2 17s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', top: '40%', left: '30%',
      width: '280px', height: '280px',
      background: 'radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 65%)',
      borderRadius: '50%',
      animation: 'orb-float-3 20s ease-in-out infinite',
    }} />
  </div>
);

const getStrength = (pw) => {
  if (!pw) return { label: '', color: 'transparent', width: '0%' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '33%' };
  if (score <= 2) return { label: 'Medium', color: '#f59e0b', width: '66%' };
  return { label: 'Strong', color: '#10b981', width: '100%' };
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

// ─── OTP Verification Screen ───────────────────────────────────────────────────
function OTPScreen({ email, onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

  // Start 60-second countdown for resend
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      triggerShake('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/verify-email`, {
        email,
        code,
      });
      onSuccess(res.data.access_token);
    } catch (err) {
      triggerShake(err.response?.data?.detail || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setResendLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/resend-code`, { email });
      setResendCountdown(60);
      // Restart timer
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const triggerShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4 }}
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
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.8rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            📧
          </div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 8px' }}>
            Check Your Email
          </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
            We sent a 6-digit code to
          </p>
          <p style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-all' }}>
            {email}
          </p>
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                ...inputStyle,
                fontSize: '1.8rem',
                textAlign: 'center',
                letterSpacing: '0.5em',
                paddingLeft: '24px',
              }}
              className="input-glow"
              autoFocus
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
                textAlign: 'center',
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn-gradient"
            style={{
              width: '100%', padding: '13px', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                Verifying…
              </>
            ) : 'Verify Account ✓'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px' }}>
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCountdown > 0 || resendLoading}
            style={{
              background: 'none', border: 'none', cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
              color: resendCountdown > 0 ? '#475569' : '#818cf8',
              fontSize: '0.875rem', fontWeight: 600, padding: '4px 0',
              transition: 'color 0.2s',
            }}
          >
            {resendLoading
              ? 'Sending…'
              : resendCountdown > 0
                ? `Resend Code (${resendCountdown}s)`
                : 'Resend Code'}
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link
            to="/signup"
            onClick={() => window.location.reload()}
            style={{ color: '#475569', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            ← Use a different email
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Signup Form ────────────────────────────────────────────────────────────
const Signup = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [fallbackCode, setFallbackCode] = useState(null); // shown when email fails

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { } = useAuth();  // keep auth context connected
  const navigate = useNavigate();
  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/signup`, { email, password });
      setPendingEmail(email);
      if (res.data.dev_code) {
        setFallbackCode(res.data.dev_code); // email failed — show code on screen
      }
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySuccess = (token) => {
    localStorage.setItem('token', token);
    // Hard navigate to let AuthContext re-initialize with the new token
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', position: 'relative' }}>
      <OrbBackground />

      <AnimatePresence mode="wait">
        {step === 'otp' ? (
          <OTPScreen key="otp" email={pendingEmail} onSuccess={handleVerifySuccess} fallbackCode={fallbackCode} />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '40px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}>
              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '56px', height: '56px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✨</span>
                </div>
                <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.6rem', margin: '0 0 6px' }}>Start Analyzing</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Create your free YT Vibe Check account</p>
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
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: strength.width,
                          background: strength.color, borderRadius: '4px',
                          transition: 'width 0.4s ease, background 0.4s ease',
                        }} />
                      </div>
                      <p style={{ color: strength.color, fontSize: '0.72rem', fontWeight: 600, margin: '4px 0 0' }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient"
                  style={{
                    width: '100%', padding: '13px', fontSize: '0.95rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="spin" />
                      Sending Code…
                    </>
                  ) : 'Create Account & Verify →'}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signup;
