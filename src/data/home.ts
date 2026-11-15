// Content of the home page: catalog cards and the facts strip. Prices come only from pricing.ts.
import type { IconName } from '@/components/ui/Icon.astro';
import { categoryFrom } from './pricing';
import { portfolio } from './portfolio';
import { reviews } from './reviews';
import { generalFaq } from './faq';
import type { Faq, PortfolioItem, Review } from './types';

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
  { icon: 'clock', value: '10:00–20:00', label: 'ежедневно, без выходных' },
];

// ——— lower half of the home page ———

/** captions of portfolio tags (src/data/portfolio.ts); the first 12 are products */
export const tagLabels: Record<string, string> = {
  futbolki: 'Футболки',
  hudi: 'Худи',
  shoppery: 'Шопперы',
  kepki: 'Бейсболки',
  kruzhki: 'Кружки',
  znachki: 'Значки',
  breloki: 'Брелоки',
  magnity: 'Магниты',
  nakleyki: 'Стикеры',
  poligrafiya: 'Полиграфия',
  kalendari: 'Календари',
  sport: 'Спорт',
  korporativ: 'Для компаний',
  podarki: 'Подарки',
  svadba: 'Свадьба',
  fandom: 'Фан-мерч',
};

const PRODUCT_TAGS = new Set(Object.keys(tagLabels).slice(0, 12));

/** caption of a work: its first product tag, else its first tag, else «Работа» */
export function workLabel(tags: string[]): string {
  const product = tags.find((t) => PRODUCT_TAGS.has(t));
  return tagLabels[product ?? tags[0]] ?? 'Работа';
}

/** 12 works for the home strip: captions take turns, at most 2 per caption, never portfolio-14 */
export const homeWorks: PortfolioItem[] = (() => {
  const groups = new Map<string, PortfolioItem[]>();
  for (const w of portfolio) {
    if (w.src.includes('portfolio-14.')) continue;
    const label = workLabel(w.tags);
    groups.set(label, [...(groups.get(label) ?? []), w]);
  }
  const out: PortfolioItem[] = [];
  for (let round = 0; round < 2; round++) {
    for (const items of groups.values()) if (items[round] && out.length < 12) out.push(items[round]);
  }
  return out;
})();

export const why: { icon: IconName; title: string; text: string }[] = [
  { icon: 'factory', title: 'Своё производство', text: 'Печатаем сами, в мастерской в ТЦ «Экватор»' },
  { icon: 'hash-1', title: 'От 1 штуки', text: 'Одна футболка или тираж — цена понятна заранее' },
  { icon: 'wand', title: 'Поможем с макетом', text: 'Простой макет подготовим бесплатно' },
  { icon: 'shield-check', title: 'Отвечаем за результат', text: 'Брак по нашей вине переделаем бесплатно' },
];

/** texts — HomeSteps.astro of 2.0, the address in step 4 is the new one */
export const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'calculator',
    title: 'Посчитайте цену',
    text: 'Калькулятор на странице «Цены» покажет цену за штуку и за весь тираж. Можно собрать смету из нескольких изделий.',
  },
  {
    icon: 'upload',
    title: 'Пришлите макет',
    text: 'Прикрепите файл к заявке или опишите идею. Нет макета — подготовим, в большинстве случаев бесплатно.',
  },
  {
    icon: 'check-square',
    title: 'Согласуем и оплатите',
    text: 'Покажем, как будет выглядеть изделие. Частным лицам — предоплата 50%, компаниям — счёт без НДС.',
  },
  {
    icon: 'shopping-bag',
    title: 'Заберите заказ',
    text: 'В ТЦ «Экватор» на Челнокова, 9, 2 этаж. За срочность не доплачиваете — сделаем к нужной дате.',
  },
];

const HOME_FAQ_QUESTIONS = [
  'Как оформить заказ?',
  'Какой минимальный тираж?',
  'Сколько времени занимает изготовление?',
  'У меня нет макета. Поможете?',
  'Как оплатить заказ?',
  'Можно ли принести своё изделие для печати?',
];
const allFaq = generalFaq.flatMap((g) => g.items);
/** six questions from /faq, in the order a first-time visitor asks them */
export const homeFaq: Faq[] = HOME_FAQ_QUESTIONS.map((q) => allFaq.find((f) => f.q === q)).filter((f): f is Faq => !!f);

/** the first six reviews of reviews.ts — that order already mixes Авито, Яндекс Карты and 2ГИС */
export const homeReviews: Review[] = reviews.slice(0, 6);
