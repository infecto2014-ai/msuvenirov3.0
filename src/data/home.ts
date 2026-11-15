// Content of the home page: catalog cards and the facts strip. Prices come only from pricing.ts.
import type { IconName } from '@/components/ui/Icon.astro';
import { categoryFrom } from './pricing';

export interface CatalogCard {
  id: string;
  title: string;
  text: string;
  href: string;
  /** pricing.ts category ids — the card shows the lowest «от» among them */
  categories: string[];
  /** owner's picture name in public/img/v3/ */
  pic: string;
  /** picture used until the owner's one arrives */
  fallback: string;
  icon: IconName;
}

export const catalog: CatalogCard[] = [
  {
    id: 'clothes',
    title: 'Одежда',
    text: 'Футболки, худи, шопперы, бейсболки',
    href: '/pechat-na-odezhde',
    categories: ['textile'],
    pic: 'catalog-clothes',
    fallback: '/img/products/tshirts-640.webp',
    icon: 'shirt',
  },
  {
    id: 'mugs',
    title: 'Кружки',
    text: 'С фото, надписью или логотипом',
    href: '/pechat-na-kruzhkah',
    categories: ['mugs'],
    pic: 'catalog-mugs',
    fallback: '/img/products/mugs-640.webp',
    icon: 'coffee',
  },
  {
    id: 'badges',
    title: 'Значки',
    text: 'Закатные и на цанге',
    href: '/znachki',
    categories: ['badges'],
    pic: 'catalog-badges',
    fallback: '/img/products/badges-640.webp',
    icon: 'badge',
  },
  {
    id: 'stickers',
    title: 'Стикеры',
    text: '3D-стикеры и виниловые',
    href: '/nakleyki',
    categories: ['stickers'],
    pic: 'catalog-stickers',
    fallback: '/img/products/stickers-640.webp',
    icon: 'sticker',
  },
  {
    id: 'print',
    title: 'Полиграфия',
    text: 'Визитки, листовки, календари',
    href: '/vizitki',
    categories: ['cards', 'flyers', 'calendars'],
    pic: 'catalog-print',
    fallback: '/img/products/business-cards-640.webp',
    icon: 'file-text',
  },
  {
    id: 'gifts',
    title: 'Фотоподарки',
    // what the «gifts» category of pricing.ts really has (no photo frames there)
    text: 'Подушки, пазлы, коврики для мыши',
    href: '/fotopodarki',
    categories: ['gifts'],
    pic: 'catalog-gifts',
    fallback: '/img/products/pillow-640.webp',
    icon: 'gift',
  },
];

/** «от» price and its unit (шт, см² …) of the cheapest of the card's categories */
export function catalogFrom(card: CatalogCard): { price: number; unit: string } {
  return card.categories
    .map((id) => categoryFrom(id))
    .reduce((min, f) => (f.price < min.price ? f : min));
}

export const facts: { icon: IconName; value: string; label: string }[] = [
  { icon: 'check-square', value: '10 000+', label: 'заказов выполнено' },
  { icon: 'award', value: '10+ лет', label: 'опыта в печати' },
  { icon: 'factory', value: 'С 2019 года', label: 'своя мастерская' },
  { icon: 'clock', value: '10:00–20:00', label: 'ежедневно, без выходных' },
];
