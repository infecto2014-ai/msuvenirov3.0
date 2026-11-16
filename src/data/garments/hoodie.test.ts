import { expect, test } from 'vitest';
import { hoodie } from './hoodie';
import { garmentFaq, garmentReviews, garmentWorks, presetPrice } from './select';
import { services } from '../services';
import { findProduct, HOODIE_BLANK } from '../pricing';

const { presets, sizes, printSizes, specs, care } = hoodie;
const product = findProduct('textile', 'hoodie')!;
const quote = (o: Record<string, string>, qty = 1) => product.quote({ options: { blank: 'ours', color: 'white', print1: 'none', ...o }, dims: {}, qty });

test('готовые варианты: четыре, цена по прайсу', () => {
  expect(presets).toHaveLength(4);
  for (const v of presets) {
    const price = presetPrice(v);
    expect(price.unit, v.title).toBeGreaterThan(HOODIE_BLANK);
    expect(price.total, v.title).toBe(price.unit * v.qty);
  }
  // pinned: hoodie 2 600 + DTF A4 800 (1 pc)
  expect(presetPrice(presets.find((v) => v.title === 'Худи с принтом на груди')!).total).toBe(HOODIE_BLANK + 800);
  // team: 20 pcs — hoodie 2 600 at any run + A4 and A6 at the 20+ tier
  const team = presets.find((v) => v.title.startsWith('Для класса'))!;
  expect(team.qty).toBe(20);
  expect(presetPrice(team).unit).toBeGreaterThan(HOODIE_BLANK);
});

test('цена худи — точная, без «от»; одна цена при любом количестве', () => {
  for (const qty of [1, 10, 50]) {
    const b = quote({}, qty).breakdown[0];
    expect(b.amount).toBe(HOODIE_BLANK);
    expect(b.label).not.toContain('от');
  }
  expect(product.table!.rows[0].cells.every((c) => !c.startsWith('от'))).toBe(true);
  expect(JSON.stringify(hoodie)).not.toMatch(/уточняйте/i);
});

test('цвета только белый и чёрный, без серого меланжа и без пометок', () => {
  expect(hoodie.colors!.choices.map((c) => c.id)).toEqual(['white', 'black']);
  expect(hoodie.colors!.choices.every((c) => !c.hint)).toBe(true);
  expect(JSON.stringify(hoodie)).not.toMatch(/меланж/i);
});

test('характеристики и размеры подтверждены — без пометок', () => {
  expect(hoodie.specsTodo).toBeFalsy();
  expect(sizes!.todo).toBeFalsy();
  expect(specs.find((s) => s.label === 'Состав')!.value).toBe('80% хлопок, 20% полиэстер');
  expect(sizes!.adult!.rows).toHaveLength(5);
  expect(sizes!.kids).toBeUndefined();
  for (const r of sizes!.adult!.rows) expect(r).toHaveLength(sizes!.adult!.columns.length);
  expect(printSizes.map((p) => `${p.label} ${p.w}×${p.h}`)).toEqual(['А6 10×15', 'А5 15×21', 'А4 21×28', 'А3 28×38']);
  expect(care).toHaveLength(4);
});

test('калькулятор: плитки «Худи» и «Своё худи» (только печать)', () => {
  expect(hoodie.calc.tiles!.map((t) => t.label)).toEqual(['Худи', 'Своё худи']);
  expect(hoodie.calc.tiles!.find((t) => t.id === 'own')!.preset).toEqual({ blank: 'own' });
  for (const t of hoodie.calc.tiles!) expect(findProduct(hoodie.calc.category, t.product), t.id).toBeTruthy();
  // «своё» — только печать: без цены худи
  expect(quote({ blank: 'own', print1: 'a4' }).breakdown.some((b) => b.amount === HOODIE_BLANK)).toBe(false);
});

test('таблица цен «Цена печати на худи»; принтов до 4', () => {
  expect(`${hoodie.prices.title} ${hoodie.prices.accent}`).toBe('Цена печати на худи');
  for (const p of hoodie.prices.products) expect(findProduct(hoodie.calc.category, p.id)?.table, p.id).toBeTruthy();
  expect(product.options!.filter((g) => /^print\d$/.test(g.id))).toHaveLength(4);
});

test('картинки котов и схема принтов', () => {
  expect(hoodie.images.hero).toBe('hoodie-hero');
  expect(hoodie.images.heroMobile).toBe('hoodie-hero-mobile');
  expect(hoodie.prints.shape).toBe('hoodie');
});

test('фото вариантов: первый — настоящая работа, остальные — слот hoodie-product (не неоновое фото)', () => {
  expect(presets[0].img).toBe('/portfolio/portfolio-5.webp');
  for (const v of presets.slice(1)) {
    expect(v.pic?.name).toBe('hoodie-product');
    expect(v.img).toBeUndefined();
  }
  expect(JSON.stringify(hoodie)).not.toContain('showcase/hoodie');
  expect(JSON.stringify(hoodie)).not.toContain('portfolio-14');
});

test('подпись схемы: рамки на груди, на спине те же размеры до А3; без выдуманных советов', () => {
  expect(hoodie.prints.caption).toContain('на спине — те же размеры, до А3');
  expect(hoodie.prints.caption).not.toContain('выше кармана');
});

test('«Наши работы» худи: только с тегом hudi', () => {
  const works = garmentWorks(hoodie);
  expect(works.length).toBeGreaterThan(0);
  for (const w of works) {
    expect(w.tags).toContain('hudi');
    expect(w.src).not.toContain('portfolio-14');
  }
});

test('отзывы худи: не меньше трёх, без повторов; добраны с главной — помечены topped', () => {
  const { items, topped } = garmentReviews(hoodie);
  expect(items.length).toBeGreaterThanOrEqual(3);
  expect(new Set(items.map((r) => r.text)).size).toBe(items.length);
  // fewer than three reviews mention «худи» — the rest comes from the home selection, the heading turns neutral
  expect(items.filter((r) => r.text.toLowerCase().includes('худи')).length).toBeLessThan(3);
  expect(topped).toBe(true);
});

test('вопросы худи — из services.ts', () => {
  const svc = services.find((s) => s.slug === '/pechat-na-hudi')!;
  const faq = garmentFaq(hoodie);
  expect(faq).toHaveLength(6);
  expect(faq).toEqual(svc.faq);
});

test('в данных нет старого адреса', () => {
  expect(JSON.stringify(hoodie)).not.toContain('Челнокова, 11');
});
