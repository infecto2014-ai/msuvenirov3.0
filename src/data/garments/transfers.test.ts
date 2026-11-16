import { expect, test } from 'vitest';
import { transfers } from './transfers';
import { garmentFaq, garmentFrom, garmentReviews, garmentWorks, presetPrice } from './select';
import { tileProducts } from '@/lib/calc-preset';
import { SHEET_MAX, defaultSelection, findProduct, rub } from '../pricing';
import { portfolio } from '../portfolio';
import { stubSlugs } from '@/lib/stubs';
import { flatLinks, serviceNav, mainNav, infoNav } from '../site';

const t = transfers;
const sheet = findProduct('transfers', 'dtf-sheet')!;
const sub = findProduct('transfers', 'sub-sheet')!;
const quote = (p: typeof sheet, qty: number, options: Record<string, string> = {}) => {
  const b = defaultSelection(p);
  return p.quote({ ...b, qty, options: { ...b.options, ...options } });
};

test('адрес, заголовок, акцент, title и description 2.0', () => {
  expect(t.slug).toBe('/dtf-pechat');
  expect(t.h1).toBe('DTF и сублимация без нанесения в Калининграде');
  expect(t.accent).toBe('от 1 листа');
  expect(t.title).toBe('DTF-печать на заказ в Калининграде — трансферы листами А3 | Мастерская сувениров');
  expect(t.description).toContain('DTF-печать без нанесения в Калининграде: готовые трансферы листами 28×38 см');
  expect(t.crumbs.map((c) => c.href)).toEqual(['/', '/pechat-na-odezhde', '/dtf-pechat']);
  expect(t.images.hero).toBe('dtf-hero');
  expect(t.images.heroMobile).toBe('dtf-hero-mobile');
  expect(t.heads.details).toBe('о листах');
  expect(t.heads.details.length).toBeLessThanOrEqual(12);
});

test('калькулятор: категория transfers, две плитки без «своего»; цена «за лист» с первого экрана', () => {
  expect(t.calc.category).toBe('transfers');
  expect(t.calc.tiles).toEqual([
    { id: 'dtf', label: 'DTF-лист 28×38', product: 'dtf-sheet' },
    { id: 'sub', label: 'Сублимационный лист', product: 'sub-sheet' },
  ]);
  expect(tileProducts(t.calc.tiles)).toEqual(['dtf-sheet', 'sub-sheet']);
  expect(t.calc.tiles.some((x) => x.own)).toBe(false);
  expect(t.hero.priceLabel).toBe('Цена за лист');
  expect(garmentFrom(t)).toBe(sub.fromPrice);
  // сублимация: формат листа А3 / А4, больше 50 листов — индивидуально
  expect(sub.options!.find((g) => g.id === 'variant')!.choices.map((c) => c.id)).toEqual(['a3', 'a4']);
  // the calculator stops at SHEET_MAX and says «больше — цена индивидуально» (qty.individualAbove)
  expect(sub.qty).toMatchObject({ max: SHEET_MAX, individualAbove: true });
  expect(sheet.qty).toMatchObject({ max: SHEET_MAX, individualAbove: true });
  expect(quote(sub, SHEET_MAX, { variant: 'a4' }).error).toBeFalsy();
});

test('5 готовых вариантов 2.0, цены из pricing.ts, фото-слоты', () => {
  expect(t.presets.map((p) => p.title)).toEqual([
    'Один лист DTF',
    '5 листов DTF',
    '10 листов DTF',
    '10 сублимационных листов А3',
    '5 сублимационных листов А4',
  ]);
  expect(t.presets.map((p) => [p.product, p.qty, p.options])).toEqual([
    ['dtf-sheet', 1, {}],
    ['dtf-sheet', 5, {}],
    ['dtf-sheet', 10, {}],
    ['sub-sheet', 10, { variant: 'a3' }],
    ['sub-sheet', 5, { variant: 'a4' }],
  ]);
  expect(t.presets.map((p) => p.pic!.name)).toEqual(['dtf-sheet-product', 'dtf-sheet-product', 'dtf-sheet-product', 'sub-sheet-product', 'sub-sheet-product']);
  expect(presetPrice(t.presets[0], 'transfers')).toEqual({ unit: 900, total: 900 });
  expect(presetPrice(t.presets[3], 'transfers').total).toBe(1500);
  expect(presetPrice(t.presets[4], 'transfers').total).toBe(450);
});

