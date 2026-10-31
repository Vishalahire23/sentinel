import type { WorkspaceNavRoute } from './types.ts';

export const WORKSPACE_ROUTES: WorkspaceNavRoute[] = [
  { id: 'overview', label: 'Overview', iconName: 'LayoutDashboard' },
  { id: 'monitors', label: 'Monitors', iconName: 'Activity' },
  { id: 'alerts', label: 'Alerts', iconName: 'Bell' },
  { id: 'policies', label: 'Policies', iconName: 'Sliders' },
  { id: 'admin', label: 'Admin Center', iconName: 'Shield', adminOnly: true }
];
