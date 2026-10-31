import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.65rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1
    }}>
      <div 
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          backgroundColor: checked ? 'var(--primary-accent)' : 'var(--bg-elevated)',
          border: '1px solid var(--border-prominent)',
          position: 'relative',
          transition: 'background-color 0.2s ease'
        }}
      >
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
      {label && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>}
    </label>
  );
};
