import { expect, test } from 'vitest';
import { sport } from './sport';
import { garmentFaq, garmentFrom, garmentReviews, garmentWorks, presetPrice } from './select';
import { tileProducts, applyPreset } from '@/lib/calc-preset';
import { extraPrintFactor, findProduct, rub } from '../pricing';
import { portfolio } from '../portfolio';

const { presets } = sport;
const cat = sport.calc.category;
const own = findProduct('textile', 'own-item')!;
const sub = findProduct('textile', 'tshirt-sub')!;
const quote = (o: Record<string, string>, qty = 1) => own.quote({ options: { print1: 'a6', ...o }, dims: {}, qty });
const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

test('адрес, заголовок, акцент, title и description', () => {
  expect(sport.slug).toBe('/pechat-na-sportivnoy-forme');
  expect(sport.h1).toBe('Печать на спортивной форме в Калининграде');
  expect(sport.accent).toBe('от 1 штуки');
  expect(sport.title).toContain('Печать на спортивной форме в Калининграде — номера и фамилии');
  expect(sport.description).toContain('На вашей форме, на наших футболках или подберём форму. От 1 шт.');
  expect(sport.crumbs.map((c) => c.href)).toEqual(['/', '/pechat-na-odezhde', '/pechat-na-sportivnoy-forme']);
  expect(sport.images.hero).toBe('sport-hero');
  expect(sport.images.heroMobile).toBe('sport-hero-mobile');
  expect(sport.heads.details).toBe('о форме');
});

test('плитки: своя форма, футболка для сублимации, футболка хлопковая', () => {
  expect(sport.calc.tiles).toEqual([
    { id: 'own', label: 'Своя форма', product: 'own-item', own: true },
    { id: 'sub', label: 'Футболка для сублимации', product: 'tshirt-sub' },
    { id: 'cotton', label: 'Футболка хлопковая', product: 'tshirt-unisex' },
  ]);
  expect(tileProducts(sport.calc.tiles)).toEqual(['own-item', 'tshirt-sub', 'tshirt-unisex']);
  expect(garmentFrom(sport)).toBeGreaterThan(0);
});

test('до 5 принтов, фамилия и номер — один принт, без доплаты; таблица цен', () => {
  expect(sport.prices.products.map((p) => p.id)).toEqual(['own-item', 'tshirt-sub', 'tshirt-unisex']);
  expect(`${sport.prices.title} ${sport.prices.accent}`).toBe('Цена печати на форме');
  const rules = sport.prices.rules.map((r) => r.text).join(' | ');
  expect(rules).toContain('До 5 принтов на одной вещи, каждый до А3');
  expect(rules).toContain(`Каждый следующий принт — −${extraOff}%`);
  expect(rules).toContain('Фамилия и номер на спине — один принт');
  expect(rules).toContain('без доплаты');
  expect(JSON.stringify(sport)).not.toMatch(/до 3 принтов|до трёх|Второй принт|халат|вышив|шелкограф|доставк/i);
});

test('готовые варианты: пять из 2.0, цена по прайсу, количество не меняется', () => {
  expect(presets.map((v) => [v.title, v.product, v.qty])).toEqual([
    ['Фамилия и номер на спину', 'own-item', 15],
    ['Номер, фамилия и эмблема', 'own-item', 15],
    ['Футболки для команды — сублимация', 'tshirt-sub', 12],
    ['Хлопковые футболки на турнир', 'tshirt-unisex', 20],
    ['Номер на шорты', 'own-item', 15],
  ]);
  for (const v of presets) {
    const p = presetPrice(v, cat);
    expect(p.unit, v.title).toBeGreaterThan(0);
    expect(p.total, v.title).toBe(Math.round(p.unit * v.qty));
    const prod = findProduct(cat, v.product)!;
    expect(applyPreset(prod, { options: v.options, qty: v.qty }).qty).toBe(v.qty);
  }
  const a4 = quote({ print1: 'a4' }, 15).unit;
  const a6 = quote({ print1: 'a6' }, 15).unit;
  expect(presetPrice(presets[1], cat).unit).toBe(Math.round(a4 + a6 * 0.7));
});

