import { expect, test } from 'vitest';
import { defaultSelection, findProduct } from '@/data/pricing';
import { applyPreset, CALC_APPLY_EVENT } from './calc-preset';

const tee = findProduct('textile', 'tshirt-unisex')!;

test('событие готового варианта называется calc:apply', () => {
  expect(CALC_APPLY_EVENT).toBe('calc:apply');
});

test('цветная футболка из готового варианта: 1 шт поднимается до 5, цвет и принт ставятся', () => {
  const s = applyPreset(tee, { options: { color: 'red', print1: 'a4' }, qty: 1 });
  expect(s.qty).toBe(5);
  expect(s.options.color).toBe('red');
  expect(s.options.print1).toBe('a4');
});

test('белая футболка остаётся с 1 шт', () => {
  expect(applyPreset(tee, { options: { color: 'white' }, qty: 1 }).qty).toBe(1);
});

test('неизвестная группа и неизвестное значение отбрасываются', () => {
  const s = applyPreset(tee, { options: { foo: 'bar', color: 'plaid', print2: 'a6' }, qty: 3 });
  expect(s.options).not.toHaveProperty('foo');
  expect(s.options.color).toBe(defaultSelection(tee).options.color);
  expect(s.options.print2).toBe('a6');
  expect(s.qty).toBe(3);
});

test('количество больше максимума ограничивается qty.max', () => {
  expect(applyPreset(tee, { qty: 999 }).qty).toBe(tee.qty.max);
});

test('пустой вариант даёт настройки по умолчанию', () => {
  expect(applyPreset(tee, {})).toEqual(defaultSelection(tee));
});

test('цена готового варианта совпадает с расчётом pricing.ts', () => {
  const s = applyPreset(tee, { options: { color: 'blue', print1: 'a4', print2: 'a6' }, qty: 20 });
  const q = tee.quote(s);
  expect(q.error).toBeUndefined();
  expect(q.total).toBe(q.unit * 20);
});

test('цветной шоппер из готового варианта: 1 шт поднимается до 10', () => {
  const shopper = findProduct('textile', 'shopper')!;
  const s = applyPreset(shopper, { options: { color: 'red' }, qty: 1 });
  expect(s.qty).toBe(10);
  expect(shopper.quote(s).error).toBeUndefined();
});

test('очередь: вариант, нажатый до загрузки калькулятора, ждёт и выдаётся один раз', async () => {
  const { queueCalcPreset, takeCalcPreset } = await import('./calc-preset');
  const w: Record<string, unknown> = {};
  const d = { product: 'tshirt-unisex', options: { color: 'blue' }, qty: 20 };
  expect(takeCalcPreset(w)).toBeUndefined();
  queueCalcPreset(w, d);
  expect(takeCalcPreset(w)).toEqual(d);
  expect(takeCalcPreset(w)).toBeUndefined();
});

test('плитка «Своя футболка»: preset blank own даёт только печать', () => {
  const s = applyPreset(tee, { options: { blank: 'own' } });
  expect(s.options.blank).toBe('own');
  const q = tee.quote(s);
  expect(q.breakdown.every((b) => b.label.startsWith('Печать'))).toBe(true);
});

test('активная плитка: своя выигрывает у обычной, когда blank own; детская — по продукту', async () => {
  const { activeTile } = await import('./calc-preset');
  const tiles = [
    { id: 'unisex', label: 'Футболка унисекс', product: 'tshirt-unisex' },
    { id: 'kids', label: 'Детская', product: 'tshirt-kids' },
    { id: 'own', label: 'Своя футболка', product: 'tshirt-unisex', preset: { blank: 'own' } },
  ];
  expect(activeTile(tiles, 'tshirt-unisex', { blank: 'ours' })?.id).toBe('unisex');
  expect(activeTile(tiles, 'tshirt-unisex', { blank: 'own' })?.id).toBe('own');
  expect(activeTile(tiles, 'tshirt-kids', {})?.id).toBe('kids');
  expect(activeTile(tiles, 'hoodie', {})).toBeUndefined();
});

