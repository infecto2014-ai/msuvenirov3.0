import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const KEY = 'msuvenirov:estimate:v1';

/** Fresh copy of estimate.ts (it caches the estimate in memory) over a fake localStorage. */
const load = async (stored: string | null) => {
  vi.resetModules();
  vi.stubGlobal('window', { dispatchEvent: () => true });
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k === KEY ? stored : null),
    setItem: () => {},
  });
  return import('./estimate');
};

beforeEach(() => vi.stubGlobal('CustomEvent', class { constructor(public type: string, public init?: unknown) {} }));
afterEach(() => vi.unstubAllGlobals());

test('getEstimate: мусор в хранилище даёт массив и не падает', async () => {
  for (const junk of ['{not json', '[{"foo":1}]', 'null', '"text"', '[null, 5, {"id": 7}]']) {
    const { getEstimate } = await load(junk);
    const list = getEstimate();
    expect(Array.isArray(list)).toBe(true);
    expect(list).toEqual([]);
  }
});

test('getEstimate: пустое хранилище — пустая смета', async () => {
  const { getEstimate } = await load(null);
  expect(getEstimate()).toEqual([]);
});

test('getEstimate: нормальная позиция сохраняется', async () => {
  const item = { id: 'a1', title: 'Футболка', details: '', qty: 1, unitPrice: 750, total: 750 };
  const { getEstimate } = await load(JSON.stringify([item, { foo: 1 }]));
  expect(getEstimate()).toEqual([item]);
});
