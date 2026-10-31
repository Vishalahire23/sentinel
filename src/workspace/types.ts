export type WorkspacePageId = 'overview' | 'monitors' | 'alerts' | 'policies' | 'admin';

export interface WorkspaceNavRoute {
  id: WorkspacePageId;
  label: string;
  iconName: string;
  adminOnly?: boolean;
}
