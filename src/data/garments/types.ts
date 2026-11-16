// One clothing page («Печать на одежде»: футболки, худи, …) is one GarmentPage record; the template
// src/layouts/GarmentPage.astro draws it. Prices are never written here — they come from pricing.ts.
import type { CalcTile } from '@/lib/calc-preset';
import type { IconName } from '@/components/ui/Icon.astro';
import type { ShapeId } from './shapes';

/** a ready-made variant: a real work photo, its calculator settings; the price is quoted by pricing.ts */
export interface GarmentPreset {
  title: string;
  note: string;
  /** product id in the page's calculator category */
  product: string;
  qty: number;
  /** calculator options: color, print1…print5 ('a6' | 'a5' | 'a4' | 'a3' | 'none'), blank… */
  options: Record<string, string>;
  /** a real work of the workshop (/portfolio/…) */
  img?: string;
  /** or a picture slot of public/img/v3 (Pic name, 1000×1000): the product photo, a labelled placeholder until it arrives */
  pic?: { name: string; label: string; alt: string };
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
  /**
   * the calculator: its tiles (a tile with `own` — the customer's item, only the print). The page's products — for
   * the calculator, the first-screen «от» price and the JSON-LD — are the tiles' products (tileProducts).
   */
  calc: { category: string; tiles: CalcTile[]; lead: string };
  presets: GarmentPreset[];
  /*
   * «Подробнее об изделии»: every section is optional and left out without data, in this order — colours, specs,
   * print sizes, size charts, care.
   */
  /**
   * colours of `product` from pricing.ts (colorChoices): «в наличии» or «от N шт» by its colour rules, never by
   * the chip hints
   */
  colors?: { product: string; sub: string };
  /** fabric and specs; title «Ткань и характеристики» and icon `shirt` unless given; `todo` — not confirmed (a note) */
  specs?: { items: { label: string; value: string }[]; sub: string; title?: string; icon?: IconName; todo?: boolean };
  /** the measuring scheme next to the charts is drawn on `prints.shape` (none without prints) */
  sizes?: { adult?: SizeTable; kids?: SizeTable; sub: string; /** not confirmed — a visible note */ todo?: boolean };
  care?: string[];
  /** DTF print sizes (w×h, cm) drawn to scale on the `shape` outline (src/data/garments/shapes.ts) */
  prints?: { sizes: { label: string; w: number; h: number }[]; sub: string; shape: ShapeId; caption: string };
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
  /**
   * the page's own heading parts: the accent of «Подробнее о …» and the lead under «Наши работы». The other section
   * headings are the template's and neutral (owner, 16.11.2026: the product name only in h1, the price table and
   * «Подробнее о …» — not «на футболках» in every section)
   */
  heads: { details: string; worksLead: string };
  /**
   * picture names for Pic (public/img/v3), the alt text, what the placeholder says until the picture arrives
   * («кот с футболкой»), `extra.measure` — the measuring cat next to the size charts
   */
  images: { hero: string; heroMobile: string; alt: string; label: string; extra?: { measure?: string } };
}
