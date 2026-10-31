import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, LayoutDashboard, Activity, Bell, Sliders, Shield, 
  Plus, Zap, Download, ArrowRight, CornerDownLeft, X 
} from 'lucide-react';
import type { Monitor } from '../types.ts';
import type { WorkspacePageId } from '../workspace/types.ts';
import { formatCurrency } from '../format.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: WorkspacePageId) => void;
  onOpenAddMonitor: () => void;
  onSimulateTelemetry?: () => void;
  onExportCsv?: () => void;
  monitors: Monitor[];
  onSelectMonitor?: (monitor: Monitor) => void;
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Products';
  icon: React.ReactNode;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAddMonitor,
  onSimulateTelemetry,
  onExportCsv,
  monitors,
  onSelectMonitor
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct actions list
  const baseActions: PaletteAction[] = [
    // Navigation
    {
      id: 'nav-overview',
      title: 'Go to Overview Dashboard',
      category: 'Navigation',
      icon: <LayoutDashboard size={16} />,
      perform: () => { onNavigate('overview'); onClose(); }
    },
    {
      id: 'nav-monitors',
      title: 'Go to Monitored Target Catalog',
      category: 'Navigation',
      icon: <Activity size={16} />,
      perform: () => { onNavigate('monitors'); onClose(); }
    },
    {
      id: 'nav-alerts',
      title: 'Go to Price Drop Alerts',
      category: 'Navigation',
      icon: <Bell size={16} />,
      perform: () => { onNavigate('alerts'); onClose(); }
    },
    {
      id: 'nav-policies',
      title: 'Go to Defense Policies',
      category: 'Navigation',
      icon: <Sliders size={16} />,
      perform: () => { onNavigate('policies'); onClose(); }
    },
    {
      id: 'nav-admin',
      title: 'Go to Admin Center & Health',
      category: 'Navigation',
      icon: <Shield size={16} />,
      perform: () => { onNavigate('admin'); onClose(); }
    },

    // Actions
    {
      id: 'act-add',
      title: 'Add New Target Monitor',
      category: 'Actions',
      icon: <Plus size={16} style={{ color: 'var(--primary-accent)' }} />,
      perform: () => { onOpenAddMonitor(); onClose(); }
    },
    {
      id: 'act-simulate',
      title: 'Simulate Live Telemetry Ping',
      category: 'Actions',
      icon: <Zap size={16} style={{ color: '#fbbf24' }} />,
      perform: () => { if (onSimulateTelemetry) onSimulateTelemetry(); onClose(); }
    },
    {
      id: 'act-export',
      title: 'Export Intelligence Catalog (.CSV)',
      category: 'Actions',
      icon: <Download size={16} style={{ color: '#34d399' }} />,
      perform: () => { if (onExportCsv) onExportCsv(); onClose(); }
    }
  ];

  // Add matching products to actions
  const productActions: PaletteAction[] = monitors.map(m => ({
    id: `prod-${m.id}`,
    title: `${m.name} (${formatCurrency(m.currentPrice, m.currency)}) - ${m.city || 'India'}`,
    category: 'Products',
    icon: <Activity size={16} style={{ color: '#38bdf8' }} />,
    perform: () => {
      onNavigate('overview');
      if (onSelectMonitor) onSelectMonitor(m);
      onClose();
    }
  }));

  const allActions = [...baseActions, ...productActions];

  // Filter actions based on query
  const filtered = allActions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  // Keyboard Navigation inside Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].perform();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div 
        className="modal-card" 
        style={{ maxWidth: 640, borderRadius: 16, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <Search size={18} style={{ color: 'var(--primary-accent)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search products, or jump to page..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No commands or products matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.perform}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-prominent)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'var(--bg-elevated)'
                    }}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={13} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer Help */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          backgroundColor: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Sentinel Command Engine</span>
        </div>
      </div>
    </div>
  );
};
