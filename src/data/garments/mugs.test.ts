import { expect, test } from 'vitest';
import { mugs, buildMugFaq } from './mugs';
import { garmentFaq, garmentWorks, presetPrice } from './select';
import { findProduct, defaultSelection, rub } from '../pricing';
import { portfolio } from '../portfolio';

const category = mugs.calc.category;

test('калькулятор: четыре модели из прайса, без своей кружки и конструктора', () => {
  expect(mugs.calc.tiles.map((t) => [t.label, t.product])).toEqual([
    ['Кружка 330 мл', 'mug'], ['Кружка 425 мл', 'mug-big'], ['Кофейный набор', 'coffee-set'], ['Пивная 600 мл', 'beer-mug'],
  ]);
  for (const tile of mugs.calc.tiles) expect(findProduct(category, tile.product)).toBeTruthy();
  expect(mugs.showConstructor).toBe(false);
  expect(mugs.calc.tiles.some((t) => t.own)).toBe(false);
});

test('пять готовых пакетов используют допустимые настройки и цены из прайса', () => {
  expect(mugs.presets.map((p) => [p.title, p.product, p.qty])).toEqual([
    ['Кружка с фото в подарок', 'mug', 1], ['Кружка-хамелеон', 'mug', 1], ['Кофейный набор в подарок', 'coffee-set', 1],
    ['Пивная кружка 600 мл для папы', 'beer-mug', 1], ['Кружки с логотипом для офиса', 'mug', 50],
  ]);
  for (const preset of mugs.presets) {
    const p = findProduct(category, preset.product)!;
    expect(presetPrice(preset, category).unit).toBeGreaterThan(0);
    expect(presetPrice(preset, category).total).toBe(presetPrice(preset, category).unit * preset.qty);
    for (const [key, value] of Object.entries(preset.options)) {
      const group = p.options?.find((g) => g.id === key);
      if (group?.type === 'one') expect(group.choices.some((c) => c.id === value), `${preset.title}: ${value}`).toBe(true);
      else if (key === 'variant') expect(p.options?.some((g) => g.id === 'variant' && g.choices.some((c) => c.id === value))).toBe(true);
    }
    expect(preset.img ? portfolio.some((w) => w.src === preset.img && w.tags.includes('kruzhki')) : preset.pic?.name === 'mug-product').toBe(true);
  }
  expect(JSON.stringify(mugs)).not.toContain('portfolio-14');
});

test('описания моделей и покрытия, ценовая таблица содержит все изделия и варианты', () => {
  const modelCards = mugs.extra!.find((x) => x.id === 'models')!.cards;
  expect(modelCards).toHaveLength(4);
  expect(modelCards.map((c) => c.title)).toEqual(['Кружка 330 мл', 'Кружка 425 мл', 'Кофейный набор', 'Пивная кружка 600 мл']);
  expect(modelCards.map((c) => c.rows?.find((r) => r.label === 'Диаметр')?.value)).toEqual(['82 мм', '82 мм', '78 мм', '82 мм']);
  const covers = mugs.extra!.find((x) => x.id === 'finishes')!.cards;
  expect(covers).toHaveLength(6);
  expect(covers.find((c) => c.title === 'Цветная ручка и внутри')?.points).toEqual(['Тёмно-синий', 'Тёмно-зелёный', 'Чёрный', 'Розовый', 'Синий', 'Салатовый', 'Красный', 'Оранжевый', 'Жёлтый']);
  expect(covers.find((c) => c.title === 'Глиттер')?.points).toEqual(['Золотой', 'Серебряный', 'Бирюзовый', 'Розовый']);
  expect(covers.find((c) => c.title === 'Мрамор, зеркальное золото и серебро')?.points).toEqual(['Мрамор серый', 'Мрамор розовый', 'Мрамор голубой', 'Зеркальное золото', 'Зеркальное серебро']);
  const mugProduct = findProduct(category, 'mug')!;
  expect(mugProduct.table?.rows).toHaveLength(6);
  expect(mugs.prices.products.map((p) => p.id)).toEqual(['mug', 'mug-big', 'coffee-set', 'beer-mug']);
  for (const row of mugs.prices.products) expect(findProduct(category, row.id)?.table, row.id).toBeTruthy();
});

test('FAQ передаёт актуальные цены и сохраняет тексты 2.0; уход и фото без выдуманных решений', () => {
  const one = (id: string, variant?: string) => {
    const p = findProduct(category, id)!;
    const base = defaultSelection(p);
    return rub(p.quote({ ...base, qty: 1, options: { ...base.options, ...(variant ? { variant } : {}) } }).unit);
  };
  const expected = buildMugFaq({ one330: one('mug', 'white'), oneChameleon: one('mug', 'chameleon') });
  expect(garmentFaq(mugs)).toEqual(expected);
  expect(expected).toHaveLength(12);
  expect(expected[1].a).toContain(one('mug', 'white'));
  expect(expected[3].a).toContain(one('mug', 'chameleon'));
  expect(mugs.care).toHaveLength(4);
  expect(mugs.careSub).toBe('Как мыть, чтобы рисунок оставался ярким');
  expect(mugs.images).toMatchObject({ hero: 'mug-hero', heroMobile: 'mug-hero-mobile' });
  expect(JSON.stringify(mugs)).not.toMatch(/УФ|своя кружка|свою кружку|portfolio-14/iu);
  expect(mugs.images.label).not.toMatch(/пресс/);
  expect(mugs.images.alt).not.toMatch(/пресс/);
});

test('работы — настоящие кружки с тегом kruzhki, исключая portfolio-14', () => {
  const works = garmentWorks(mugs);
  expect(works.length).toBeGreaterThan(0);
  expect(works.every((w) => w.tags.includes('kruzhki') && !w.src.includes('portfolio-14'))).toBe(true);
});
