// Геометрия SVG-иллюстраций квартальных календарей (CalendarArt.astro).
// Все размеры — в миллиметрах, как в прайсе поставщика.

export type CalendarType = 'midi3' | 'midi1' | 'mini3' | 'mini1' | 'trio';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Accent = 'c' | 'm' | 'y';

interface Model {
  headerW: number;
  headerH: number;
  blockW: number;
  blockH: number;
  blocks: number;
  adH: number;
  /** рекламное поле под каждым блоком (true) или одно внизу (false) */
  adEach: boolean;
  trio?: boolean;
}

export const MODELS: Record<CalendarType, Model> = {
  midi3: { headerW: 325, headerH: 240, blockW: 311, blockH: 160, blocks: 3, adH: 60, adEach: true },
  midi1: { headerW: 325, headerH: 240, blockW: 311, blockH: 160, blocks: 3, adH: 60, adEach: false },
  mini3: { headerW: 297, headerH: 210, blockW: 283, blockH: 145, blocks: 3, adH: 60, adEach: true },
  mini1: { headerW: 297, headerH: 210, blockW: 283, blockH: 145, blocks: 3, adH: 60, adEach: false },
  trio: { headerW: 335, headerH: 240, blockW: 327, blockH: 235, blocks: 1, adH: 60, adEach: false, trio: true },
};

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export interface MonthArt {
  title: Rect;
  accent: Accent;
  name: string;
  year: string;
  titleFs: number;
  big: boolean;
  weekdays: { x: number; y: number; t: string; we: boolean }[];
  wdFs: number;
  cells: { x: number; y: number; w: number; h: number; tx: number; ty: number; d: number; cur: boolean; we: boolean }[];
  fs: number;
  weekNums: { x: number; y: number; n: number }[];
  wnFs: number;
}

function isoWeek(ts: number): number {
  const d = new Date(ts);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3); // четверг этой недели
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 864e5 + 1) / 7);
}

/** Сетка месяца внутри прямоугольника r. compact — без колонок номеров недель. */
export function monthArt(r: Rect, year: number, month: number, accent: Accent, opts: { compact?: boolean; big?: boolean } = {}): MonthArt {
  const { compact = false, big = false } = opts;
  const titleH = r.h * (big ? 0.13 : compact ? 0.15 : 0.16);
  const wdH = r.h * (compact ? 0.09 : 0.085);
  const side = compact ? 0 : r.w * 0.065;
  const gx = r.x + side;
  const gw = r.w - side * 2;
  const colW = gw / 7;
  const gy = r.y + titleH + wdH;
  const rowH = (r.h - titleH - wdH) / 6;
  const gap = Math.min(colW, rowH) * 0.1;

  const first = Date.UTC(year, month, 1);
  const dow = (new Date(first).getUTCDay() + 6) % 7;
  const cells: MonthArt['cells'] = [];
  const weekNums: MonthArt['weekNums'] = [];
  const fs = Math.min(rowH * 0.56, colW * 0.46);
  for (let i = 0; i < 42; i++) {
    const ts = Date.UTC(year, month, 1 - dow + i);
    const dt = new Date(ts);
    const col = i % 7;
    const row = Math.floor(i / 7);
    const x = gx + col * colW;
    const y = gy + row * rowH;
    cells.push({
      x: x + gap / 2,
      y: y + gap / 2,
      w: colW - gap,
      h: rowH - gap,
      tx: x + colW / 2,
      ty: y + rowH / 2 + fs * 0.36,
      d: dt.getUTCDate(),
      cur: dt.getUTCMonth() === month,
      we: col >= 5,
    });
    if (!compact && col === 0) weekNums.push({ x: r.x + side / 2, y: y + rowH / 2, n: isoWeek(ts) });
  }
  const wdFs = Math.min(wdH * 0.55, colW * 0.3);
  return {
    title: { x: r.x, y: r.y, w: r.w, h: titleH * 0.78 },
    accent,
    name: MONTHS[month],
    year: String(year),
    titleFs: titleH * (big ? 0.5 : 0.44),
    big,
    weekdays: WEEKDAYS.map((t, i) => ({ x: gx + colW * (i + 0.5), y: r.y + titleH + wdH * 0.62, t, we: i >= 5 })),
    wdFs,
    cells,
    fs,
    weekNums,
    wnFs: Math.min(side * 0.42, rowH * 0.36),
  };
}

export interface Dim {
  a: number;
  b: number;
  /** край изделия, от которого тянется выносная линия */
  edge: number;
  label: string;
}

export interface Layout {
  model: Model;
  width: number; // ширина самого календаря
  height: number;
  header: Rect;
  blocks: Rect[];
  ads: (Rect & { last: boolean })[];
  spirals: { x: number; y: number; w: number }[];
  months: MonthArt[];
  vdims: Dim[];
}

const SPIRAL_INSET = 6;

export function buildLayout(type: CalendarType): Layout {
  const m = MODELS[type];
  const header: Rect = { x: 0, y: 0, w: m.headerW, h: m.headerH };
  const bx = (m.headerW - m.blockW) / 2;
  const blocks: Rect[] = [];
  const ads: Layout['ads'] = [];
  const spirals: Layout['spirals'] = [];
  const months: MonthArt[] = [];
  let y = m.headerH;
  const accents: Accent[] = ['c', 'm', 'y'];

  for (let i = 0; i < m.blocks; i++) {
    const b: Rect = { x: bx, y, w: m.blockW, h: m.blockH };
    blocks.push(b);
    spirals.push({ x: bx + 4, y, w: m.blockW - 8 });
    y += m.blockH;
    if (m.adEach || i === m.blocks - 1) {
      ads.push({ x: bx, y, w: m.blockW, h: m.adH, last: i === m.blocks - 1 });
      y += m.adH;
    }
  }

  if (m.trio) {
    const b = blocks[0];
    const pad = 9;
    const top = b.y + SPIRAL_INSET + 8;
    const innerH = b.h - (top - b.y) - pad;
    const leftW = (b.w - pad * 3) * 0.64;
    months.push(monthArt({ x: b.x + pad, y: top, w: leftW, h: innerH }, 2027, 0, 'm', { compact: true, big: true }));
    const rx = b.x + pad * 2 + leftW;
    const rw = b.w - pad * 3 - leftW;
    const rh = (innerH - pad) / 2;
    months.push(monthArt({ x: rx, y: top, w: rw, h: rh }, 2027, 1, 'c', { compact: true }));
    months.push(monthArt({ x: rx, y: top + rh + pad, w: rw, h: rh }, 2027, 2, 'y', { compact: true }));
  } else {
    const seq: [number, number][] = [
      [2026, 11],
      [2027, 0],
      [2027, 1],
    ];
    blocks.forEach((b, i) => {
      const padX = 8;
      const top = b.y + SPIRAL_INSET + 6;
      months.push(monthArt({ x: b.x + padX, y: top, w: b.w - padX * 2, h: b.h - (top - b.y) - 7 }, seq[i][0], seq[i][1], accents[i]));
    });
  }

  const b0 = blocks[0];
  const adDim = ads[0];
  const vdims: Dim[] = [
    { a: 0, b: m.headerH, edge: m.headerW, label: `${m.headerH} мм` },
    { a: b0.y, b: b0.y + b0.h, edge: b0.x + b0.w, label: `${m.blockH} мм` },
    { a: adDim.y, b: adDim.y + adDim.h, edge: adDim.x + adDim.w, label: `${m.adH} мм` },
  ];

  return { model: m, width: m.headerW, height: y, header, blocks, ads, spirals, months, vdims };
}

