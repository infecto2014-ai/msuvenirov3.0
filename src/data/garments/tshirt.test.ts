import { expect, test } from 'vitest';
import { tshirt } from './tshirt';
import { garmentFaq, garmentReviews, garmentWorks, presetPrice } from './select';
import { services } from '../services';
import { findProduct } from '../pricing';

const { presets, sizes, care } = tshirt;
const specs = tshirt.specs!.items;
const printSizes = tshirt.prints!.sizes;
const works = garmentWorks(tshirt);
const { items: reviews, topped } = garmentReviews(tshirt);
const faq = garmentFaq(tshirt);

test('готовые варианты: четыре, цена по прайсу', () => {
  expect(presets).toHaveLength(4);
  for (const v of presets) {
    const price = presetPrice(v, 'textile');
    expect(price.unit, v.title).toBeGreaterThan(0);
    expect(price.total, v.title).toBe(price.unit * v.qty);
  }
  // pinned: blank 750 + DTF A4 800 (1 pc)
  expect(presetPrice(presets.find((v) => v.title === 'Футболка с фото в подарок')!, 'textile').total).toBe(1550);
  const team = presets.find((v) => v.title.startsWith('Для команды'))!;
  // 20 pcs: blank 550 + A4 at the 20+ tier + A6 −30%
  expect(presetPrice(team, 'textile')).toEqual({ unit: 1196, total: 23920 });
});

test('«Для команды» — 20 синих футболок', () => {
  const team = presets.find((v) => v.title.startsWith('Для команды'))!;
  expect(team.qty).toBe(20);
  expect(team.options.color).toBe('blue');
  expect(presets.some((v) => v.options.color === 'other')).toBe(false);
});

test('фото вариантов — настоящие работы, не portfolio-14', () => {
  for (const v of presets) {
    expect(v.img!.startsWith('/portfolio/')).toBe(true);
    expect(v.img).not.toContain('portfolio-14');
  }
});

test('детская размерная сетка владельца: 12 строк от 98 до 164', () => {
  const kids = sizes!.kids!;
  expect(kids.rows).toHaveLength(12);
  expect(kids.rows[0]).toEqual(['98', '40', '31', '11']);
  expect(kids.rows[11]).toEqual(['164', '62', '46', '17']);
  for (const r of kids.rows) expect(r).toHaveLength(kids.columns.length);
});

test('взрослая сетка, принты, характеристики, уход', () => {
  const adult = sizes!.adult!;
  expect(adult.rows[0][0]).toBe('XS (42)');
  expect(adult.rows.at(-1)![0]).toBe('3XL (54)');
  expect(printSizes.map((p) => `${p.label} ${p.w}×${p.h}`)).toEqual(['А6 10×15', 'А5 15×21', 'А4 21×28', 'А3 28×38']);
  expect(specs.length).toBeGreaterThan(5);
  expect(care).toHaveLength(5);
});

test('правки владельца 16.11: взрослая сетка верная — без пометки; характеристики без пометки', () => {
  expect(sizes!.todo).toBeFalsy();
  expect(tshirt.specs!.todo).toBeFalsy();
});

test('калькулятор: три плитки — унисекс, детская, своя (только печать)', () => {
  expect(tshirt.calc.tiles.map((t) => t.label)).toEqual(['Футболка унисекс', 'Детская', 'Своя футболка']);
  expect(tshirt.calc.tiles.find((t) => t.id === 'own')!.preset).toEqual({ blank: 'own' });
  for (const t of tshirt.calc.tiles) expect(findProduct(tshirt.calc.category, t.product), t.id).toBeTruthy();
});

test('таблица цен: заголовок и подзаголовок владельца, продукты есть в прайсе', () => {
  expect(`${tshirt.prices.title} ${tshirt.prices.accent}`).toBe('Цена печати на футболках');
  expect(tshirt.prices.lead).toBe('Цена указана за одну футболку вместе с печатью. Чем больше тираж, тем дешевле каждая футболка.');
  for (const p of tshirt.prices.products) expect(findProduct(tshirt.calc.category, p.id)?.table, p.id).toBeTruthy();
});

test('цвета: все цвета футболки из pricing.ts, белый и чёрный — в наличии', async () => {
  const { garmentColors } = await import('./select');
  const ids = garmentColors(tshirt).map((c) => c.id);
  expect(ids.slice(0, 2)).toEqual(['white', 'black']);
  expect(garmentColors(tshirt).filter((c) => c.free).map((c) => c.id)).toEqual(['white', 'black']);
});

