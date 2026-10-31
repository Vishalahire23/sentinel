import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { INDIA_STATES_AND_CITIES, getCitiesForState } from '../india.ts';

interface LocationOptionsProps {
  selectedState?: string;
  selectedCity?: string;
  pincode?: string;
  onChangeLocation: (state: string, city: string, pincode?: string) => void;
}

export const LocationOptions: React.FC<LocationOptionsProps> = ({
  selectedState = 'Maharashtra',
  selectedCity = 'Mumbai',
  pincode = '',
  onChangeLocation
}) => {
  const [currentState, setCurrentState] = useState(selectedState || 'Maharashtra');
  const [currentCity, setCurrentCity] = useState(selectedCity || 'Mumbai');
  const [currentPin, setCurrentPin] = useState(pincode || '');

  const availableCities = getCitiesForState(currentState);

  useEffect(() => {
    if (selectedState) setCurrentState(selectedState);
    if (selectedCity) setCurrentCity(selectedCity);
    if (pincode !== undefined) setCurrentPin(pincode);
  }, [selectedState, selectedCity, pincode]);

  const handleStateChange = (newState: string) => {
    setCurrentState(newState);
    const cities = getCitiesForState(newState);
    const defaultCity = cities[0] || '';
    setCurrentCity(defaultCity);
    onChangeLocation(newState, defaultCity, currentPin);
  };

  const handleCityChange = (newCity: string) => {
    setCurrentCity(newCity);
    onChangeLocation(currentState, newCity, currentPin);
  };

  const handlePinChange = (newPin: string) => {
    setCurrentPin(newPin);
    onChangeLocation(currentState, currentCity, newPin);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem',
      marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
        <MapPin size={15} style={{ color: 'var(--primary-accent)' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
          India Regional & City Telemetry Node
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Indian State / UT (All 36)</label>
          <select
            className="form-select"
            value={currentState}
            onChange={(e) => handleStateChange(e.target.value)}
          >
            {INDIA_STATES_AND_CITIES.map(state => (
              <option key={state.code} value={state.name}>
                {state.name} ({state.type === 'Union Territory' ? 'UT' : 'State'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>City / Hub ({availableCities.length} available)</label>
          <select
            className="form-select"
            value={currentCity}
            onChange={(e) => handleCityChange(e.target.value)}
          >
            {availableCities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>
            Local Delivery Pincode (Optional)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 400001, 560001, 110001"
            value={currentPin}
            onChange={(e) => handlePinChange(e.target.value)}
            maxLength={6}
          />
        </div>

        <div style={{
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <Navigation size={13} style={{ color: '#10b981' }} />
          <span>Active Probe: <strong>{currentCity}, {currentState}</strong></span>
        </div>
      </div>
    </div>
  );
};
