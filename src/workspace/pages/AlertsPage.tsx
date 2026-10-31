import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, MapPin, Landmark } from 'lucide-react';
import { PageHeading } from '../PageHeading.tsx';
import { EmptyState } from '../../components/EmptyState.tsx';
import { AdaptiveSearch } from '../../components/AdaptiveSearch.tsx';
import type { Alert } from '../../types.ts';
import { formatDate } from '../../format.ts';
import { INDIA_STATES_AND_CITIES, getCitiesForState } from '../../india.ts';

interface AlertsPageProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onSelectAlert,
  onMarkAllRead,
  onDismiss
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'govt'>('all');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const citiesForState = selectedState !== 'All' ? getCitiesForState(selectedState) : [];

  const q = searchQuery.toLowerCase().trim();
  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread' && a.read) return false;
    if (filter === 'critical' && a.severity !== 'critical') return false;
    if (filter === 'govt' && !a.isGovtAlert) return false;
    if (selectedState !== 'All' && a.state !== selectedState) return false;
    if (selectedCity !== 'All' && a.city !== selectedCity) return false;
    if (q) {
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchMsg = a.message?.toLowerCase().includes(q);
      const matchName = a.monitorName?.toLowerCase().includes(q);
      const matchCity = a.city?.toLowerCase().includes(q);
      const matchState = a.state?.toLowerCase().includes(q);
      const matchAuth = a.authority?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchName && !matchCity && !matchState && !matchAuth) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="page-wrapper">
      <PageHeading
        title="Price Drop & Policy Alerts"
        subtitle="Real-time incident log of competitor price undercuts and inventory status shifts by State and City."
        actions={
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onMarkAllRead}
            disabled={alerts.every(a => a.read)}
          >
            <CheckCheck size={16} /> Mark All Read
          </button>
        }
      />

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <AdaptiveSearch
          placeholder="Search alerts by SKU, incident title, competitor platform, or city..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Filter Tabs & State/City Bar */}
      <div className="alerts-filter-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="alerts-tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: 2 }}>
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ flexShrink: 0 }}
          >
            All Events ({alerts.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('unread')}
            style={{ flexShrink: 0 }}
          >
            Unread ({alerts.filter(a => !a.read).length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('critical')}
            style={{ flexShrink: 0 }}
          >
            Critical ({alerts.filter(a => a.severity === 'critical').length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'govt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('govt')}
            style={{
              flexShrink: 0,
              ...(filter === 'govt' ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#090d16' } : {})
            }}
          >
            <Landmark size={13} />
            <span>Govt Regulatory ({alerts.filter(a => a.isGovtAlert).length})</span>
          </button>
        </div>

        {/* State & City Filter dropdowns */}
        <div className="alerts-geo-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <MapPin size={14} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
          <select
            className="form-select alerts-geo-select"
            style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('All');
            }}
          >
            <option value="All">All Indian States (All 36)</option>
            {INDIA_STATES_AND_CITIES.map(s => (
              <option key={s.code} value={s.name}>{s.name}</option>
            ))}
          </select>

          {selectedState !== 'All' && (
            <select
              className="form-select alerts-geo-select"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="All">All Cities in {selectedState}</option>
              {citiesForState.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No alerts found"
          description={searchQuery ? `No alerts match "${searchQuery}". Try a different keyword or reset filters.` : "There are currently no alerts matching your active status and geographic filter criteria."}
          action={
            (searchQuery || selectedState !== 'All' || selectedCity !== 'All' || filter !== 'all') ? (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchQuery(''); setSelectedState('All'); setSelectedCity('All'); setFilter('all'); }}
              >
                Reset All Filters & Search
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="card alert-item-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.5rem',
                borderLeft: alert.severity === 'critical' ? '4px solid #ef4444' : '4px solid #f59e0b',
                opacity: alert.read ? 0.75 : 1
              }}
            >
              <div 
                className="alert-item-body"
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => onSelectAlert(alert)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'neutral'}`}>
                    {alert.severity}
                  </span>
                  {alert.isGovtAlert && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: '0.675rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      fontWeight: 700,
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <Landmark size={11} />
                      GoI Regulatory Notice: {alert.authority || 'Legal Compliance'}
                    </span>
                  )}
                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                    {alert.title}
                  </span>
                  {!alert.read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1' }} />
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {alert.message}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, flexWrap: 'wrap' }}>
                  <span>Target: {alert.monitorName}</span>
                  <span>•</span>
                  <span>{formatDate(alert.timestamp)}</span>
                  {alert.city && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        📍 {alert.city}, {alert.state || 'India'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="alert-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectAlert(alert)}
                >
                  Inspect
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDismiss(alert.id)}
                  title="Dismiss alert"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
