import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatPercent } from '../format.ts';

interface ChangeBadgeProps {
  changePercent: number;
}

export const ChangeBadge: React.FC<ChangeBadgeProps> = ({ changePercent }) => {
  if (changePercent < 0) {
    return (
      <span className="badge badge-danger">
        <ArrowDownRight size={13} />
        {formatPercent(changePercent)}
      </span>
    );
  }

  if (changePercent > 0) {
    return (
      <span className="badge badge-success">
        <ArrowUpRight size={13} />
        {formatPercent(changePercent)}
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <Minus size={13} />
      0.0%
    </span>
  );
};
