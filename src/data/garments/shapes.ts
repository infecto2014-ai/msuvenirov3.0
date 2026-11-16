// Garment outlines for «Подробнее об изделии»: the to-scale print scheme («Размеры принтов») and the measuring
// scheme next to the size charts. Everything is in centimetres; prints hang `top` cm below the shoulder line,
// centred on `center`. `dims` — the measuring lines, `labels` — their letters and what each one measures
// (a cap or a shopper has no sleeve, so its labels differ).
export interface GarmentShape {
  /** outline of the garment */
  path: string;
  /** hood, pocket… drawn thinner over the outline; '' if none */
  extra: string;
  center: number;
  top: number;
  viewBox: string;
  dims: string[];
  labels: { l: string; x: number; y: number; what: string }[];
}

const LENGTH = 'длина изделия';
const WIDTH = 'ширина изделия';
const SLEEVE = 'длина рукава';

export const SHAPES = {
  // T-shirt, size M: 52 cm wide, 72 cm long
  tshirt: {
    path: 'M17 0C21 6 31 6 35 0L48 3L68 15L62 27L52 22L52 72L0 72L0 22L-10 27L-16 15L4 3Z',
    extra: '',
    center: 26,
    top: 9,
    viewBox: '-18 -2 88 76',
    dims: ['M6 4V71', 'M1 30H51', 'M50.5 6.5L64.5 15'],
    labels: [
      { l: 'A', x: 6, y: 50, what: LENGTH },
      { l: 'B', x: 40, y: 30, what: WIDTH },
      { l: 'C', x: 57.5, y: 10.8, what: SLEEVE },
    ],
  },
  // Hoodie, size M–L: 54 cm wide, 70 cm long, long sleeves, hood and kangaroo pocket
  hoodie: {
    path: 'M14 3L38 3L46 6L66 52L57 56L52 32L52 70L0 70L0 32L-5 56L-14 52L6 6Z',
    extra: 'M14 3C12 -9 40 -9 38 3C32 8 20 8 14 3ZM9 50L43 50L47 66L5 66Z',
    center: 26,
    top: 7,
    viewBox: '-18 -9 88 82',
    dims: ['M6 6V69', 'M1 32H51', 'M47 7L61.5 52'],
    labels: [
      { l: 'A', x: 6, y: 50, what: LENGTH },
      { l: 'B', x: 40, y: 32, what: WIDTH },
      { l: 'C', x: 56, y: 30, what: SLEEVE },
    ],
  },
} satisfies Record<string, GarmentShape>;

export type ShapeId = keyof typeof SHAPES;
