import { expect, test } from 'vitest';
import { stickers } from './stickers';
import { applyPreset, tileFromLabel } from '../../lib/calc-preset';
import { findProduct, STICKER_MIN_SUM } from '../pricing';
import { garmentFrom, presetPrice } from './select';
import { service } from '../../lib/schema';

test('все пять изделий и их таблицы доступны; нет конструктора одежды', () => {
  expect(stickers.calc.tiles.map(t => t.product)).toEqual(['sticker-3d', 'sticker-pack', 'sticker-set', 'vinyl-sticker', 'vinyl-pack']);
  expect(stickers.showConstructor).toBe(false);
  for (const item of stickers.prices.products) expect(findProduct('stickers', item.id)?.table).toBeTruthy();
});

test('шесть вариантов считают по своим размерам, количество и сумма допустимы', () => {
  const expected = [80, 47.5, 100.8, 270, 150, 80];
  expect(stickers.presets).toHaveLength(expected.length);
  stickers.presets.forEach((v, i) => {
    const p = findProduct('stickers', v.product)!;
    const selection = applyPreset(p, v);
    expect(selection.qty).toBe(v.qty);
    const q = p.quote(selection);
    expect(q.error, v.title).toBeUndefined();
    expect(presetPrice(v, 'stickers')).toEqual({ unit: expected[i], total: expected[i] * v.qty });
  });
  expect(stickers.presets[1].dims).toEqual({ w: 5, h: 2 });
  expect(stickers.presets[3].dims).toEqual({ w: 3, h: 3 });
});

test('размеры применяются до расчёта минимума 850 ₽; мусорные размеры отбрасываются', () => {
  for (const id of ['sticker-3d', 'vinyl-sticker']) {
    const p = findProduct('stickers', id)!;
    const s = applyPreset(p, { dims: { w: 1, h: 1 }, qty: p.qty.min });
    const q = p.quote(s);
    expect(q.error).toBeUndefined();
    expect(q.total).toBeGreaterThanOrEqual(STICKER_MIN_SUM);
    expect(s.qty).toBeGreaterThan(p.qty.min);
    const bad = applyPreset(p, { dims: { w: Number.NaN, h: 1000, bogus: 5 } });
    expect(bad.dims.w).toBe(p.dims![0].default);
    expect(bad.dims.h).toBe(p.dims![1].max);
    expect(bad.dims).not.toHaveProperty('bogus');
  }
});

test('ставка за площадь не подменяется ценой изделия; единица явно указана в hero и schema', () => {
  const vinyl = findProduct('stickers', 'vinyl-sticker')!;
  const tile = stickers.calc.tiles.find(t => t.product === vinyl.id)!;
  expect(tileFromLabel(vinyl, tile)).toBe('от 0,2 ₽/см²');
  expect(garmentFrom(stickers)).toBe(0.2);
  expect(stickers.hero.priceUnit).toBe('см²');
  const schema = service({ name: stickers.serviceName, description: stickers.description, url: stickers.slug, lowPrice: garmentFrom(stickers), priceUnit: stickers.hero.priceUnit });
  expect(schema.offers.priceSpecification).toMatchObject({ unitText: 'см²', price: 0.2 });
});

test('вопросы объясняют минимальный заказ и цену; чужих работ нет', () => {
  expect(stickers.faq).toHaveLength(10);
  expect(stickers.faq![0].a).toContain('850');
  expect(stickers.faq![3].a).toContain('80');
  expect(stickers.faq![3].a).toContain('5 ₽');
  expect(stickers.worksTag).toBe('nakleyki');
  expect(JSON.stringify(stickers)).not.toContain('portfolio-14');
});
