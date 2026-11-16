import { expect, test } from 'vitest';
import { cap } from './cap';
import { garmentColors, garmentFaq, garmentFrom, garmentReviews, garmentWorks, presetPrice } from './select';
import { services } from '../services';
import { COLOR_MIN, findProduct } from '../pricing';
import { applyPreset } from '@/lib/calc-preset';

const { presets } = cap;
const cat = cap.calc.category;
const product = findProduct('textile', 'cap')!;
const quote = (o: Record<string, string>, qty = 1) =>
  product.quote({ options: { blank: 'ours', color: 'white', print1: 'a6', ...o }, dims: {}, qty });

test('калькулятор: «Бейсболка» и «Своя бейсболка» (только печать)', () => {
  expect(cap.calc.tiles.map((t) => t.label)).toEqual(['Бейсболка', 'Своя бейсболка']);
  expect(cap.calc.tiles.map((t) => t.product)).toEqual(['cap', 'cap']);
  expect(cap.calc.tiles.find((t) => t.id === 'own')).toMatchObject({ preset: { blank: 'own' }, own: true });
  const own = quote({ blank: 'own' });
  expect(own.breakdown.map((b) => b.label)).toEqual(['Печать DTF А6']);
  expect(garmentFrom(cap)).toBe(product.fromPrice);
});

test('цены бейсболки: 650 / 550 / 450 + печать; до 4 принтов, все А6; больше 100 — индивидуально', () => {
  expect(quote({}, 1).breakdown[0].amount).toBe(650);
  expect(quote({}, 10).breakdown[0].amount).toBe(550);
  expect(quote({}, 30).breakdown[0].amount).toBe(450);
  const printGroups = (product.options ?? []).filter((o) => /^print\d$/.test(o.id));
  expect(printGroups).toHaveLength(4);
  for (const o of printGroups)
    expect(o.choices.map((c) => c.id).filter((id) => id !== 'none')).toEqual(['a6']);
  expect(product.qty.max).toBe(100);
  expect(product.qty.individualAbove).toBe(true);
  expect(product.table!.note).toBe('Больше 100 шт — цена рассчитывается индивидуально.');
  // four prints: the first in full, every next −30%
  const four = quote({ print2: 'a6', print3: 'a6', print4: 'a6' });
  expect(four.breakdown.filter((b) => b.label.includes('(−30%)'))).toHaveLength(3);
});

test('готовые варианты: пять из 2.0, цена по прайсу, количество не меняется', () => {
  expect(presets.map((v) => [v.title, v.qty])).toEqual([
    ['Именная кепка', 1],
    ['Логотип спереди и сбоку', 1],
    ['10 кепок для команды', 10],
    ['30 кепок для персонала', 30],
    ['100 кепок для промо', 100],
  ]);
  expect(presets.map((v) => v.note)).toEqual([
    'имя, надпись или рисунок спереди — в подарок',
    'два принта на одной кепке: второй — со скидкой',
    'логотип клуба или название команды спереди',
    'логотип компании спереди — для зала, курьеров, выездной команды',
    'логотип спереди — акции, забеги, фестивали',
  ]);
  for (const v of presets) {
    expect(v.product).toBe('cap');
    const p = presetPrice(v, cat);
    expect(p.unit, v.title).toBeGreaterThan(0);
    expect(p.total, v.title).toBe(p.unit * v.qty);
    // a variant of 1 pc is white or black (coloured caps — from 10), so no variant's quantity is lifted
    expect(applyPreset(product, { options: v.options, qty: v.qty }).qty, v.title).toBe(v.qty);
  }
  // pinned: cap 650 + DTF A6; two prints: 650 + A6 + A6 × 0.7
  const a6 = quote({ blank: 'own' }).unit;
  expect(presetPrice(presets[0], cat).total).toBe(650 + a6);
  expect(presetPrice(presets[1], cat).total).toBe(Math.round(650 + a6 + a6 * 0.7));
});

test('цветная бейсболка в готовом варианте поднимает количество до 10', () => {
  expect(applyPreset(product, { options: { color: 'red' }, qty: 1 }).qty).toBe(10);
  expect(applyPreset(product, { options: { color: 'white' }, qty: 1 }).qty).toBe(1);
  expect(quote({ color: 'red' }, 1).error).toBe('Цветные бейсболки — от 10 шт');
});

