import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Check } from 'lucide-react';

interface InstallAppBannerProps {
  onInstalled?: () => void;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({ onInstalled }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if previously dismissed in this session/browser
    const dismissed = localStorage.getItem('sentinel_pwa_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Capture native Chromium beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      if (onInstalled) onInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
        if (onInstalled) onInstalled();
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      alert("To install Sentinel:\n\n• Android (Chrome): Tap the three dots (⋮) at top right and choose 'Install App' or 'Add to Home Screen'.\n• PC/Mac (Chrome/Edge): Click the Install icon in your browser address bar.");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('sentinel_pwa_dismissed', 'true');
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <aside className="pwa-install-banner" aria-label="Install Sentinel Application">
        <div className="pwa-banner-content">
          <div className="pwa-banner-icon">
            <Smartphone size={18} />
          </div>
          <div className="pwa-banner-text">
            <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>Install Sentinel App</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 6 }}>
              Get fast 1-tap full-screen access from your phone or desktop
            </span>
          </div>
        </div>

        <div className="pwa-banner-actions">
          <button 
            type="button" 
            onClick={handleInstallClick} 
            className="btn btn-primary btn-sm pwa-install-btn"
          >
            <Download size={13} />
            <span>Install App</span>
          </button>
          <button 
            type="button" 
            onClick={handleDismiss} 
            className="pwa-dismiss-btn"
            title="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* iOS Safari Home Screen Guide Popup */}
      {showIOSGuide && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowIOSGuide(false)}
          style={{ zIndex: 1000 }}
        >
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '380px', padding: '1.5rem', textAlign: 'center' }}
          >
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Smartphone size={26} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Install on iPhone or iPad
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Apple Safari requires adding to home screen through the Share menu:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-elevated)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                  <Share size={16} />
                </div>
                <span>1. Tap the <strong>Share</strong> button at bottom of Safari</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#34d399' }}>
                  <PlusSquare size={16} />
                </div>
                <span>2. Scroll down & tap <strong>Add to Home Screen</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24' }}>
                  <Check size={16} />
                </div>
                <span>3. Tap <strong>Add</strong> at top right to complete</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => setShowIOSGuide(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
