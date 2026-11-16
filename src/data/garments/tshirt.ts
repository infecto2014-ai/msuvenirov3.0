// «Печать на футболках» (/pechat-na-futbolkah) on the clothing template: ready-made variants, specs, size charts,
// print sizes, care. Texts are taken verbatim from msuvenirov 2.0 (src/data/garments.ts); prices are never written
// here — a variant's price is quoted by the calculator rules in pricing.ts (presetPrice), rules use its constants.
import { COLOR_MIN, extraPrintFactor } from '../pricing';
import type { GarmentPage, GarmentPreset, SizeTable } from './types';

const presets: GarmentPreset[] = [
  {
    title: 'Футболка с фото в подарок',
    note: 'белая или чёрная, фото или коллаж А4 на груди',
    product: 'tshirt-unisex',
    qty: 1,
    options: { color: 'black', print1: 'a4', print2: 'none', print3: 'none' },
    img: '/portfolio/portfolio-21.webp',
  },
  {
    title: 'Парные футболки',
    note: 'две футболки с одним дизайном А4 — для пары, свадьбы, друзей',
    product: 'tshirt-unisex',
    qty: 2,
    options: { color: 'white', print1: 'a4', print2: 'none', print3: 'none' },
    img: '/portfolio/wedding-tshirts.webp',
  },
  {
    title: 'Спереди и сзади',
    note: 'небольшой принт А6 на груди и крупный А3 на спине',
    product: 'tshirt-unisex',
    qty: 1,
    options: { color: 'black', print1: 'a6', print2: 'a3', print3: 'none' },
    img: '/portfolio/dtf-bestdad.webp',
  },
  {
    title: 'Для команды или мероприятия',
    note: '20 футболок в цвет команды: логотип А6 на груди, А4 на спине',
    product: 'tshirt-unisex',
    qty: 20,
    // 2.0 had «другой цвет»; in 3.0 every colour is in the list — blue (spec, 16.11.2026)
    options: { color: 'blue', print1: 'a6', print2: 'a4', print3: 'none' },
    // 2.0 showed portfolio-9 (red face masks) — replaced with a real batch of team T-shirts
    img: '/portfolio/portfolio-20.webp',
  },
];

const specs = [
  { label: 'Модель', value: 'Унисекс' },
  { label: 'Состав', value: '100% хлопок' },
  { label: 'Плотность', value: '160–180 г/м²' },
  { label: 'Размеры', value: 'взрослые — от XS до 3XL' },
  { label: 'Детские размеры', value: 'от 98 до 164 (рост, см)' },
  { label: 'Технология печати', value: 'DTF — на ткани любого цвета' },
  { label: 'Места печати', value: 'грудь, спина, рукава' },
  { label: 'Размер принта', value: 'от А6 (10×15 см) до А3 (28×38 см)' },
  { label: 'Стойкость принта', value: '50+ стирок при правильном уходе' },
];

// owner, 16.11.2026: the adult chart is correct — no «ориентировочные» note
const adultSizes: SizeTable = {
  columns: ['Размер', 'Ширина, см', 'Длина, см'],
  rows: [
    ['XS (42)', '46', '68'],
    ['S (44)', '49', '70'],
    ['M (46)', '52', '72'],
    ['L (48)', '55', '74'],
    ['XL (50)', '58', '76'],
    ['XXL (52)', '61', '78'],
    ['3XL (54)', '64', '80'],
  ],
};

/** the owner's kids size chart (16.11.2026) */
const kidsSizes: SizeTable = {
  columns: ['Размер', 'Длина изделия, см (A)', 'Ширина изделия, см (B)', 'Длина рукава, см (C)'],
  rows: [
    ['98', '40', '31', '11'],
    ['104', '42', '33', '12'],
    ['110', '44', '34', '12'],
    ['116', '46', '35', '13'],
    ['122', '48', '36', '13'],
    ['128', '50', '37', '14'],
    ['134', '52', '38', '14'],
    ['140', '54', '40', '15'],
    ['146', '56', '42', '15'],
    ['152', '58', '42', '16'],
    ['158', '60', '44', '16'],
    ['164', '62', '46', '17'],
  ],
};

