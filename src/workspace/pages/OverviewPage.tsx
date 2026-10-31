import React, { useState } from 'react';
import { 
  Activity, Bell, TrendingDown, Layers, Plus, ArrowRight, BarChart3, ShieldCheck, Zap, Flame 
} from 'lucide-react';
import { PageHeading } from '../PageHeading.tsx';
import { Stat } from '../../components/Stat.tsx';
import { PriceChart } from '../../components/PriceChart.tsx';
import { HeadToHeadMatrix } from '../../components/HeadToHeadMatrix.tsx';
import type { Monitor, Alert, DashboardStats, SessionUser } from '../../types.ts';
import { formatDate, formatCurrency } from '../../format.ts';
import { api } from '../../api.ts';

interface OverviewPageProps {
  stats: DashboardStats;
  monitors: Monitor[];
  alerts: Alert[];
  currentUser?: SessionUser;
  onOpenAddMonitor: () => void;
  onSelectAlert: (alert: Alert) => void;
  onNavigateToMonitors: () => void;
  onUpdateMonitorPrice?: (monitorId: string, newPrice: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  monitors,
  alerts,
  currentUser,
  onOpenAddMonitor,
  onSelectAlert,
  onNavigateToMonitors,
  onUpdateMonitorPrice
}) => {
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>(monitors[0]?.id || '');
  const [isSimulatingWarRoom, setIsSimulatingWarRoom] = useState(false);
  const [warRoomReport, setWarRoomReport] = useState<string | null>(null);

  const activeMonitor = monitors.find(m => m.id === selectedMonitorId) || monitors[0];

  const handleApplyPrice = (newPrice: number) => {
    if (activeMonitor && onUpdateMonitorPrice) {
      onUpdateMonitorPrice(activeMonitor.id, newPrice);
    }
  };

  const handleTriggerWarRoom = async () => {
    try {
      setIsSimulatingWarRoom(true);
      const res = await api.simulateFestiveCrash('Diwali & Big Billion Days Flash Sale');
      setWarRoomReport(`Simulated aggressive -14.2% festive price crash across ${res.affectedCount} catalogs. Generated ${res.alertsCreated} compliance defense alerts. Check the alerts feed!`);
      setTimeout(() => setWarRoomReport(null), 8000);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'War room simulation failed');
    } finally {
      setIsSimulatingWarRoom(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeading
        title="Market Telemetry Overview"
        subtitle="Real-time competitor price movements, system health, and automated policy alerts."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {currentUser?.role === 'admin' && (
              <button
                className="btn btn-secondary"
                onClick={handleTriggerWarRoom}
                disabled={isSimulatingWarRoom}
                style={{
                  borderColor: 'rgba(249, 115, 22, 0.4)',
                  background: 'rgba(249, 115, 22, 0.1)',
                  color: '#fb923c'
                }}
                title="Stress-test pricing policies against simulated midnight Diwali / Flipkart BBD flash crash"
              >
                <Flame size={16} />
                <span>{isSimulatingWarRoom ? 'Simulating Blitz...' : 'Festive War Room'}</span>
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button className="btn btn-primary" onClick={onOpenAddMonitor}>
                <Plus size={16} /> Add Target
              </button>
            )}
          </div>
        }
      />

      {/* Festive War Room Stress Test Banner */}
      {warRoomReport && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Flame size={20} style={{ color: '#f87171', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>Festive Blitzkrieg Simulation Deployed:</strong>
              <span style={{ color: '#ffffff', fontSize: '0.8rem', marginLeft: 6 }}>{warRoomReport}</span>
            </div>
          </div>
          <button
            onClick={() => setWarRoomReport(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <Stat
          title="Monitored Targets"
          value={stats.totalMonitors}
          subtitle={`${stats.activeMonitors} actively polling`}
          icon={<Layers size={20} />}
        />
        <Stat
          title="Active Crawlers"
          value={stats.activeMonitors}
          subtitle="Zero proxy rate limits"
          icon={<Activity size={20} />}
        />
        <Stat
          title="Critical Alerts"
          value={stats.criticalAlerts}
          subtitle="Unacknowledged price drops"
          icon={<Bell size={20} />}
        />
        <Stat
          title="Catalog Delta"
          value={`${stats.avgPriceChange > 0 ? '+' : ''}${stats.avgPriceChange}%`}
          subtitle="Average price shift across SKUs"
          icon={<TrendingDown size={20} />}
        />
      </div>

      {/* Main Visuals Grid */}
      <div className="overview-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Trend Chart Card */}
        <div className="card">
          <div className="overview-chart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Comparative Price Trajectory</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Competitor Detected vs Industry Average vs Our Store Baseline</p>
            </div>

            {monitors.length > 0 && (
              <select
                className="form-select overview-header-select"
                style={{ width: 'auto', maxWidth: '360px', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                value={selectedMonitorId}
                onChange={(e) => setSelectedMonitorId(e.target.value)}
              >
                {monitors.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
          </div>

          {activeMonitor && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Detected:</span>
                <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(activeMonitor.currentPrice, activeMonitor.currency)}
                </strong>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>30d Lowest (ATL):</span>
                <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(activeMonitor.lowestPrice30d || activeMonitor.currentPrice, activeMonitor.currency)}
                </strong>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>30d Peak:</span>
                <strong style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(activeMonitor.highestPrice30d || activeMonitor.currentPrice, activeMonitor.currency)}
                </strong>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Our Store Baseline:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(activeMonitor.baselinePrice || (activeMonitor.currentPrice * 1.04), activeMonitor.currency)}
                </strong>
              </div>
            </div>
          )}

          {activeMonitor ? (
            <PriceChart
              data={activeMonitor.priceHistory}
              currency={activeMonitor.currency}
              height={260}
              showComparison={true}
            />
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No monitors active to chart.
            </div>
          )}
        </div>

        {/* Live Alert Feed Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Recent Price Drops</h3>
            <span className="badge badge-danger">{alerts.filter(a => !a.read).length} Unread</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', maxHeight: 340 }}>
            {alerts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                No alerts detected. All pricing nominal.
              </div>
            ) : (
              alerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(alert.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>

          <button
            onClick={onNavigateToMonitors}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1rem', width: '100%' }}
          >
            <span>View All Monitors</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Head-to-Head Buy Box Matrix */}
      {activeMonitor && (
        <HeadToHeadMatrix
          monitor={activeMonitor}
          onMatchWinner={currentUser?.role === 'admin' ? handleApplyPrice : undefined}
        />
      )}
    </div>
  );
};
