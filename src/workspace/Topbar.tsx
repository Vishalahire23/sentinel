import React from 'react';
import { 
  LayoutDashboard, Activity, Bell, Sliders, Shield, 
  LogOut, Plus, HelpCircle, Zap, Search, Download 
} from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon.tsx';
import type { SessionUser } from '../types.ts';
import type { WorkspacePageId } from './types.ts';
import { WORKSPACE_ROUTES } from './pages.ts';

interface TopbarProps {
  currentPage: WorkspacePageId;
  onNavigate: (page: WorkspacePageId) => void;
  currentUser: SessionUser;
  onLogout: () => void;
  unreadAlertsCount?: number;
  onOpenAddMonitor: () => void;
  onOpenHelp: () => void;
  onSimulateTelemetry?: () => void;
  onOpenPalette?: () => void;
  onExportCsv?: () => void;
  sseConnected?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  unreadAlertsCount = 0,
  onOpenAddMonitor,
  onOpenHelp,
  onSimulateTelemetry,
  onOpenPalette,
  onExportCsv,
  sseConnected = true
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className="icon" size={16} />;
      case 'Activity': return <Activity className="icon" size={16} />;
      case 'Bell': return <Bell className="icon" size={16} />;
      case 'Sliders': return <Sliders className="icon" size={16} />;
      case 'Shield': return <Shield className="icon" size={16} />;
      default: return <Activity className="icon" size={16} />;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Brand Logo & Title */}
        <div 
          className="topbar-brand"
          onClick={() => onNavigate('overview')}
          title="Sentinel Intelligence Dashboard"
          style={{ cursor: 'pointer' }}
        >
          <BrandIcon size={18} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.1 }}>
              SENTINEL
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Market Intel
            </div>
          </div>
        </div>

        <div className="topbar-divider" />

        {/* Top Horizontal Navigation */}
        <nav className="topbar-nav">
          {WORKSPACE_ROUTES.map(route => {
            if (route.adminOnly && currentUser.role !== 'admin') {
              return null;
            }
            const isActive = currentPage === route.id;

            return (
              <button
                key={route.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(route.id)}
              >
                {getIcon(route.iconName)}
                <span>{route.label}</span>
                {route.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="nav-badge">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="topbar-actions">
        {/* SSE Live Status */}
        <div 
          className="topbar-status-pill"
          style={{
            backgroundColor: sseConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: sseConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            color: sseConnected ? '#34d399' : '#f87171'
          }}
          title={sseConnected ? 'Connected to live event stream' : 'Disconnected from stream'}
        >
          <span 
            className="pulse-dot"
            style={{ backgroundColor: sseConnected ? '#10b981' : '#ef4444' }} 
          />
          <span>{sseConnected ? 'SSE Live' : 'Offline'}</span>
        </div>

        {/* Quick Search Trigger */}
        {onOpenPalette && (
          <button
            type="button"
            onClick={onOpenPalette}
            className="topbar-search-btn"
            title="Search monitors, cities, and actions (⌘K / Ctrl+K)"
          >
            <Search size={13} />
            <span className="search-label">Search...</span>
            <span className="search-kbd">⌘K</span>
          </button>
        )}

        {/* Export CSV */}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="btn btn-secondary btn-sm"
            title="Download full intelligence catalog as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}

        {/* Simulate Telemetry Ping */}
        {onSimulateTelemetry && (
          <button
            type="button"
            onClick={onSimulateTelemetry}
            className="btn btn-secondary btn-sm btn-simulate"
            title="Simulate live price shift and broadcast across stream"
          >
            <Zap size={14} />
            <span>Simulate Ping</span>
          </button>
        )}

        {/* Help & Documentation */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="btn btn-secondary btn-sm"
          title="Open Documentation & Help"
        >
          <HelpCircle size={14} />
          <span>Docs</span>
        </button>

        {/* Add Target Monitor */}
        {currentUser.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenAddMonitor}
            className="btn btn-primary btn-sm"
            title="Add a new product or competitor monitor"
          >
            <Plus size={14} />
            <span>Add Target</span>
          </button>
        )}

        <div className="topbar-divider" />

        {/* User Profile & Logout */}
        <div className="topbar-user-section">
          <div 
            className="user-avatar"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role.toUpperCase()}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out of Sentinel"
            className="user-logout-btn"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
