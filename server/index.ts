import express, { type Request, type Response, type NextFunction } from 'express';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ApiError, Store } from './store.ts';
import type { SessionUser } from '../src/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SESSION_COOKIE = 'sentinel_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: SESSION_MAX_AGE };

function cookieToken(request: Request): string {
  const header = request.headers.cookie;
  if (!header) return '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function createApp(store: Store, production = false, dist = resolve(__dirname, '../dist')) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // Security headers
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('X-Frame-Options', 'DENY');
    next();
  });

  const api = express.Router();

  const requireUser = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const token = cookieToken(request);
      const user = token ? await store.session(token) : null;
      if (!user) {
        response.status(401).json({ error: 'Please sign in to continue.' });
        return;
      }
      response.locals.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };

  const requireAdmin = (request: Request, response: Response, next: NextFunction) => {
    requireUser(request, response, (error?: unknown) => {
      if (error) { next(error); return; }
      const user = response.locals.user as SessionUser;
      if (user.role !== 'admin') {
        response.status(403).json({ error: 'Administrator access is required.' });
        return;
      }
      next();
    });
  };

  // Basic in-memory rate limiter for auth endpoints
  const ipRequests = new Map<string, { count: number; resetTime: number }>();
  const rateLimitAuth = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipRequests.get(ip);
    if (!record || now > record.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + 60000 });
      return next();
    }
    if (record.count >= 25) {
      res.status(429).json({ error: 'Too many authentication attempts. Please try again in 1 minute.' });
      return;
    }
    record.count++;
    next();
  };

  // --- Auth Endpoints ---
  api.post('/auth/login', rateLimitAuth, async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await store.login(email, password);
      res.cookie(SESSION_COOKIE, token, cookieOptions);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  api.post('/auth/register', rateLimitAuth, async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const { token, user } = await store.register(email, password, name);
      res.cookie(SESSION_COOKIE, token, cookieOptions);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  });

  api.post('/auth/logout', async (req, res, next) => {
    try {
      const token = cookieToken(req);
      if (token) await store.logout(token);
      res.clearCookie(SESSION_COOKIE);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  api.get('/auth/me', async (req, res, next) => {
    try {
      const token = cookieToken(req);
      const user = token ? await store.session(token) : null;
      res.json({ user: user || null });
    } catch (err) {
      next(err);
    }
  });

  // --- Real-Time Server-Sent Events (SSE) Stream ---
  api.get('/stream/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial connected message
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Sentinel Live SSE Stream Online', timestamp: new Date().toISOString() })}\n\n`);

    const onEvent = (eventData: unknown) => {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    store.events.on('stream', onEvent);

    req.on('close', () => {
      store.events.off('stream', onEvent);
    });
  });

  // --- Telemetry Simulation Endpoint ---
  api.post('/telemetry/simulate', requireUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { monitorId } = req.body;
      const result = await store.simulatePriceShift(monitorId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // --- URL Scraper Extraction ---
  api.post('/monitors/scrape', requireUser, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, category } = req.body;
      const created = await store.scrapeAndAdd(url, category);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // --- Stats & Monitors ---
  api.get('/stats', requireUser, async (_req, res, next) => {
    try {
      const stats = await store.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

  api.get('/monitors', requireUser, async (_req, res, next) => {
    try {
      const monitors = await store.getMonitors();
      res.json(monitors);
    } catch (err) {
      next(err);
    }
  });

  api.post('/monitors', requireAdmin, async (req, res, next) => {
    try {
      const created = await store.addMonitor(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  api.patch('/monitors/:id', requireAdmin, async (req, res, next) => {
    try {
      const updated = await store.updateMonitor(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  api.delete('/monitors/:id', requireAdmin, async (req, res, next) => {
    try {
      await store.deleteMonitor(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // --- Automated Repricing Endpoint ---
  api.post('/monitors/:id/reprice', requireAdmin, async (req, res, next) => {
    try {
      const { newPrice, reason } = req.body;
      if (!newPrice || isNaN(Number(newPrice))) {
        res.status(400).json({ error: 'Valid target price is required.' });
        return;
      }
      const updated = await store.repriceMonitor(req.params.id, Number(newPrice), reason);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // --- Autonomous Background Crawler Endpoints ---
  api.get('/crawler/status', requireUser, (_req, res) => {
    res.json({
      active: store.isCrawlerActive(),
      intervalSeconds: 45,
      webhookConfigured: store.getWebhookUrl()
    });
  });

  api.post('/crawler/toggle', requireAdmin, (_req, res) => {
    if (store.isCrawlerActive()) {
      store.stopAutonomousCrawler();
    } else {
      store.startAutonomousCrawler(45000);
    }
    res.json({ active: store.isCrawlerActive() });
  });

  // --- Indian Festive War Room Simulator ---
  api.post('/simulator/festive', requireUser, async (req, res, next) => {
    try {
      const { festiveName } = req.body;
      const result = await store.simulateFestiveFlashCrash(festiveName);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // --- Alerts ---
  api.get('/alerts', requireUser, async (_req, res, next) => {
    try {
      const alerts = await store.getAlerts();
      res.json(alerts);
    } catch (err) {
      next(err);
    }
  });

  api.patch('/alerts/:id/read', requireUser, async (req, res, next) => {
    try {
      const updated = await store.markAlertRead(req.params.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  api.delete('/alerts/:id', requireUser, async (req, res, next) => {
    try {
      await store.dismissAlert(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  api.post('/alerts/:id/whatsapp', requireUser, async (req, res, next) => {
    try {
      const { recipient } = req.body;
      const result = await store.dispatchWhatsAppAlert(req.params.id, recipient);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // --- Policies ---
  api.get('/policies', requireUser, async (_req, res, next) => {
    try {
      const policies = await store.getPolicies();
      res.json(policies);
    } catch (err) {
      next(err);
    }
  });

  api.post('/policies', requireAdmin, async (req, res, next) => {
    try {
      const created = await store.addPolicy(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  api.patch('/policies/:id/toggle', requireAdmin, async (req, res, next) => {
    try {
      const updated = await store.togglePolicy(req.params.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // --- Admin ---
  api.get('/admin/users', requireAdmin, async (_req, res, next) => {
    try {
      const users = await store.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  api.get('/admin/logs', requireAdmin, async (_req, res, next) => {
    try {
      const logs = await store.getLogs();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  });

  app.use('/api', api);

  // Serve static UI if dist exists or production mode
  if (production || existsSync(resolve(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      res.sendFile(resolve(dist, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('API Error:', err);
    res.status(500).json({ error: message });
  });

  return app;
}

// Server startup if run directly
const isMain = process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'));
if (isMain) {
  const store = new Store();
  const production = process.argv.includes('--production') || true;
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  const app = createApp(store, production);

  app.listen(port, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SENTINEL MASTER URL: http://localhost:${port}`);
    console.log(`📡 API ENDPOINTS:       http://localhost:${port}/api`);
    console.log(`======================================================\n`);
  });
}
