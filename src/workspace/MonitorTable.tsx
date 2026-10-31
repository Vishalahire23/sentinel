import React from 'react';
import { ExternalLink, Edit2, Trash2, Play, Pause, TrendingUp, BarChart2 } from 'lucide-react';
import type { Monitor, SessionUser } from '../types.ts';
import { formatCurrency } from '../format.ts';
import { ChangeBadge } from '../components/ChangeBadge.tsx';

interface MonitorTableProps {
  monitors: Monitor[];
  currentUser?: SessionUser;
  onToggleStatus: (id: string, currentStatus: Monitor['status']) => void;
  onEdit: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
  onSelectMonitor?: (monitor: Monitor) => void;
}

export const MonitorTable: React.FC<MonitorTableProps> = ({
  monitors,
  currentUser,
  onToggleStatus,
  onEdit,
  onDelete,
  onSelectMonitor
}) => {
  const isAdmin = currentUser?.role === 'admin';
  return (
    <>
      {/* Desktop / Large Screen Data Table */}
      <div className="table-container desktop-table-view">
        <table className="table">
          <thead>
            <tr>
              <th>Product & Competitor Target</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Competitor Price</th>
              <th style={{ textAlign: 'right' }}>Our Benchmark</th>
              <th style={{ textAlign: 'right' }}>30d Spread (Low / High)</th>
              <th style={{ textAlign: 'center' }}>Stock Status</th>
              <th style={{ textAlign: 'center' }}>State</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map(m => {
              const low30 = m.lowestPrice30d || Math.min(...(m.priceHistory.map(p => p.price)));
              const high30 = m.highestPrice30d || Math.max(...(m.priceHistory.map(p => p.price)));
              const ourBase = m.baselinePrice || (m.currentPrice * 1.04);
              const vsBaseDelta = Number((((m.currentPrice - ourBase) / ourBase) * 100).toFixed(1));

              return (
                <tr key={m.id}>
                  <td>
                    <div 
                      style={{ fontWeight: 600, color: '#ffffff', cursor: onSelectMonitor ? 'pointer' : 'default' }}
                      onClick={() => onSelectMonitor && onSelectMonitor(m)}
                    >
                      {m.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{m.domain}</span>
                      {m.city && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#38bdf8' }}>
                          • 📍 {m.city}, {m.state || 'India'}
                        </span>
                      )}
                      {m.url && (
                        <a 
                          href={m.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--primary-accent)', display: 'inline-flex' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{m.category}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                      {formatCurrency(m.currentPrice, m.currency)}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <ChangeBadge changePercent={m.changePercent} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {formatCurrency(ourBase, m.currency)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: vsBaseDelta < 0 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                      {vsBaseDelta < 0 ? `${Math.abs(vsBaseDelta)}% undercut` : 'Our price safe'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <div style={{ color: '#34d399' }}>Low: {formatCurrency(low30, m.currency)}</div>
                    <div style={{ color: '#94a3b8' }}>High: {formatCurrency(high30, m.currency)}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${m.stockStatus === 'in_stock' ? 'success' : m.stockStatus === 'low_stock' ? 'warning' : 'danger'}`}>
                      {m.stockStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {onSelectMonitor && (
                        <button
                          onClick={() => onSelectMonitor(m)}
                          className="btn btn-secondary btn-sm"
                          title="Inspect 30-day comparative chart"
                          style={{ padding: '0.3rem 0.5rem', color: '#38bdf8' }}
                        >
                          <BarChart2 size={14} />
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onToggleStatus(m.id, m.status)}
                            className="btn btn-secondary btn-sm"
                            title={m.status === 'active' ? 'Pause monitor' : 'Resume monitor'}
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            {m.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            onClick={() => onEdit(m)}
                            className="btn btn-secondary btn-sm"
                            title="Edit monitor"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(m.id)}
                            className="btn btn-danger btn-sm"
                            title="Delete monitor"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Active on Screen Width <= 768px) */}
      <div className="mobile-card-list">
        {monitors.map(m => {
          const low30 = m.lowestPrice30d || Math.min(...(m.priceHistory.map(p => p.price)));
          const high30 = m.highestPrice30d || Math.max(...(m.priceHistory.map(p => p.price)));
          const ourBase = m.baselinePrice || (m.currentPrice * 1.04);
          const vsBaseDelta = Number((((m.currentPrice - ourBase) / ourBase) * 100).toFixed(1));

          return (
            <div key={m.id} className="card mobile-monitor-card">
              {/* Header */}
              <div className="mobile-card-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div 
                    className="mobile-card-title"
                    onClick={() => onSelectMonitor && onSelectMonitor(m)}
                  >
                    {m.name}
                  </div>
                  <div className="mobile-card-meta">
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{m.category}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.domain}</span>
                    {m.city && (
                      <span className="mobile-card-location">
                        • 📍 {m.city}, {m.state || 'India'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span className={`badge badge-${m.stockStatus === 'in_stock' ? 'success' : m.stockStatus === 'low_stock' ? 'warning' : 'danger'}`}>
                    {m.stockStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Price & Benchmark Grid */}
              <div className="mobile-card-price-grid">
                <div>
                  <div className="mobile-card-label">Competitor Price</div>
                  <div className="mobile-card-price">
                    {formatCurrency(m.currentPrice, m.currency)}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <ChangeBadge changePercent={m.changePercent} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mobile-card-label">Our Benchmark</div>
                  <div className="mobile-card-benchmark">
                    {formatCurrency(ourBase, m.currency)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: vsBaseDelta < 0 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                    {vsBaseDelta < 0 ? `${Math.abs(vsBaseDelta)}% undercut` : 'Our price safe'}
                  </div>
                </div>
              </div>

              {/* 30-Day Spread */}
              <div className="mobile-card-range-row">
                <div style={{ color: '#34d399' }}>Low: {formatCurrency(low30, m.currency)}</div>
                <div style={{ color: '#94a3b8' }}>High: {formatCurrency(high30, m.currency)}</div>
              </div>

              {/* Actions Footer */}
              <div className="mobile-card-actions">
                {onSelectMonitor && (
                  <button
                    onClick={() => onSelectMonitor(m)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                    title="Inspect 30-day comparative chart"
                  >
                    <BarChart2 size={14} style={{ color: '#38bdf8' }} />
                    <span>Inspect</span>
                  </button>
                )}
                {m.url && (
                  <a 
                    href={m.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                    title="Open competitor URL"
                    style={{ padding: '0.4rem 0.65rem', color: 'var(--primary-accent)' }}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => onToggleStatus(m.id, m.status)}
                      className="btn btn-secondary btn-sm"
                      title={m.status === 'active' ? 'Pause monitor' : 'Resume monitor'}
                      style={{ padding: '0.4rem 0.65rem' }}
                    >
                      {m.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => onEdit(m)}
                      className="btn btn-secondary btn-sm"
                      title="Edit monitor"
                      style={{ padding: '0.4rem 0.65rem' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete monitor"
                      style={{ padding: '0.4rem 0.65rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
