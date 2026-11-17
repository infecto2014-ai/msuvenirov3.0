// Data shape for the B2B page /korporativnym-klientam (content: src/data/corporate.ts, page: src/pages/korporativnym-klientam.astro).
// No prices on this page (owner, 02.11.2026): informative, SEO-oriented.
import type { Faq } from './types';

export interface CorporatePage {
  title: string; // <title>, ≤ 65 chars
  description: string; // meta description, ≤ 160 chars
  h1: string;
  lead: string; // 1–2 sentences under H1
  /** short proof chips under the lead, 3–5 items, e.g. «Счёт без НДС» */
  highlights: string[];
  heroImage: string; // path under /public
  heroImageAlt: string;
  /** main directions of corporate branding; each becomes a section with an anchor (#id) */
  directions: {
    id: string; // latin, for anchor, e.g. 'merch'
    title: string; // H2/H3, contains a search phrase, e.g. «Корпоративный мерч с логотипом»
    lead: string; // 1–2 sentences
    items: string[]; // what exactly we brand (4–8 short items)
    useCases?: string[]; // for what / when (2–4 short items)
    image: string; // path under /public
    imageAlt: string;
    /** related service pages on the site (slugs), shown as links */
    links?: { href: string; label: string }[];
  }[];
  /** who we work with: industries / types of clients, 6–10 items */
  audiences: { title: string; text: string }[];
  /** how we work with companies, 5–7 steps */
  process: { title: string; text: string }[];
  /** documents, payment, guarantees for companies */
  terms: { title: string; text: string }[];
  /** case studies from real portfolio photos (no invented numbers) */
  cases: { title: string; text: string; image: string; tags: string[] }[];
  /** SEO text block: H2 + several H3 sub-sections */
  seo: { title: string; sections: { title: string; paragraphs: string[] }[] };
  faq: Faq[];
  /** things the owner must confirm before launch (shown nowhere, for us) */
  todo: string[];
}

