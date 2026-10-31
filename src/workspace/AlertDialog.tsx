import React from 'react';
import { Modal } from '../components/Modal.tsx';
import type { Alert } from '../types.ts';
import { formatDate } from '../format.ts';

interface AlertDialogProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  alert,
  isOpen,
  onClose,
  onMarkRead,
  onDismiss
}) => {
  if (!alert) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alert.title}
      footer={
        <>
          <button 
            className="btn btn-secondary" 
            onClick={() => { onDismiss(alert.id); onClose(); }}
          >
            Dismiss Alert
          </button>
          {!alert.read && (
            <button 
              className="btn btn-primary" 
              onClick={() => { onMarkRead(alert.id); onClose(); }}
            >
              Acknowledge & Mark Read
            </button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'neutral'}`}>
            {alert.severity}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Triggered at {formatDate(alert.timestamp)}
          </span>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Target Product:</div>
          <div style={{ fontWeight: 600, color: '#ffffff' }}>{alert.monitorName}</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.4
        }}>
          {alert.message}
        </div>
      </div>
    </Modal>
  );
};
