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

test('stepQty и setEstimateQty: цветная футболка не опускается ниже 5 шт', async () => {
  const { findProduct, defaultSelection } = await import('@/data/pricing');
  const p = findProduct('textile', 'tshirt-unisex')!;
  const sel = { ...defaultSelection(p), qty: 5, options: { ...defaultSelection(p).options, color: 'red' } };
  const item = { id: 'c1', title: 'Футболка', details: '', qty: 5, unitPrice: 1, total: 5, calc: { cat: 'textile', product: 'tshirt-unisex', sel } };
  const { stepQty, setEstimateQty, getEstimate } = await load(JSON.stringify([item]));
  expect(stepQty(p.qty, 5, -1, p.minQty!(sel))).toBe(5);
  expect(stepQty(p.qty, 6, -1, p.minQty!(sel))).toBe(5);
  expect(stepQty(p.qty, 1, 1)).toBe(2);
  setEstimateQty('c1', 3);
  expect(getEstimate()[0].qty).toBe(5);
  setEstimateQty('c1', 7);
  expect(getEstimate()[0].qty).toBe(7);
  // белая — с 1 шт
  const white = { ...item, id: 'w1', qty: 5, calc: { ...item.calc, sel: { ...sel, options: { ...sel.options, color: 'white' } } } };
  const m = await load(JSON.stringify([white]));
  m.setEstimateQty('w1', 1);
  expect(m.getEstimate()[0].qty).toBe(1);
});

test('getEstimate: старая или битая calc — позиция остаётся, calc отбрасывается', async () => {
  const base = { title: 'Футболка', details: '', qty: 3, unitPrice: 750, total: 2250 };
  const good = { cat: 'textile', product: 'tshirt-unisex', sel: { qty: 3, options: {} } };
  const stored = [
    { ...base, id: 'o1', calc: { cat: 'textile', product: 'tshirt-unisex' } },
    { ...base, id: 'o2', calc: { ...good, sel: { qty: 3 } } },
    { ...base, id: 'o3', calc: { ...good, sel: { options: {} } } },
    { ...base, id: 'o4', calc: { ...good, sel: { qty: '3', options: {} } } },
    { ...base, id: 'o5', calc: 'x' },
    { ...base, id: 'o6', calc: good },
  ];
  const { getEstimate } = await load(JSON.stringify(stored));
  const list = getEstimate();
  expect(list.map((i) => i.id)).toEqual(['o1', 'o2', 'o3', 'o4', 'o5', 'o6']);
  expect(list.slice(0, 5).every((i) => i.calc === undefined)).toBe(true);
  expect(list[5].calc).toEqual(good);
});

test('setEstimateQty: количество ниже минимума поднимается до минимума', async () => {
  const { findProduct, defaultSelection } = await import('@/data/pricing');
  const p = findProduct('textile', 'tshirt-unisex')!;
  const sel = { ...defaultSelection(p), qty: 7, options: { ...defaultSelection(p).options, color: 'red' } };
  const item = { id: 'c1', title: 'Футболка', details: '', qty: 7, unitPrice: 1, total: 7, calc: { cat: 'textile', product: 'tshirt-unisex', sel } };
  const { setEstimateQty, getEstimate } = await load(JSON.stringify([item]));
  setEstimateQty('c1', 2);
  expect(getEstimate()[0].qty).toBe(5);
  expect(getEstimate()[0].calc!.sel.qty).toBe(5);
});
