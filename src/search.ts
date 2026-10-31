export interface SearchableItem {
  id: string;
  name: string;
  category?: string;
  domain?: string;
}

export function calculateFuzzyScore(target: string, query: string): number {
  const t = target.toLowerCase();
  const q = query.toLowerCase().trim();

  if (!q) return 1.0;
  if (t === q) return 1.0;
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.75;

  // Word boundary matching
  const words = t.split(/[\s\-_\/]+/);
  for (const word of words) {
    if (word.startsWith(q)) return 0.8;
  }

  // Subsequence matching
  let qIdx = 0;
  for (let tIdx = 0; tIdx < t.length && qIdx < q.length; tIdx++) {
    if (t[tIdx] === q[qIdx]) qIdx++;
  }
  if (qIdx === q.length) {
    return 0.5 * (q.length / t.length);
  }

  return 0.0;
}

export function filterAndRank<T extends SearchableItem>(
  items: T[],
  query: string,
  keys: (keyof T)[] = ['name', 'category', 'domain']
): T[] {
  if (!query || !query.trim()) return items;

  const scored = items.map(item => {
    let maxScore = 0;
    for (const key of keys) {
      const val = item[key];
      if (typeof val === 'string') {
        const score = calculateFuzzyScore(val, query);
        if (score > maxScore) maxScore = score;
      }
    }
    return { item, score: maxScore };
  });

  return scored
    .filter(entry => entry.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item);
}
