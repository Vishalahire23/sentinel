import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';
import { Store, ApiError } from './store.ts';

const TEST_FILE = resolve(process.cwd(), 'server/data/test-state.json');

test('Store - Authentication lifecycle', async () => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
  const store = new Store(TEST_FILE);

  // Register
  const { token, user } = await store.register('test@example.com', 'secret123', 'Tester');
  assert.equal(user.email, 'test@example.com');
  assert.equal(user.role, 'user');
  assert.ok(token);

  // Session verification
  const sessionUser = await store.session(token);
  assert.ok(sessionUser);
  assert.equal(sessionUser?.email, 'test@example.com');

  // Duplicate registration
  await assert.rejects(
    async () => await store.register('test@example.com', 'secret123', 'Tester'),
    ApiError
  );

  // Login
  const loginRes = await store.login('test@example.com', 'secret123');
  assert.equal(loginRes.user.email, 'test@example.com');

  // Logout
  await store.logout(loginRes.token);
  const loggedOutUser = await store.session(loginRes.token);
  assert.equal(loggedOutUser, null);

  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
});

test('Store - Monitor CRUD operations', async () => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
  const store = new Store(TEST_FILE);

  const mon = await store.addMonitor({
    name: 'Test Gaming Monitor',
    url: 'https://test-retailer.com/monitor',
    currentPrice: 499.99,
    previousPrice: 549.99,
    category: 'Displays'
  });

  assert.equal(mon.name, 'Test Gaming Monitor');
  assert.equal(mon.domain, 'test-retailer.com');
  assert.ok(mon.changePercent < 0);

  const all = await store.getMonitors();
  assert.equal(all.length, 1);

  const updated = await store.updateMonitor(mon.id, { currentPrice: 479.99 });
  assert.equal(updated.currentPrice, 479.99);

  await store.deleteMonitor(mon.id);
  const remaining = await store.getMonitors();
  assert.equal(remaining.length, 0);

  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
});
