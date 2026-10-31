import React from 'react';
import { LayoutDashboard, Layers, Bell, Sliders, Search } from 'lucide-react';
import type { WorkspacePageId } from './types.ts';

interface MobileBottomNavProps {
  currentPage: WorkspacePageId;
  onNavigate: (page: WorkspacePageId) => void;
  unreadAlertsCount?: number;
  onOpenPalette?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  unreadAlertsCount = 0,
  onOpenPalette
}) => {
  const tabs = [
    { id: 'overview' as WorkspacePageId, label: 'Overview', icon: LayoutDashboard },
    { id: 'monitors' as WorkspacePageId, label: 'Targets', icon: Layers },
    { id: 'alerts' as WorkspacePageId, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'policies' as WorkspacePageId, label: 'Policies', icon: Sliders }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
          >
            <div className="mobile-nav-icon-wrapper">
              <Icon size={20} />
              {tab.badge && tab.badge > 0 ? (
                <span className="mobile-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
              ) : null}
            </div>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}

      {onOpenPalette && (
        <button
          type="button"
          className="mobile-nav-item"
          onClick={onOpenPalette}
          title="Search (⌘K)"
        >
          <div className="mobile-nav-icon-wrapper">
            <Search size={20} />
          </div>
          <span className="mobile-nav-label">Search</span>
        </button>
      )}
    </nav>
  );
};
