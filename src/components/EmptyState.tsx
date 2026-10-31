import React from 'react';
import { Layers } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-secondary)' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 54,
        height: 54,
        borderRadius: '50%',
        background: 'var(--bg-elevated)',
        marginBottom: '1rem',
        color: 'var(--text-muted)'
      }}>
        <Layers size={26} />
      </div>
      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.25rem', color: 'var(--text-muted)' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
