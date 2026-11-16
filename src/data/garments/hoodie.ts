// «Печать на худи» (/pechat-na-hudi) on the clothing template: ready-made variants, specs, size chart, print sizes,
// care. Texts are taken verbatim from msuvenirov 2.0 (src/data/garments.ts); prices are never written here — a
// variant's price is quoted by the calculator rules in pricing.ts (presetPrice). Specs and sizes are confirmed by
// the owner (16.11.2026) — no «уточняйте» notes. Colours: white and black only (no grey melange).
import { extraPrintFactor, GARMENT_COLORS } from '../pricing';
import type { GarmentPage, GarmentPreset, SizeTable } from './types';

/** the calm product photo is not there yet (the neon one of 2.0 does not fit): a labelled slot in public/img/v3 */
const HOODIE_PRODUCT = { name: 'hoodie-product', label: 'hoodie-product — худи', alt: 'Худи с принтом' };

const presets: GarmentPreset[] = [
  {
    title: 'Худи с принтом на груди',
    note: 'рисунок или надпись А4 спереди',
    product: 'hoodie',
    qty: 1,
    options: { color: 'black', print1: 'a4', print2: 'none', print3: 'none' },
    img: '/portfolio/portfolio-5.webp',
  },
  {
    title: 'Большой принт на спине',
    note: 'небольшой принт А6 на груди и крупный А3 на спине',
    product: 'hoodie',
    qty: 1,
    options: { color: 'white', print1: 'a6', print2: 'a3', print3: 'none' },
    pic: HOODIE_PRODUCT,
  },
  {
    title: 'Грудь, спина и рукав',
    note: 'логотип А6 на груди, А3 на спине и надпись А6 на рукаве',
    product: 'hoodie',
    qty: 1,
    options: { color: 'black', print1: 'a6', print2: 'a3', print3: 'a6' },
    pic: HOODIE_PRODUCT,
  },
  {
    title: 'Для класса или команды',
    note: '20 худи: логотип А6 на груди, название или имя А4 на спине',
    product: 'hoodie',
    qty: 20,
    options: { color: 'black', print1: 'a6', print2: 'a4', print3: 'none' },
    pic: HOODIE_PRODUCT,
  },
];

const specs = [
  { label: 'Модель', value: 'Худи унисекс с капюшоном и карманом «кенгуру»' },
  { label: 'Состав', value: '80% хлопок, 20% полиэстер' },
  { label: 'Плотность', value: '320 г/м², с начёсом внутри' },
  { label: 'Размеры', value: 'от S до 3XL' },
  { label: 'Цвета', value: 'белый и чёрный' },
  { label: 'Технология печати', value: 'DTF — на тёмном и светлом трикотаже' },
  { label: 'Места печати', value: 'грудь, спина, рукава, капюшон — до 4 принтов на одном худи' },
  { label: 'Размер принта', value: 'от А6 (10×15 см) до А3 (28×38 см) на спине' },
  { label: 'Стойкость принта', value: '50+ стирок при правильном уходе' },
];

const adultSizes: SizeTable = {
  columns: ['Размер', 'Ширина, см', 'Длина, см', 'Рукав, см'],
  rows: [
    ['S–M (44–46)', '52', '68', '73'],
    ['M–L (46–48)', '54', '70', '74'],
    ['L–XL (48–50)', '56', '72', '76'],
    ['XL–2XL (50–52)', '58', '74', '78'],
    ['2XL–3XL (52–54)', '61', '76', '79'],
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
  'Стирайте навыворот в деликатном режиме при 30 °C, без отбеливателя.',
  'Гладьте с изнанки, утюгом по принту не проводите.',
  'Сушите расправленным на горизонтальной поверхности, не в барабанной сушилке.',
];

const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

export const hoodie: GarmentPage = {
  slug: '/pechat-na-hudi',
  title: 'Печать на худи в Калининграде от 1 шт | Мастерская сувениров',
  description:
    'Печать на худи в Калининграде от 1 шт: большой принт на спине, логотип на груди, надпись на рукаве. DTF на любом цвете. ТЦ «Экватор», +7 952 114-23-50.',
  h1: 'Печать на худи в Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-hudi', label: 'Худи' },
  ],
  serviceName: 'Печать на худи',
  hero: { priceLabel: 'Худи с печатью' },
  calc: {
    category: 'textile',
    products: ['hoodie'],
    // owner, 16.11.2026: every clothing page has a «свой» tile — the customer's own hoodie, only the print
    tiles: [
      { id: 'ours', label: 'Худи', product: 'hoodie' },
      { id: 'own', label: 'Своё худи', product: 'hoodie', preset: { blank: 'own' } },
    ],
    lead: 'Выберите худи, цвет и принты — цена за штуку и за тираж посчитается сразу.',
  },
  presets,
  // owner, 16.11.2026: only white and black (the grey melange of 2.0 is not shown)
  colors: { choices: GARMENT_COLORS.filter((c) => !c.hint), sub: 'Белый и чёрный — в наличии' },
  specs,
  specsSub: '80% хлопок, 320 г/м² с начёсом, печать DTF',
  sizes: { adult: adultSizes, sub: 'Унисекс, от S до 3XL' },
  care,
  printSizes,
  prints: {
    sub: 'А6, А5, А4 и А3 на худи',
    shape: 'hoodie',
    caption: 'Рамки показаны на груди худи размера M–L в масштабе; на спине — те же размеры, до А3',
  },
  worksTag: 'hudi',
  reviewWords: ['худи'],
  faqSlug: '/pechat-na-hudi',
  prices: {
    title: 'Цена печати',
    accent: 'на худи',
    lead: 'Цена указана за одно худи вместе с печатью. Чем больше тираж, тем дешевле печать.',
    products: [{ id: 'hoodie', title: 'Худи' }],
    rules: [
      { icon: 'palette', text: 'Худи — белые и чёрные, одна цена при любом количестве.' },
      { icon: 'layers', text: `Каждый следующий принт — со скидкой −${extraOff}%, самый дорогой — по полной цене.` },
    ],
  },
  heads: {
    details: 'о худи',
    works: 'на худи',
    worksLead: 'Настоящие худи наших клиентов',
    reviews: 'о печати на худи',
    faq: 'о худи',
  },
  images: {
    hero: 'hoodie-hero',
    heroMobile: 'hoodie-hero-mobile',
    alt: 'Рыжий кот в тёмно-синем худи показывает худи с принтом на спине',
    label: 'кот с худи',
  },
};
