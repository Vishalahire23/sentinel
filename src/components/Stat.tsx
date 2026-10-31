import React from 'react';

interface StatProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const Stat: React.FC<StatProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-title">{title}</span>
        {icon && <span style={{ color: 'var(--primary-accent)' }}>{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};
