import { expect, test } from 'vitest';
import { hoodie } from './hoodie';
import { garmentColors, garmentFaq, garmentReviews, garmentWorks, presetPrice } from './select';
import { services } from '../services';
import { findProduct, HOODIE_BLANK } from '../pricing';

const { presets, sizes, care } = hoodie;
const specs = hoodie.specs!.items;
const printSizes = hoodie.prints!.sizes;
const product = findProduct('textile', 'hoodie')!;
const quote = (o: Record<string, string>, qty = 1) => product.quote({ options: { blank: 'ours', color: 'white', print1: 'none', ...o }, dims: {}, qty });

test('готовые варианты: четыре, цена по прайсу', () => {
  expect(presets).toHaveLength(4);
  for (const v of presets) {
    const price = presetPrice(v, 'textile');
    expect(price.unit, v.title).toBeGreaterThan(HOODIE_BLANK);
    expect(price.total, v.title).toBe(price.unit * v.qty);
  }
  // pinned: hoodie 2 600 + DTF A4 800 (1 pc)
  expect(presetPrice(presets.find((v) => v.title === 'Худи с принтом на груди')!, 'textile').total).toBe(HOODIE_BLANK + 800);
  // team: 20 pcs — hoodie 2 600 at any run + A4 and A6 at the 20+ tier
  const team = presets.find((v) => v.title.startsWith('Для класса'))!;
  expect(team.qty).toBe(20);
  expect(presetPrice(team, 'textile').unit).toBeGreaterThan(HOODIE_BLANK);
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

test('цвета — все 11, как у футболок: белый и чёрный в наличии, цветные — от 5 шт; без серого меланжа', () => {
  const c = garmentColors(hoodie);
  expect(c.map((x) => x.id)).toEqual(['white', 'black', 'yellow', 'green', 'brown', 'red', 'orange', 'pink', 'gray', 'blue', 'lilac']);
  expect(c.filter((x) => x.free).map((x) => x.id)).toEqual(['white', 'black']);
  expect(c.filter((x) => !x.free).every((x) => x.note === 'от 5 шт')).toBe(true);
  expect(JSON.stringify(hoodie)).not.toMatch(/меланж/i);
});

test('характеристики и размеры подтверждены — без пометок', () => {
  expect(hoodie.specs!.todo).toBeFalsy();
  expect(sizes!.todo).toBeFalsy();
  expect(specs.find((s) => s.label === 'Состав')!.value).toBe('80% хлопок, 20% полиэстер');
  expect(sizes!.adult!.rows).toHaveLength(5);
  expect(sizes!.kids).toBeUndefined();
  for (const r of sizes!.adult!.rows) expect(r).toHaveLength(sizes!.adult!.columns.length);
  expect(printSizes.map((p) => `${p.label} ${p.w}×${p.h}`)).toEqual(['А6 10×15', 'А5 15×21', 'А4 21×28', 'А3 28×38']);
  expect(care).toHaveLength(4);
});

test('калькулятор: плитки «Худи» и «Своё худи» (только печать)', () => {
  expect(hoodie.calc.tiles.map((t) => t.label)).toEqual(['Худи', 'Своё худи']);
  expect(hoodie.calc.tiles.find((t) => t.id === 'own')).toMatchObject({ preset: { blank: 'own' }, own: true });
  for (const t of hoodie.calc.tiles) expect(findProduct(hoodie.calc.category, t.product), t.id).toBeTruthy();
  // «своё» — только печать: без цены худи
  expect(quote({ blank: 'own', print1: 'a4' }).breakdown.some((b) => b.amount === HOODIE_BLANK)).toBe(false);
});

test('таблица цен «Цена печати на худи»; принтов до 5', () => {
  expect(`${hoodie.prices.title} ${hoodie.prices.accent}`).toBe('Цена печати на худи');
  for (const p of hoodie.prices.products) expect(findProduct(hoodie.calc.category, p.id)?.table, p.id).toBeTruthy();
  expect(product.options!.filter((g) => /^print\d$/.test(g.id))).toHaveLength(5);
});

test('картинки котов и схема принтов', () => {
  expect(hoodie.images.hero).toBe('hoodie-hero');
  expect(hoodie.images.heroMobile).toBe('hoodie-hero-mobile');
  expect(hoodie.prints!.shape).toBe('hoodie');
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
  expect(hoodie.prints!.caption).toContain('на спине — те же размеры, до А3');
  expect(hoodie.prints!.caption).not.toContain('выше кармана');
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

test('presetPrice: категория обязательна (страницы не только из «textile»)', () => {
  const v = presets[0];
  // a type check (npm run build): without a category the price would silently be looked up in «textile»
  // @ts-expect-error — the category is required
  const withoutCategory = () => presetPrice(v);
  expect(typeof withoutCategory).toBe('function');
  expect(presetPrice(v, hoodie.calc.category)).toEqual(presetPrice(v, 'textile'));
});

test('описание худи: DTF на белых, чёрных и цветных и на вашем; телефон — из site.ts', async () => {
  const { site } = await import('../site');
  const svc = services.find((s) => s.slug === '/pechat-na-hudi')!;
  for (const d of [hoodie.description, svc.description]) {
    expect(d).toContain('DTF на белых, чёрных и цветных худи и на вашем');
    expect(d).not.toContain('любом цвете');
  }
  expect(hoodie.description).toContain(site.phone);
});

test('тексты сайта — по правилам 16.11 (после худи): цветные худи от 5, шопперы и кепки — 11 цветов, цветные от 10', async () => {
  const { generalFaq } = await import('../faq');
  const all = JSON.stringify({ services, generalFaq, hoodie });
  for (const old of [/7 цветов/, /сем[иь] цветов/, /от 20 шт/, /Худи — белые и чёрные,/, /'Цвета', value: 'белый и чёрный'/, /на белых и чёрных худи и/, /белого нет/i]) {
    expect(all).not.toMatch(old);
  }
  expect(hoodie.prices.rules![0].text).toBe('Цветные худи — от 5 шт. Белые и чёрные — с 1 шт. Цена худи одна при любом количестве.');
  expect(specs.find((s) => s.label === 'Цвета')!.value).toBe('11 цветов: белый и чёрный — с 1 шт, цветные — от 5 шт');
  const rows = JSON.stringify(services.find((s) => s.slug === '/pechat-na-odezhde')!.blocks);
  expect(rows).toContain('"Худи","values":["Тёплый мерч, худи для класса или команды","Белые и чёрные — от 1 шт, цветные — от 5 шт"');
  expect(rows).toContain('"Шоппер","values":["Подарок, мероприятие, сумка с логотипом магазина","Белые и чёрные — от 1 шт, цветные — от 10 шт"');
  expect(rows).toContain('"Кепка","values":["Персонал, команда, промо","Белые и чёрные — от 1 шт, цветные — от 10 шт"');
  expect(rows).toContain('"Грудь, спина, рукав; до 5 принтов, каждый до А3"');
  const caps = services.find((s) => s.slug === '/pechat-na-kepkah')!;
  expect(caps.highlights).toContain('11 цветов');
});

test('тексты: число принтов как в прайсе — худи 5 (каждый до А3), кепка 4 (каждый до А6), шоппер 2', async () => {
  const { generalFaq } = await import('../faq');
  const places = (id: string) => findProduct('textile', id)!.options!.filter((g) => /^print\d$/.test(g.id)).length;
  expect([places('hoodie'), places('cap'), places('shopper')]).toEqual([5, 4, 2]);
  const all = JSON.stringify({ services, generalFaq, hoodie });
  for (const old of [/до 4 принтов на одном худи/, /на худи — до четырёх/, /на кепке — до трёх/, /Второй принт можно сделать сзади/, /Спереди и ещё одно место/]) {
    expect(all).not.toMatch(old);
  }
  expect(specs.find((s) => s.label === 'Места печати')!.value).toContain(`до ${places('hoodie')} принтов на одном худи`);
  const hub = services.find((s) => s.slug === '/pechat-na-odezhde')!;
  expect(JSON.stringify(hub.faq)).toContain('На футболке и худи — до пяти, на кепке — до четырёх, на шоппере — два.');
  const rows = JSON.stringify(hub.blocks);
  expect(rows).toMatch(/"Худи","values":\[[^\]]*"Грудь, спина, рукав; до 5 принтов, каждый до А3"\]/);
  expect(rows).toMatch(/"Кепка","values":\[[^\]]*"Спереди, сзади, сбоку; до 4 принтов, каждый до А6"\]/);
});
