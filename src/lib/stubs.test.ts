import { expect, test } from 'vitest';
import { REAL_PAGES, stubSlugs } from './stubs';
test('заглушки покрывают все внутренние адреса меню', () => {
  const s = stubSlugs();
  for (const slug of ['price', 'korporativnym-klientam', 'portfolio', 'o-nas', 'kontakty', 'uslugi', 'faq', 'stati',
    'pechat-na-odezhde', 'pechat-na-kruzhkah', 'znachki', 'nakleyki', 'vizitki', 'fotopodarki']) expect(s).toContain(slug);
  expect(new Set(s).size).toBe(s.length);
  expect(s.some((x) => x.startsWith('http') || x.startsWith('/') || x === '' || x === 'index')).toBe(false);
});
test('страницы нового дизайна — не заглушки', () => {
  for (const slug of REAL_PAGES) expect(stubSlugs()).not.toContain(slug);
  expect(REAL_PAGES).toContain('pechat-na-futbolkah');
  expect(REAL_PAGES).toContain('pechat-na-hudi');
});
