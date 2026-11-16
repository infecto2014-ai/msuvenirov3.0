import { expect, test } from 'vitest';
import { adultSizes, kidsSizes, presetPrice, printSizes, teeCare, teePresets, teeSpecs } from './tshirt';
import { findProduct } from './pricing';
import { applyPreset } from '@/lib/calc-preset';

test('готовые варианты: четыре, цена из калькулятора', () => {
  expect(teePresets).toHaveLength(4);
  const p = findProduct('textile', 'tshirt-unisex')!;
  expect(p.id).toBe('tshirt-unisex');
  for (const v of teePresets) {
    const price = presetPrice(v);
    const q = p.quote(applyPreset(p, { options: v.options, qty: v.qty }));
    expect(q.error, v.title).toBeUndefined();
    expect(price.unit, v.title).toBeGreaterThan(0);
    expect(price.total, v.title).toBeGreaterThan(0);
    expect(price).toEqual({ unit: q.unit, total: q.total });
  }
});

test('«Для команды» — 20 синих футболок', () => {
  const team = teePresets.find((v) => v.title.startsWith('Для команды'))!;
  expect(team.qty).toBe(20);
  expect(team.options.color).toBe('blue');
  expect(teePresets.some((v) => v.options.color === 'other')).toBe(false);
});

test('фото вариантов — настоящие работы, не portfolio-14', () => {
  for (const v of teePresets) {
    expect(v.img.startsWith('/portfolio/')).toBe(true);
    expect(v.img).not.toContain('portfolio-14');
  }
});

test('детская размерная сетка владельца: 12 строк от 98 до 164', () => {
  expect(kidsSizes.rows).toHaveLength(12);
  expect(kidsSizes.rows[0]).toEqual(['98', '40', '31', '11']);
  expect(kidsSizes.rows[11]).toEqual(['164', '62', '46', '17']);
  for (const r of kidsSizes.rows) expect(r).toHaveLength(kidsSizes.columns.length);
});

test('взрослая сетка, принты, характеристики, уход', () => {
  expect(adultSizes.rows[0][0]).toBe('XS (42)');
  expect(adultSizes.rows.at(-1)![0]).toBe('3XL (54)');
  expect(printSizes.map((p) => `${p.label} ${p.w}×${p.h}`)).toEqual(['А6 10×15', 'А5 15×21', 'А4 21×28', 'А3 28×38']);
  expect(teeSpecs.length).toBeGreaterThan(5);
  expect(teeCare).toHaveLength(5);
});

test('в данных нет старого адреса', () => {
  const all = JSON.stringify({ teePresets, teeSpecs, teeCare, adultSizes, kidsSizes, printSizes });
  expect(all).not.toContain('Челнокова, 11');
});
