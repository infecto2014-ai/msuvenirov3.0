import { expect, test } from 'vitest';
import { defaultSelection, findProduct, rub } from '../pricing';
import { mainNav, serviceNav } from '../site';
import { stubSlugs } from '@/lib/stubs';
import { garmentFaq, garmentFrom, garmentWorks } from './select';
import { notebooks } from './notebooks';

test('страница блокнотов доступна из каталога, а отзывы — из главного меню', () => {
  expect(serviceNav.flatMap((g) => g.links).filter((l) => l.href === notebooks.slug)).toHaveLength(1);
  expect(mainNav.filter((l) => l.href === '/otzyvy')).toEqual([{ href: '/otzyvy', label: 'Отзывы' }]);
  expect(stubSlugs()).not.toContain('bloknoty');
});

test('калькулятор блокнотов использует только прайс и не предлагает конструктор одежды', () => {
  expect(notebooks.calc.category).toBe('flyers');
  expect(notebooks.calc.tiles.map((t) => t.product)).toEqual(['notebook']);
  expect(notebooks.showConstructor).toBe(false);
  expect(notebooks.presets).toEqual([]);
  expect(garmentFrom(notebooks)).toBe(findProduct('flyers', 'notebook')!.fromPrice);
});

test('информация об обложках, наполнении и ценах согласована с расчётом', () => {
  const product = findProduct('flyers', 'notebook')!;
  const faq = garmentFaq(notebooks);
  for (const variant of ['a5', 'a6']) {
    const sel = defaultSelection(product);
    const unit = product.quote({ ...sel, qty: 10, options: { ...sel.options, variant, cover: 'front' } }).unit;
    expect(faq.some((x) => x.a.includes(rub(unit)))).toBe(true);
  }
  const copy = JSON.stringify(notebooks);
  expect(copy).toContain('30 чистых листов');
  expect(copy).toContain('15%');
  expect(copy).toContain('Печать внутри');
  expect(copy).toContain('индивидуально');
  expect(copy).not.toContain('40 листов');
  expect(garmentWorks(notebooks)).toEqual([]);
  expect(notebooks.prices.products.map((p) => p.id)).toEqual(['notebook']);
});
