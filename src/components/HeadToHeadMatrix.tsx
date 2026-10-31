import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, CheckCircle2, AlertTriangle, ExternalLink, MapPin, Check, 
  ShieldAlert, TrendingUp, Percent 
} from 'lucide-react';
import type { Monitor } from '../types.ts';
import { formatCurrency } from '../format.ts';
import { INDIA_STATES_AND_CITIES, getCitiesForState, getPincodesForCity } from '../india.ts';

interface HeadToHeadMatrixProps {
  monitor: Monitor;
  onMatchWinner?: (targetPrice: number) => void;
}

interface CompetitorListing {
  platform: string;
  domain: string;
  price: number;
  deliveryTime: string;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  isOurStore?: boolean;
}

export const HeadToHeadMatrix: React.FC<HeadToHeadMatrixProps> = ({ monitor, onMatchWinner }) => {
  const [selectedState, setSelectedState] = useState<string>(monitor.state || 'Maharashtra');
  const [selectedCity, setSelectedCity] = useState<string>(monitor.city || 'Mumbai');
  const [selectedPincode, setSelectedPincode] = useState<string>('400050');
  const [repriceSuccess, setRepriceSuccess] = useState(false);

  useEffect(() => {
    if (monitor.state) setSelectedState(monitor.state);
    if (monitor.city) {
      setSelectedCity(monitor.city);
      const hubs = getPincodesForCity(monitor.city);
      if (hubs.length > 0) setSelectedPincode(hubs[0].pincode);
    }
  }, [monitor.id, monitor.state, monitor.city]);

  // Generate realistic comparative listings across Indian platforms for this SKU in the selected city & pincode
  const current = monitor.currentPrice;
  const currency = monitor.currency;

  const availablePincodes = getPincodesForCity(selectedCity);
  const currentHub = availablePincodes.find(p => p.pincode === selectedPincode) || availablePincodes[0] || {
    pincode: '400001',
    locality: selectedCity,
    darkStoreName: `${selectedCity} Main Dark Store`,
    deliveryMins: 10
  };

  // City-specific regional micro-variance (-1.2% to +1.2%)
  const cityVarianceSeed = (selectedCity + selectedPincode).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cityFactor = 1 + (((cityVarianceSeed % 7) - 3) * 0.004);

  const listings: CompetitorListing[] = [
    {
      platform: 'Amazon India',
      domain: 'amazon.in',
      price: Math.round(current * cityFactor),
      deliveryTime: `Tomorrow, by 11 AM (${selectedCity} Hub)`,
      stock: monitor.stockStatus
    },
    {
      platform: 'Flipkart Plus',
      domain: 'flipkart.com',
      price: Math.round(current * 1.018 * cityFactor),
      deliveryTime: `2 Days Express (${selectedCity})`,
      stock: 'in_stock'
    },
    {
      platform: 'Blinkit Instant',
      domain: 'blinkit.com',
      price: Math.round(current * 0.995 * cityFactor),
      deliveryTime: `⚡ ${currentHub.deliveryMins + 2} Mins (${currentHub.locality} Hub, ${currentHub.pincode})`,
      stock: (cityVarianceSeed % 4 === 0) ? 'low_stock' : 'in_stock'
    },
    {
      platform: 'Zepto Quick',
      domain: 'zepto.in',
      price: Math.round(current * 0.991 * cityFactor),
      deliveryTime: `⚡ ${currentHub.deliveryMins} Mins (${currentHub.darkStoreName})`,
      stock: (cityVarianceSeed % 3 === 0) ? 'low_stock' : 'in_stock'
    },
    {
      platform: 'ONDC Network',
      domain: 'ondc.org',
      price: Math.round(current * 0.997 * cityFactor),
      deliveryTime: `Within 2 Hours (Local Retailer via ONDC)`,
      stock: 'in_stock'
    },
    {
      platform: 'Croma Retail',
      domain: 'croma.com',
      price: Math.round(current * 1.035 * cityFactor),
      deliveryTime: `Same Day Store Pickup (${currentHub.locality || selectedCity})`,
      stock: 'in_stock'
    },
    {
      platform: 'Our Store Direct',
      domain: 'ourstore.in',
      price: monitor.baselinePrice || Math.round(current * 1.04),
      deliveryTime: 'Next Day Prime Delivery',
      stock: 'in_stock',
      isOurStore: true
    }
  ];

  const sorted = [...listings].sort((a, b) => a.price - b.price);
  const winner = sorted[0];
  const ourStore = listings.find(l => l.isOurStore)!;

  const availableCities = getCitiesForState(selectedState);

  // Profit Margin & Landed COGS Guardrail calculation
  const cogs = monitor.cogs || Math.round(current * 0.86);
  const minMarginPercent = monitor.minMarginPercent || 8.0;
  const currentMargin = ((ourStore.price - cogs) / ourStore.price) * 100;
  const projectedMargin = ((winner.price - cogs) / winner.price) * 100;
  const isMarginViolated = projectedMargin < minMarginPercent;

  // Quick-Commerce Stockout Arbitrage Detector
  const blinkitListing = listings.find(l => l.platform.includes('Blinkit'));
  const zeptoListing = listings.find(l => l.platform.includes('Zepto'));
  const isQCommerceDepleted = (blinkitListing?.stock !== 'in_stock') || (zeptoListing?.stock !== 'in_stock');

  const handleExecuteReprice = () => {
    if (onMatchWinner) {
      onMatchWinner(winner.price);
      setRepriceSuccess(true);
      setTimeout(() => setRepriceSuccess(false), 3000);
    }
  };

  return (
    <div className="card h2h-matrix-container" style={{ marginTop: '1.5rem', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 22, 0.95) 100%)' }}>
      {/* Header Block */}
      <div className="h2h-header">
        <div className="h2h-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Trophy size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0, wordBreak: 'break-word' }}>
              Head-to-Head Buy Box Battle: <span style={{ color: '#38bdf8' }}>{selectedCity}</span>
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>
            Real-time pricing matrix across Indian multi-channel retailers for <strong>{monitor.name}</strong> in {selectedCity}, {selectedState}
          </p>
        </div>

        {/* Winner Pill & 1-Click Reprice Action Bar */}
        <div className="h2h-action-bar">
          <div className="h2h-winner-pill">
            <Trophy size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>Cheapest: <strong style={{ color: '#ffffff' }}>{winner.platform}</strong> ({formatCurrency(winner.price, currency)})</span>
          </div>

          {onMatchWinner && ourStore.price > winner.price && (
            <button
              className="h2h-reprice-btn"
              onClick={handleExecuteReprice}
              style={{
                background: isMarginViolated 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: isMarginViolated ? '#090d16' : '#ffffff',
                boxShadow: isMarginViolated 
                  ? '0 2px 10px rgba(245, 158, 11, 0.35)' 
                  : '0 2px 10px rgba(16, 185, 129, 0.35)'
              }}
              title={isMarginViolated ? `Caution: Matching ₹${winner.price} brings margin to ${projectedMargin.toFixed(1)}% (below ${minMarginPercent}% target)` : 'Safe reprice within profit threshold'}
            >
              {repriceSuccess ? (
                <><Check size={14} /> Repriced to Win!</>
              ) : isMarginViolated ? (
                <><ShieldAlert size={14} /> Reprice ({formatCurrency(winner.price, currency)}) [Low Margin]</>
              ) : (
                <><Zap size={14} /> 1-Click Reprice to Win ({formatCurrency(winner.price, currency)})</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Regional Dark Store Selector Panel */}
      <div className="h2h-region-panel">
        <div className="h2h-region-label">
          <MapPin size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span>Fulfillment Hub & Region:</span>
        </div>

        <div className="h2h-region-selects">
          <div className="h2h-select-wrap">
            <select
              className="form-select h2h-dropdown"
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                const cities = getCitiesForState(newState);
                if (cities.length > 0) setSelectedCity(cities[0]);
              }}
              title="State / Union Territory"
            >
              {INDIA_STATES_AND_CITIES.map(s => (
                <option key={s.code} value={s.name} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h2h-select-wrap">
            <select
              className="form-select h2h-dropdown"
              value={selectedCity}
              onChange={(e) => {
                const newCity = e.target.value;
                setSelectedCity(newCity);
                const hubs = getPincodesForCity(newCity);
                if (hubs.length > 0) setSelectedPincode(hubs[0].pincode);
              }}
              title="City"
            >
              {availableCities.map(city => (
                <option key={city} value={city} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {availablePincodes.length > 0 && (
            <div className="h2h-select-wrap">
              <select
                className="form-select h2h-dropdown"
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                title="Hyper-local Dark Store Postal Code"
              >
                {availablePincodes.map(p => (
                  <option key={p.pincode} value={p.pincode} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    {p.pincode} ({p.locality})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Gross Margin & Landed COGS Guardrail Bar */}
      <div className={`h2h-guardrail-bar ${isMarginViolated ? 'violated' : 'healthy'}`}>
        <div className="h2h-guardrail-metrics">
          <div className="h2h-metric-item">
            <span className="h2h-metric-label">Landed Cost (COGS)</span>
            <strong className="h2h-metric-val">{formatCurrency(cogs, currency)}</strong>
          </div>
          <div className="h2h-metric-item">
            <span className="h2h-metric-label">Current Margin</span>
            <strong className="h2h-metric-val" style={{ color: '#38bdf8' }}>
              {currentMargin.toFixed(1)}% (+{formatCurrency(ourStore.price - cogs, currency)}/u)
            </strong>
          </div>
          <div className="h2h-metric-item">
            <span className="h2h-metric-label">Projected if Matched</span>
            <strong className="h2h-metric-val" style={{ color: isMarginViolated ? '#f87171' : '#34d399' }}>
              {projectedMargin.toFixed(1)}% ({isMarginViolated ? 'Under Target' : 'Compliant'})
            </strong>
          </div>
        </div>

        <div className="h2h-guardrail-status">
          {isMarginViolated ? (
            <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldAlert size={14} /> Margin Floor Violated ({minMarginPercent}%)
            </span>
          ) : (
            <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} /> Margin Healthy (&gt; {minMarginPercent}% safety floor)
            </span>
          )}
        </div>
      </div>

      {/* Quick-Commerce Stockout Arbitrage Detector */}
      {isQCommerceDepleted && (
        <div className="h2h-arbitrage-banner">
          <div className="h2h-arbitrage-body">
            <div className="h2h-arbitrage-icon">
              <Zap size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="h2h-arbitrage-title">
                ⚡ Dark Store Stockout Arbitrage: {currentHub.locality} ({currentHub.pincode})
              </div>
              <p className="h2h-arbitrage-desc">
                {zeptoListing?.stock !== 'in_stock' ? 'Zepto' : 'Blinkit'} local dark store has depleted stock. Your direct store has full fulfillment dominance in this PIN code. Safe upward markup opportunity identified.
              </p>
            </div>
          </div>

          <button
            className="h2h-arbitrage-btn"
            onClick={() => {
              if (onMatchWinner) {
                onMatchWinner(ourStore.price + 450);
                setRepriceSuccess(true);
                setTimeout(() => setRepriceSuccess(false), 3000);
              }
            }}
          >
            <TrendingUp size={13} />
            <span>Capitalize (+₹450 Markup)</span>
          </button>
        </div>
      )}

      {/* Grid of Platform Cards */}
      <div className="h2h-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem' }}>
        {listings.map((item, idx) => {
          const isWinner = item.platform === winner.platform;
          const diffFromOur = item.price - ourStore.price;

          return (
            <div
              key={idx}
              className="h2h-card"
              style={{
                backgroundColor: item.isOurStore ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-elevated)',
                border: isWinner 
                  ? '2px solid #fbbf24' 
                  : item.isOurStore 
                  ? '1px solid #6366f1' 
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                position: 'relative'
              }}
            >
              {isWinner && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: 12,
                  backgroundColor: '#fbbf24',
                  color: '#090d16',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  boxShadow: '0 2px 6px rgba(251, 191, 36, 0.4)'
                }}>
                  <Zap size={10} />
                  <span>LOWEST PRICE</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.isOurStore ? '#818cf8' : '#ffffff' }}>
                  {item.platform}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {item.domain}
                </span>
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isWinner ? '#fbbf24' : '#ffffff', marginBottom: '0.4rem' }}>
                {formatCurrency(item.price, currency)}
              </div>

              {/* Price delta against our store */}
              <div style={{ fontSize: '0.75rem', marginBottom: '0.85rem' }}>
                {item.isOurStore ? (
                  <span style={{ color: 'var(--text-muted)' }}>Our Baseline Reference</span>
                ) : diffFromOur < 0 ? (
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    Undercuts us by {formatCurrency(Math.abs(diffFromOur), currency)}
                  </span>
                ) : diffFromOur > 0 ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Higher than us by {formatCurrency(diffFromOur, currency)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Equal to our price</span>
                )}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: '0.7rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SLA Delivery:</span>
                  <span style={{ fontWeight: 600, color: item.deliveryTime.includes('⚡') ? '#fbbf24' : 'inherit' }}>
                    {item.deliveryTime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Stock:</span>
                  <span className={`badge badge-${item.stock === 'in_stock' ? 'success' : item.stock === 'low_stock' ? 'warning' : 'danger'}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                    {item.stock.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
