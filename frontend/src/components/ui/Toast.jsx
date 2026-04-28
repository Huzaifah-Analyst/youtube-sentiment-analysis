import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Global Toast Manager ──────────────────────────────────────────────────────
let toastListeners = [];
let toastIdCounter = 0;

export function showToast(message, type = 'success', duration = 3500) {
  const id = ++toastIdCounter;
  toastListeners.forEach(fn => fn({ id, message, type, duration }));
}

// ─── Toast Container (mount once in App) ──────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, { ...toast, exiting: false }]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 320);
      }, toast.duration);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);

  const typeClass = (type) => {
    if (type === 'success') return 'toast-success';
    if (type === 'indigo') return 'toast-indigo';
    return 'toast-error';
  };

  const typeIcon = (type) => {
    if (type === 'success') return '✅';
    if (type === 'indigo') return '💾';
    return '❌';
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${typeClass(t.type)} ${t.exiting ? 'toast-out' : ''}`}
        >
          <span>{typeIcon(t.type)}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
