import React, { useState } from 'react';
import { 
  Shield, Plus, MapPin, Landmark, Scale, AlertTriangle, 
  FileText, CheckCircle2, ShieldCheck, Lock 
} from 'lucide-react';
import { PageHeading } from '../PageHeading.tsx';
import { Toggle } from '../../components/Toggle.tsx';
import { Modal } from '../../components/Modal.tsx';
import type { Policy, PolicyCategory, SessionUser } from '../../types.ts';
import { INDIA_STATES_AND_CITIES, getCitiesForState } from '../../india.ts';

interface PoliciesPageProps {
  policies: Policy[];
  currentUser: SessionUser;
  onTogglePolicy: (id: string) => void;
  onAddPolicy?: (newPolicy: Omit<Policy, 'id'>) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ 
  policies, 
  currentUser,
  onTogglePolicy,
  onAddPolicy 
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'govt' | 'commercial'>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Policy Form State
  const [newName, setNewName] = useState('');
  const [newIsGovt, setNewIsGovt] = useState(true);
  const [newCategory, setNewCategory] = useState<PolicyCategory>('Govt Regulatory Compliance');
  const [newAuthority, setNewAuthority] = useState('Ministry of Consumer Affairs (GoI)');
  const [newPenaltyNotice, setNewPenaltyNotice] = useState('Sec 36 Penalty up to ₹1,00,000 / Takedown');
  const [newCondition, setNewCondition] = useState('Competitor Listing Price > Declared Maximum Retail Price (MRP)');
  const [newAction, setNewAction] = useState('Flag criminal violation under Legal Metrology; auto-clamp price and alert compliance team');
  const [newScopeType, setNewScopeType] = useState<'national' | 'state' | 'city'>('state');
  const [newScopeState, setNewScopeState] = useState('Maharashtra');
  const [newScopeCity, setNewScopeCity] = useState('Mumbai');

  const filteredPolicies = policies.filter(p => {
    if (categoryFilter === 'govt' && !p.isGovtPolicy) return false;
    if (categoryFilter === 'commercial' && p.isGovtPolicy) return false;
    if (selectedStateFilter !== 'All') {
      if (p.scopeType !== 'national' && p.scopeState && p.scopeState !== selectedStateFilter) {
        return false;
      }
    }
    return true;
  });

  const govtCount = policies.filter(p => p.isGovtPolicy).length;
  const commercialCount = policies.filter(p => !p.isGovtPolicy).length;

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (onAddPolicy) {
      onAddPolicy({
        name: newName.trim(),
        condition: newCondition,
        threshold: 10,
        action: newAction,
        enabled: true,
        scopeType: newScopeType,
        scopeState: newScopeType !== 'national' ? newScopeState : undefined,
        scopeCity: newScopeType === 'city' ? newScopeCity : undefined,
        isGovtPolicy: newIsGovt,
        category: newCategory,
        authority: newAuthority,
        penaltyNotice: newPenaltyNotice
      });
    }

