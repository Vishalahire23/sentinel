import React from 'react';
import { 
  LayoutDashboard, Activity, Bell, Sliders, Settings, Shield, LogOut 
} from 'lucide-react';
import { BrandIcon } from '../components/BrandIcon.tsx';
import type { SessionUser } from '../types.ts';
import type { WorkspacePageId } from './types.ts';
import { WORKSPACE_ROUTES } from './pages.ts';

interface SidebarProps {
  currentPage: WorkspacePageId;
  onNavigate: (page: WorkspacePageId) => void;
  currentUser: SessionUser;
  onLogout: () => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  unreadAlertsCount = 0
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className="icon" />;
      case 'Activity': return <Activity className="icon" />;
      case 'Bell': return <Bell className="icon" />;
      case 'Sliders': return <Sliders className="icon" />;
      case 'Settings': return <Settings className="icon" />;
      case 'Shield': return <Shield className="icon" />;
      default: return <Activity className="icon" />;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BrandIcon size={20} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            SENTINEL
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Market Intelligence
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {WORKSPACE_ROUTES.map(route => {
          if (route.adminOnly && currentUser.role !== 'admin') {
            return null;
          }
          const isActive = currentPage === route.id;

          return (
            <div
              key={route.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(route.id)}
            >
              {getIcon(route.iconName)}
              <span style={{ flex: 1 }}>{route.label}</span>
              {route.id === 'alerts' && unreadAlertsCount > 0 && (
                <span style={{
                  padding: '0.15rem 0.45rem',
                  borderRadius: 999,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {unreadAlertsCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-prominent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'var(--primary-accent)'
          }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentUser.role.toUpperCase()}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
