import { expect, test } from 'vitest';
import { catalog, catalogFrom, facts, homeFaq, homeReviews, homeWorks, steps, why, workLabel } from './home';
import { portfolio } from './portfolio';
import { categoryFrom, findCategory } from './pricing';

test('каталог: 6 карточек с существующими категориями и ценой из прайса', () => {
  expect(catalog.map((c) => c.href)).toEqual(['/pechat-na-odezhde', '/pechat-na-kruzhkah', '/znachki', '/nakleyki', '/vizitki', '/fotopodarki']);
  for (const c of catalog) {
    for (const id of c.categories) expect(findCategory(id), id).toBeTruthy();
    const prices = c.categories.map((id) => categoryFrom(id).price);
    const cheapest = c.categories[prices.indexOf(Math.min(...prices))];
    const from = catalogFrom(c);
    expect(from.price).toBe(Math.min(...prices));
    expect(from.price).toBeGreaterThan(0);
    expect(from.unit).toBe(categoryFrom(cheapest).unit);
    expect(typeof from.unit).toBe('string');
    expect(from.unit.length).toBeGreaterThan(0);
  }
  expect(catalog[4].categories).toEqual(['cards', 'flyers', 'calendars']);
});
test('факты: четыре', () => expect(facts).toHaveLength(4));

test('подпись работы: первый тег-изделие, иначе первый тег', () => {
  expect(workLabel(['korporativ', 'futbolki'])).toBe('Футболки');
  expect(workLabel(['korporativ'])).toBe('Для компаний');
  expect(workLabel([])).toBe('Работа');
  expect(workLabel(['неизвестный'])).toBe('Работа');
});
test('лента работ: 12 настоящих фото, без запрещённого, не больше двух на подпись', () => {
  expect(homeWorks).toHaveLength(12);
  expect(homeWorks.every((w) => portfolio.includes(w))).toBe(true);
  expect(homeWorks.some((w) => w.src.includes('portfolio-14.'))).toBe(false);
  const n: Record<string, number> = {};
  for (const w of homeWorks) n[workLabel(w.tags)] = (n[workLabel(w.tags)] ?? 0) + 1;
  expect(Math.max(...Object.values(n))).toBeLessThanOrEqual(2);
});
test('блоки: 4 причины, 4 шага, 6 вопросов, 6 отзывов; без доставки и старого адреса', () => {
  expect([why.length, steps.length, homeFaq.length, homeReviews.length]).toEqual([4, 4, 6, 6]);
  const text = JSON.stringify([why, steps]);
  expect(text).not.toMatch(/доставк|Челнокова, 11/i);
});
