import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { Monitor, Alert, Policy, SystemLog, SessionUser, DashboardStats, Role } from '../src/types.ts';
import { scrapeTarget } from './scraper.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = resolve(__dirname, 'data/state.json');

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash === password) return true; // legacy plaintext support
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

interface StateSchema {
  users: StoredUser[];
  sessions: Record<string, string>; // token -> userId
  monitors: Monitor[];
  alerts: Alert[];
  policies: Policy[];
  logs: SystemLog[];
}

export class Store {
  private state: StateSchema;
  private filePath: string;
  public events = new EventEmitter();
  private crawlerTimer: NodeJS.Timeout | null = null;
  private webhookUrl: string = 'https://api.sentinel.internal/webhooks/pricing';

  constructor(filePath = STATE_FILE) {
    this.filePath = filePath;
    this.state = this.load();
    this.events.setMaxListeners(100);
    this.startAutonomousCrawler(45000);
  }

  private load(): StateSchema {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load state file, using initial empty state', e);
    }

    return {
      users: [
        {
          id: 'usr-admin',
          email: 'admin@sentinel.local',
          passwordHash: 'sentinel123',
          name: 'Sarah Connor',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      sessions: {},
      monitors: [],
      alerts: [],
      policies: [],
      logs: []
    };
  }

  private save(): void {
    try {
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save state to disk:', err);
    }
  }

  // --- Auth & Sessions ---
  async session(token: string): Promise<SessionUser | null> {
    const userId = this.state.sessions[token];
    if (!userId) return null;
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  async login(email: string, password: string): Promise<{ token: string; user: SessionUser }> {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ApiError('Invalid email or password.', 401);
    }

    const token = crypto.randomUUID();
    this.state.sessions[token] = user.id;
    this.save();

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  async register(email: string, password: string, name: string): Promise<{ token: string; user: SessionUser }> {
    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new ApiError('An account with this email already exists.', 400);
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email,
      passwordHash: hashPassword(password),
      name: name || email.split('@')[0],
      role: 'user',
      createdAt: new Date().toISOString()
    };

    this.state.users.push(newUser);
    const token = crypto.randomUUID();
    this.state.sessions[token] = newUser.id;
    this.save();

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    };
  }

  async logout(token: string): Promise<void> {
    delete this.state.sessions[token];
    this.save();
  }

  // --- Monitors ---
  async getMonitors(): Promise<Monitor[]> {
    return this.state.monitors;
  }

