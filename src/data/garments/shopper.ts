// «Печать на шопперах» (/pechat-na-shopperah) on the clothing template: ready-made variants, two kinds of shopper,
// «DTF или сублимация», print sizes, care. Texts are taken verbatim from msuvenirov 2.0 (src/data/shoppersPage.ts),
// changed only where the owner's rules of 16.11.2026 differ: the cotton shopper comes in the 11 garment colours,
// white and black from 1 pc, coloured from 10 (no «светлый (как лён)», no «другой цвет от 20 шт»), up to 2 prints
// up to А4. The sublimation shopper (shopper-sub) is unchanged. Prices are never written here — a variant's price is
// quoted by the calculator rules in pricing.ts (presetPrice).
import { COLOR_MIN, extraPrintFactor } from '../pricing';
import type { GarmentPage, GarmentPreset } from './types';

/** the calm product photo is not there yet: a labelled slot in public/img/v3 */
const SHOPPER_PRODUCT = { name: 'shopper-product', label: 'shopper-product — шоппер', alt: 'Шоппер с принтом' };

// 2.0 drew the cotton shoppers «natural» (light) — that colour is gone (owner, 16.11.2026): white instead; the
// two-sided one was black
const presets: GarmentPreset[] = [
  {
    title: 'Шоппер с принтом в подарок',
    note: 'хлопковый, рисунок или фото А4 с одной стороны',
    product: 'shopper',
    qty: 1,
    options: { color: 'white', print1: 'a4', print2: 'none' },
    img: '/portfolio/shopper-bags.webp',
  },
  {
    title: 'С двух сторон',
    note: 'хлопковый, два принта А4 — одинаковые или разные',
    product: 'shopper',
    qty: 1,
    options: { color: 'black', print1: 'a4', print2: 'a4' },
    pic: SHOPPER_PRODUCT,
  },
  {
    title: '20 шопперов для мероприятия',
    note: 'хлопковые, логотип или афиша А5',
    product: 'shopper',
    qty: 20,
    options: { color: 'white', print1: 'a5', print2: 'none' },
    pic: SHOPPER_PRODUCT,
  },
  {
    title: '50 светлых шопперов с сублимацией',
    note: 'цвет льна, яркое фото или рисунок А4',
    product: 'shopper-sub',
    qty: 50,
    options: { print1: 'a4', print2: 'none' },
    img: '/portfolio/portfolio-7.webp',
  },
  {
    title: '100 шопперов цвета льна с логотипом',
    note: 'сублимация А5 — для welcome pack и раздачи',
    product: 'shopper-sub',
    qty: 100,
    options: { print1: 'a5', print2: 'none' },
    pic: SHOPPER_PRODUCT,
  },
];

/** DTF print sizes on clothing (owner, 02.11.2026), w×h in cm; the cotton shopper takes up to А4 */
const printSizes = [
  { label: 'А6', w: 10, h: 15 },
  { label: 'А5', w: 15, h: 21 },
  { label: 'А4', w: 21, h: 28 },
];

// 2.0 had the care only in a question («Как стирать шоппер с печатью?») — the same words as a list
const care = [
  'Хлопковый шоппер с DTF-принтом стирайте навыворот вручную или в деликатном режиме до 30 °C, без отбеливателя.',
  'Гладьте с изнанки.',
  'Светлый шоппер с сублимацией можно стирать в машинке при 30–40 °C.',
];

const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

