// What a clothing page takes from the shared data: works by tag, reviews by words, questions from services.ts,
// and the price of a ready-made variant exactly as the calculator quotes it.
import { findProduct } from '../pricing';
import { portfolio } from '../portfolio';
import { reviews } from '../reviews';
import { services } from '../services';
import { homeReviews } from '../home';
import { applyPreset } from '@/lib/calc-preset';
import type { Faq, PortfolioItem, Review } from '../types';
import type { GarmentPage, GarmentPreset } from './types';

/** price of a variant exactly as the calculator quotes it after «Настроить в калькуляторе» */
export function presetPrice(preset: GarmentPreset, category = 'textile'): { unit: number; total: number } {
  const p = findProduct(category, preset.product)!;
  const q = p.quote(applyPreset(p, { options: preset.options, qty: preset.qty }));
  return { unit: q.unit, total: q.total };
}

/** real works with the page's tag; the cup with the rude print (portfolio-14) never goes to the site */
export const garmentWorks = (page: GarmentPage): PortfolioItem[] =>
  portfolio.filter((w) => w.tags.includes(page.worksTag) && !w.src.includes('portfolio-14.'));

/**
 * up to six reviews that mention the garment; if there are fewer than three, the rest comes from the home selection
 * and `topped` is true — the page then uses the neutral heading «Отзывы клиентов», not «Отзывы о печати на …»
 */
export const garmentReviews = (page: GarmentPage): { items: Review[]; topped: boolean } => {
  const about = reviews.filter((r) => page.reviewWords.some((w) => r.text.toLowerCase().includes(w))).slice(0, 6);
  if (about.length >= 3) return { items: about, topped: false };
  const rest = homeReviews.filter((r) => !about.includes(r));
  return { items: [...about, ...rest].slice(0, 3), topped: true };
};

/** the page's questions: its entry of services.ts */
export const garmentFaq = (page: GarmentPage): Faq[] => services.find((s) => s.slug === page.faqSlug)?.faq ?? [];
