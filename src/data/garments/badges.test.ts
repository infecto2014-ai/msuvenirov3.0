import { expect, test } from 'vitest';
import { badges, buildBadgeFaq } from './badges';
import { garmentFaq, garmentWorks, presetPrice } from './select';
import { defaultSelection, findProduct, rub } from '../pricing';
import { portfolio } from '../portfolio';

const category = badges.calc.category;

test('калькулятор: оба изделия из прайса, правильные минимумы и без конструктора', () => {
  expect(badges.slug).toBe('/znachki');
  expect(badges.h1).toBe('Значки на заказ в Калининграде');
  expect(badges.accent).toBe('от 10 штук');
  expect(badges.calc.tiles.map((t) => [t.label, t.product])).toEqual([
    ['Закатной значок', 'badge-roll'], ['Значок на цанге', 'badge-pin'],
  ]);
  expect(findProduct(category, 'badge-roll')!.qty.min).toBe(10);
  expect(findProduct(category, 'badge-pin')!.qty.min).toBe(25);
  expect(findProduct(category, 'badge-roll')!.qty.max).toBe(1000);
  expect(badges.showConstructor).toBe(false);
  expect(badges.calc.tiles.some((tile) => tile.own)).toBe(false);
});

test('пять вариантов имеют допустимые изделия, размеры и цены из quote', () => {
  expect(badges.presets.map((p) => [p.title, p.product, p.qty, p.options.variant])).toEqual([
    ['Набор для фандома', 'badge-roll', 10, 'd38'],
    ['Значки на выпускной', 'badge-roll', 25, 'd56'],
    ['50 значков для акции', 'badge-roll', 50, 'd38'],
    ['100 значков с логотипом', 'badge-roll', 100, 'd56'],
    ['Значки на цанге для команды', 'badge-pin', 50, 'd25'],
  ]);
  for (const preset of badges.presets) {
    const product = findProduct(category, preset.product)!;
    expect(product.options?.some((group) => group.id === 'variant' && group.choices.some((choice) => choice.id === preset.options.variant)), preset.title).toBe(true);
    expect(presetPrice(preset, category).unit).toBeGreaterThan(0);
    expect(presetPrice(preset, category).total).toBe(presetPrice(preset, category).unit * preset.qty);
    expect(preset.pic?.name).toBe('badge-product');
    expect(preset.img).toBeUndefined();
  }
});

test('описания содержат все размеры и таблицы цен обоих изделий', () => {
  const types = badges.extra!.find((section) => section.id === 'types')!.cards;
  expect(types.map((card) => card.title)).toEqual(['Закатной значок', 'Значок на цанге']);
  expect(types[0].rows?.[0].value).toBe('38 или 56 мм');
  expect(types[1].rows?.[0].value).toBe('15, 25, 30 или 35 мм');
  const roll = findProduct(category, 'badge-roll')!;
  const pin = findProduct(category, 'badge-pin')!;
  expect(roll.table?.rows.length).toBeGreaterThan(0);
  expect(pin.table?.rows.length).toBeGreaterThan(0);
  expect(badges.prices.products.map((p) => p.id)).toEqual(['badge-roll', 'badge-pin']);
  expect(badges.prices.products.every((p) => findProduct(category, p.id)?.table)).toBe(true);
  expect(badges.prices.rules.map((r) => r.text).join(' ')).toMatch(/50 шт/);
  expect(badges.prices.rules.map((r) => r.text).join(' ')).toMatch(/1000/);
});

test('FAQ воспроизводит оригинальные ответы и берёт цены из актуального quote', () => {
  const unit = (qty: number) => {
    const product = findProduct(category, 'badge-roll')!;
    const base = defaultSelection(product);
    return rub(product.quote({ ...base, qty, options: { ...base.options, variant: 'd38' } }).unit);
  };
  const expected = buildBadgeFaq({ roll38: unit(10), roll38at50: unit(50), rollMin: 10, pinMin: 25, discountFrom: 50, max: 1000 });
  expect(garmentFaq(badges)).toEqual(expected);
  expect(expected).toHaveLength(8);
  expect(expected[0].a).toContain('от 10 штук');
  expect(expected[0].a).toContain('от 25 штук');
  expect(expected[1].a).toContain(unit(10));
  expect(expected[1].a).toContain(unit(50));
  expect(badges.extra!.find((section) => section.id === 'layout')!.cards).toHaveLength(4);
});

test('работы отбираются по тегам значков или брелоков, portfolio-14 исключён', () => {
  const works = garmentWorks(badges);
  const eligible = portfolio.filter((w) => w.tags.includes('znachki') || w.tags.includes('breloki'));
  expect(works.length).toBeGreaterThan(0);
  expect(works.map((w) => w.src)).toEqual(eligible.filter((w) => !w.src.includes('portfolio-14.')).map((w) => w.src));
  expect(works.every((w) => (w.tags.includes('znachki') || w.tags.includes('breloki')) && !w.src.includes('portfolio-14.'))).toBe(true);
});