export const shopper: GarmentPage = {
  slug: '/pechat-na-shopperah',
  title: 'Печать на шопперах в Калининграде — шоппер с логотипом | Мастерская сувениров',
  description:
    'Печать на шопперах в Калининграде: шоппер с принтом от 1 шт (DTF) и светлые шопперы с сублимацией от 10 шт. Эко-сумки с логотипом оптом, счёт без НДС.',
  h1: 'Печать на шопперах в Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-shopperah', label: 'Шопперы' },
  ],
  serviceName: 'Печать на шопперах',
  hero: { priceLabel: 'Шоппер с печатью' },
  calc: {
    category: 'textile',
    // spec 2026-11-16-shoppers-caps: cotton, sublimation and the customer's own shopper (only the print)
    tiles: [
      { id: 'cotton', label: 'Хлопковый шоппер', product: 'shopper' },
      { id: 'sub', label: 'Шоппер для сублимации', product: 'shopper-sub' },
      { id: 'own', label: 'Свой шоппер', product: 'shopper', preset: { blank: 'own' }, own: true },
    ],
    lead: 'Выберите шоппер, цвет и принты — цена за штуку и за тираж посчитается сразу.',
  },
  presets,
  colors: { product: 'shopper', sub: `Хлопковый: белый и чёрный — в наличии, остальные — от ${COLOR_MIN.shopper} шт` },
  extra: [
    {
      id: 'kinds',
      title: 'Хлопковый или для сублимации',
      icon: 'shopping-bag',
      sub: 'Два вида шоппера: материал, размер, ручки',
      cards: [
        {
          title: 'Хлопковый шоппер',
          tag: 'от 1 штуки',
          rows: [
            { label: 'Материал', value: '100% хлопок, саржа, 240 г/м²' },
            { label: 'Цвет', value: `11 цветов: белый и чёрный — с 1 шт, цветные — от ${COLOR_MIN.shopper} шт` },
            { label: 'Размер', value: '38 × 42 см' },
            { label: 'Ручки', value: 'высота 35 см, ширина 3 см, укреплены строчкой' },
            { label: 'Печать', value: 'DTF, любые цвета' },
          ],
          text: 'Подарок, мерч художника, шоппер для себя или небольшая партия — когда нужно от одной штуки.',
        },
        {
          title: 'Светлый шоппер цвета льна',
          // review 16.11.2026: the calculator tile's name next to the 2.0 title
          tag: 'Шоппер для сублимации · для тиража',
          rows: [
            { label: 'Материал', value: 'синтетическая ткань для сублимации, 330 г/м²' },
            { label: 'Цвет', value: 'небелёный лён' },
            { label: 'Размер', value: '36 × 42 см (±3 см)' },
            { label: 'Ручки', value: '70 см' },
            { label: 'Печать', value: 'сублимация, полноцвет' },
          ],
          text: 'Мероприятия, конференции, welcome pack, магазины — яркое фото или логотип на партии от 10 штук.',
        },
      ],
    },
    {
      id: 'tech',
      title: 'DTF или сублимация — что выбрать',
      icon: 'layers',
      sub: 'Хлопковый шоппер — DTF, светлый — сублимация',
      cards: [
        {
          title: 'DTF-печать',
          tag: 'хлопковый шоппер',
          points: [
            'От 1 штуки — для подарка или образца.',
            'Печатаем на ткани любого цвета, есть белый цвет в рисунке.',
            'Принт — тонкая эластичная плёнка, на ощупь чуть заметен.',
            'До А4 с каждой стороны, можно с двух сторон.',
            'Стойкий принт при бережной стирке.',
          ],
          text: 'Выбирайте, если нужно немного шопперов — от одной штуки — или в рисунке есть белый цвет.',
        },
        {
          title: 'Сублимация',
          tag: 'светлый шоппер цвета льна',
          points: [
            'От 10 штук — для мероприятий и мерча.',
            'Краска уходит в ткань: рисунок не ощущается на ощупь.',
            'Яркое фото и плавные переходы цвета.',
            'До А3 с каждой стороны, можно с двух сторон.',
            'Белого в рисунке нет: светлые места будут цвета ткани.',
          ],
          text: 'Выбирайте для тиража от 10 штук — с ростом партии печать заметно дешевле.',
        },
      ],
    },
  ],
  care,
  prints: {
    sizes: printSizes,
    sub: 'А6, А5 и А4 на хлопковом шоппере',
    shape: 'shopper',
    caption: 'Рамки на хлопковом шоппере 38×42 см — в масштабе. А3 — только на шоппере для сублимации',
  },
  worksTag: 'shoppery',
  reviewWords: ['шоппер', 'сумк'],
  faqSlug: '/pechat-na-shopperah',
  prices: {
    title: 'Цена печати',
    accent: 'на шопперах',
    lead: 'Цена указана за один шоппер вместе с печатью. Чем больше тираж, тем дешевле каждый шоппер.',
    products: [
      { id: 'shopper', title: 'Хлопковый шоппер, DTF' },
      { id: 'shopper-sub', title: 'Шоппер для сублимации' },
    ],
    rules: [
      { icon: 'palette', text: `Цветные шопперы — от ${COLOR_MIN.shopper} шт. Белые и чёрные — с 1 шт.` },
      { icon: 'layers', text: `На хлопковом шоппере второй принт — со скидкой −${extraOff}%. Шоппер для сублимации — от 10 шт, каждая сторона — по полной цене.` },
    ],
  },
  heads: {
    details: 'о шопперах',
    worksLead: 'Настоящие шопперы наших клиентов',
  },
  images: {
    hero: 'shopper-hero',
    heroMobile: 'shopper-hero-mobile',
    alt: 'Рыжий кот в тёмно-синем худи с шоппером на плече',
    label: 'кот с шоппером',
  },
};