test('фото вариантов: первый — настоящая работа, остальные — слот sport-product', () => {
  expect(presets[0].img).toBe('/portfolio/sport-jersey.webp');
  expect(portfolio.map((p) => p.src)).toContain(presets[0].img);
  for (const v of presets.slice(1)) expect(v.pic?.name).toBe('sport-product');
  expect(JSON.stringify(sport)).not.toContain('portfolio-14');
});

test('«Подробнее»: что наносим, список, свои или подберём, DTF или сублимация; уход; без схемы', () => {
  const ex = sport.extra!;
  expect(ex.map((x) => x.title)).toEqual(['Что наносим', 'Список команды', 'Своя форма или подберём', 'DTF или сублимация']);
  expect(ex[0].cards.map((c) => c.title)).toEqual(['Номер на спине', 'Фамилия над номером', 'Эмблема и номер спереди', 'Номер на шортах']);
  expect(ex[0].cards[1].text).toContain('Фамилия и номер на спине — это один принт');
  expect(ex[1].cards[0].points![0]).toBe('ИВАНОВ — 10 — L');
  expect(ex[1].cards[0].text).toContain('Разные фамилии и номера — без доплаты');
  const ways = ex[2].cards;
  expect(ways.map((c) => c.title)).toEqual(['Печатаем на вашей форме', 'Подберём и закажем форму']);
  expect(ways[1].points).toEqual(['От 10 штук', 'Если есть в наличии — 1–2 дня', 'Цену формы назовём после подбора']);
  expect(ways[1].text).toContain(`от ${sub.qty.min} шт`);
  expect(ex[3].cards.map((c) => c.title)).toEqual(['DTF-печать', 'Сублимация']);
  expect(sport.care).toHaveLength(4);
  expect(sport.prints).toBeUndefined();
});

test('вопросы: девять, цены из pricing.ts, правила 16.11.2026', () => {
  const faq = garmentFaq(sport);
  expect(faq).toHaveLength(9);
  const price = faq.find((f) => f.q === 'Сколько стоит нанести номер и фамилию на форму?')!;
  expect(price.a).toContain(rub(quote({ print1: 'a4' }).unit));
  expect(price.a).toContain(rub(quote({ print1: 'a6' }).unit));
  expect(price.a).toContain('один принт');
  expect(price.a).toContain(`на ${extraOff}% дешевле`);
  expect(price.a).toContain('до 5 принтов');
  const extra = faq.find((f) => f.q === 'Есть доплата за разные фамилии и номера?')!;
  expect(extra.a).toMatch(/^Нет/);
  const kit = faq.find((f) => f.q === 'Есть ли у вас своя форма?')!;
  expect(kit.a).toContain('Да, форму можно подобрать и заказать — от 10 штук');
  expect(kit.a).toContain('1–2 дня');
  expect(kit.a).toContain('Цену формы назовём после подбора');
  expect(kit.a).toContain(`от ${sub.qty.min} штук`);
  expect(JSON.stringify(faq)).not.toMatch(/второй принт|до 3|до трёх|халат|вышив|доставк/i);
});

test('работы по тегу sport, без portfolio-14; отзывы по словам', () => {
  expect(sport.worksTag).toBe('sport');
  const w = garmentWorks(sport).map((x) => x.src);
  expect(w).toContain('/portfolio/sport-jersey.webp');
  expect(w.some((s) => s.includes('portfolio-14'))).toBe(false);
  expect(sport.reviewWords).toEqual(['форм', 'команд', 'номер']);
  expect(garmentReviews(sport).items.length).toBeGreaterThanOrEqual(3);
  expect(JSON.stringify(sport)).not.toContain('Челнокова, 11');
});
