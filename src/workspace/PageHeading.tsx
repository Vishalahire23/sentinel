import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeading: React.FC<PageHeadingProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="page-heading">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
