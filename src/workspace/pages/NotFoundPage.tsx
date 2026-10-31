import React from 'react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState.tsx';

interface NotFoundPageProps {
  onBackToOverview: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBackToOverview }) => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        title="404 - Page Not Found"
        description="The workspace route or page you requested does not exist or requires elevated permissions."
        action={
          <button className="btn btn-primary" onClick={onBackToOverview}>
            Back to Overview
          </button>
        }
      />
    </div>
  );
};
