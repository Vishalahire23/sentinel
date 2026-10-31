import React from 'react';
import { Shield } from 'lucide-react';

interface BrandIconProps {
  size?: number;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ size = 24, className = '' }) => {
  return (
    <div 
      className={`brand-icon-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size * 1.6,
        height: size * 1.6,
        borderRadius: size * 0.45,
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
        color: '#ffffff'
      }}
    >
      <Shield size={size} strokeWidth={2.5} />
    </div>
  );
};
