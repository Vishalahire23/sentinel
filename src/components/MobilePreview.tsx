import React from 'react';
import { Smartphone, Bell, TrendingDown } from 'lucide-react';
import type { Monitor } from '../types.ts';
import { formatCurrency } from '../format.ts';

interface MobilePreviewProps {
  monitor: Monitor;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ monitor }) => {
  return (
    <div style={{
      width: 280,
      borderRadius: 24,
      border: '4px solid #334155',
      backgroundColor: '#090d16',
      padding: '1.25rem 1rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
    }}>
      <div style={{
        width: 60,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#334155',
        margin: '0 auto 1rem'
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#94a3b8',
        marginBottom: '0.85rem'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Smartphone size={13} /> Mobile Push
        </span>
        <span style={{ fontSize: '0.65rem' }}>Now</span>
      </div>

      <div style={{
        backgroundColor: '#162036',
        borderRadius: 12,
        padding: '0.75rem',
        border: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Bell size={13} style={{ color: '#f87171' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
            Sentinel Alert
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.3 }}>
          {monitor.name} dropped to <strong>{formatCurrency(monitor.currentPrice, monitor.currency)}</strong> on {monitor.domain}.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.7rem', color: '#f87171' }}>
          <TrendingDown size={12} />
          <span>{monitor.changePercent}% price drop detected</span>
        </div>
      </div>
    </div>
  );
};