/** DTF print sizes on clothing (owner, 02.11.2026) — not the paper A-sizes; w×h in cm */
const printSizes = [
  { label: 'А6', w: 10, h: 15 },
  { label: 'А5', w: 15, h: 21 },
  { label: 'А4', w: 21, h: 28 },
  { label: 'А3', w: 28, h: 38 },
];

const care = [
  'Первую стирку — не раньше чем через сутки после печати.',
  'Стирайте навыворот при 30–40 °C, без отбеливателя.',
  'Гладьте с изнанки, утюгом по принту не проводите.',
  'Не сушите в барабанной сушилке и на батарее.',
  'Без химчистки и агрессивных пятновыводителей на принте.',
];

const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

export const tshirt: GarmentPage = {
  slug: '/pechat-na-futbolkah',
  title: 'Печать на футболках в Калининграде — от 1 штуки | Мастерская сувениров',
  description:
    'Печать на белых, чёрных и цветных футболках в ТЦ «Экватор»: DTF-печать от А6 до А3, взрослые и детские размеры, от 1 штуки. Рассчитайте цену онлайн и оставьте заявку.',
  h1: 'Печать на\u00a0футболках в\u00a0Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-futbolkah', label: 'Футболки' },
  ],
  serviceName: 'Печать на футболках',
  hero: { priceLabel: 'Футболка с\u00a0печатью' },
  calc: {
    category: 'textile',
    // owner, 16.11.2026: three tiles instead of the product list and the «наша / своя» switch
    tiles: [
      { id: 'unisex', label: 'Футболка унисекс', product: 'tshirt-unisex' },
      { id: 'kids', label: 'Детская', product: 'tshirt-kids' },
      { id: 'own', label: 'Своя футболка', product: 'tshirt-unisex', preset: { blank: 'own' }, own: true },
    ],
    lead: 'Выберите футболку, цвет и принты — цена за штуку и за тираж посчитается сразу.',
  },
  presets,
  colors: { product: 'tshirt-unisex', sub: `Белый и чёрный — в наличии, остальные — от ${COLOR_MIN.tshirt} шт` },
  specs: { items: specs, sub: '100% хлопок, 160–180 г/м², печать DTF' },
  sizes: { adult: adultSizes, kids: kidsSizes, sub: 'Взрослые XS–3XL, детские 98–164' },
  care,
  prints: { sizes: printSizes, sub: 'А6, А5, А4 и А3 на футболке', shape: 'tshirt', caption: 'Рамки принтов на груди футболки размера M — в масштабе' },
  worksTag: 'futbolki',
  reviewWords: ['футболк'],
  faqSlug: '/pechat-na-futbolkah',
  prices: {
    // owner, 16.11.2026: title «Цена печати на футболках», the lead rewritten
    title: 'Цена печати',
    accent: 'на футболках',
    lead: 'Цена указана за одну футболку вместе с печатью. Чем больше тираж, тем дешевле каждая футболка.',
    products: [
      { id: 'tshirt-unisex', title: 'Взрослая футболка' },
      { id: 'tshirt-kids', title: 'Детская футболка' },
    ],
    rules: [
      { icon: 'palette', text: `Цветные футболки — от ${COLOR_MIN.tshirt} шт. Белые и чёрные — с 1 шт.` },
      { icon: 'layers', text: `Каждый следующий принт — со скидкой −${extraOff}%, самый дорогой — по полной цене.` },
    ],
  },
  heads: {
    details: 'о футболке',
    works: 'на футболках',
    worksLead: 'Настоящие футболки наших клиентов',
    reviews: 'о печати на футболках',
    faq: 'о футболках',
  },
  images: {
    hero: 'tee-hero',
    heroMobile: 'tee-hero-mobile',
    alt: 'Рыжий кот в тёмно-синем худи держит белую футболку',
    label: 'кот с футболкой',
    extra: { measure: 'tee-cat-measure' },
  },
};