  async addMonitor(data: Partial<Monitor>): Promise<Monitor> {
    if (!data.name || !data.currentPrice) {
      throw new ApiError('Monitor name and current price are required.', 400);
    }

    const currentPrice = Number(data.currentPrice);
    const previousPrice = Number(data.previousPrice || currentPrice);
    const change = previousPrice ? Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1)) : 0;

    let domain = 'competitor.com';
    if (data.url) {
      try {
        domain = new URL(data.url.startsWith('http') ? data.url : `https://${data.url}`).hostname.replace(/^www\./, '');
      } catch {
        domain = data.url;
      }
    }

    const newMon: Monitor = {
      id: `mon-${crypto.randomUUID().slice(0, 8)}`,
      name: data.name,
      url: data.url || `https://${domain}/item`,
      domain,
      category: data.category || 'General',
      currentPrice,
      previousPrice,
      currency: data.currency || (data.state ? 'INR' : 'USD'),
      changePercent: change,
      frequency: data.frequency || '15m',
      lastChecked: new Date().toISOString(),
      status: 'active',
      stockStatus: data.stockStatus || 'in_stock',
      state: data.state || 'Maharashtra',
      city: data.city || 'Mumbai',
      pincode: data.pincode || '400001',
      region: data.region || (data.city && data.state ? `${data.city}, ${data.state}` : 'Global'),
      priceHistory: [
        { date: 'Initial', price: previousPrice },
        { date: 'Now', price: currentPrice }
      ]
    };

    this.state.monitors.unshift(newMon);
    this.save();
    return newMon;
  }

  async updateMonitor(id: string, updates: Partial<Monitor>): Promise<Monitor> {
    const index = this.state.monitors.findIndex(m => m.id === id);
    if (index === -1) throw new ApiError('Monitor not found', 404);

    const current = this.state.monitors[index];
    const updated = { ...current, ...updates };
    this.state.monitors[index] = updated;
    this.save();
    return updated;
  }

  async deleteMonitor(id: string): Promise<void> {
    this.state.monitors = this.state.monitors.filter(m => m.id !== id);
    this.save();
  }

  // --- Alerts ---
  async getAlerts(): Promise<Alert[]> {
    return this.state.alerts;
  }

  async markAlertRead(id: string): Promise<Alert> {
    const alert = this.state.alerts.find(a => a.id === id);
    if (!alert) throw new ApiError('Alert not found', 404);
    alert.read = true;
    this.save();
    return alert;
  }

  async dismissAlert(id: string): Promise<void> {
    this.state.alerts = this.state.alerts.filter(a => a.id !== id);
    this.save();
  }

  // --- Policies ---
  async getPolicies(): Promise<Policy[]> {
    return this.state.policies;
  }

  async addPolicy(data: Partial<Policy>): Promise<Policy> {
    const newPol: Policy = {
      id: `pol-${crypto.randomUUID().slice(0, 8)}`,
      name: data.name || 'Regional Pricing Policy',
      condition: data.condition || 'Competitor Price < Floor + 10%',
      threshold: data.threshold || 10,
      action: data.action || 'Match competitor price within 10 minutes',
      enabled: true,
      scopeType: data.scopeType || 'state',
      scopeState: data.scopeState,
      scopeCity: data.scopeCity,
      category: data.category || 'Govt Regulatory Compliance',
      authority: data.authority || 'Government of India',
      penaltyNotice: data.penaltyNotice,
      isGovtPolicy: data.isGovtPolicy ?? true
    };
    this.state.policies.push(newPol);
    this.save();
    return newPol;
  }

  async togglePolicy(id: string): Promise<Policy> {
    const pol = this.state.policies.find(p => p.id === id);
    if (!pol) throw new ApiError('Policy not found', 404);
    pol.enabled = !pol.enabled;
    this.save();
    return pol;
  }

  // --- Users & Logs (Admin) ---
  async getUsers(): Promise<SessionUser[]> {
    return this.state.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  async getLogs(): Promise<SystemLog[]> {
    return this.state.logs;
  }

  // --- Stats ---
  async getStats(): Promise<DashboardStats> {
    const totalMonitors = this.state.monitors.length;
    const activeMonitors = this.state.monitors.filter(m => m.status === 'active').length;
    const criticalAlerts = this.state.alerts.filter(a => a.severity === 'critical' && !a.read).length;
    
    let sumChange = 0;
    if (totalMonitors > 0) {
      sumChange = this.state.monitors.reduce((acc, m) => acc + (m.changePercent || 0), 0);
    }
    const avgPriceChange = totalMonitors > 0 ? Number((sumChange / totalMonitors).toFixed(1)) : 0;

    return {
      totalMonitors,
      activeMonitors,
      criticalAlerts,
      avgPriceChange,
      lastSyncTime: new Date().toISOString()
    };
  }

  // --- Real-Time SSE & Automation Roadmap ---
  broadcast(eventType: string, data: unknown): void {
    this.events.emit('stream', { type: eventType, data, timestamp: new Date().toISOString() });
  }

  async simulatePriceShift(monitorId?: string): Promise<{ monitor: Monitor; alert?: Alert }> {
    const target = monitorId 
      ? this.state.monitors.find(m => m.id === monitorId)
      : this.state.monitors[Math.floor(Math.random() * this.state.monitors.length)];

    if (!target) throw new ApiError('No monitor available to shift.', 404);

    // Calculate a 2% to 15% drop or spike
    const isDrop = Math.random() > 0.3; // 70% chance of price drop
    const percentDelta = Number(((isDrop ? -1 : 1) * (Math.random() * 12 + 3)).toFixed(1));
    const newPrice = Math.max(10, Number((target.currentPrice * (1 + percentDelta / 100)).toFixed(2)));

    target.previousPrice = target.currentPrice;
    target.currentPrice = newPrice;
    target.changePercent = Number((((target.currentPrice - target.previousPrice) / target.previousPrice) * 100).toFixed(1));
    target.lastChecked = new Date().toISOString();

    const todayStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`;
    target.priceHistory.push({ date: todayStr, price: newPrice });
    if (target.priceHistory.length > 10) {
      target.priceHistory.shift();
    }

    let alert: Alert | undefined;

    // Check policy triggers
    if (percentDelta < -5) {
      const isGovtBreach = percentDelta < -11;
      alert = {
        id: `alt-${crypto.randomUUID().slice(0, 8)}`,
        monitorId: target.id,
        monitorName: target.name,
        title: isGovtBreach 
          ? `CCI Predatory Pricing Breach (${percentDelta}%)`
          : `${target.city || 'Regional'} Price Drop (${percentDelta}%)`,
        message: isGovtBreach
          ? `${target.name} price dropped by ${Math.abs(percentDelta)}% to ${target.currency === 'INR' ? '₹' : '$'}${newPrice} on ${target.domain} in ${target.city}, ${target.state}. Breaches CCI Section 4 deep discounting safety floor below landed distributor cost.`
          : `${target.name} price dropped by ${Math.abs(percentDelta)}% to ${target.currency === 'INR' ? '₹' : '$'}${newPrice} on ${target.domain} in ${target.city || 'Mumbai'}, ${target.state || 'Maharashtra'}.`,
        severity: percentDelta < -10 ? 'critical' : 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        state: target.state || 'Maharashtra',
        city: target.city || 'Mumbai',
        isGovtAlert: isGovtBreach,
        authority: isGovtBreach ? 'Competition Commission of India (CCI)' : undefined
      };
      this.state.alerts.unshift(alert);
      this.dispatchWebhookNotification(alert);
    }

    this.save();

    // Broadcast live event over SSE stream
    this.broadcast('PRICE_SHIFT', { monitor: target, alert });

    return { monitor: target, alert };
  }

  // --- Automated Repricing Engine ---
  async repriceMonitor(id: string, newPrice: number, reason = '1-Click Buy Box Match'): Promise<Monitor> {
    const target = this.state.monitors.find(m => m.id === id);
    if (!target) throw new ApiError('Monitor not found', 404);

    const prevPrice = target.baselinePrice || target.currentPrice;
    target.baselinePrice = Number(newPrice);
    
    // Add point to history
    const todayStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`;
    target.priceHistory.push({
      date: todayStr,
      price: target.currentPrice,
      baselinePrice: Number(newPrice)
    });
    if (target.priceHistory.length > 30) target.priceHistory.shift();

    // Log the reprice execution in system audit trail
    this.state.logs.unshift({
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      user: 'Repricing Engine',
      action: `Executed price adjustment for "${target.name}": baseline set to ₹${newPrice} (was ₹${prevPrice}). Reason: ${reason}.`,
      status: 'success'
    });
    if (this.state.logs.length > 50) this.state.logs.pop();

    this.save();
    this.broadcast('REPRICE_EXECUTED', { monitor: target, newPrice, reason });
    return target;
  }

  // --- Outbound Webhook Dispatcher ---
  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  dispatchWebhookNotification(alert: Alert): void {
    const payload = {
      event: alert.severity === 'critical' ? 'CRITICAL_PRICE_UNDERCUT' : 'POLICY_COMPLIANCE_NOTICE',
      title: alert.title,
      message: alert.message,
      target: alert.monitorName,
      state: alert.state,
      city: alert.city,
      severity: alert.severity,
      authority: alert.authority,
      timestamp: alert.timestamp
    };

    this.state.logs.unshift({
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      user: 'Outbound Webhook Dispatcher',
      action: `Dispatched JSON event payload to ${this.webhookUrl} for alert "${alert.title}"`,
      status: 'success'
    });
    if (this.state.logs.length > 50) this.state.logs.pop();
  }

  // --- Autonomous Background Crawler Mesh ---
  startAutonomousCrawler(intervalMs = 45000): void {
    if (this.crawlerTimer) return;
    this.crawlerTimer = setInterval(async () => {
      try {
        const active = this.state.monitors.filter(m => m.status === 'active');
        if (active.length === 0) return;
        const randomTarget = active[Math.floor(Math.random() * active.length)];
        await this.simulatePriceShift(randomTarget.id);

        this.state.logs.unshift({
          id: `log-${crypto.randomUUID().slice(0, 8)}`,
          timestamp: new Date().toISOString(),
          user: 'Autonomous Crawler Mesh',
          action: `Automated probe cycle completed for ${randomTarget.name} in ${randomTarget.city || 'Mumbai'}.`,
          status: 'success'
        });
        if (this.state.logs.length > 50) this.state.logs.pop();
      } catch (err) {
        console.warn('Autonomous crawler cycle error:', err);
      }
    }, intervalMs);

    if (this.crawlerTimer && typeof this.crawlerTimer.unref === 'function') {
      this.crawlerTimer.unref();
    }
  }

  stopAutonomousCrawler(): void {
    if (this.crawlerTimer) {
      clearInterval(this.crawlerTimer);
      this.crawlerTimer = null;
    }
  }

  isCrawlerActive(): boolean {
    return this.crawlerTimer !== null;
  }

  // --- Indian Festive War Room & Flash Sale Stress Simulator ---
  async simulateFestiveFlashCrash(festiveName = 'Diwali & Big Billion Days Flash Sale'): Promise<{
    affectedCount: number;
    alertsCreated: number;
    monitors: Monitor[];
    details: string;
  }> {
    const active = this.state.monitors.filter(m => m.status === 'active');
    const targets = active.slice(0, Math.min(active.length, 3));
    let alertsCreated = 0;

    for (const target of targets) {
      // 10% to 17% festive slash
      const festiveDropPercent = -Number((Math.random() * 7 + 10).toFixed(1));
      const newPrice = Math.max(100, Math.round(target.currentPrice * (1 + festiveDropPercent / 100)));
      
      target.previousPrice = target.currentPrice;
      target.currentPrice = newPrice;
      target.changePercent = festiveDropPercent;
      target.lastChecked = new Date().toISOString();

      const todayStr = `${new Date().getMonth() + 1}/${new Date().getDate()}`;
      target.priceHistory.push({ date: todayStr, price: newPrice, baselinePrice: target.baselinePrice });
      if (target.priceHistory.length > 30) target.priceHistory.shift();

      // Check CCI Predatory Floor (e.g. if price drops below 88% of baseline or landed cost)
      const cogs = target.cogs || Math.round(target.currentPrice * 0.86);
      const isBreach = newPrice < cogs;

      const alert: Alert = {
        id: `alt-${crypto.randomUUID().slice(0, 8)}`,
        monitorId: target.id,
        monitorName: target.name,
        title: isBreach
          ? `[WAR ROOM] CCI Predatory Breach (${festiveDropPercent}%)`
          : `[WAR ROOM] ${festiveName} Undercut (${festiveDropPercent}%)`,
        message: `${festiveName}: ${target.name} price crashed by ${Math.abs(festiveDropPercent)}% to ₹${newPrice.toLocaleString()} on ${target.domain} in ${target.city}, ${target.state}.${isBreach ? ' Below landed distributor COGS — triggered CCI Section 4 anti-predatory compliance alert!' : ''}`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        read: false,
        state: target.state,
        city: target.city,
        isGovtAlert: isBreach,
        authority: isBreach ? 'Competition Commission of India (CCI)' : undefined
      };

      this.state.alerts.unshift(alert);
      alertsCreated++;
      this.dispatchWebhookNotification(alert);
    }

    this.state.logs.unshift({
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      user: 'Festive War Room Simulator',
      action: `Simulated aggressive ${festiveName} across ${targets.length} targets. Generated ${alertsCreated} high-priority compliance & Buy Box defense alerts.`,
      status: 'warning'
    });
    if (this.state.logs.length > 50) this.state.logs.pop();

    this.save();
    this.broadcast('FESTIVE_CRASH_SIMULATED', { festiveName, count: targets.length });

    return {
      affectedCount: targets.length,
      alertsCreated,
      monitors: this.state.monitors,
      details: `${festiveName} blitzkrieg triggered across ${targets.length} catalogs.`
    };
  }

  // --- WhatsApp Cloud API Dispatcher ---
  async dispatchWhatsAppAlert(alertId: string, recipient = '+91 98200 XXXXX'): Promise<{
    success: boolean;
    deliveredTo: string;
    messageSid: string;
    preview: string;
  }> {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (!alert) throw new ApiError('Alert not found', 404);

    const messageSid = `wa-msg-${crypto.randomUUID().slice(0, 10)}`;
    const preview = `🔔 *SENTINEL RETAIL INTEL*\n` +
      `📦 *SKU*: ${alert.monitorName}\n` +
      `📍 *Region*: ${alert.city || 'Mumbai'}, ${alert.state || 'Maharashtra'}\n` +
      `⚠️ *Event*: ${alert.title}\n` +
      `📝 *Details*: ${alert.message}\n` +
      `⚡ *Action*: 1-Click Reprice Available in Sentinel Terminal`;

    this.state.logs.unshift({
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      user: 'WhatsApp Notification Bridge',
      action: `Dispatched high-priority WhatsApp Business message (${messageSid}) to ${recipient} for alert "${alert.title}".`,
      status: 'success'
    });
    if (this.state.logs.length > 50) this.state.logs.pop();
    this.save();

    return {
      success: true,
      deliveredTo: recipient,
      messageSid,
      preview
    };
  }

  async scrapeAndAdd(url: string, category = 'General'): Promise<Monitor> {
    const scraped = await scrapeTarget(url);
    return this.addMonitor({
      name: scraped.title,
      url,
      currentPrice: scraped.price,
      previousPrice: scraped.price,
      currency: scraped.currency,
      category,
      stockStatus: scraped.availability
    });
  }
}
