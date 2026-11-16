import { expect, test } from 'vitest';
import { cap } from './cap';
import { garmentFaq, garmentWorks } from './select';
import { services } from '../services';
import { portfolio } from '../portfolio';
import type { GarmentPage } from './types';

test('без faq и works — вопросы из services.ts, работы по тегу', () => {
  expect(garmentFaq(cap)).toEqual(services.find((s) => s.slug === cap.faqSlug)!.faq);
  for (const w of garmentWorks(cap)) expect(w.tags).toContain(cap.worksTag);
});

test('faq страницы важнее services.ts', () => {
  const faq = [{ q: 'Вопрос?', a: 'Ответ.' }];
  expect(garmentFaq({ ...cap, faq } as GarmentPage)).toEqual(faq);
});

test('works — список файлов портфолио в заданном порядке', () => {
  const src = [portfolio[2].src, portfolio[0].src];
  const w = garmentWorks({ ...cap, works: src } as GarmentPage);
  expect(w.map((x) => x.src)).toEqual(src);
  expect(w[0]).toBe(portfolio[2]);
});

test('works: файл не из портфолио и работа с неприличной надписью не попадают', () => {
  const w = garmentWorks({ ...cap, works: ['/portfolio/net-takogo.webp', portfolio[0].src] } as GarmentPage);
  expect(w.map((x) => x.src)).toEqual([portfolio[0].src]);
  const rude = portfolio.find((p) => p.src.includes('portfolio-14.'));
  if (rude) expect(garmentWorks({ ...cap, works: [rude.src] } as GarmentPage)).toEqual([]);
});
