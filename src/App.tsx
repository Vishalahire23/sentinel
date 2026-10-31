import React, { useState, useEffect, useCallback } from 'react';
import { api, subscribeToTelemetry } from './api.ts';
import type { SessionUser, Monitor, Alert, Policy, DashboardStats } from './types.ts';
import type { WorkspacePageId } from './workspace/types.ts';
import { AuthPage } from './components/AuthPage.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { Topbar } from './workspace/Topbar.tsx';
import { OverviewPage } from './workspace/pages/OverviewPage.tsx';
import { MonitorsPage } from './workspace/pages/MonitorsPage.tsx';
import { AlertsPage } from './workspace/pages/AlertsPage.tsx';
import { PoliciesPage } from './workspace/pages/PoliciesPage.tsx';
import { NotFoundPage } from './workspace/pages/NotFoundPage.tsx';
import { MonitorDialog } from './workspace/MonitorDialog.tsx';
import { AlertDialog } from './workspace/AlertDialog.tsx';
import { DeleteDialog } from './workspace/DeleteDialog.tsx';
import { HelpDialog } from './workspace/HelpDialog.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { MobileBottomNav } from './workspace/MobileBottomNav.tsx';
import { InstallAppBanner } from './components/InstallAppBanner.tsx';
import { exportMonitorsToCsv } from './format.ts';
import './styles.css';

