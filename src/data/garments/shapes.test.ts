import { expect, test } from 'vitest';
import { SHAPES } from './shapes';

test('контуры изделий: у каждой линии замера своя буква и подпись', () => {
  for (const [id, s] of Object.entries(SHAPES)) {
    expect(s.labels, id).toHaveLength(s.dims.length);
    expect(new Set(s.labels.map((x) => x.l)).size, id).toBe(s.labels.length);
    for (const x of s.labels) expect(x.what, id).toBeTruthy();
  }
});

test('футболка и худи: A — длина, B — ширина, C — рукав', () => {
  for (const s of [SHAPES.tshirt, SHAPES.hoodie])
    expect(s.labels.map((x) => `${x.l} — ${x.what}`)).toEqual(['A — длина изделия', 'B — ширина изделия', 'C — длина рукава']);
});
