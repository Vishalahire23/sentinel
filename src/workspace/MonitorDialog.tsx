import React from 'react';
import { Modal } from '../components/Modal.tsx';
import { MonitorForm } from '../components/MonitorForm.tsx';
import type { Monitor } from '../types.ts';

interface MonitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Monitor>) => void;
  initialData?: Monitor | null;
  isLoading?: boolean;
}

export const MonitorDialog: React.FC<MonitorDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Target Monitor' : 'Add Target Monitor'}
      maxWidth="580px"
    >
      <MonitorForm
        initialData={initialData || undefined}
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
};
