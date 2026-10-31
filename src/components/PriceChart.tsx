import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { PricePoint } from '../types.ts';
import { formatCurrency, formatChartDate, formatChartDateFull } from '../format.ts';

interface PriceChartProps {
  data: PricePoint[];
  currency?: string;
  color?: string;
  height?: number;
  showComparison?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  currency = 'INR',
  color = '#6366f1',
  height = 220,
  showComparison = true
}) => {
  const [range, setRange] = useState<'7D' | '14D' | '30D'>('30D');

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No price history recorded yet.
      </div>
    );
  }

  // Filter data based on selected time range
  const displayData = range === '7D' 
    ? data.slice(-7) 
    : range === '14D' 
    ? data.slice(-14) 
    : data;

  const hasMarketAvg = displayData.some(d => d.marketAvg !== undefined);
  const hasBaseline = displayData.some(d => d.baselinePrice !== undefined);

  return (
    <div style={{ width: '100%' }}>
      {/* Time Horizon Selector Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>Timeframe:</span>
        {(['7D', '14D', '30D'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', minWidth: '38px', borderRadius: 'var(--radius-sm)' }}
          >
            {r}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#475569" 
              fontSize={11}
              tickLine={false}
              tickFormatter={formatChartDate}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => formatCurrency(val, currency)}
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              labelFormatter={(label) => `Date: ${formatChartDateFull(String(label))}`}
              formatter={(val: unknown, name: unknown) => {
                const label = name === 'price' ? 'Competitor Tracked' : name === 'marketAvg' ? 'Market Avg Benchmark' : name === 'baselinePrice' ? 'Our Store Baseline' : String(name);
                return [formatCurrency(Number(val), currency), label];
              }}
            />
            {showComparison && (hasMarketAvg || hasBaseline) && (
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  if (value === 'price') return 'Competitor Price';
                  if (value === 'marketAvg') return 'Industry Market Avg';
                  if (value === 'baselinePrice') return 'Our Store Baseline';
                  return value;
                }}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="price" 
              name="price"
              stroke={color} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#priceGradient)" 
            />
            {showComparison && hasMarketAvg && (
              <Line
                type="monotone"
                dataKey="marketAvg"
                name="marketAvg"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            {showComparison && hasBaseline && (
              <Line
                type="monotone"
                dataKey="baselinePrice"
                name="baselinePrice"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