export function App() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Workspace Data State
  const [currentPage, setCurrentPage] = useState<WorkspacePageId>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalMonitors: 0,
    activeMonitors: 0,
    criticalAlerts: 0,
    avgPriceChange: 0,
    lastSyncTime: ''
  });
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Dialogs State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [deletingMonitorId, setDeletingMonitorId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(true);

  // Global Command Palette Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Load Session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getCurrentUser();
        setCurrentUser(res.user);
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch workspace datasets
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [statsData, monitorsData, alertsData, policiesData] = await Promise.all([
        api.getStats(),
        api.getMonitors(),
        api.getAlerts(),
        api.getPolicies()
      ]);
      setStats(statsData);
      setMonitors(monitorsData);
      setAlerts(alertsData);
      setPolicies(policiesData);
    } catch (err) {
      console.error('Failed to fetch workspace data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, refreshData]);

  // Subscribe to Real-Time SSE Stream (Roadmap Phase 1)
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToTelemetry((event) => {
      if (event.type === 'CONNECTED') {
        setSseConnected(true);
      } else if (event.type === 'PRICE_SHIFT') {
        const payload = event.data as { monitor: Monitor; alert?: Alert };
        if (payload?.monitor) {
          setMonitors(prev => prev.map(m => m.id === payload.monitor.id ? payload.monitor : m));
          if (payload.alert) {
            setAlerts(prev => [payload.alert!, ...prev]);
          }
          setLiveToast(`⚡ Live SSE Stream: ${payload.monitor.name} price shifted to $${payload.monitor.currentPrice} (${payload.monitor.changePercent}%)`);
          setTimeout(() => setLiveToast(null), 4500);
          refreshData();
        }
      } else if (event.type === 'REPRICE_EXECUTED') {
        const payload = event.data as { monitor: Monitor; newPrice: number; reason: string };
        if (payload?.monitor) {
          setLiveToast(`🎯 Automated Reprice: ${payload.monitor.name} set to ₹${payload.newPrice.toLocaleString()}`);
          setTimeout(() => setLiveToast(null), 4500);
          refreshData();
        }
      } else if (event.type === 'FESTIVE_CRASH_SIMULATED') {
        const payload = event.data as { festiveName?: string; count?: number };
        setLiveToast(`🔥 Festive War Room: ${payload?.festiveName || 'Diwali blitz'} triggered across ${payload?.count || 3} items!`);
        setTimeout(() => setLiveToast(null), 5000);
        refreshData();
      }
    });

    return () => unsubscribe();
  }, [currentUser, refreshData]);

  const handleSimulateTelemetry = async () => {
    try {
      await api.simulatePriceShift();
    } catch (err: unknown) {
      console.warn('Simulation trigger failed', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout error', e);
    }
    setCurrentUser(null);
    setCurrentPage('overview');
  };

  // Monitor CRUD
  const handleSaveMonitor = async (data: Partial<Monitor>) => {
    try {
      if (editingMonitor) {
        await api.updateMonitor(editingMonitor.id, data);
      } else {
        await api.addMonitor(data);
      }
      setIsAddOpen(false);
      setEditingMonitor(null);
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving monitor');
    }
  };

  const handleUpdateMonitorPrice = async (monitorId: string, newPrice: number) => {
    try {
      const mon = monitors.find(m => m.id === monitorId);
      if (!mon) return;
      try {
        await api.repriceMonitor(monitorId, newPrice, '1-Click Buy Box Match');
      } catch {
        await api.updateMonitor(monitorId, { baselinePrice: newPrice });
      }
      await refreshData();
      setLiveToast(`✓ Deployed counter-price: ${mon.name} baseline set to ₹${newPrice.toLocaleString()}`);
      setTimeout(() => setLiveToast(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error applying reprice');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: Monitor['status']) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.updateMonitor(id, { status: nextStatus });
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMonitorId) return;
    try {
      await api.deleteMonitor(deletingMonitorId);
      setDeletingMonitorId(null);
      await refreshData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting monitor');
    }
  };

  // Alert Actions
  const handleMarkAlertRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await api.dismissAlert(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    for (const a of alerts) {
      if (!a.read) await api.markAlertRead(a.id);
    }
    await refreshData();
  };

  // Policy Action
  const handleTogglePolicy = async (id: string) => {
    try {
      await api.togglePolicy(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: '#94a3b8' }}>
        Authenticating Sentinel node...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onSuccess={setCurrentUser} />;
  }

  const deletingMonitor = monitors.find(m => m.id === deletingMonitorId);

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <Topbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadAlertsCount={alerts.filter(a => !a.read).length}
        onOpenAddMonitor={() => { setEditingMonitor(null); setIsAddOpen(true); }}
        onOpenHelp={() => setIsHelpOpen(true)}
        onSimulateTelemetry={handleSimulateTelemetry}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onExportCsv={() => exportMonitorsToCsv(monitors)}
        sseConnected={sseConnected}
      />

      {/* PWA Install Smart Banner (Mobile & Desktop) */}
      <InstallAppBanner />

      {/* Main Content Area */}
      <div className="main-content">

        {/* Live SSE Notification Toast */}
        {liveToast && (
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            padding: '0.85rem 1.25rem',
            backgroundColor: '#0f172a',
            border: '1px solid #6366f1',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#f8fafc',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1', animation: 'pulse 1.5s infinite' }} />
            <span>{liveToast}</span>
          </div>
        )}

        {currentPage === 'overview' && (
          <OverviewPage
            stats={stats}
            monitors={monitors}
            alerts={alerts}
            currentUser={currentUser || undefined}
            onOpenAddMonitor={() => { setEditingMonitor(null); setIsAddOpen(true); }}
            onSelectAlert={setActiveAlert}
            onNavigateToMonitors={() => setCurrentPage('monitors')}
            onUpdateMonitorPrice={handleUpdateMonitorPrice}
          />
        )}

        {currentPage === 'monitors' && (
          <MonitorsPage
            monitors={monitors}
            currentUser={currentUser}
            onOpenAddMonitor={() => { setEditingMonitor(null); setIsAddOpen(true); }}
            onEditMonitor={(m) => { setEditingMonitor(m); setIsAddOpen(true); }}
            onDeleteMonitor={setDeletingMonitorId}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {currentPage === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            onSelectAlert={setActiveAlert}
            onMarkAllRead={handleMarkAllAlertsRead}
            onDismiss={handleDismissAlert}
          />
        )}

        {currentPage === 'policies' && (
          <PoliciesPage
            policies={policies}
            currentUser={currentUser}
            onTogglePolicy={handleTogglePolicy}
            onAddPolicy={async (newPol) => {
              try {
                await api.addPolicy(newPol);
                await refreshData();
              } catch (err: unknown) {
                alert(err instanceof Error ? err.message : 'Failed to add policy');
              }
            }}
          />
        )}

        {currentPage === 'admin' && currentUser.role === 'admin' && <AdminPage />}

        {currentPage === 'admin' && currentUser.role !== 'admin' && (
          <NotFoundPage onBackToOverview={() => setCurrentPage('overview')} />
        )}
      </div>

      {/* Native Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        unreadAlertsCount={alerts.filter(a => !a.read).length}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Dialog Modals */}
      <MonitorDialog
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setEditingMonitor(null); }}
        onSubmit={handleSaveMonitor}
        initialData={editingMonitor}
      />

      <AlertDialog
        alert={activeAlert}
        isOpen={!!activeAlert}
        onClose={() => setActiveAlert(null)}
        onMarkRead={handleMarkAlertRead}
        onDismiss={handleDismissAlert}
      />

      <DeleteDialog
        isOpen={!!deletingMonitorId}
        onClose={() => setDeletingMonitorId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Monitored Target"
        itemName={deletingMonitor?.name || 'this target'}
      />

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={setCurrentPage}
        onOpenAddMonitor={() => { setEditingMonitor(null); setIsAddOpen(true); }}
        onSimulateTelemetry={handleSimulateTelemetry}
        onExportCsv={() => exportMonitorsToCsv(monitors)}
        monitors={monitors}
        onSelectMonitor={(m) => {
          // Trigger view of monitor
        }}
      />
    </div>
  );
}

export default App;
