import React, { useState } from 'react';
import { BrandIcon } from './BrandIcon.tsx';
import { api } from '../api.ts';
import type { SessionUser } from '../types.ts';
import '../auth-admin.css';

interface AuthPageProps {
  onSuccess: (user: SessionUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@sentinel.local');
  const [password, setPassword] = useState('sentinel123');
  const [name, setName] = useState('Sarah Connor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, name);
        onSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword('sentinel123');
    setName(demoName);
    setIsRegister(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <BrandIcon size={32} />
          <h2 className="auth-title">
            {isRegister ? 'Create Sentinel Account' : 'Welcome to Sentinel'}
          </h2>
          <p className="auth-subtitle">
            {isRegister 
              ? 'Join the high-frequency market intelligence platform' 
              : 'Sign in to access your monitored targets and policies'}
          </p>
        </div>

        {/* Demo Quick Select */}
        <div className="demo-credentials-box">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Quick Demo Credentials:</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('admin@sentinel.local', 'Sarah Connor')}
            >
              Demo Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('analyst@sentinel.local', 'Alex Mercer')}
            >
              Demo Analyst
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle-link">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
};
