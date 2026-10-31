import React, { useState } from 'react';
import type { Monitor } from '../types.ts';
import { LocationOptions } from './LocationOptions.tsx';

interface MonitorFormProps {
  initialData?: Partial<Monitor>;
  onSubmit: (data: Partial<Monitor>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MonitorForm: React.FC<MonitorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [category, setCategory] = useState(initialData?.category || 'Electronics');
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice ? String(initialData.currentPrice) : '');
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [frequency, setFrequency] = useState(initialData?.frequency || '15m');
  const [stockStatus, setStockStatus] = useState<Monitor['stockStatus']>(initialData?.stockStatus || 'in_stock');
  const [state, setState] = useState(initialData?.state || 'Maharashtra');
  const [city, setCity] = useState(initialData?.city || 'Mumbai');
  const [pincode, setPincode] = useState(initialData?.pincode || '400001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentPrice) return;

    onSubmit({
      name: name.trim(),
      url: url.trim(),
      category,
      currentPrice: parseFloat(currentPrice),
      previousPrice: initialData?.previousPrice || parseFloat(currentPrice),
      currency,
      frequency,
      stockStatus,
      state,
      city,
      pincode,
      region: `${city}, ${state}`
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Product Name / Title</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Competitor Target URL</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://www.amazon.in/dp/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Electronics">Electronics</option>
            <option value="Computers">Computers</option>
            <option value="Audio">Audio</option>
            <option value="Displays">Displays</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Mobile">Mobile</option>
            <option value="Quick Commerce">Quick Commerce (10-min)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <select 
            className="form-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Target / Current Price</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="29999.00"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Check Frequency</label>
          <select 
            className="form-select"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="5m">Every 5 minutes (Priority)</option>
            <option value="15m">Every 15 minutes (Standard)</option>
            <option value="30m">Every 30 minutes</option>
            <option value="1h">Every 1 hour</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Initial Stock Status</label>
        <select 
          className="form-select"
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value as Monitor['stockStatus'])}
        >
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock (Scarcity warning)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* State & City Geographic Node */}
      <LocationOptions
        selectedState={state}
        selectedCity={city}
        pincode={pincode}
        onChangeLocation={(newState, newCity, newPin) => {
          setState(newState);
          setCity(newCity);
          if (newPin) setPincode(newPin);
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Monitor' : 'Create Monitor'}
        </button>
      </div>
    </form>
  );
};
