// Pages that are not rebuilt in the new design yet: every internal menu address gets a «переезжает» stub,
// so no link on the site is broken. A real page takes over its slug: list it in REAL_PAGES.
import { flatLinks, infoNav, mainNav, serviceNav, type NavLink } from '../data/site';

export interface StubPage {
  slug: string;
  label: string;
}

/** menu addresses that already have a real page in the new design (src/pages/<slug>.astro) */
export const REAL_PAGES: string[] = ['pechat-na-futbolkah', 'pechat-na-hudi', 'pechat-na-shopperah'];

export function stubPages(): StubPage[] {
  const links: NavLink[] = [
    ...flatLinks(serviceNav.flatMap((g) => g.links)),
    ...mainNav,
    ...infoNav,
    { href: '/uslugi', label: 'Все услуги' },
  ];
  const seen = new Map<string, string>();
  for (const l of links) {
    if (!l.href.startsWith('/') || l.href.startsWith('//')) continue; // external (Конструктор и т. п.)
    const slug = l.href.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '');
    if (!slug || slug === 'index' || seen.has(slug) || REAL_PAGES.includes(slug)) continue;
    seen.set(slug, l.label);
  }
  return [...seen].map(([slug, label]) => ({ slug, label }));
}

export function stubSlugs(): string[] {
  return stubPages().map((p) => p.slug);
}
