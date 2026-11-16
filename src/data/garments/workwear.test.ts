import { expect, test } from 'vitest';
import { workwear } from './workwear';
import { garmentFaq, garmentFrom, garmentReviews, garmentWorks, presetPrice } from './select';
import { extraPrintFactor, findProduct, rub } from '../pricing';
import { portfolio } from '../portfolio';
import { applyPreset } from '@/lib/calc-preset';

const { presets } = workwear;
const cat = workwear.calc.category;
const product = findProduct('textile', 'own-item')!;
const quote = (o: Record<string, string>, qty = 1) => product.quote({ options: { print1: 'a6', ...o }, dims: {}, qty });
const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

test('адрес, заголовок, акцент, title и description из 2.0', () => {
  expect(workwear.slug).toBe('/pechat-na-specodezhde');
  expect(workwear.h1).toBe('Печать на спецодежде и униформе в Калининграде');
  expect(workwear.accent).toBe('от 1 штуки');
  expect(workwear.title).toContain('Печать на спецодежде в Калининграде — логотип на униформу');
  expect(workwear.description).toBe(
    'Нанесение логотипа на спецодежду и униформу в Калининграде: куртки, жилеты, сигнальные жилеты, комбинезоны, фартуки, поло. На вашей одежде или подберём от 10 шт. Счёт без НДС.',
  );
  expect(workwear.crumbs.map((c) => c.href)).toEqual(['/', '/pechat-na-odezhde', '/pechat-na-specodezhde']);
  expect(workwear.images.hero).toBe('workwear-hero');
  expect(workwear.images.heroMobile).toBe('workwear-hero-mobile');
});

test('калькулятор: одна плитка «Своя спецодежда» на own-item, цена «от» — печать', () => {
  expect(workwear.calc.tiles).toEqual([{ id: 'own', label: 'Своя спецодежда', product: 'own-item', own: true }]);
  expect(garmentFrom(workwear)).toBe(product.fromPrice);
  expect(garmentFrom(workwear)).toBeGreaterThan(0);
});

test('до 5 принтов: правила, таблица цен, без «до 3 принтов»', () => {
  expect(workwear.prices.products.map((p) => p.id)).toEqual(['own-item']);
  expect(`${workwear.prices.title} ${workwear.prices.accent}`).toBe('Цена печати на спецодежде');
  const rules = workwear.prices.rules.map((r) => r.text).join(' | ');
  expect(rules).toContain('До 5 принтов на одной вещи, каждый до А3');
  expect(rules).toContain(`Каждый следующий принт — −${extraOff}%`);
  expect(rules).toContain('Больше 50 шт — индивидуально');
  // embroidery is only mentioned in the question «Делаете вышивку?» of 2.0 — answered «Нет»
  expect(JSON.stringify({ ...workwear, faq: [] })).not.toMatch(/вышив/i);
  expect(workwear.faq!.find((f) => /вышив/i.test(f.q))!.a).toMatch(/^Нет, вышивку мы не делаем/);
  expect(JSON.stringify(workwear)).not.toMatch(/до 3 принтов|до трёх|второй и третий|Второй принт на изделии|халат|шелкограф|доставк/i);
});

test('готовые варианты: пять из 2.0, цена по прайсу, количество не меняется', () => {
  expect(presets.map((v) => [v.title, v.qty])).toEqual([
    ['Логотип на грудь', 10],
    ['Логотип и название на спине', 20],
    ['Сигнальные жилеты с логотипом', 30],
    ['Фартуки для кафе', 10],
    ['Поло для персонала', 20],
  ]);
  for (const v of presets) {
    expect(v.product).toBe('own-item');
    const p = presetPrice(v, cat);
    expect(p.unit, v.title).toBeGreaterThan(0);
    expect(p.total, v.title).toBe(Math.round(p.unit * v.qty));
    expect(applyPreset(product, { options: v.options, qty: v.qty }).qty).toBe(v.qty);
  }
  // pinned: 20 pcs, A3 + A6 (the dearest in full, the next −30%)
  const a3 = quote({ print1: 'a3' }, 20).unit;
  const a6 = quote({ print1: 'a6' }, 20).unit;
  expect(presetPrice(presets[1], cat).unit).toBe(Math.round(a3 + a6 * 0.7));
});

