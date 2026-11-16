import { expect, test } from 'vitest';
import { sublimation } from './sublimation';
import { garmentFaq, garmentFrom, garmentReviews, garmentWorks } from './select';
import { tileProducts } from '@/lib/calc-preset';
import { findProduct, rub, subPrint } from '../pricing';
import { portfolio } from '../portfolio';

const s = sublimation;

test('адрес, заголовок, акцент, title и description 2.0', () => {
  expect(s.slug).toBe('/sublimacionnaya-pechat');
  expect(s.h1).toBe('Сублимационная печать в Калининграде');
  expect(s.accent).toBe('от 1 штуки');
  expect(s.title).toBe('Сублимационная печать в Калининграде на заказ — цены А6–А3 | Мастерская сувениров');
  expect(s.description).toContain('Сублимационная печать в Калининграде от 1 шт: на светлой синтетике');
  expect(s.crumbs.map((c) => c.href)).toEqual(['/', '/pechat-na-odezhde', '/sublimacionnaya-pechat']);
  expect(s.images.hero).toBe('sub-hero');
  expect(s.images.heroMobile).toBe('sub-hero-mobile');
  // short accent: a long one is one unbreakable piece and overflows a 360px screen
  expect(s.heads.details.length).toBeLessThanOrEqual(12);
});

test('плитки: своя вещь, футболка для сублимации, шоппер для сублимации; готовых вариантов нет', () => {
  expect(s.calc.tiles).toEqual([
    { id: 'own', label: 'Своя вещь', product: 'sub-print', own: true },
    { id: 'tee', label: 'Футболка для сублимации', product: 'tshirt-sub' },
    { id: 'shopper', label: 'Шоппер для сублимации', product: 'shopper-sub' },
  ]);
  expect(tileProducts(s.calc.tiles)).toEqual(['sub-print', 'tshirt-sub', 'shopper-sub']);
  expect(s.presets).toEqual([]);
  expect(garmentFrom(s)).toBe(findProduct('textile', 'sub-print')!.fromPrice);
});

test('«Подробнее»: характеристики, карточки по порядку, размеры принтов из subPrint, размерные сетки', () => {
  expect(s.specs!.title).toBe('Наша футболка для сублимации');
  expect(s.specs!.items.map((x) => x.label)).toEqual(['Состав', 'Ткань', 'Плотность', 'Производитель', 'Заказ', 'Печать']);
  expect(s.extra!.map((x) => x.title)).toEqual(['Как это работает', 'На чём печатаем', 'Подходит и не подходит', 'Сублимация или DTF', 'Каким должен быть макет']);
  const [how, items, fit, compare, layout] = s.extra!;
  expect(how.cards).toHaveLength(4);
  expect(items.cards.map((c) => c.title)).toEqual(['Кружки', 'Светлые шопперы', 'Спортивная форма и синтетика', 'Фотоподарки', 'Магниты']);
  for (const c of items.cards) expect(c.href, c.title).toMatch(/^\//);
  expect(JSON.stringify(items)).not.toMatch(/₽|\d+\s*руб/);
  expect(fit.cards.map((c) => c.title)).toEqual(['Подходит', 'Не подходит']);
  expect(fit.cards[0].points).toHaveLength(3);
  expect(fit.cards[1].points).toHaveLength(3);
  expect(fit.cards[1].text).toContain('есть DTF-печать');
  expect(compare.cards.map((c) => c.title)).toEqual(['Сублимация', 'DTF-печать']);
  expect(compare.cards[0].rows![0]).toEqual({ label: 'Ткань', value: 'Полиэстер и светлая синтетика' });
  expect(compare.cards[1].rows).toHaveLength(6);
  expect(layout.cards[0].points).toHaveLength(4);
  // prints scheme: the sizes of subPrint (A3 = 29,7×42), up to A3 only
  expect(s.prints!.sizes.map((p) => p.label)).toEqual(['А6', 'А5', 'А4', 'А3']);
  expect(s.prints!.sizes.at(-1)).toEqual({ label: 'А3', w: 29.7, h: 42 });
  expect(subPrint.a3.size).toBe('29,7×42 см');
  expect(s.prints!.caption).toBe('Максимум — А3, на всё изделие не печатаем');
  expect(s.sizes!.kids!.columns).toEqual(['Размер', '128–140', '146', '146–152']);
  expect(s.sizes!.adult!.columns).toHaveLength(11);
  expect(s.sizes!.sub).toContain('±2 см');
  expect(s.colors).toBeUndefined();
});

test('вопросы 2.0: цены из pricing.ts, без доставки', () => {
  const faq = garmentFaq(s);
  expect(faq).toHaveLength(11);
  const price = faq.find((f) => f.q === 'Сколько стоит сублимационная печать?')!;
  expect(price.a).toContain(`${rub(subPrint.a6.tiers[0].price)} за 1 шт`);
  expect(price.a).toContain(`А4 — ${rub(subPrint.a4.tiers[0].price)}`);
  expect(faq.find((f) => f.q === 'Какой самый большой размер печати?')!.a).toContain('А3');
  expect(JSON.stringify(faq)).not.toMatch(/доставк|Челнокова, 11|вышив/i);
});

test('работы: сублимация без portfolio-14 и portfolio-26; отзывы про сублимацию', () => {
  const w = garmentWorks(s).map((x) => x.src);
  const all = portfolio.filter((p) => p.tech === 'Сублимация').map((p) => p.src);
  expect(w).toEqual(all.filter((x) => !x.includes('portfolio-14') && !x.includes('portfolio-26')));
  expect(w.length).toBeGreaterThanOrEqual(8);
  expect(s.reviewWords).toEqual(['сублимац']);
  expect(garmentReviews(s).items.length).toBeGreaterThanOrEqual(3);
});

test('таблица цен и правила: без скидки за второй принт, максимум А3', () => {
  expect(`${s.prices.title} ${s.prices.accent}`).toBe('Цена сублимационной печати');
  expect(s.prices.products.map((p) => p.id)).toEqual(['sub-print', 'tshirt-sub', 'shopper-sub']);
  const rules = s.prices.rules.map((r) => r.text);
  expect(rules).toEqual([
    'Каждая сторона — по полной цене, скидки за второй принт нет.',
    'Максимум А3, на всё изделие не печатаем.',
    `Футболка и шоппер для сублимации — от ${findProduct('textile', 'tshirt-sub')!.qty.min} шт.`,
  ]);
  expect(JSON.stringify(s)).not.toMatch(/[−-]\s?\d+\s?%|\d+\s?% дешевле|на всё изделие печатаем/);
  expect(JSON.stringify(s)).not.toContain('Челнокова, 11');
});
