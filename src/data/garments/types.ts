// One clothing page («Печать на одежде»: футболки, худи, …) is one GarmentPage record; the template
// src/layouts/GarmentPage.astro draws it. Prices are never written here — they come from pricing.ts.
import type { Choice } from '../pricing';
import type { CalcTile } from '@/lib/calc-preset';
import type { IconName } from '@/components/ui/Icon.astro';

/** a ready-made variant: a real work photo, its calculator settings; the price is quoted by pricing.ts */
export interface GarmentPreset {
  title: string;
  note: string;
  /** product id in the page's calculator category */
  product: string;
  qty: number;
  /** calculator options: color, print1…print5 ('a6' | 'a5' | 'a4' | 'a3' | 'none'), blank… */
  options: Record<string, string>;
  /** a real work of the workshop (/portfolio/…) or the product picture */
  img: string;
}

export interface SizeTable {
  columns: string[];
  rows: string[][];
}

export interface GarmentPage {
  /** page address, also the services.ts entry with the page's questions unless faqSlug says otherwise */
  slug: string;
  /** <title> and meta description */
  title: string;
  description: string;
  /** h1 = `${h1} ${accent}`, the accent is blue with the squiggle */
  h1: string;
  accent: string;
  /** breadcrumbs, the last one is this page */
  crumbs: { href: string; label: string }[];
  /** name of the Service in JSON-LD */
  serviceName: string;
  hero: { priceLabel: string };
  calc: { category: string; products: string[]; tiles?: CalcTile[]; lead: string };
  presets: GarmentPreset[];
  /** colours of the garment (from pricing.ts); white and black without a hint are «в наличии» */
  colors?: { choices: Choice[]; sub: string };
  specs: { label: string; value: string }[];
  specsSub: string;
  /** specs not confirmed by the owner — shown with «уточняйте у менеджера» */
  specsTodo?: boolean;
  sizes?: { adult?: SizeTable; kids?: SizeTable; sub: string; /** not confirmed — a visible note */ todo?: boolean };
  care: string[];
  /** DTF print sizes on clothing, w×h in cm; `shape` — the outline the to-scale scheme is drawn on */
  printSizes: { label: string; w: number; h: number }[];
  prints: { sub: string; shape: 'tshirt'; caption: string };
  /** portfolio tag of the page's works */
  worksTag: string;
  /** lower-case word stems a review must contain to be shown first (e.g. 'футболк') */
  reviewWords: string[];
  /** services.ts entry with the questions */
  faqSlug: string;
  prices: {
    title: string;
    accent: string;
    lead: string;
    /** calculator products whose pricing.ts table is shown */
    products: { id: string; title: string }[];
    rules: { icon: IconName; text: string }[];
  };
  /** section headings of the page */
  heads: { details: string; works: string; worksLead: string; reviews: string; faq: string };
  /**
   * picture names for Pic (public/img/v3), the alt text, what the placeholder says until the picture arrives
   * («кот с футболкой»), `extra.measure` — the measuring cat next to the size charts
   */
  images: { hero: string; heroMobile: string; alt: string; label: string; extra?: { measure?: string } };
}
