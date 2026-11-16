// Content of the T-shirt page (/pechat-na-futbolkah): ready-made variants, specs, size charts, print sizes, care.
// Texts are taken verbatim from msuvenirov 2.0 (src/data/garments.ts); prices are never written here —
// a variant's price is quoted by the calculator rules in pricing.ts (presetPrice).
import { findProduct } from './pricing';
import { applyPreset } from '@/lib/calc-preset';

export interface TeePreset {
  title: string;
  note: string;
  product: 'tshirt-unisex';
  qty: number;
  /** calculator options: color, print1…print4 ('a6' | 'a5' | 'a4' | 'a3' | 'none') */
  options: Record<string, string>;
  /** a real work of the workshop, /portfolio/… */
  img: string;
}

export const teePresets: TeePreset[] = [
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

/** price of a variant exactly as the calculator quotes it after «Настроить в калькуляторе» */
export function presetPrice(preset: TeePreset): { unit: number; total: number } {
  const p = findProduct('textile', preset.product)!;
  const q = p.quote(applyPreset(p, { options: preset.options, qty: preset.qty }));
  return { unit: q.unit, total: q.total };
}

export const teeSpecs: { label: string; value: string }[] = [
  { label: 'Модель', value: 'Унисекс' },
  { label: 'Состав', value: '100% хлопок' },
  { label: 'Плотность', value: '160–180 г/м²' },
  { label: 'Размеры', value: 'взрослые — от XS до 3XL' },
  { label: 'Детские размеры', value: 'от 98 до 164 (рост, см)' },
  { label: 'Технология печати', value: 'DTF — на белой и чёрной ткани' },
  { label: 'Места печати', value: 'грудь, спина, рукава' },
  { label: 'Размер принта', value: 'от А6 (10×15 см) до А3 (28×38 см)' },
  { label: 'Стойкость принта', value: '50+ стирок при правильном уходе' },
];

export interface SizeTable {
  columns: string[];
  rows: string[][];
  /** not confirmed by the owner yet — shown with «уточняйте у менеджера» (as on 2.0) */
  todo?: boolean;
}

export const adultSizes: SizeTable = {
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
  todo: true,
};

/** the owner's kids size chart (16.11.2026) */
export const kidsSizes: SizeTable = {
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
export const printSizes: { label: string; w: number; h: number }[] = [
  { label: 'А6', w: 10, h: 15 },
  { label: 'А5', w: 15, h: 21 },
  { label: 'А4', w: 21, h: 28 },
  { label: 'А3', w: 28, h: 38 },
];

export const teeCare: string[] = [
  'Первую стирку — не раньше чем через сутки после печати.',
  'Стирайте навыворот при 30–40 °C, без отбеливателя.',
  'Гладьте с изнанки, утюгом по принту не проводите.',
  'Не сушите в барабанной сушилке и на батарее.',
  'Без химчистки и агрессивных пятновыводителей на принте.',
];
