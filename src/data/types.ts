// Content contracts shared by data files and page templates.

/** One FAQ entry; always rendered visibly on the page (FAQPage JSON-LD mirrors it). */
export interface Faq {
  q: string;
  a: string;
}

/** A content block on a service landing page. */
export type ServiceBlock =
  | { kind: 'text'; title: string; paragraphs: string[] }
  | { kind: 'features'; title: string; items: { title: string; text: string }[] }
  | { kind: 'compare'; title: string; columns: string[]; rows: { label: string; values: string[] }[] }
  | { kind: 'steps'; title: string; items: { title: string; text: string }[] }
  /** editorial cards with a photo and a short tag, e.g. «Что чаще всего заказывают» */
  | { kind: 'ideas'; title: string; lead?: string; items: { title: string; text: string; tag?: string; img?: string }[] }
  /** cards that lead to other pages, e.g. «DTF-печать и сублимация» on the clothing hub */
  | { kind: 'links'; title: string; lead?: string; items: { title: string; text: string; tag?: string; links: { href: string; label: string }[] }[] };

export interface ServicePage {
  /** URL path without trailing slash, e.g. "/pechat-na-futbolkah" */
  slug: string;
  /** Short name for menus and breadcrumbs, e.g. "Печать на футболках" */
  name: string;
  /** <title>, up to ~65 chars */
  title: string;
  /** meta description, up to ~160 chars */
  description: string;
  /** visible H1 */
  h1: string;
  /** 1–2 sentence lead under H1 */
  lead: string;
  /** Short selling points shown as chips under the lead (3–4 items) */
  highlights: string[];
  /** id of a calculator category from src/data/pricing.ts, opened preselected on this page */
  calcCategory: string;
  /** optional product id inside that category to preselect */
  calcProduct?: string;
  /** hero image path under /public, e.g. "/img/showcase/tshirt.webp" */
  image: string;
  imageAlt: string;
  blocks: ServiceBlock[];
  faq: Faq[];
  /** slugs of related service pages for internal linking (2–4) */
  related: string[];
  /** portfolio tags to show on the page (see src/data/portfolio.ts) */
  portfolioTags: string[];
}

export interface PortfolioItem {
  /** path under /public */
  src: string;
  title: string;
  /** e.g. "DTF-печать", "Сублимация" */
  tech: string;
  tags: string[];
}

export interface Review {
  name: string;
  text: string;
  /** where the review comes from, e.g. "Яндекс Карты", "Авито", "2ГИС"; omit if unknown */
  source?: string;
  /** when it was written, as shown on the platform, e.g. "июль 2026" */
  date?: string;
  /** stars on the platform, 1–5 */
  rating?: number;
}

/** Extra content for a garment landing page (футболки, худи, шопперы, бейсболки) — src/data/garments.ts */
export interface GarmentInfo {
  /** service page slug this belongs to, e.g. "/pechat-na-futbolkah" */
  slug: string;
  /** product id inside the 'textile' calculator category (src/data/pricing.ts) */
  productId: string;
  /** silhouette type for the future print constructor (owner builds it separately) */
  silhouette?: 'tshirt' | 'hoodie' | 'shopper' | 'cap';
  /** ready-made orders with a turnkey price computed from pricing.ts */
  packages: {
    title: string;
    /** short description, e.g. "белая или чёрная, принт А4 на груди" */
    note: string;
    qty: number;
    /** calculator options for this product, e.g. { color: 'white', print1: 'a4', print2: 'a3' } */
    options: Record<string, string>;
    /** image path under /public */
    img: string;
  }[];
  /** colours of the blank in stock */
  /** colours of the blank (a long list without notes is shown as a palette) */
  colors: { name: string; hex: string; note?: string }[];
  /** slugs of service pages for the «С этим заказывают» strip under the calculator */
  alsoOrder?: string[];
  /** facts about the blank: fabric, density, sizes… todo=true → owner must confirm, shown as «уточняйте» */
  specs: { label: string; value: string; todo?: boolean }[];
  /** size chart, optional */
  sizes?: { columns: string[]; rows: string[][]; todo?: boolean };
  /** care tips for the printed item (3–5 short lines) */
  care: string[];
  /** lowercase word stems to pick matching reviews, e.g. ['футболк'] */
  reviewKeywords: string[];
}
