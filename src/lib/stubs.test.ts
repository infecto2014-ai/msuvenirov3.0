import { expect, test } from 'vitest';
import { stubSlugs } from './stubs';
test('заглушки покрывают все внутренние адреса меню', () => {
  const s = stubSlugs();
  for (const slug of ['price', 'korporativnym-klientam', 'portfolio', 'o-nas', 'kontakty', 'uslugi', 'faq', 'stati',
    'pechat-na-odezhde', 'pechat-na-kruzhkah', 'znachki', 'nakleyki', 'vizitki', 'fotopodarki', 'pechat-na-futbolkah']) expect(s).toContain(slug);
  expect(new Set(s).size).toBe(s.length);
  expect(s.some((x) => x.startsWith('http') || x.startsWith('/') || x === '' || x === 'index')).toBe(false);
});
