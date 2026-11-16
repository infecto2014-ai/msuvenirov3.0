import { expect, test } from 'vitest';
import { hoodie } from './hoodie';
import { tshirt } from './tshirt';
import { shopper } from './shopper';

// owner, 16.11.2026 (after the hoodie): the product name is in h1, the price table heading and at most one or two
// other headings — not «на футболках» in every section. The template's own headings (calculator, variants, works,
// reviews, questions) are fixed and neutral; a page sets only the «Подробнее о …» accent and the works lead.
for (const page of [tshirt, hoodie, shopper]) {
  test(`${page.slug}: заголовки разделов — без повторов названия изделия`, () => {
    expect(Object.keys(page.heads).sort()).toEqual(['details', 'worksLead']);
    const named = [`${page.h1}`, `${page.prices.title} ${page.prices.accent}`, `Подробнее ${page.heads.details}`];
    expect(named.every((h) => h.length > 0)).toBe(true);
  });
}
