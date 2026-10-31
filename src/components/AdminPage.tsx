import React, { useState, useEffect } from 'react';
import { Users, Activity, ShieldCheck, Terminal, Clock } from 'lucide-react';
import { api } from '../api.ts';
import type { SessionUser, SystemLog } from '../types.ts';
import { formatDate } from '../format.ts';
import '../auth-admin.css';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, logsData] = await Promise.all([
          api.getAdminUsers(),
          api.getAdminLogs()
        ]);
        setUsers(usersData);
        setLogs(logsData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-heading">
        <div>
          <h1 className="page-title">Administration & System Health</h1>
          <p className="page-subtitle">Manage organization seats, security policies, and monitor system logs.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-title">Registered Accounts</span>
            <Users size={18} style={{ color: 'var(--primary-accent)' }} />
          </div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-subtitle">Active across all teams</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-title">Crawler Cluster</span>
            <Activity size={18} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>Healthy</div>
          <div className="stat-subtitle">0 proxy blocks recorded today</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-title">Security Status</span>
            <ShieldCheck size={18} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-value">RBAC Active</div>
          <div className="stat-subtitle">Session cookie encryption enabled</div>
        </div>
      </div>

      {/* Users Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} /> Organization Members
        </h3>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`admin-badge-role ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Logs Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} /> System Audit Trail
        </h3>

        <div className="log-stream">
          {logs.map(log => (
            <div key={log.id} className="log-item">
              <div>
                <strong style={{ color: '#ffffff', marginRight: '0.5rem' }}>[{log.user}]</strong>
                <span>{log.action}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge badge-${log.status === 'success' ? 'success' : log.status === 'warning' ? 'warning' : 'danger'}`}>
                  {log.status}
                </span>
                <span className="log-time" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={12} />
                  {formatDate(log.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
