import React from 'react';
import { Modal } from '../components/Modal.tsx';
import { BookOpen, Zap, Shield, Globe, Smartphone, Download } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sentinel Platform Documentation"
      maxWidth="620px"
      footer={
        <button className="btn btn-primary" onClick={onClose}>
          Close Guide
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* PWA Installation Info */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <div style={{ padding: 8, borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
            <Smartphone size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
              Install as Mobile & Desktop App
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Sentinel is a full Progressive Web App (PWA). You can install it on your home screen or desktop:
            </p>
            <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 4, paddingLeft: '1.2rem', lineHeight: 1.5 }}>
              <li><strong>Android & Chrome</strong>: Tap the three dots (⋮) &gt; <em>Install App</em> or <em>Add to Home Screen</em>.</li>
              <li><strong>iPhone & iPad (Safari)</strong>: Tap the Share button at the bottom of Safari &gt; <em>Add to Home Screen</em>.</li>
              <li><strong>PC / Mac (Edge / Chrome)</strong>: Click the <em>Install</em> icon in your browser address bar.</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--primary-accent)' }}>
            <Zap size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
              High-Frequency Polling
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Monitors scrape competitor endpoints at configured intervals (from 5 mins to 1 hour). When a price shifts more than the threshold, an alert is queued.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-elevated)', color: '#34d399' }}>
            <Shield size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
              Policy & Margin Rules
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Under <em>Policies</em>, configure automatic actions such as matching competitor price cuts or raising prices when competitors run out of stock.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-elevated)', color: '#fbbf24' }}>
            <Globe size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
              Multi-Region Probes & India Hubs
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Support for pincode-level price testing across Mumbai, Delhi NCR, Bengaluru, and global proxy routing.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
