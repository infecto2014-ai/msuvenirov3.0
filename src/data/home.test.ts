import { expect, test } from 'vitest';
import { catalog, catalogFrom, facts } from './home';
import { categoryFrom, findCategory } from './pricing';

test('каталог: 6 карточек с существующими категориями и ценой из прайса', () => {
  expect(catalog.map((c) => c.href)).toEqual(['/pechat-na-odezhde', '/pechat-na-kruzhkah', '/znachki', '/nakleyki', '/vizitki', '/fotopodarki']);
  for (const c of catalog) {
    for (const id of c.categories) expect(findCategory(id), id).toBeTruthy();
    expect(catalogFrom(c)).toBe(Math.min(...c.categories.map((id) => categoryFrom(id).price)));
    expect(catalogFrom(c)).toBeGreaterThan(0);
  }
  expect(catalog[4].categories).toEqual(['cards', 'flyers', 'calendars']);
});
test('факты: четыре', () => expect(facts).toHaveLength(4));