test('«от» на плитках — одна база: штука при самом выгодном тираже с самым маленьким принтом', async () => {
  const { tileFromPrice } = await import('./calc-preset');
  const kids = findProduct('textile', 'tshirt-kids')!;
  const hoodie = findProduct('textile', 'hoodie')!;
  // our garment: blank at its cheapest run + A6 at its cheapest run (= the product's «от»)
  expect(tileFromPrice(tee, { id: 'unisex', label: 'Футболка унисекс', product: 'tshirt-unisex' })).toBe(tee.fromPrice);
  expect(tileFromPrice(tee, { id: 'unisex', label: 'Футболка унисекс', product: 'tshirt-unisex' })).toBe(830);
  expect(tileFromPrice(kids, { id: 'kids', label: 'Детская', product: 'tshirt-kids' })).toBe(780);
  expect(tileFromPrice(hoodie, { id: 'hoodie', label: 'Худи', product: 'hoodie' })).toBe(2880);
  // own garment: the same, only without the blank — so own = ours − the blank's cheapest price
  expect(tileFromPrice(tee, { id: 'own', label: 'Своя футболка', product: 'tshirt-unisex', preset: { blank: 'own' } })).toBe(830 - 550);
  expect(tileFromPrice(hoodie, { id: 'own', label: 'Своё худи', product: 'hoodie', preset: { blank: 'own' } })).toBe(2880 - 2600);
});

// ---- tiles: «свой» by the `own` flag, product list from the tiles, switching tiles (final review 16.11)

const own = { id: 'own', label: 'Своя футболка', product: 'tshirt-unisex', preset: { blank: 'own' }, own: true };
const unisex = { id: 'unisex', label: 'Футболка унисекс', product: 'tshirt-unisex' };
const kids = { id: 'kids', label: 'Детская', product: 'tshirt-kids' };
/** workwear / sport uniform: the customer's item only, a product without a «наша / своя» group */
const ownItem = { id: 'own', label: 'Своя спецодежда', product: 'own-item', own: true };

test('«печать от» и название позиции решает флаг own, а не preset', async () => {
  const { tileFromLabel, tileItemName } = await import('./calc-preset');
  const item = findProduct('textile', 'own-item')!;
  expect(tileFromLabel(tee, own)).toBe('печать от 280 ₽');
  expect(tileFromLabel(tee, unisex)).toBe('от 830 ₽');
  // own-item has no `blank` group, no preset — still «печать от» and named by the tile
  expect(tileFromLabel(item, ownItem)).toMatch(/^печать от \d+ ₽$/);
  expect(tileItemName(ownItem, item)).toBe('Своя спецодежда');
  expect(tileItemName(own, tee)).toBe('Своя футболка');
  // an ordinary tile keeps the product's full name in the estimate
  expect(tileItemName(kids, findProduct('textile', 'tshirt-kids')!)).toBe('Футболка детская');
  expect(tileItemName(undefined, tee)).toBe('Футболка унисекс');
});

test('плитка «своя вещь» без preset активна на own-item', async () => {
  const { activeTile } = await import('./calc-preset');
  expect(activeTile([ownItem], 'own-item', {})?.id).toBe('own');
});

test('список изделий страницы — из плиток, без повторов', async () => {
  const { tileProducts } = await import('./calc-preset');
  expect(tileProducts([unisex, kids, own])).toEqual(['tshirt-unisex', 'tshirt-kids']);
});

test('смена плитки: размеры принтов переносятся, повторный выбор той же плитки ничего не сбрасывает', async () => {
  const { switchTile } = await import('./calc-preset');
  const cur = applyPreset(tee, { options: { color: 'red', print1: 'a3', print2: 'a6', print5: 'a5' }, qty: 7 });
  // the same tile again — nothing changes
  expect(switchTile(tee, unisex, unisex, cur)).toBeUndefined();
  // to «Детская»: prints carried over, colour and qty back to the defaults
  const k = switchTile(findProduct('textile', 'tshirt-kids')!, unisex, kids, cur)!;
  expect([k.options.print1, k.options.print2, k.options.print5]).toEqual(['a3', 'a6', 'a5']);
  expect(k.options.color).toBe('white');
  // to «Своя футболка»: prints carried over, the preset wins
  const o = switchTile(tee, unisex, own, cur)!;
  expect(o.options.blank).toBe('own');
  expect(o.options.print1).toBe('a3');
  // to the hoodie: only 4 places — print5 is dropped, print1 kept
  const h = switchTile(findProduct('textile', 'hoodie')!, unisex, { id: 'h', label: 'Худи', product: 'hoodie' }, cur)!;
  expect(h.options.print1).toBe('a3');
  expect(h.options.print5).toBeUndefined();
});
