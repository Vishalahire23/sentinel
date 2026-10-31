import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFuzzyScore, filterAndRank } from '../src/search.ts';

test('Search - Fuzzy Score calculation', () => {
  assert.equal(calculateFuzzyScore('Apple MacBook Pro', 'apple'), 0.9);
  assert.equal(calculateFuzzyScore('Sony Headphones', 'Sony Headphones'), 1.0);
  assert.ok(calculateFuzzyScore('Dell UltraSharp Monitor', 'monitor') > 0.5);
  assert.equal(calculateFuzzyScore('Logitech Mouse', 'xyz'), 0.0);
});

test('Search - filterAndRank utility', () => {
  const items = [
    { id: '1', name: 'Logitech MX Master 3S', category: 'Peripherals', domain: 'amazon.com' },
    { id: '2', name: 'Apple Magic Trackpad', category: 'Peripherals', domain: 'apple.com' },
    { id: '3', name: 'Dell 32 inch 4K Monitor', category: 'Displays', domain: 'dell.com' }
  ];

  const results = filterAndRank(items, 'apple');
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Apple Magic Trackpad');

  const emptyQuery = filterAndRank(items, '');
  assert.equal(emptyQuery.length, 3);
});
