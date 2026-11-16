import { expect, test } from 'vitest';
import { adultSizes, kidsSizes, presetPrice, printSizes, teeCare, teeFaq, teePresets, teeReviews, teeSpecs, teeWorks } from './tshirt';
import { services } from './services';

test('готовые варианты: четыре, цена по прайсу', () => {
  expect(teePresets).toHaveLength(4);
  for (const v of teePresets) {
    const price = presetPrice(v);
    expect(price.unit, v.title).toBeGreaterThan(0);
    expect(price.total, v.title).toBe(price.unit * v.qty);
  }
  // pinned: blank 750 + DTF A4 800 (1 pc)
  expect(presetPrice(teePresets.find((v) => v.title === 'Футболка с фото в подарок')!).total).toBe(1550);
  const team = teePresets.find((v) => v.title.startsWith('Для команды'))!;
  // 20 pcs: blank 550 + A4 at the 20+ tier + A6 −30%
  expect(presetPrice(team)).toEqual({ unit: 1196, total: 23920 });
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

test('«Наши работы» футболок: только с тегом futbolki, без portfolio-14', () => {
  expect(teeWorks.length).toBeGreaterThan(0);
  for (const w of teeWorks) {
    expect(w.tags).toContain('futbolki');
    expect(w.src).not.toContain('portfolio-14');
  }
});

test('отзывы футболок: не меньше трёх, про футболки в первую очередь', () => {
  expect(teeReviews.length).toBeGreaterThanOrEqual(3);
  expect(teeReviews[0].text.toLowerCase()).toContain('футболк');
  expect(new Set(teeReviews.map((r) => r.text)).size).toBe(teeReviews.length);
});

test('вопросы футболок — из services.ts', () => {
  const svc = services.find((s) => s.slug === '/pechat-na-futbolkah')!;
  expect(teeFaq.length).toBeGreaterThan(0);
  expect(teeFaq).toEqual(svc.faq);
});