    setIsModalOpen(false);
    setNewName('');
  };

  return (
    <div className="page-wrapper">
      <PageHeading
        title="Autonomous Defense Policies"
        subtitle="Enforce programmatic price compliance with Government of India (GoI) Legal Metrology, CCPA, CCI, and GST regulations across all 28 States & 8 UTs."
        actions={
          isAdmin ? (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Deploy New Policy
            </button>
          ) : undefined
        }
      />

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">Total Active Policies</div>
            <div className="stat-value" style={{ fontSize: '1.45rem' }}>{policies.filter(p => p.enabled).length} / {policies.length}</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <CheckCircle2 size={12} /> Active Real-Time Enforcement
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">GoI Central Mandates</div>
            <div className="stat-value" style={{ fontSize: '1.45rem', color: '#f59e0b' }}>
              {policies.filter(p => p.isGovtPolicy && p.scopeType === 'national').length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Legal Metrology, CCPA, CCI, GST Rule 138, BIS
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">State & City Regulations</div>
            <div className="stat-value" style={{ fontSize: '1.45rem', color: '#38bdf8' }}>
              {policies.filter(p => p.scopeType !== 'national').length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Across Maharashtra, Karnataka, Delhi, TN, Gujarat, WB
            </div>
          </div>
        </div>
      </div>

      {/* Filters: Category & State */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--bg-elevated)',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Category Filter Pills */}
        <div className="policies-tabs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: 2 }}>
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategoryFilter('all')}
            style={{ flexShrink: 0 }}
          >
            All Policies ({policies.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'govt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategoryFilter('govt')}
            style={{
              flexShrink: 0,
              ...(categoryFilter === 'govt' ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#090d16' } : {})
            }}
          >
            <Landmark size={13} />
            <span>Govt of India Compliance ({govtCount})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'commercial' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategoryFilter('commercial')}
            style={{ flexShrink: 0 }}
          >
            <ShieldCheck size={13} />
            <span>Commercial Pricing Defense ({commercialCount})</span>
          </button>
        </div>

        {/* State Filter */}
        <div className="policies-geo-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <MapPin size={15} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Jurisdiction:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
          >
            <option value="All">All Jurisdictions & National</option>
            {INDIA_STATES_AND_CITIES.map(s => (
              <option key={s.code} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="policies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
        {filteredPolicies.map(policy => (
          <div 
            key={policy.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderColor: policy.isGovtPolicy ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {policy.isGovtPolicy && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)'
              }} />
            )}

            <div>
              {/* Header with Badges and Toggle */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {policy.isGovtPolicy ? (
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
                        {policy.scopeType === 'national' ? 'GoI Central Mandate' : `State Regulation (${policy.scopeState || 'India'})`}
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: '0.675rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 4,
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        fontWeight: 700
                      }}>
                        <Shield size={11} />
                        Commercial Defense
                      </span>
                    )}

                    {policy.category && (
                      <span style={{
                        fontSize: '0.675rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 4,
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {policy.category}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#ffffff', marginTop: 4, lineHeight: 1.3 }}>
                    {policy.name}
                  </h3>
                </div>

                {isAdmin && (
                  <Toggle
                    checked={policy.enabled}
                    onChange={() => onTogglePolicy(policy.id)}
                  />
                )}
              </div>

              {/* Authority & Scope Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem', fontSize: '0.75rem' }}>
                {policy.authority && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8' }}>
                    <Scale size={12} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <span><strong>Authority:</strong> {policy.authority}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8' }}>
                  <MapPin size={12} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Jurisdiction:</strong>{' '}
                    {policy.scopeType === 'city' && policy.scopeCity
                      ? `${policy.scopeCity}, ${policy.scopeState}`
                      : policy.scopeType === 'state' && policy.scopeState
                      ? `${policy.scopeState} (All Cities)`
                      : 'Pan-India (All 28 States & 8 UTs)'}
                  </span>
                </div>

                {policy.penaltyNotice && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 5, 
                    color: '#f87171', 
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 4,
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem' }}><strong>Statutory Risk:</strong> {policy.penaltyNotice}</span>
                  </div>
                )}
              </div>

              {/* Trigger Condition */}
              <div style={{ marginBottom: '0.85rem' }}>
                <span className="stat-title" style={{ fontSize: '0.7rem' }}>Trigger Rule Condition:</span>
                <div style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-elevated)',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: 3,
                  border: '1px solid var(--border-subtle)'
                }}>
                  {policy.condition}
                </div>
              </div>

              {/* Automated Countermeasure */}
              <div>
                <span className="stat-title" style={{ fontSize: '0.7rem' }}>Automated Countermeasure & Compliance Action:</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
                  {policy.action}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            {isAdmin && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '1.25rem',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${policy.enabled ? 'badge-success' : 'badge-neutral'}`}>
                  {policy.enabled ? 'Active' : 'Standby'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Deploy Indian Government or Pricing Defense Policy"
          maxWidth="640px"
        >
          <form onSubmit={handleCreatePolicy}>
            <div className="form-group">
              <label className="form-label">Policy Nature</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn ${newIsGovt ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setNewIsGovt(true);
                    setNewCategory('Govt Regulatory Compliance');
                    setNewAuthority('Ministry of Consumer Affairs (GoI)');
                  }}
                  style={{ justifyContent: 'center' }}
                >
                  <Landmark size={15} />
                  <span>Indian Govt Regulation (GoI)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${!newIsGovt ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setNewIsGovt(false);
                    setNewCategory('Pricing Defense');
                    setNewAuthority('Internal Merchandising Committee');
                  }}
                  style={{ justifyContent: 'center' }}
                >
                  <Shield size={15} />
                  <span>Commercial Margin Defense</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Policy Title</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Legal Metrology: Packaged Commodities MRP Enforcement"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Policy Category</label>
                <select
                  className="form-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as PolicyCategory)}
                >
                  <option value="Govt Regulatory Compliance">Govt Regulatory Compliance</option>
                  <option value="Tax & GST">Tax & GST</option>
                  <option value="Consumer Protection">Consumer Protection</option>
                  <option value="Supply Chain & Labour">Supply Chain & Labour</option>
                  <option value="Pricing Defense">Pricing Defense</option>
                </select>
              </div>

              <div>
                <label className="form-label">Enforcing Authority</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Department of Consumer Affairs (DCA)"
                  value={newAuthority}
                  onChange={(e) => setNewAuthority(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statutory Legal Reference / Penalty Clause</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Legal Metrology Act Sec 36 / Fine up to ₹1,00,000 / Takedown"
                value={newPenaltyNotice}
                onChange={(e) => setNewPenaltyNotice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Geographic Jurisdiction Level</label>
              <select
                className="form-select"
                value={newScopeType}
                onChange={(e) => setNewScopeType(e.target.value as 'national' | 'state' | 'city')}
              >
                <option value="national">Pan-India National (All 28 States & 8 UTs)</option>
                <option value="state">Specific State (All Cities in State)</option>
                <option value="city">Specific City (Metro Hub / Quick Commerce Zone)</option>
              </select>
            </div>

            {newScopeType !== 'national' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Select State</label>
                  <select
                    className="form-select"
                    value={newScopeState}
                    onChange={(e) => {
                      setNewScopeState(e.target.value);
                      const cities = getCitiesForState(e.target.value);
                      if (cities[0]) setNewScopeCity(cities[0]);
                    }}
                  >
                    {INDIA_STATES_AND_CITIES.map(s => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {newScopeType === 'city' && (
                  <div>
                    <label className="form-label">Select City in {newScopeState}</label>
                    <select
                      className="form-select"
                      value={newScopeCity}
                      onChange={(e) => setNewScopeCity(e.target.value)}
                    >
                      {getCitiesForState(newScopeState).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Trigger Rule Condition</label>
              <input
                type="text"
                className="form-input"
                required
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Automated Countermeasure & Compliance Action</label>
              <textarea
                className="form-input"
                style={{ height: 75, resize: 'vertical' }}
                required
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Deploy Policy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