test('тексты сайта не спорят с правилами 16.11: худи — цена из прайса, 5 принтов, детская до А3', async () => {
  const { generalFaq } = await import('../faq');
  const { HOODIE_BLANK, rub } = await import('../pricing');
  const prints = (id: string) => findProduct('textile', id)!.options!.filter((g) => /^print\d$/.test(g.id)).length;
  const all = JSON.stringify({ services, generalFaq });
  const general = JSON.stringify(generalFaq);
  expect(general).toContain(`Худи — ${rub(HOODIE_BLANK)} за штуку при любом количестве, плюс печать; белые и чёрные — от 1 штуки, цветные — от 5.`);
  expect(all).not.toMatch(/худи[^"]{0,40}уточняйте наличие/i);
  // «До 4 принтов» is right for the cap now — the T-shirt and the hoodie must not say it
  for (const slug of ['/pechat-na-futbolkah', '/pechat-na-hudi']) expect(JSON.stringify(services.find((s) => s.slug === slug)), slug).not.toContain('До 4 принтов');
  expect(all).toContain(`${rub(HOODIE_BLANK)} за штуку при любом количестве`);
  expect(findProduct('textile', 'hoodie')!.quote({ options: { blank: 'ours', color: 'white', print1: 'none' }, dims: {}, qty: 1 }).breakdown[0].amount).toBe(HOODIE_BLANK);
  const tee = services.find((s) => s.slug === '/pechat-na-futbolkah')!;
  expect(tee.highlights).toContain(`До ${prints('tshirt-unisex')} принтов на футболке`);
  const kidsRow = JSON.stringify(services.find((s) => s.slug === '/pechat-na-odezhde')!.blocks).match(/"Детская футболка","values":\[[^\]]*\]/)![0];
  expect(kidsRow).toContain('до А3');
});

test('в данных нет старого адреса', () => {
  expect(JSON.stringify(tshirt)).not.toContain('Челнокова, 11');
});

test('«Наши работы» футболок: только с тегом futbolki, без portfolio-14', () => {
  expect(works.length).toBeGreaterThan(0);
  for (const w of works) {
    expect(w.tags).toContain('futbolki');
    expect(w.src).not.toContain('portfolio-14');
  }
});

test('отзывы футболок: не меньше трёх, про футболки в первую очередь', () => {
  expect(reviews.length).toBeGreaterThanOrEqual(3);
  expect(reviews[0].text.toLowerCase()).toContain('футболк');
  expect(new Set(reviews.map((r) => r.text)).size).toBe(reviews.length);
});

test('вопросы футболок — из services.ts', () => {
  const svc = services.find((s) => s.slug === '/pechat-na-futbolkah')!;
  expect(faq.length).toBeGreaterThan(0);
  expect(faq).toEqual(svc.faq);
});

test('отзывы футболок: все про футболки, не добраны с главной', () => {
  expect(reviews.length).toBeGreaterThanOrEqual(3);
  for (const r of reviews) expect(r.text.toLowerCase()).toContain('футболк');
  expect(topped).toBe(false);
});

// owner, 16.11.2026 (after the hoodie): the kids T-shirt is printed on all places like the adult one
test('детская футболка в «Печати на одежде»: «Грудь, спина, рукав; до 5 принтов, каждый до А3»', () => {
  const prints = findProduct('textile', 'tshirt-kids')!.options!.filter((g) => /^print\d$/.test(g.id)).length;
  const blocks = JSON.stringify(services.find((s) => s.slug === '/pechat-na-odezhde')!.blocks);
  const kidsRow = blocks.match(/"Детская футболка","values":\[[^\]]*\]/)![0];
  expect(kidsRow).toContain(`"Грудь, спина, рукав; до ${prints} принтов, каждый до А3"`);
});

test('шаблон: цвета из прайса с пометкой по правилам, цена «от» — по плиткам', async () => {
  const { garmentColors, garmentFrom } = await import('./select');
  const colors = garmentColors(tshirt);
  expect(colors.map((c) => c.id)).toEqual(['white', 'black', 'yellow', 'green', 'brown', 'red', 'orange', 'pink', 'gray', 'blue', 'lilac']);
  expect(colors.filter((c) => c.free).map((c) => c.note)).toEqual(['в наличии', 'в наличии']);
  expect(colors.find((c) => c.id === 'red')!.note).toBe('от 5 шт');
  // the cheapest product of the tiles: the kids T-shirt
  expect(garmentFrom(tshirt)).toBe(findProduct('textile', 'tshirt-kids')!.fromPrice);
  expect('products' in tshirt.calc).toBe(false);
  expect(tshirt.calc.tiles.find((t) => t.id === 'own')!.own).toBe(true);
});

test('шаблон: разделы «Подробнее» — из данных, характеристики с заголовком по умолчанию', () => {
  expect(tshirt.specs!.items.length).toBeGreaterThan(5);
  expect(tshirt.specs!.title).toBeUndefined();
  expect(tshirt.prints!.sizes).toHaveLength(4);
  expect(tshirt.care).toHaveLength(5);
});
