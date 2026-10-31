import React, { useState } from 'react';
import { Plus, MapPin, Download } from 'lucide-react';
import { PageHeading } from '../PageHeading.tsx';
import { AdaptiveSearch } from '../../components/AdaptiveSearch.tsx';
import { MonitorTable } from '../MonitorTable.tsx';
import { EmptyState } from '../../components/EmptyState.tsx';
import { Modal } from '../../components/Modal.tsx';
import { PriceChart } from '../../components/PriceChart.tsx';
import { MobilePreview } from '../../components/MobilePreview.tsx';
import type { Monitor, SessionUser } from '../../types.ts';
import { filterAndRank } from '../../search.ts';
import { INDIA_STATES_AND_CITIES, getCitiesForState } from '../../india.ts';
import { exportMonitorsToCsv } from '../../format.ts';

interface MonitorsPageProps {
  monitors: Monitor[];
  currentUser?: SessionUser;
  onOpenAddMonitor: () => void;
  onEditMonitor: (monitor: Monitor) => void;
  onDeleteMonitor: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: Monitor['status']) => void;
}

export const MonitorsPage: React.FC<MonitorsPageProps> = ({
  monitors,
  currentUser,
  onOpenAddMonitor,
  onEditMonitor,
  onDeleteMonitor,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);

  const categories = Array.from(new Set(monitors.map(m => m.category))).filter(Boolean);
  const citiesForState = selectedState !== 'All' ? getCitiesForState(selectedState) : [];

  let filtered: Monitor[] = filterAndRank<Monitor>(monitors, searchQuery);
  if (selectedCategory !== 'All') {
    filtered = filtered.filter(m => m.category === selectedCategory);
  }
  if (selectedState !== 'All') {
    filtered = filtered.filter(m => m.state === selectedState);
  }
  if (selectedCity !== 'All') {
    filtered = filtered.filter(m => m.city === selectedCity);
  }

  return (
    <div className="page-wrapper">
      <PageHeading
        title="Monitored Target Catalog"
        subtitle="Manage competitor product targets, tracking intervals, and price change telemetry by Indian State & City."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => exportMonitorsToCsv(filtered)}
              title="Download filtered products as formatted CSV spreadsheet"
            >
              <Download size={15} /> Export Catalog (.CSV)
            </button>
            {currentUser?.role === 'admin' && (
              <button className="btn btn-primary" onClick={onOpenAddMonitor}>
                <Plus size={16} /> Add Target
              </button>
            )}
          </div>
        }
      />

      <div style={{ marginBottom: '1.25rem' }}>
        <AdaptiveSearch
          placeholder="Filter targets by SKU, product name, or competitor domain..."
          value={searchQuery}
          onChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* State & City Geographic Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <MapPin size={14} style={{ color: 'var(--primary-accent)' }} />
          <span style={{ fontWeight: 600, color: '#ffffff' }}>Regional Filter:</span>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedCity('All');
          }}
        >
          <option value="All">All Indian States & UTs (All 36)</option>
          {INDIA_STATES_AND_CITIES.map(s => (
            <option key={s.code} value={s.name}>{s.name}</option>
          ))}
        </select>

        {selectedState !== 'All' && (
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="All">All Cities in {selectedState}</option>
            {citiesForState.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}

        {(selectedState !== 'All' || selectedCity !== 'All') && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedState('All'); setSelectedCity('All'); }}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            Clear Geographic Filter
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No targets match criteria"
          description="Try broadening your search query or reset category filters to view active monitors."
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          }
        />
      ) : (
        <MonitorTable
          monitors={filtered}
          currentUser={currentUser}
          onToggleStatus={onToggleStatus}
          onEdit={onEditMonitor}
          onDelete={onDeleteMonitor}
          onSelectMonitor={setSelectedMonitor}
        />
      )}

      {/* Detail / Telemetry Inspection Modal */}
      {selectedMonitor && (
        <Modal
          isOpen={!!selectedMonitor}
          onClose={() => setSelectedMonitor(null)}
          title={`Telemetry: ${selectedMonitor.name}`}
          maxWidth="700px"
          footer={
            <button className="btn btn-primary" onClick={() => setSelectedMonitor(null)}>
              Done
            </button>
          }
        >
          <div className="monitor-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Observed Price Curve ({selectedMonitor.currency})
              </h4>
              <PriceChart
                data={selectedMonitor.priceHistory}
                currency={selectedMonitor.currency}
                height={200}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Target Endpoint: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedMonitor.domain}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MobilePreview monitor={selectedMonitor} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