test('фото вариантов: настоящие работы с тегом kepki, остальные — слот cap-product', () => {
  const works = garmentWorks(cap).map((w) => w.src);
  const imgs = presets.filter((v) => v.img).map((v) => v.img);
  expect(imgs.length).toBeGreaterThan(0);
  for (const i of imgs) expect(works).toContain(i);
  for (const v of presets.filter((x) => !x.img)) expect(v.pic?.name).toBe('cap-product');
  expect(JSON.stringify(cap)).not.toContain('portfolio-14');
  expect(JSON.stringify(cap)).not.toContain('showcase/');
});

test('цвета: 11, белый и чёрный в наличии, цветные — от 10 шт', () => {
  const c = garmentColors(cap);
  expect(c).toHaveLength(11);
  expect(c.filter((x) => x.free).map((x) => x.id)).toEqual(['white', 'black']);
  expect(c.filter((x) => !x.free).every((x) => x.note === `от ${COLOR_MIN.cap} шт`)).toBe(true);
});

test('тексты по новым правилам: 11 цветов, до 4 принтов, четвёртое место не названо', () => {
  const all = JSON.stringify(cap);
  expect(all).not.toMatch(/7 цветов|семи цветов|хаки|до тр[её]х|третий принт|ещё дешевле|вдвое|−50%|четв[её]рт/i);
  expect(all).toContain('до 4 принтов');
  const places = cap.specs!.items.find((s) => s.label === 'Места печати')!.value;
  expect(places).toBe('спереди, сбоку и сзади над застёжкой — до 4 принтов, каждый А6');
});

test('характеристики — из 2.0; без схемы размеров, места печати — карточками', () => {
  expect(cap.specs!.items.map((s) => s.label)).toEqual(['Модель', 'Состав', 'Ткань', 'Размер', 'Застёжка', 'Печать', 'Места печати']);
  expect(cap.specs!.items.find((s) => s.label === 'Ткань')!.value).toBe('саржа, 250 г/м²');
  expect(cap.prints).toBeUndefined();
  expect(cap.sizes).toBeUndefined();
  const where = cap.extra!.find((x) => x.id === 'places')!;
  expect(where.title).toBe('Где печатаем');
  expect(where.cards.map((c) => c.title)).toEqual(['Спереди', 'Сбоку', 'Сзади, над застёжкой']);
  expect(where.cards[0].text).toBe(
    'Главное место: логотип, имя, название команды или короткая надпись. Широкая передняя панель без шва — принт не разрезается посередине.',
  );
  expect(where.cards[0].rows![0].value).toBe('до А6 по ширине; по высоте ограничивает панель — около 11 × 6 см');
});

test('уход — из 2.0 дословно', () => {
  expect(cap.care).toEqual([
    'Не стирайте в машинке — козырёк и передняя часть могут потерять форму.',
    'Чистите вручную: тёплая вода, мягкая губка, без отбеливателя.',
    'Не трите принт щёткой.',
    'Сушите на форме — например, на банке или мяче, а не на батарее.',
  ]);
});

test('работы — тег kepki; отзывов про кепки нет — добраны с главной', () => {
  const works = garmentWorks(cap);
  expect(works.length).toBeGreaterThan(0);
  for (const w of works) expect(w.tags).toContain('kepki');
  expect(cap.reviewWords).toEqual(['кепк', 'бейсболк']);
  const { items } = garmentReviews(cap);
  expect(items.length).toBeGreaterThanOrEqual(3);
  expect(new Set(items.map((r) => r.text)).size).toBe(items.length);
});

test('вопросы — из services.ts', () => {
  const svc = services.find((s) => s.slug === '/pechat-na-kepkah')!;
  expect(garmentFaq(cap)).toEqual(svc.faq);
  expect(garmentFaq(cap).length).toBeGreaterThan(0);
});

test('таблица цен «Цена печати на бейсболках»', () => {
  expect(`${cap.prices.title} ${cap.prices.accent}`).toBe('Цена печати на бейсболках');
  expect(cap.prices.products.map((p) => p.id)).toEqual(['cap']);
  expect(product.table).toBeTruthy();
  expect(cap.prices.rules[0].text).toBe('Цветные бейсболки — от 10 шт. Белые и чёрные — с 1 шт.');
});

test('первый экран, картинки, адрес', () => {
  expect(cap.slug).toBe('/pechat-na-kepkah');
  expect(cap.h1.replace(/ /g, ' ')).toBe('Печать на бейсболках в Калининграде');
  expect(cap.accent).toBe('от 1 штуки');
  expect(cap.images.hero).toBe('cap-hero');
  expect(cap.images.heroMobile).toBe('cap-hero-mobile');
  expect(JSON.stringify(cap)).not.toContain('Челнокова, 11');
});
