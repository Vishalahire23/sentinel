import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Tag } from 'lucide-react';

interface AdaptiveSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const AdaptiveSearch: React.FC<AdaptiveSearchProps> = ({
  placeholder = 'Search monitors, domains, categories...',
  value,
  onChange,
  categories = [],
  selectedCategory = 'All',
  onSelectCategory
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}>
        <Search 
          size={16} 
          style={{
            position: 'absolute',
            left: 14,
            color: isFocused ? 'var(--primary-accent)' : 'var(--text-muted)',
            pointerEvents: 'none',
            transition: 'color 0.15s ease'
          }} 
        />
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          style={{
            paddingLeft: '2.5rem',
            paddingRight: value ? '2.25rem' : '4.5rem',
            height: '42px',
            fontSize: '0.875rem'
          }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value ? (
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: 12,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        ) : (
          <div style={{
            position: 'absolute',
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            ⌘K
          </div>
        )}
      </div>

      {categories.length > 0 && onSelectCategory && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Tag size={12} /> Filters:
          </span>
          <button
            onClick={() => onSelectCategory('All')}
            className={`btn btn-sm ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '999px', padding: '0.2rem 0.65rem' }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '999px', padding: '0.2rem 0.65rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