test('«Подробнее»: карточки по порядку, ссылки существуют, без цен', () => {
  expect(t.colors).toBeUndefined();
  expect(t.specs).toBeUndefined();
  expect(t.prints).toBeUndefined();
  expect(t.extra!.map((x) => x.title)).toEqual(['Что поместится на лист 28 × 38 см', 'DTF или сублимация', 'Нужно нанести? Сделаем сами', 'Какой макет подойдёт']);
  const [layouts, tech, apply, layout] = t.extra!;
  expect(layouts.cards).toHaveLength(4);
  expect(tech.cards.map((c) => c.title)).toEqual(['DTF-трансферы', 'Сублимационные листы']);
  expect(apply.cards.map((c) => c.title)).toEqual(['Футболки', 'Худи', 'Ваша вещь', 'Спецодежда', 'Спортивная форма', 'Бейсболки', 'Шопперы', 'Сублимация на изделиях']);
  expect(apply.cards.find((c) => c.title === 'Ваша вещь')!.href).toBe('/pechat-na-futbolkah');
  // каждая ссылка ведёт на уже готовую страницу (и в карте сайта её нет среди заглушек)
  const stubs = stubSlugs();
  for (const c of apply.cards) {
    expect(c.href, c.title).toMatch(/^\//);
    expect(stubs, c.title).not.toContain(c.href!.slice(1));
  }
  expect(layout.cards[0].points).toHaveLength(4);
  expect(JSON.stringify(t.extra)).not.toMatch(/₽|\d+\s*руб/);
  expect(flatLinks(serviceNav.flatMap((g) => g.links)).length).toBeGreaterThan(0);
  expect(mainNav.length + infoNav.length).toBeGreaterThan(0);
});

test('вопросы 2.0: 8 штук, цены из pricing.ts, без доставки', () => {
  const faq = garmentFaq(t);
  expect(faq).toHaveLength(8);
  const price = faq.find((f) => f.q === 'Сколько стоит DTF-печать?')!;
  expect(price.a).toContain(`${rub(quote(sheet, 1).unit)} за один лист`);
  expect(price.a).toContain(`от 30 листов — ${rub(quote(sheet, 30).unit)} за лист`);
  const subq = faq.find((f) => f.q === 'Сколько стоят сублимационные листы?')!;
  expect(subq.a).toContain(`Лист А3 — ${rub(quote(sub, 1, { variant: 'a3' }).unit)}, лист А4 — ${rub(quote(sub, 1, { variant: 'a4' }).unit)}`);
  expect(faq.find((f) => f.q === 'Можно заказать больше 50 листов?')!.a).toContain(`до ${SHEET_MAX} листов`);
  expect(JSON.stringify(faq)).not.toMatch(/доставк|Челнокова, 11|вышив/i);
});

test('работы по тегу футболок, отзывы про DTF и плёнку', () => {
  expect(t.worksTag).toBe('futbolki');
  expect(garmentWorks(t).length).toBeGreaterThanOrEqual(4);
  expect(garmentWorks(t).every((w) => w.tags.includes('futbolki'))).toBe(true);
  expect(portfolio.length).toBeGreaterThan(0);
  expect(t.reviewWords).toEqual(['dtf', 'трансфер', 'плёнк', 'пленк']);
  expect(garmentReviews(t).items.length).toBeGreaterThanOrEqual(3);
});

test('таблица цен и правила', () => {
  expect(`${t.prices.title} ${t.prices.accent}`).toBe('Цена печати листами');
  expect(t.prices.products.map((p) => p.id)).toEqual(['dtf-sheet', 'sub-sheet']);
  expect(t.prices.rules.map((r) => r.text)).toEqual([
    'Цена за лист — на лист помещается сколько угодно картинок.',
    'Лист А4 вдвое дешевле А3.',
    `Больше ${SHEET_MAX} листов — индивидуально.`,
  ]);
  expect(JSON.stringify(t)).not.toContain('Челнокова, 11');
});
