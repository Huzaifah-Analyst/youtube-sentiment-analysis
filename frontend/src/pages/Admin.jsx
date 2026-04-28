import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flex: 1,
    minWidth: '180px',
    transition: 'box-shadow 0.3s, border-color 0.3s',
  }}
    className="card-glow"
  >
    <div style={{
      width: '52px', height: '52px',
      borderRadius: '14px',
      background: `linear-gradient(135deg, ${color}33, ${color}22)`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem', flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
  </div>
);

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!user.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} className="spin" />
      <p style={{ color: '#94a3b8' }}>Loading admin panel…</p>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: '600px', margin: '60px auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', padding: '24px', color: '#fca5a5', textAlign: 'center' }}>
      🚫 {error}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
          }}>🛡️</div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '2rem', margin: 0 }}>Admin Panel</h1>
        </div>
        <p style={{ color: '#94a3b8', margin: 0, paddingLeft: '56px' }}>YT Vibe Check — System Overview</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <StatCard icon="👥" label="Total Users" value={stats.total_users} color="#6366f1" />
          <StatCard icon="📊" label="Total Analyses" value={stats.total_analyses} color="#8b5cf6" />
          <StatCard icon="📅" label="Today's Analyses" value={stats.today_count} color="#10b981" />
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.1rem' }}>👤</span>
          <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
            Registered Users ({users.length})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['#', 'Email', 'Joined', 'Analyses', 'Role'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.85rem' }}>{u.id}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                      }}>
                        {u.email[0].toUpperCase()}
                      </div>
                      <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>{formatDate(u.created_at)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: 'rgba(99,102,241,0.15)',
                      color: '#a5b4fc',
                      borderRadius: '999px',
                      padding: '3px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>{u.analysis_count}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {u.is_admin ? (
                      <span style={{
                        background: 'rgba(245,158,11,0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '999px',
                        padding: '3px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>🛡️ Admin</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
