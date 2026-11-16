import { expect, test } from 'vitest';
import { shopper } from './shopper';
import { garmentColors, garmentFaq, garmentFrom, garmentReviews, garmentWorks, presetPrice } from './select';
import { services } from '../services';
import { findProduct } from '../pricing';
import { applyPreset } from '@/lib/calc-preset';
import { SHAPES } from './shapes';

const { presets } = shopper;
const cat = shopper.calc.category;
const cotton = findProduct('textile', 'shopper')!;
const sub = findProduct('textile', 'shopper-sub')!;

test('калькулятор: «Хлопковый шоппер», «Шоппер для сублимации», «Свой шоппер» (только печать)', () => {
  expect(shopper.calc.tiles.map((t) => t.label)).toEqual(['Хлопковый шоппер', 'Шоппер для сублимации', 'Свой шоппер']);
  expect(shopper.calc.tiles.map((t) => t.product)).toEqual(['shopper', 'shopper-sub', 'shopper']);
  expect(shopper.calc.tiles.find((t) => t.id === 'own')).toMatchObject({ preset: { blank: 'own' }, own: true });
  for (const t of shopper.calc.tiles) expect(findProduct(cat, t.product), t.id).toBeTruthy();
  const own = cotton.quote({ options: { blank: 'own', color: 'white', print1: 'a4', print2: 'none' }, dims: {}, qty: 1 });
  expect(own.breakdown.map((b) => b.label)).toEqual(['Печать DTF А4']);
});

test('цена «от» на первом экране — самая низкая из изделий плиток', () => {
  expect(garmentFrom(shopper)).toBe(Math.min(cotton.fromPrice, sub.fromPrice));
});

test('готовые варианты: пять из 2.0 дословно, цена по прайсу', () => {
  expect(presets.map((v) => [v.title, v.product, v.qty])).toEqual([
    ['Шоппер с принтом в подарок', 'shopper', 1],
    ['С двух сторон', 'shopper', 1],
    ['20 шопперов для мероприятия', 'shopper', 20],
    ['50 светлых шопперов с сублимацией', 'shopper-sub', 50],
    ['100 шопперов цвета льна с логотипом', 'shopper-sub', 100],
  ]);
  expect(presets.map((v) => v.note)).toEqual([
    'хлопковый, рисунок или фото А4 с одной стороны',
    'хлопковый, два принта А4 — одинаковые или разные',
    'хлопковые, логотип или афиша А5',
    'цвет льна, яркое фото или рисунок А4',
    'сублимация А5 — для welcome pack и раздачи',
  ]);
  for (const v of presets) {
    const p = presetPrice(v, cat);
    expect(p.unit, v.title).toBeGreaterThan(0);
    expect(p.total, v.title).toBe(p.unit * v.qty);
    // the variant's quantity is not lifted by a colour minimum: every colour is white or black
    expect(applyPreset(findProduct(cat, v.product)!, { options: v.options, qty: v.qty }).qty, v.title).toBe(v.qty);
  }
  // pinned: cotton 450 + DTF A4 800; two sides: 450 + 800 + 800 × 0.7
  expect(presetPrice(presets[0], cat).total).toBe(1250);
  expect(presetPrice(presets[1], cat).total).toBe(1810);
  // sublimation: 50 pcs — 230 + A4 150
  expect(presetPrice(presets[3], cat).unit).toBe(380);
});

test('фото вариантов: настоящие работы с тегом shoppery, остальные — слот shopper-product', () => {
  const works = garmentWorks(shopper).map((w) => w.src);
  const imgs = presets.filter((v) => v.img).map((v) => v.img);
  expect(imgs.length).toBeGreaterThan(0);
  for (const i of imgs) expect(works).toContain(i);
  for (const v of presets.filter((x) => !x.img)) expect(v.pic?.name).toBe('shopper-product');
  expect(JSON.stringify(shopper)).not.toContain('portfolio-14');
  expect(JSON.stringify(shopper)).not.toContain('showcase/');
});

test('цветной шоппер в готовом варианте поднимает количество до 10', () => {
  expect(applyPreset(cotton, { options: { color: 'red' }, qty: 1 }).qty).toBe(10);
  expect(applyPreset(cotton, { options: { color: 'black' }, qty: 1 }).qty).toBe(1);
});

test('шоппер для сублимации ниже 10 шт — без цены (подсказка), с 10 — цена', () => {
  expect(sub.qty.min).toBe(10);
  expect(applyPreset(sub, { qty: 1 }).qty).toBe(10);
});

