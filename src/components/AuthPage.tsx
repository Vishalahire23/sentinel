import React, { useState, useEffect } from 'react';
import { BrandIcon } from './BrandIcon.tsx';
import { Download, Smartphone, Share, PlusSquare, Check, X, Laptop } from 'lucide-react';
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

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    // 1. Standalone / already installed check
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // 2. Platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setGuidePlatform('ios');
    } else if (/android/.test(ua)) {
      setGuidePlatform('android');
    } else {
      setGuidePlatform('desktop');
    }

    // 3. Native install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

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

        {/* Clickable PWA Install Button on Login Page */}
        {!isStandalone && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Smartphone size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  Install Sentinel App
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
                  Add to Home Screen / Desktop
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
          </div>
        )}

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

      {/* Install Guidance Modal for devices/browsers */}
      {showInstallGuide && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowInstallGuide(false)}
          style={{ zIndex: 1000 }}
        >
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '420px', padding: '1.5rem', textAlign: 'left', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setShowInstallGuide(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Smartphone size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Install Sentinel App
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Choose your device instructions below:
                </p>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setGuidePlatform('android')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: guidePlatform === 'android' ? 'var(--primary-accent)' : 'transparent',
                  color: guidePlatform === 'android' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setGuidePlatform('ios')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: guidePlatform === 'ios' ? 'var(--primary-accent)' : 'transparent',
                  color: guidePlatform === 'ios' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                iPhone / iPad
              </button>
              <button
                type="button"
                onClick={() => setGuidePlatform('desktop')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: guidePlatform === 'desktop' ? 'var(--primary-accent)' : 'transparent',
                  color: guidePlatform === 'desktop' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                PC / Mac
              </button>
            </div>

            {/* Platform Guides */}
            {guidePlatform === 'android' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8', fontWeight: 700 }}>
                    1
                  </div>
                  <span>Tap the <strong>three dots (⋮)</strong> menu in Chrome</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#34d399', fontWeight: 700 }}>
                    2
                  </div>
                  <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24', fontWeight: 700 }}>
                    3
                  </div>
                  <span>Tap <strong>Install</strong> to add directly to your home screen</span>
                </div>
              </div>
            )}

            {guidePlatform === 'ios' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                    <Share size={14} />
                  </div>
                  <span>Tap the <strong>Share</strong> icon at the bottom of Safari</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#34d399' }}>
                    <PlusSquare size={14} />
                  </div>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24' }}>
                    <Check size={14} />
                  </div>
                  <span>Tap <strong>Add</strong> at top right to install</span>
                </div>
              </div>
            )}

            {guidePlatform === 'desktop' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                    <Laptop size={14} />
                  </div>
                  <span>Look at the <strong>right side of your browser address bar</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#34d399' }}>
                    <Download size={14} />
                  </div>
                  <span>Click the <strong>Install Sentinel</strong> icon</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24' }}>
                    <Check size={14} />
                  </div>
                  <span>Click <strong>Install</strong> to run in standalone desktop window</span>
                </div>
              </div>
            )}

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              💡 <em>On your live Render HTTPS URL, your browser can also prompt to install automatically in 1 tap!</em>
            </div>

            <button 
              type="button"
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => setShowInstallGuide(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
