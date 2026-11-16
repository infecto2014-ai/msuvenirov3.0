import { expect, test } from 'vitest';
import { countStored, orderLabel, ESTIMATE_EVENT, ESTIMATE_KEY, pluralLines } from './estimate-count';

test('pluralLines: русские формы', () => {
  const f: Record<number, string> = { 1: 'позиция', 2: 'позиции', 4: 'позиции', 5: 'позиций', 11: 'позиций', 12: 'позиций', 14: 'позиций', 21: 'позиция', 22: 'позиции', 25: 'позиций', 30: 'позиций' };
  for (const [n, w] of Object.entries(f)) expect(pluralLines(Number(n))).toBe(w);
});

test('orderLabel: без позиций просто «Заявка», с позициями — сколько в смете', () => {
  expect(orderLabel(0)).toBe('Заявка');
  expect(orderLabel(1)).toBe('Заявка, в смете 1 позиция');
  expect(orderLabel(3)).toBe('Заявка, в смете 3 позиции');
  expect(orderLabel(7)).toBe('Заявка, в смете 7 позиций');
  expect(orderLabel(11)).toBe('Заявка, в смете 11 позиций');
  expect(orderLabel(0, 'Оставить заявку')).toBe('Оставить заявку');
  expect(orderLabel(2, 'Оставить заявку')).toBe('Оставить заявку, в смете 2 позиции');
});

test('countStored: считает как estimate.ts, мусор даёт 0', () => {
  expect(countStored(null)).toBe(0);
  for (const junk of ['{not json', 'null', '"text"', '[null, 5, {"id": 7}]', '{}']) expect(countStored(junk)).toBe(0);
  expect(countStored('[{"id":"a"},{"id":"b"},{"x":1}]')).toBe(2);
  expect(countStored(JSON.stringify(Array.from({ length: 40 }, (_, i) => ({ id: String(i) }))))).toBe(30);
});

test('ключ и событие совпадают с estimate.ts', async () => {
  const est = await import('./estimate');
  expect(est.ESTIMATE_EVENT).toBe(ESTIMATE_EVENT);
  const stored: Record<string, string> = {};
  const { vi } = await import('vitest');
  vi.stubGlobal('window', { dispatchEvent: () => true });
  vi.stubGlobal('CustomEvent', class { constructor(public type: string) {} });
  vi.stubGlobal('localStorage', { getItem: (k: string) => stored[k] ?? null, setItem: (k: string, v: string) => { stored[k] = v; } });
  est.addToEstimate({ title: 't', details: 'd', qty: 1, unitPrice: 1, total: 1 });
  expect(countStored(stored[ESTIMATE_KEY])).toBe(1);
  vi.unstubAllGlobals();
});