test('фото вариантов: «Поло для персонала» — настоящая работа, остальные — слот workwear-product', () => {
  const polo = presets.find((v) => v.title === 'Поло для персонала')!;
  expect(polo.img).toBe('/portfolio/corporate-polo.webp');
  expect(portfolio.map((p) => p.src)).toContain(polo.img);
  for (const v of presets.filter((x) => x !== polo)) expect(v.pic?.name).toBe('workwear-product');
  expect(JSON.stringify(workwear)).not.toContain('portfolio-14');
});

test('«Подробнее»: на чём, где, свои или подберём, макет; уход; без схемы размеров', () => {
  const ex = workwear.extra!;
  expect(ex.map((x) => x.title)).toEqual(['На чём печатаем', 'Где печатаем', 'Своя спецодежда или подберём', 'Какой макет подойдёт']);
  expect(ex[0].cards.map((c) => c.title)).toEqual([
    'Куртки и ветровки', 'Жилеты', 'Сигнальные жилеты', 'Комбинезоны и полукомбинезоны', 'Фартуки', 'Поло и футболки',
  ]);
  expect(ex[1].cards.map((c) => c.title)).toEqual(['На груди', 'На спине', 'На рукаве']);
  expect(ex[1].cards[1].rows![0].value).toBe('до А3 (28 × 38 см); больше — в несколько прогонов, если позволяет макет');
  const ways = ex[2].cards;
  expect(ways.map((c) => c.title)).toEqual(['Печатаем на вашей спецодежде', 'Подберём и закажем спецодежду']);
  expect(ways[0].points).toEqual([
    'Только печать — цена в калькуляторе',
    `Каждый следующий принт — на ${extraOff}% дешевле`,
    'Можно разные надписи и имена',
  ]);
  expect(ways[1].points).toEqual(['От 10 штук', 'Если есть в наличии — 1–2 дня', 'Цену одежды назовём после подбора']);
  expect(ex[3].cards[0].points).toHaveLength(4);
  expect(workwear.care).toHaveLength(4);
  expect(workwear.prints).toBeUndefined();
  expect(workwear.heads.details).toBe('о спецодежде');
});

test('вопросы: восемь из 2.0, цены из pricing.ts, правила 16.11.2026', () => {
  const faq = garmentFaq(workwear);
  expect(faq).toHaveLength(8);
  expect(faq[0].q).toBe('На какой спецодежде вы печатаете?');
  const price = faq.find((f) => f.q === 'Сколько стоит нанести логотип на спецодежду?')!;
  expect(price.a).toContain(rub(quote({ print1: 'a6' }, 1).unit));
  expect(price.a).toContain(rub(quote({ print1: 'a3' }, 1).unit));
  expect(price.a).toContain(`на ${extraOff}% дешевле`);
  expect(price.a).toContain('до 5 принтов');
  const org = faq.find((f) => f.q === 'Работаете с организациями?')!;
  expect(org.a).toContain(`до ${product.qty.max} штук`);
  expect(JSON.stringify(faq)).not.toMatch(/второй принт|до 3|до трёх|халат|доставк/i);
});

test('работы: три настоящие, по порядку; отзывы по словам', () => {
  expect(workwear.works).toEqual(['/portfolio/corporate-polo.webp', '/portfolio/portfolio-20.webp', '/portfolio/branded-caps.webp']);
  expect(garmentWorks(workwear).map((w) => w.src)).toEqual(workwear.works);
  expect(workwear.reviewWords).toEqual(['спецодежд', 'униформ', 'форм']);
  expect(garmentReviews(workwear).items.length).toBeGreaterThanOrEqual(3);
  expect(JSON.stringify(workwear)).not.toContain('Челнокова, 11');
});