test('цвета хлопкового: 11 цветов, белый и чёрный в наличии, цветные — от 10 шт; без «светлого» и «от 20»', () => {
  const c = garmentColors(shopper);
  expect(c).toHaveLength(11);
  expect(c.filter((x) => x.free).map((x) => x.id)).toEqual(['white', 'black']);
  expect(c.filter((x) => !x.free).every((x) => x.note === 'от 10 шт')).toBe(true);
  const all = JSON.stringify(shopper);
  expect(all).not.toMatch(/как лён|от 20 шт|светлый \(|или чёрный;/i);
});

test('«Подробнее»: два вида шоппера и «DTF или сублимация» — тексты 2.0, у хлопкового цвет по новым правилам', () => {
  const ids = shopper.extra!.map((s) => s.id);
  expect(ids).toEqual(['kinds', 'tech']);
  const kinds = shopper.extra![0].cards;
  expect(kinds.map((k) => k.title)).toEqual(['Хлопковый шоппер', 'Светлый шоппер цвета льна']);
  const row = (i: number, label: string) => kinds[i].rows!.find((r) => r.label === label)!.value;
  expect(row(0, 'Материал')).toBe('100% хлопок, саржа, 240 г/м²');
  expect(row(0, 'Цвет')).toBe('11 цветов: белый и чёрный — с 1 шт, цветные — от 10 шт');
  expect(row(0, 'Размер')).toBe('38 × 42 см');
  expect(row(1, 'Цвет')).toBe('небелёный лён');
  expect(row(1, 'Ручки')).toBe('70 см');
  const tech = shopper.extra![1].cards;
  expect(tech.map((t) => t.title)).toEqual(['DTF-печать', 'Сублимация']);
  expect(tech[0].points).toContain('До А4 с каждой стороны, можно с двух сторон.');
  expect(tech[1].points).toContain('До А3 с каждой стороны, можно с двух сторон.');
});

test('размеры принтов на контуре шоппера: А6–А4 (хлопковый), А3 — только сублимация', () => {
  expect(shopper.prints!.shape).toBe('shopper');
  expect(shopper.prints!.sizes.map((p) => `${p.label} ${p.w}×${p.h}`)).toEqual(['А6 10×15', 'А5 15×21', 'А4 21×28']);
  expect(shopper.prints!.caption).toContain('А3');
  expect(shopper.prints!.caption).toContain('сублимации');
  // every frame fits the cotton shopper (38 × 42 cm)
  const s = SHAPES.shopper;
  for (const p of shopper.prints!.sizes) {
    expect(s.center - p.w / 2).toBeGreaterThanOrEqual(0);
    expect(s.top + p.h).toBeLessThanOrEqual(42);
  }
  expect(shopper.sizes).toBeUndefined();
});

test('уход — из 2.0', () => {
  expect(shopper.care!.join(' ')).toContain('Светлый шоппер с сублимацией можно стирать в машинке при 30–40 °C.');
});

test('работы — тег shoppery; отзывы — со словами «шоппер», «сумк», не меньше трёх', () => {
  const works = garmentWorks(shopper);
  expect(works.length).toBeGreaterThan(0);
  for (const w of works) expect(w.tags).toContain('shoppery');
  expect(shopper.reviewWords).toEqual(['шоппер', 'сумк']);
  const { items } = garmentReviews(shopper);
  expect(items.length).toBeGreaterThanOrEqual(3);
  expect(new Set(items.map((r) => r.text)).size).toBe(items.length);
});

test('вопросы — из services.ts', () => {
  const svc = services.find((s) => s.slug === '/pechat-na-shopperah')!;
  expect(garmentFaq(shopper)).toEqual(svc.faq);
  expect(garmentFaq(shopper).length).toBeGreaterThan(0);
});

test('таблица цен «Цена печати на шопперах» — хлопковый и сублимационный', () => {
  expect(`${shopper.prices.title} ${shopper.prices.accent}`).toBe('Цена печати на шопперах');
  expect(shopper.prices.products.map((p) => p.id)).toEqual(['shopper', 'shopper-sub']);
  for (const p of shopper.prices.products) expect(findProduct(cat, p.id)?.table, p.id).toBeTruthy();
  expect(shopper.prices.rules[0].text).toBe('Цветные шопперы — от 10 шт. Белые и чёрные — с 1 шт.');
});

test('первый экран, картинки, адрес', () => {
  expect(shopper.h1.replace(/\u00a0/g, ' ')).toBe('Печать на шопперах в Калининграде');
  expect(shopper.accent).toBe('от 1 штуки');
  expect(shopper.images.hero).toBe('shopper-hero');
  expect(shopper.images.heroMobile).toBe('shopper-hero-mobile');
  expect(JSON.stringify(shopper)).not.toContain('Челнокова, 11');
});
