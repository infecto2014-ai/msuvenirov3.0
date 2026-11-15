// Single source of truth for all prices on the site.
// Calculators, price tables, "от N ₽" labels and JSON-LD offers are all derived from this file.
// Prices are in rubles. A tier `{ from, price }` applies when qty >= from.

export interface Tier {
  from: number;
  price: number;
}

export interface Choice {
  id: string;
  label: string;
  /** short hint under the label */
  hint?: string;
  /** colour dot shown in the chip, e.g. '#d9261c' */
  swatch?: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  /** 'one' = pick exactly one, 'many' = any number of toggles */
  type: 'one' | 'many';
  choices: Choice[];
  /** default choice id(s) */
  default?: string | string[];
  /** hide this group while another group has this value, e.g. colour is hidden for the customer's own t-shirt */
  hideWhen?: { group: string; value: string };
  /** show this group only while another group has this value, e.g. mug colours only for the coloured mug */
  showWhen?: { group: string; value: string };
  /** optional extra group (e.g. 2nd–4th print): hidden while 'none', the customer adds it with a button */
  addable?: boolean;
}

export interface DimInput {
  id: string;
  label: string;
  unit: 'см';
  min: number;
  max: number;
  default: number;
}

export interface QtyConfig {
  min: number;
  max: number;
  default: number;
  /** discrete packages only (e.g. pocket calendars) */
  presets?: number[];
  /** with presets: from this quantity on, any amount can be ordered (presets below it) */
  freeFrom?: number;
  /** above `max` the price is set individually (clothing: more than 50 pcs) — the last tier reads «20–50 шт» */
  individualAbove?: boolean;
  /** above `max` the order is counted as another product of the same category (set of 3×3 stickers → epoxy stickers) */
  moreIn?: { product: string; label: string; dims?: Record<string, number> };
}

export interface Selection {
  options: Record<string, string | string[]>;
  dims: Record<string, number>;
  qty: number;
}

export interface Quote {
  /** price per piece */
  unit: number;
  total: number;
  /** price is a lower bound ("от"); exact price confirmed by the manager */
  from?: boolean;
  /** human-readable lines that sum up to `unit` (per piece) or to `total` */
  breakdown: { label: string; amount: number; per: 'шт' | 'заказ' }[];
  /** cheaper tier available at a larger quantity */
  next?: { qty: number; unit: number };
  notes: string[];
  /** blocking problem: the configuration cannot be ordered as is */
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  /** one-line description in the picker */
  short?: string;
  image?: string;
  qty: QtyConfig;
  options?: OptionGroup[];
  dims?: DimInput[];
  /** quantities at which the price per piece drops (for the tier ladder in the UI) */
  ladder?: (sel: Selection) => Tier[];
  quote: (sel: Selection) => Quote;
  /** smallest run for this selection when it depends on the size (stickers: minimum order sum); default qty.min */
  minQty?: (sel: Selection) => number;
  /** static price table for the HTML price list (always visible, indexable) */
  table?: PriceTable;
  /** lowest possible price per piece, for "от N ₽" labels */
  fromPrice: number;
  /** text unit for fromPrice: "шт", "м²", "см²" */
  fromUnit?: string;
}

export interface PriceTable {
  columns: string[];
  rows: { label: string; cells: string[] }[];
  /** small print under the table */
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  /** landing page with details */
  page?: string;
  products: Product[];
}

// ---------------------------------------------------------------- helpers

export const tierPrice = (tiers: Tier[], qty: number): number => {
  let p = tiers[0].price;
  for (const t of tiers) if (qty >= t.from) p = t.price;
  return p;
};

export const nextTier = (tiers: Tier[], qty: number): Tier | undefined => {
  const cur = tierPrice(tiers, qty);
  return tiers.find((t) => t.from > qty && t.price < cur);
};

const one = (sel: Selection, id: string, fallback: string): string => {
  const v = sel.options[id];
  return typeof v === 'string' ? v : fallback;
};

const many = (sel: Selection, id: string): string[] => {
  const v = sel.options[id];
  return Array.isArray(v) ? v : [];
};

const round = (n: number) => Math.round(n * 100) / 100;


export const rub = (n: number): string =>
  `${n.toLocaleString('ru-RU', { maximumFractionDigits: n % 1 ? 2 : 0, minimumFractionDigits: n % 1 ? 1 : 0 })} ₽`;

/** Labels for price tiers: exact print runs for presets, ranges for free quantities. */
export const qtyLabels = (from: number[], qty: QtyConfig): string[] => {
  if (qty.individualAbove || qty.moreIn) {
    const labels = rangeLabels(from);
    labels[labels.length - 1] = `${from[from.length - 1]}–${qty.max} шт`;
    return labels;
  }
  if (!qty.presets) return rangeLabels(from);
  const free = qty.freeFrom ?? Infinity;
  const ranges = rangeLabels(from);
  return from.map((f, i) => (f < free ? `${f.toLocaleString('ru-RU')} шт` : ranges[i]));
};

/** [1, 5, 20] -> ["1–4 шт", "5–19 шт", "от 20 шт"] */
export const rangeLabels = (from: number[]): string[] =>
  from.map((f, i) => {
    if (from.length === 1) return `от ${f} шт`;
    if (i === from.length - 1) return `от ${f} шт`;
    const to = from[i + 1] - 1;
    return to === f ? `${f} шт` : `${f}–${to} шт`;
  });

/** Build tiers from a list of thresholds and a matching list of prices. */
const tiers = (from: number[], prices: number[]): Tier[] => from.map((f, i) => ({ from: f, price: prices[i] }));

const minPrice = (t: Tier[]) => Math.min(...t.map((x) => x.price));

/** Simple product: price per piece depends on a variant and on quantity. */
function tiered(args: {
  id: string;
  name: string;
  short?: string;
  image?: string;
  qty: QtyConfig;
  variantLabel?: string;
  variants: { id: string; label: string; hint?: string; tiers: Tier[] }[];
  extras?: { id: string; label: string; price: number }[];
  extrasLabel?: string;
  /** Extra choices that do not change the price (e.g. paper finish). */
  choices?: OptionGroup[];
  notes?: string[];
}): Product {
  const groups: OptionGroup[] = [];
  if (args.variants.length > 1) {
    groups.push({
      id: 'variant',
      label: args.variantLabel ?? 'Вариант',
      type: 'one',
      choices: args.variants.map((v) => ({ id: v.id, label: v.label, hint: v.hint })),
      default: args.variants[0].id,
    });
  }
  if (args.choices?.length) groups.push(...args.choices);
  if (args.extras?.length) {
    groups.push({
      id: 'extras',
      label: args.extrasLabel ?? 'Дополнительно',
      type: 'many',
      choices: args.extras.map((e) => ({ id: e.id, label: e.label, hint: `+${e.price} ₽/шт` })),
      default: [],
    });
  }
  const variantOf = (sel: Selection) => args.variants.find((v) => v.id === one(sel, 'variant', args.variants[0].id)) ?? args.variants[0];
  return {
    id: args.id,
    name: args.name,
    short: args.short,
    image: args.image,
    qty: args.qty,
    options: groups,
    fromPrice: Math.min(...args.variants.map((v) => minPrice(v.tiers))),
    table: {
      columns: qtyLabels(args.variants[0].tiers.map((t) => t.from), args.qty),
      rows: [
        ...args.variants.map((v) => ({ label: args.variants.length > 1 ? v.label : args.name, cells: v.tiers.map((t) => rub(t.price)) })),
        ...(args.extras ?? []).map((e) => ({ label: `+ ${e.label}`, cells: args.variants[0].tiers.map(() => `+${rub(e.price)}`) })),
      ],
    },
    ladder: (sel) => variantOf(sel).tiers,
    quote: (sel) => {
      const v = variantOf(sel);
      const base = tierPrice(v.tiers, sel.qty);
      const breakdown: Quote['breakdown'] = [{ label: args.variants.length > 1 ? v.label : args.name, amount: base, per: 'шт' }];
      let unit = base;
      for (const id of many(sel, 'extras')) {
        const e = args.extras?.find((x) => x.id === id);
        if (e) {
          unit += e.price;
          breakdown.push({ label: e.label, amount: e.price, per: 'шт' });
        }
      }
      const nt = nextTier(v.tiers, sel.qty);
      return {
        unit,
        total: Math.round(unit * sel.qty),
        breakdown,
        next: nt ? { qty: nt.from, unit: unit - base + nt.price } : undefined,
        notes: args.notes ?? [],
      };
    },
  };
}

/** Fixed price per piece, no quantity discount. */
function fixed(id: string, name: string, price: number, opts: { short?: string; from?: boolean; image?: string } = {}): Product {
  return {
    id,
    name,
    short: opts.short,
    image: opts.image,
    qty: { min: 1, max: 100, default: 1 },
    fromPrice: price,
    table: { columns: ['Цена'], rows: [{ label: name, cells: [`${opts.from ? 'от ' : ''}${rub(price)}`] }] },
    quote: (sel) => ({
      unit: price,
      total: price * sel.qty,
      from: opts.from,
      breakdown: [{ label: name, amount: price, per: 'шт' }],
      notes: opts.from ? ['Итоговая цена зависит от размера и макета — менеджер подтвердит её после просмотра.'] : [],
    }),
  };
}

// ---------------------------------------------------------------- textile

/** DTF transfer price per print by format; tiers 1–4 / 5–19 / 20+. */
export const dtfPrint: Record<'a6' | 'a5' | 'a4' | 'a3', { label: string; size: string; tiers: Tier[] }> = {
  a6: { label: 'А6', size: '10×15 см', tiers: tiers([1, 5, 20], [600, 350, 280]) },
  a5: { label: 'А5', size: '15×21 см', tiers: tiers([1, 5, 20], [600, 450, 330]) },
  a4: { label: 'А4', size: '21×28 см', tiers: tiers([1, 5, 20], [800, 650, 450]) },
  a3: { label: 'А3', size: '28×38 см', tiers: tiers([1, 5, 20], [1100, 900, 680]) },
};
type Format = keyof typeof dtfPrint;

/**
 * Several prints on one item: the most expensive print is charged in full, the next one at 70%,
 * the rest at 50% (owner, 01.11.2026). Prints are ranked by price, not by the order they were picked:
 * A6 + A3 + A4 = A3 + A4 −30% + A6 −50%.
 */
export const extraPrintFactor = [1, 0.7, 0.5];

const formatChoices = (formats: Format[], withNone: boolean): Choice[] => [
  ...(withNone ? [{ id: 'none', label: 'Нет' }] : []),
  ...formats.map((f) => ({ id: f, label: dtfPrint[f].label, hint: dtfPrint[f].size })),
];

/** Clothing is priced up to this quantity; larger runs are quoted individually. */
export const GARMENT_MAX = 50;

function garment(args: {
  id: string;
  name: string;
  short: string;
  image?: string;
  /** blank price tiers; omit for "own item" */
  blank?: Tier[];
  /** blank price is a lower bound, availability must be confirmed */
  blankFrom?: boolean;
  formats: Format[];
  /** max number of print places */
  places: number;
  colors?: boolean;
  /** own colour set instead of white/black/other-from-10 (e.g. shopper: light, black, other from 20) */
  colorSet?: { choices: Choice[]; otherMin: number; what: string };
  /** priced up to this quantity, more — individually (default GARMENT_MAX) */
  max?: number;
  /** offer «своя вещь»: e.g. 'футболка' → choice «Своя футболка», only the print is charged */
  own?: string;
}): Product {
  const placeLabels = ['Основной принт', 'Второй принт', 'Третий принт', 'Четвёртый принт'];
  const options: OptionGroup[] = [];
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  if (args.own) {
    options.push({
      id: 'blank',
      label: cap(args.own),
      type: 'one',
      choices: [
        { id: 'ours', label: `Наша ${args.own}`, hint: 'с печатью' },
        { id: 'own', label: `Своя ${args.own}`, hint: 'только печать' },
      ],
      default: 'ours',
    });
  }
  const isOwn = (sel: Selection) => !!args.own && one(sel, 'blank', 'ours') === 'own';
  const colorSet = args.colorSet ?? (args.colors ? { choices: [{ id: 'white', label: 'Белый' }, { id: 'black', label: 'Чёрный' }], otherMin: 10, what: 'Футболки других цветов (кроме белого и чёрного)' } : undefined);
  if (colorSet) {
    options.push({
      ...(args.own ? { hideWhen: { group: 'blank', value: 'own' } } : {}),
      id: 'color',
      label: 'Цвет изделия',
      type: 'one',
      // otherMin 0 → only the listed colours, no «другой цвет»
      choices: colorSet.otherMin ? [...colorSet.choices, { id: 'other', label: 'Другой цвет', hint: `от ${colorSet.otherMin} шт` }] : colorSet.choices,
      default: colorSet.choices[0].id,
    });
  }
  for (let i = 0; i < args.places; i++) {
    options.push({
      id: `print${i + 1}`,
      label: i === 0 ? `${placeLabels[i]} (DTF)` : placeLabels[i],
      type: 'one',
      choices: formatChoices(args.formats, i > 0),
      default: i === 0 ? (args.formats.includes('a4') ? 'a4' : args.formats[0]) : 'none',
      addable: i > 0,
    });
  }
  const prints = (sel: Selection): Format[] => {
    const out: Format[] = [];
    for (let i = 0; i < args.places; i++) {
      const v = one(sel, `print${i + 1}`, i === 0 ? args.formats[0] : 'none');
      if (v !== 'none' && v in dtfPrint) out.push(v as Format);
    }
    return out;
  };
  /** prints ranked from the most expensive to the cheapest, each with its discount factor */
  const ranked = (sel: Selection, qty: number) =>
    prints(sel)
      .map((f) => ({ f, base: dtfPrint[f].tiers.length ? tierPrice(dtfPrint[f].tiers, qty) : 0 }))
      .sort((a, b) => b.base - a.base)
      .map((p, i) => ({ ...p, k: extraPrintFactor[Math.min(i, 2)] }));
  const unitAt = (sel: Selection, qty: number) => {
    let u = args.blank && !isOwn(sel) ? tierPrice(args.blank, qty) : 0;
    for (const p of ranked(sel, qty)) u += p.base * p.k;
    return round(u);
  };
  const breakpoints = (sel: Selection) => {
    const set = new Set<number>([1, 5, 20]);
    args.blank?.forEach((t) => set.add(t.from));
    return [...set].sort((a, b) => a - b).map((from) => ({ from, price: unitAt(sel, from) }));
  };
  const blankMin = args.blank ? minPrice(args.blank) : 0;
  const maxQty = args.max ?? GARMENT_MAX;
  // price table columns: DTF tiers plus the blank's own tiers (caps: 1 / 10 / 30)
  const cols = [...new Set([1, 5, 20, ...(args.blank ?? []).map((t) => t.from)])].sort((a, b) => a - b);
  return {
    id: args.id,
    name: args.name,
    short: args.short,
    image: args.image,
    // owner, 02.11.2026: prices up to 50 pcs; more than 50 — individual price (caps: up to 100)
    qty: { min: 1, max: maxQty, default: 1, individualAbove: true },
    options,
    fromPrice: blankMin + minPrice(dtfPrint[args.formats[0]].tiers),
    table: {
      columns: qtyLabels(cols, { min: 1, max: maxQty, default: 1, individualAbove: true }),
      rows: [
        ...(args.blank
          ? [{ label: args.name, cells: cols.map((q) => `${args.blankFrom ? 'от ' : ''}${rub(tierPrice(args.blank!, q))}`) }]
          : []),
        ...args.formats.map((f) => ({ label: `+ печать DTF ${dtfPrint[f].label}`, cells: cols.map((q) => `+${rub(tierPrice(dtfPrint[f].tiers, q))}`) })),
      ],
      note: `Больше ${maxQty} шт — цена рассчитывается индивидуально.`,
    },
    ladder: breakpoints,
    quote: (sel) => {
      const qty = sel.qty;
      const breakdown: Quote['breakdown'] = [];
      const notes: string[] = [];
      if (args.blank && !isOwn(sel)) {
        breakdown.push({ label: args.blankFrom ? `${args.name} (от)` : args.name, amount: tierPrice(args.blank, qty), per: 'шт' });
      }
      const rp = ranked(sel, qty);
      for (const p of rp) {
        breakdown.push({
          label: `Печать DTF ${dtfPrint[p.f].label}${p.k < 1 ? ` (−${Math.round((1 - p.k) * 100)}%)` : ''}`,
          amount: round(p.base * p.k),
          per: 'шт',
        });
      }
      if (rp.length > 1) notes.push('Несколько принтов: самый дорогой — по полной цене, следующий −30%, остальные −50%.');
      const unit = unitAt(sel, qty);
      const nb = breakpoints(sel).find((t) => t.from > qty && t.price < unit);
      let error: string | undefined;
      if (colorSet && !isOwn(sel) && one(sel, 'color', colorSet.choices[0].id) === 'other' && qty < colorSet.otherMin) {
        error = `${colorSet.what} — под заказ от ${colorSet.otherMin} шт.`;
      }
      if (args.blankFrom && !isOwn(sel)) notes.push('Наличие и точную цену изделия уточнит менеджер.');
      if (isOwn(sel)) notes.push(`${cap(`своя ${args.own}`)}: принесите её в мастерскую, напечатаем на ней. Подойдут хлопок, смесовые ткани, синтетика.`);
      if (!args.blank) notes.push('Печать на вашем изделии. Подойдут хлопок, смесовые ткани, синтетика.');
      if (qty >= maxQty) notes.push(`Нужно больше ${maxQty} шт? Цену рассчитаем индивидуально — отправьте заявку.`);
      return {
        unit,
        total: Math.round(unit * qty),
        from: args.blankFrom && !isOwn(sel),
        breakdown,
        next: nb ? { qty: nb.from, unit: nb.price } : undefined,
        notes,
        error,
      };
    },
  };
}

// ---------------------------------------------------------------- sublimation (owner, 05.11.2026)

/** Sublimation print price per print by format; tiers «до 10 / до 20 / до 50 / от 100 шт» → 1–10 / 11–20 / 21–99 / 100+. */
export const subPrint: Record<'a6' | 'a5' | 'a4' | 'a3', { label: string; size: string; tiers: Tier[] }> = {
  a6: { label: 'А6', size: '10,5×14,8 см', tiers: tiers([1, 11, 21, 100], [175, 110, 80, 60]) },
  a5: { label: 'А5', size: '14,8×21 см', tiers: tiers([1, 11, 21, 100], [240, 150, 100, 80]) },
  a4: { label: 'А4', size: '21×29,7 см', tiers: tiers([1, 11, 21, 100], [400, 210, 150, 130]) },
  a3: { label: 'А3', size: '29,7×42 см', tiers: tiers([1, 11, 21, 100], [600, 380, 250, 200]) },
};
type SubFormat = keyof typeof subPrint;
const subTierFrom = [1, 11, 21, 100];

/** Product priced as optional blank + one or two sublimation prints (each side at its own price). */
function sublimated(args: { id: string; name: string; short: string; image?: string; blank?: Tier[]; min: number; places: number; formats: SubFormat[]; notes: string[]; places_?: string[] }): Product {
  const placeLabels = args.places_ ?? ['Сторона 1', 'Сторона 2'];
  const options: OptionGroup[] = [];
  for (let i = 0; i < args.places; i++) {
    options.push({
      id: `print${i + 1}`,
      label: args.places > 1 ? `${placeLabels[i]} · сублимация` : 'Размер печати · сублимация',
      type: 'one',
      choices: [
        ...(i > 0 ? [{ id: 'none', label: 'Нет' }] : []),
        ...args.formats.map((f) => ({ id: f, label: subPrint[f].label, hint: subPrint[f].size })),
      ],
      default: i === 0 ? (args.formats.includes('a4') ? 'a4' : args.formats[0]) : 'none',
      addable: i > 0,
    });
  }
  const prints = (sel: Selection): SubFormat[] =>
    options.map((g, i) => one(sel, g.id, i === 0 ? args.formats[0] : 'none')).filter((v): v is SubFormat => v in subPrint);
  const unitAt = (sel: Selection, qty: number) =>
    round((args.blank ? tierPrice(args.blank, qty) : 0) + prints(sel).reduce((a, f) => a + tierPrice(subPrint[f].tiers, qty), 0));
  const breaks = [...new Set([args.min, ...subTierFrom.filter((t) => t > args.min), ...(args.blank ?? []).map((t) => t.from)])].sort((a, b) => a - b);
  return {
    id: args.id,
    name: args.name,
    short: args.short,
    image: args.image,
    qty: { min: args.min, max: 2000, default: args.min },
    options,
    fromPrice: (args.blank ? minPrice(args.blank) : 0) + Math.min(...args.formats.map((f) => minPrice(subPrint[f].tiers))),
    table: {
      columns: rangeLabels(subTierFrom),
      rows: [
        ...(args.blank ? [{ label: args.name, cells: subTierFrom.map((q) => rub(tierPrice(args.blank!, Math.max(q, args.min)))) }] : []),
        ...args.formats.map((f) => ({ label: `+ сублимация ${subPrint[f].label}`, cells: subPrint[f].tiers.map((t) => `+${rub(t.price)}`) })),
      ],
    },
    ladder: (sel) => breaks.map((from) => ({ from, price: unitAt(sel, from) })),
    quote: (sel) => {
      const qty = sel.qty;
      const breakdown: Quote['breakdown'] = [];
      if (args.blank) breakdown.push({ label: args.name, amount: tierPrice(args.blank, qty), per: 'шт' });
      prints(sel).forEach((f, i) => breakdown.push({ label: `Сублимация ${subPrint[f].label}${args.places > 1 ? ` (${placeLabels[i].toLowerCase()})` : ''}`, amount: tierPrice(subPrint[f].tiers, qty), per: 'шт' }));
      const unit = unitAt(sel, qty);
      const nb = breaks.map((from) => ({ from, price: unitAt(sel, from) })).find((t) => t.from > qty && t.price < unit);
      return { unit, total: Math.round(unit * qty), breakdown, next: nb ? { qty: nb.from, unit: nb.price } : undefined, notes: args.notes };
    },
  };
}

const textile: Category = {
  id: 'textile',
  name: 'Одежда и текстиль',
  page: '/pechat-na-futbolkah',
  products: [
    garment({
      id: 'tshirt-unisex',
      name: 'Футболка унисекс',
      short: '160–180 г/м², белая или чёрная',
      image: '/img/showcase/tshirt.webp',
      blank: tiers([1, 5, 20], [750, 650, 550]),
      formats: ['a6', 'a5', 'a4', 'a3'],
      places: 4,
      colors: true,
      own: 'футболка',
    }),
    garment({
      id: 'tshirt-kids',
      name: 'Футболка детская',
      short: '100% хлопок, размеры 98–164',
      image: '/img/showcase/tshirt.webp',
      blank: tiers([1, 5, 20], [750, 550, 500]),
      formats: ['a6', 'a5', 'a4'],
      places: 2,
      colors: true,
    }),
    garment({
      id: 'hoodie',
      name: 'Худи',
      short: 'уточняйте наличие',
      image: '/img/showcase/hoodie.webp',
      blank: tiers([1], [2000]),
      blankFrom: true,
      formats: ['a6', 'a5', 'a4', 'a3'],
      places: 4,
    }),
    garment({
      id: 'oversize',
      name: 'Футболка оверсайз',
      short: 'от 180 г/м², уточняйте наличие',
      image: '/img/showcase/tshirt.webp',
      blank: tiers([1], [1200]),
      blankFrom: true,
      formats: ['a6', 'a5', 'a4', 'a3'],
      places: 3,
    }),
    garment({
      id: 'polo',
      name: 'Поло',
      short: 'уточняйте наличие',
      image: '/portfolio/corporate-polo.webp',
      blank: tiers([1], [1200]),
      blankFrom: true,
      formats: ['a6', 'a5', 'a4'],
      places: 2,
    }),
    garment({
      id: 'cap',
      name: 'Бейсболка',
      short: 'TEXTILLER, 100% хлопок, саржа, 5 панелей',
      image: '/img/showcase/cap.webp',
      // owner, 06.11.2026: 1–9 — 650, 10–29 — 550, 30–100 — 450; print priced as DTF A6; more than 100 — individually
      blank: tiers([1, 10, 30], [650, 550, 450]),
      formats: ['a6'],
      // owner, 06.11.2026: front (≈11×6 cm), side (size depends on the cap), back above the clasp; own cap — print only
      places: 3,
      own: 'бейсболка',
      max: 100,
      colorSet: {
        choices: [
          { id: 'black', label: 'Чёрный', swatch: '#111111' },
          { id: 'white', label: 'Белый', swatch: '#ffffff' },
          { id: 'red', label: 'Красный', swatch: '#e10f0f' },
          { id: 'blue', label: 'Синий', swatch: '#2a5be8' },
          { id: 'yellow', label: 'Жёлтый', swatch: '#ffee00' },
          { id: 'green', label: 'Зелёный', swatch: '#0f8a0f' },
          { id: 'khaki', label: 'Хаки', swatch: '#7d6a2c' },
        ],
        otherMin: 0,
        what: '',
      },
    }),
    garment({
      id: 'shopper',
      name: 'Шоппер',
      short: 'хлопковая сумка',
      image: '/img/showcase/shopper.webp',
      blank: tiers([1, 5, 20], [450, 350, 250]),
      formats: ['a6', 'a5', 'a4'],
      places: 2,
      // owner, 05.11.2026: light (linen-like) and black in stock, any other colour sewn to order from 20 pcs
      colorSet: { choices: [{ id: 'light', label: 'Светлый', hint: 'как лён' }, { id: 'black', label: 'Чёрный' }], otherMin: 20, what: 'Шопперы другого цвета шьём' },
    }),
    // owner, 05.11.2026: light linen shopper for sublimation, from 10 pcs
    sublimated({
      id: 'shopper-sub',
      name: 'Шоппер для сублимации',
      short: 'небелёный лён, 330 г/м², от 10 шт',
      image: '/img/showcase/shopper.webp',
      blank: tiers([10, 50], [250, 230]),
      min: 10,
      places: 2,
      formats: ['a6', 'a5', 'a4', 'a3'],
      notes: ['Светлый шоппер цвета небелёного льна, 330 г/м², 36×42 см (±3 см), ручки 70 см. Сублимация — яркая полноцветная печать, от 10 шт.'],
    }),
    // owner, 05.11.2026: synthetic t-shirt for sublimation, 720 ₽, from 10 pcs
    sublimated({
      id: 'tshirt-sub',
      name: 'Футболка для сублимации',
      short: '50% полиэстер / 50% хлопок, от 10 шт',
      image: '/img/showcase/tshirt.webp',
      blank: tiers([10], [720]),
      min: 10,
      places: 2,
      places_: ['Перед', 'Спина'],
      formats: ['a6', 'a5', 'a4', 'a3'],
      notes: ['Белая футболка для сублимации: 50% полиэстер / 50% хлопок, кулирная гладь, 180 г/м², Россия. Размеры детские 128–152 и взрослые 42–60 (XS–6XL). Заказ от 10 шт.'],
    }),
    sublimated({
      id: 'sub-print',
      name: 'Сублимационная печать',
      short: 'на вашем изделии из светлой синтетики',
      min: 1,
      places: 1,
      formats: ['a6', 'a5', 'a4', 'a3'],
      notes: ['Сублимация подходит для светлых тканей из полиэстера и изделий с полимерным покрытием. Подойдёт ли ваше изделие — подскажем.'],
    }),
    garment({
      id: 'apron',
      name: 'Фартук',
      short: 'уточняйте наличие',
      blank: tiers([1], [1000]),
      blankFrom: true,
      formats: ['a6', 'a5', 'a4'],
      places: 1,
    }),
    garment({
      id: 'own-item',
      name: 'Печать на вашем изделии',
      short: 'принесите свою вещь',
      formats: ['a6', 'a5', 'a4', 'a3'],
      places: 3,
    }),
  ],
};

// ---------------------------------------------------------------- mugs

// Tiers: 1–4 / 5–9 / 10–49 / 50–199 / 200+ — price includes the mug and the print.
const mugTiers = [1, 5, 10, 50, 200];

const mugs: Category = {
  id: 'mugs',
  name: 'Кружки',
  page: '/pechat-na-kruzhkah',
  products: [
    tiered({
      id: 'mug',
      name: 'Кружка 330 мл',
      short: 'классическая, d=82 мм — кружка и печать в цене',
      image: '/img/showcase/mug.webp',
      qty: { min: 1, max: 300, default: 1 },
      variantLabel: 'Вид кружки',
      variants: [
        { id: 'white', label: 'Белая', hint: '330 мл', tiers: tiers(mugTiers, [650, 450, 350, 315, 250]) },
        { id: 'color', label: 'Цветная внутри или ручка', tiers: tiers(mugTiers, [750, 550, 470, 425, 340]) },
        { id: 'chameleon', label: 'Хамелеон', hint: 'рисунок проявляется от горячего', tiers: tiers(mugTiers, [1100, 980, 890, 815, 650]) },
        { id: 'glitter', label: 'Глиттер', hint: '4 цвета блёсток', tiers: tiers(mugTiers, [1630, 980, 890, 815, 650]) },
        { id: 'marble', label: 'Мрамор, зеркальное золото или серебро', hint: '3 цвета мрамора', tiers: tiers(mugTiers, [1945, 1170, 1070, 970, 780]) },
        { id: 'gold', label: 'Золото, серебро, стекло', tiers: tiers(mugTiers, [1320, 790, 730, 660, 530]) },
      ],
      choices: [
        {
          // owner, 04.11.2026: 9 colours of the handle and the inside
          id: 'inner',
          label: 'Цвет ручки и внутри',
          type: 'one',
          showWhen: { group: 'variant', value: 'color' },
          choices: [
            { id: 'navy', label: 'Тёмно-синий', swatch: '#0d1f8c' },
            { id: 'darkgreen', label: 'Тёмно-зелёный', swatch: '#0f5a40' },
            { id: 'black', label: 'Чёрный', swatch: '#141414' },
            { id: 'pink', label: 'Розовый', swatch: '#efb3c2' },
            { id: 'blue', label: 'Синий', swatch: '#2c5fd6' },
            { id: 'lime', label: 'Салатовый', swatch: '#7ed321' },
            { id: 'red', label: 'Красный', swatch: '#d9261c' },
            { id: 'orange', label: 'Оранжевый', swatch: '#f26a1b' },
            { id: 'yellow', label: 'Жёлтый', swatch: '#f6c21a' },
          ],
          default: 'red',
        },
        {
          // owner's photo, 04.11.2026
          id: 'glitter',
          label: 'Цвет глиттера',
          type: 'one',
          showWhen: { group: 'variant', value: 'glitter' },
          choices: [
            { id: 'gold', label: 'Золотой', swatch: '#e2bf3c' },
            { id: 'silver', label: 'Серебряный', swatch: '#c9ccd0' },
            { id: 'turquoise', label: 'Бирюзовый', swatch: '#8fcbd0' },
            { id: 'pink', label: 'Розовый', swatch: '#ea9ccb' },
          ],
          default: 'gold',
        },
        {
          id: 'marble',
          label: 'Покрытие',
          type: 'one',
          showWhen: { group: 'variant', value: 'marble' },
          choices: [
            { id: 'grey', label: 'Мрамор серый', swatch: '#8e8b94' },
            { id: 'pink', label: 'Мрамор розовый', swatch: '#e88a98' },
            { id: 'blue', label: 'Мрамор голубой', swatch: '#7fb0dc' },
            { id: 'mgold', label: 'Зеркальное золото', swatch: '#d4af37' },
            { id: 'msilver', label: 'Зеркальное серебро', swatch: '#bfc3c8' },
          ],
          default: 'grey',
        },
      ],
      notes: ['Кружка для сублимации 330 мл, d=82 мм. Цена включает кружку, печать по кругу и подготовку макета.'],
    }),
    // owner, 04.11.2026
    tiered({
      id: 'mug-big',
      name: 'Кружка 425 мл',
      short: 'увеличенной ёмкости, белая, d=82 мм',
      image: '/img/showcase/mug.webp',
      qty: { min: 1, max: 300, default: 1 },
      variants: [{ id: 'white', label: 'Белая 425 мл', tiers: tiers(mugTiers, [800, 600, 500, 425, 400]) }],
      notes: ['Кружка для сублимации увеличенной ёмкости, 425 мл, d=82 мм. Цена включает кружку и печать.'],
    }),
    tiered({
      id: 'coffee-set',
      name: 'Кофейный набор',
      short: 'чашка 150 мл, блюдце и ложка, белый',
      image: '/img/showcase/mug.webp',
      qty: { min: 1, max: 300, default: 1 },
      variants: [{ id: 'white', label: 'Белый 150 мл', tiers: tiers(mugTiers, [1630, 980, 890, 815, 650]) }],
      notes: ['Кофейный набор для сублимации: чашка 150 мл (d=78 мм), блюдце и ложка. Цена включает набор и печать.'],
    }),
    tiered({
      id: 'beer-mug',
      name: 'Пивная кружка 600 мл',
      short: 'белая, d=82 мм',
      image: '/img/mug/gallery-3.jpg',
      qty: { min: 1, max: 300, default: 1 },
      variants: [{ id: 'white', label: 'Белая 600 мл', tiers: tiers(mugTiers, [950, 800, 750, 690, 650]) }],
      notes: ['Пивная кружка для сублимации, 600 мл, d=82 мм. Цена включает кружку и печать.'],
    }),
  ],
};

// ---------------------------------------------------------------- badges, keychains, magnets

// pin badges: first discount from 50 pcs (owner, 05.11.2026; was 100), prices unchanged
const badgeTiers = [25, 50, 200, 300, 400, 500];
// roll badges (owner, 05.11.2026): from 50 pcs −30%, from 100 pcs −50% of the 10–49 price; 200+ unchanged
const rollTiers = [10, 50, 100, 200, 300, 400, 500];
const rollPrices = (base: number, rest: number[]) => [base, Math.round(base * 7) / 10, Math.round(base * 5) / 10, ...rest];

const badges: Category = {
  id: 'badges',
  name: 'Значки',
  page: '/znachki',
  products: [
    tiered({
      id: 'badge-roll',
      name: 'Значок закатной',
      short: 'круглый, на булавке',
      image: '/img/showcase/keychains.webp',
      qty: { min: 10, max: 1000, default: 25 },
      variantLabel: 'Диаметр',
      variants: [
        { id: 'd38', label: '38 мм', tiers: tiers(rollTiers, rollPrices(85, [38, 35, 32, 30])) },
        { id: 'd56', label: '56 мм', tiers: tiers(rollTiers, rollPrices(100, [45, 41, 38, 33])) },
      ],
    }),
    tiered({
      id: 'badge-pin',
      name: 'Значок на цанге',
      short: 'металлический, круглый',
      qty: { min: 25, max: 1000, default: 25 },
      variantLabel: 'Диаметр',
      variants: [
        { id: 'd15', label: '15 мм', tiers: tiers(badgeTiers, [120, 110, 100, 92, 85, 75]) },
        { id: 'd25', label: '25 мм', tiers: tiers(badgeTiers, [200, 185, 170, 155, 140, 125]) },
        { id: 'd30', label: '30 мм', tiers: tiers(badgeTiers, [250, 230, 210, 190, 170, 150]) },
        { id: 'd35', label: '35 мм', tiers: tiers(badgeTiers, [310, 285, 260, 240, 210, 190]) },
      ],
    }),
  ],
};

const keychains: Category = {
  id: 'keychains',
  name: 'Брелоки',
  page: '/breloki',
  products: [
    tiered({
      id: 'keychain-acrylic',
      name: 'Брелок акриловый',
      short: '40×56 мм, печать с двух сторон',
      image: '/img/showcase/keychains.webp',
      qty: { min: 1, max: 1000, default: 1 },
      variants: [{ id: 'std', label: '40×56 мм', tiers: tiers([1, 25, 100, 200, 300, 400, 500], [150, 130, 65, 60, 54, 49, 43]) }],
    }),
    tiered({
      id: 'keychain-metal',
      name: 'Брелок металлический',
      short: 'с полноцветной печатью',
      qty: { min: 1, max: 1000, default: 1 },
      variants: [{ id: 'std', label: 'Металл', tiers: tiers([1, 100, 200, 300, 400, 500], [500, 420, 400, 380, 350, 330]) }],
    }),
  ],
};

const magnetTiers = [100, 200, 300, 400, 500];

const magnets: Category = {
  id: 'magnets',
  name: 'Магниты',
  page: '/magnity',
  products: [
    tiered({
      id: 'magnet-vinyl',
      name: 'Магнит виниловый',
      short: 'тиражи от 100 шт',
      qty: { min: 100, max: 3000, default: 100 },
      variantLabel: 'Размер',
      variants: [
        { id: 'r4060', label: '40×60 мм', tiers: tiers(magnetTiers, [35, 30, 28, 28, 26]) },
        { id: 's6060', label: '60×60 мм', tiers: tiers(magnetTiers, [36, 31, 30, 29, 28]) },
        { id: 'r6080', label: '60×80 мм', tiers: tiers(magnetTiers, [39, 35, 33, 30, 29]) },
        { id: 'c68', label: 'Круг 68 мм', tiers: tiers(magnetTiers, [36, 31, 30, 29, 28]) },
        { id: 'c50', label: 'Круг 50 мм', tiers: tiers(magnetTiers, [35, 30, 28, 28, 26]) },
      ],
    }),
    tiered({
      id: 'magnet-acrylic',
      name: 'Магнит акриловый',
      short: 'тиражи от 100 шт',
      qty: { min: 100, max: 3000, default: 100 },
      variantLabel: 'Размер',
      variants: [
        { id: 's105', label: '105×105 мм', tiers: tiers(magnetTiers, [160, 140, 120, 110, 90]) },
        { id: 'r10570', label: '105×70 мм', tiers: tiers(magnetTiers, [160, 140, 120, 110, 90]) },
        { id: 'r8055', label: '80×55 мм', tiers: tiers(magnetTiers, [130, 100, 90, 80, 75]) },
      ],
    }),
    fixed('photo-magnet', 'Фотомагнит акриловый, 1 шт', 250, { short: 'подарок с вашим фото' }),
  ],
};

// ---------------------------------------------------------------- 3D stickers (area)
// Owner (05.11.2026): epoxy 3D stickers, minimum 30 pcs; 5 ₽/см² simple cut, 7 ₽/см² complex cut;
// −5% from 100 pcs, −10% from 200 pcs. A sticker pack (several designs) is priced by the same formula
// (or individually); a set of 3×3 cm stickers: 3 pcs — 200 ₽/шт, 5 — 150 ₽/шт, 10–30 — 100 ₽/шт.
// Owner (05.11.2026, later): epoxy stickers up to 300 pcs, packs 10–200, more — individually; a set above 30 pcs
// is counted as epoxy stickers. Vinyl contour-cut stickers (matte or gloss, cut does not change the price):
// from 100 pcs, 100–299 — 0.25 ₽/см², 300+ — 0.2 ₽/см²; vinyl sticker packs from 50: А6 80 / А5 120, from 100: 70 / 105.

export const STICKER_MIN = 30;
export const stickerRate = { simple: 5, complex: 7 } as const;
/** discount by the total number of stickers in the order */
export const stickerDiscounts = [
  { from: 100, off: 0.05 },
  { from: 200, off: 0.1 },
];
const stickerOff = (count: number) => stickerDiscounts.filter((d) => count >= d.from).reduce((m, d) => Math.max(m, d.off), 0);
const cutGroup: OptionGroup = {
  id: 'cut',
  label: 'Вырубка',
  type: 'one',
  choices: [
    { id: 'simple', label: 'Простая', hint: `круг, квадрат, прямоугольник · ${stickerRate.simple} ₽/см²` },
    { id: 'complex', label: 'Сложная', hint: `по контуру рисунка · ${stickerRate.complex} ₽/см²` },
  ],
  default: 'simple',
};
const baseRateOf = (sel: Selection) => (one(sel, 'cut', 'simple') === 'complex' ? stickerRate.complex : stickerRate.simple);
/** small 3D stickers (owner, 05.11.2026): area under 4 cm² — +30% to the price */
export const SMALL_STICKER_AREA = 4;
export const SMALL_STICKER_EXTRA = 0.3;
const isSmall = (sel: Selection) => (sel.dims.w ?? 4) * (sel.dims.h ?? 4) < SMALL_STICKER_AREA;
/** price per cm² with the small-size surcharge */
const rateOf = (sel: Selection) => round(baseRateOf(sel) * (isSmall(sel) ? 1 + SMALL_STICKER_EXTRA : 1));
const smallNote = `Стикер меньше ${SMALL_STICKER_AREA} см² — цена +${Math.round(SMALL_STICKER_EXTRA * 100)}%.`;
export const STICKER_MAX = 300;
/** minimum order sum for single stickers (epoxy and vinyl), owner 05.11.2026 */
export const STICKER_MIN_SUM = 850;
/** smallest run for a size: the base minimum, or more — rounded up to tens — so the order is at least STICKER_MIN_SUM */
const minRun = (base: number, max: number, unitAt: (qty: number) => number) => {
  if (base * unitAt(base) >= STICKER_MIN_SUM) return base;
  let n = Math.ceil(base / 10) * 10;
  while (n < max && n * unitAt(n) < STICKER_MIN_SUM) n += 10;
  return Math.min(n, max);
};
export const PACK_MIN = 10;
export const PACK_MAX = 200;
const stickerTable = (label: string): PriceTable => ({
  columns: [`${STICKER_MIN}–99 шт`, '100–199 шт', `200–${STICKER_MAX} шт`],
  rows: [
    { label: `${label}: простая вырубка, за см²`, cells: [0, 0.05, 0.1].map((o) => rub(round(stickerRate.simple * (1 - o)))) },
    { label: `${label}: сложная вырубка, за см²`, cells: [0, 0.05, 0.1].map((o) => rub(round(stickerRate.complex * (1 - o)))) },
  ],
  note: `Стикер меньше ${SMALL_STICKER_AREA} см² — +${Math.round(SMALL_STICKER_EXTRA * 100)}% к цене. Минимальный заказ — ${STICKER_MIN} стикеров и не меньше ${STICKER_MIN_SUM} ₽ (для маленьких стикеров — больше штук), больше ${STICKER_MAX} — индивидуально. Цена стикера = площадь (ширина × высота, см²) × цена за см².`,
});
const PACK_SIZES = [3, 4, 5, 6, 8, 10, 12];
const epoxyMin = (sel: Selection) =>
  minRun(STICKER_MIN, STICKER_MAX, (n) => round((sel.dims.w ?? 4) * (sel.dims.h ?? 4) * rateOf(sel) * (1 - stickerOff(n))));
const minError = (n: number, w: number, h: number) =>
  `Минимальный заказ — ${STICKER_MIN_SUM} ₽: стикеров ${w}×${h} см — от ${n} шт.`;

// vinyl contour-cut stickers: price per cm² by the number of stickers, the cut does not change the price
export const VINYL_MIN = 100;
export const VINYL_PACK_MIN = 50;
export const vinylTiers: Tier[] = tiers([VINYL_MIN, 300], [0.25, 0.2]);
const vinylRate = (qty: number) => [...vinylTiers].reverse().find((t) => qty >= t.from)?.price ?? vinylTiers[0].price;
const vinylMin = (sel: Selection) => minRun(VINYL_MIN, 10000, (n) => round((sel.dims.w ?? 5) * (sel.dims.h ?? 5) * vinylRate(n)));
const vinylFilm: OptionGroup = {
  id: 'film',
  label: 'Плёнка',
  type: 'one',
  choices: [
    { id: 'gloss', label: 'Глянцевая' },
    { id: 'matte', label: 'Матовая' },
  ],
  default: 'gloss',
};
const vinylSticker: Product = {
  id: 'vinyl-sticker',
  name: 'Виниловые стикеры с контурной резкой',
  short: `глянец или мат, от ${VINYL_MIN} шт`,
  image: '/img/showcase/stickers-3d.webp',
  qty: { min: VINYL_MIN, max: 10000, default: 140 },
  options: [vinylFilm],
  dims: [
    { id: 'w', label: 'Ширина', unit: 'см', min: 1, max: 30, default: 5 },
    { id: 'h', label: 'Высота', unit: 'см', min: 1, max: 30, default: 5 },
  ],
  fromPrice: vinylTiers[vinylTiers.length - 1].price,
  fromUnit: 'см²',
  table: {
    columns: [`${VINYL_MIN}–299 шт`, 'от 300 шт'],
    rows: [{ label: 'Виниловый стикер, за см²', cells: vinylTiers.map((t) => rub(t.price)) }],
    note: `Минимальный заказ — ${VINYL_MIN} стикеров и не меньше ${STICKER_MIN_SUM} ₽ (для маленьких стикеров — больше штук). Цена стикера = площадь (ширина × высота, см²) × цена за см², форма вырубки на цену не влияет.`,
  },
  minQty: (sel) => vinylMin(sel),
  ladder: (sel) => {
    const first = vinylMin(sel);
    const area = (sel.dims.w ?? 5) * (sel.dims.h ?? 5);
    return [{ from: first, price: round(area * vinylRate(first)) }, ...vinylTiers.filter((t) => t.from > first).map((t) => ({ from: t.from, price: round(area * t.price) }))];
  },
  quote: (sel) => {
    const w = sel.dims.w ?? 5;
    const h = sel.dims.h ?? 5;
    const area = round(w * h);
    const rate = vinylRate(sel.qty);
    const unit = round(area * rate);
    const next = vinylTiers.find((t) => t.from > sel.qty);
    return {
      unit,
      total: Math.round(unit * sel.qty),
      breakdown: [{ label: `Стикер ${w}×${h} см, ${one(sel, 'film', 'gloss') === 'matte' ? 'матовая' : 'глянцевая'} плёнка`, amount: unit, per: 'шт' }],
      next: next ? { qty: next.from, unit: round(area * next.price) } : undefined,
      notes: [`Площадь стикера ${String(area).replace('.', ',')} см² × ${String(rate).replace('.', ',')} ₽/см².`],
      error: sel.qty < vinylMin(sel) ? minError(vinylMin(sel), w, h) : undefined,
    };
  },
};

const stickers: Category = {
  id: 'stickers',
  name: 'Стикеры',
  page: '/nakleyki',
  products: [
    {
      id: 'sticker-3d',
      name: '3D-стикеры с эпоксидной смолой',
      short: `объёмные наклейки, от ${STICKER_MIN} шт`,
      image: '/img/showcase/stickers-3d.webp',
      qty: { min: STICKER_MIN, max: STICKER_MAX, default: 50, individualAbove: true },
      options: [cutGroup],
      dims: [
        { id: 'w', label: 'Ширина', unit: 'см', min: 1, max: 20, default: 4 },
        { id: 'h', label: 'Высота', unit: 'см', min: 1, max: 20, default: 4 },
      ],
      fromPrice: stickerRate.simple,
      fromUnit: 'см²',
      table: stickerTable('Стикер'),
      minQty: (sel) => epoxyMin(sel),
      ladder: (sel) => {
        const base = round((sel.dims.w ?? 4) * (sel.dims.h ?? 4) * rateOf(sel));
        const first = epoxyMin(sel);
        return [{ from: first, price: base }, ...stickerDiscounts.filter((d) => d.from > first).map((d) => ({ from: d.from, price: round(base * (1 - d.off)) }))];
      },
      quote: (sel) => {
        const rate = rateOf(sel);
        const w = sel.dims.w ?? 4;
        const h = sel.dims.h ?? 4;
        const area = round(w * h);
        const off = stickerOff(sel.qty);
        const unit = round(area * rate * (1 - off));
        const notes = [`Площадь стикера ${String(area).replace('.', ',')} см² × ${String(rate).replace('.', ',')} ₽/см²${off ? ` − ${Math.round(off * 100)}% за тираж` : ''}.`];
        if (isSmall(sel)) notes.push(smallNote);
        const next = stickerDiscounts.find((d) => d.from > sel.qty);
        return {
          unit,
          total: Math.round(unit * sel.qty),
          breakdown: [{ label: `Стикер ${w}×${h} см, ${baseRateOf(sel) === stickerRate.complex ? 'сложная' : 'простая'} вырубка${isSmall(sel) ? ', маленький +30%' : ''}${off ? ` (−${Math.round(off * 100)}%)` : ''}`, amount: unit, per: 'шт' }],
          next: next ? { qty: next.from, unit: round(area * rate * (1 - next.off)) } : undefined,
          notes,
          error: sel.qty < epoxyMin(sel) ? minError(epoxyMin(sel), w, h) : undefined,
        };
      },
    },
    {
      id: 'sticker-pack',
      name: 'Стикерпак из 3D-стикеров',
      short: 'набор из нескольких разных стикеров',
      image: '/img/showcase/stickers-3d.webp',
      qty: { min: PACK_MIN, max: PACK_MAX, default: PACK_MIN, individualAbove: true },
      options: [
        {
          id: 'count',
          label: 'Стикеров в одном наборе',
          type: 'one',
          choices: PACK_SIZES.map((n) => ({ id: String(n), label: `${n} шт` })),
          default: '6',
        },
        cutGroup,
      ],
      dims: [
        { id: 'w', label: 'Ширина стикера', unit: 'см', min: 1, max: 20, default: 4 },
        { id: 'h', label: 'Высота стикера', unit: 'см', min: 1, max: 20, default: 4 },
      ],
      fromPrice: stickerRate.simple,
      fromUnit: 'см²',
      table: {
        columns: ['Цена'],
        rows: [{ label: 'Стикерпак', cells: ['по той же цене за см²'] }],
        note: `Стикеры в наборе считаются по площади, как отдельные; от ${PACK_MIN} до ${PACK_MAX} наборов, больше — индивидуально. Стикеры разного размера — посчитаем индивидуально.`,
      },
      ladder: (sel) => {
        const n = Number(one(sel, 'count', '6'));
        const per = (sel.dims.w ?? 4) * (sel.dims.h ?? 4) * rateOf(sel) * n;
        const breaks = [...new Set([PACK_MIN, ...stickerDiscounts.map((d) => Math.max(PACK_MIN, Math.ceil(d.from / n)))])].sort((x, y) => x - y);
        return breaks.map((from) => ({ from, price: round(per * (1 - stickerOff(from * n))) }));
      },
      quote: (sel) => {
        const n = Number(one(sel, 'count', '6'));
        const rate = rateOf(sel);
        const w = sel.dims.w ?? 4;
        const h = sel.dims.h ?? 4;
        const count = n * sel.qty;
        const off = stickerOff(count);
        const sticker = round(w * h * rate * (1 - off));
        const unit = round(sticker * n);
        const next = stickerDiscounts.find((d) => d.from > count);
        const packsMin = Math.max(PACK_MIN, Math.ceil(STICKER_MIN / n));
        return {
          unit,
          total: Math.round(unit * sel.qty),
          breakdown: [{ label: `${n} стикеров ${w}×${h} см по ${rub(sticker)}${off ? ` (−${Math.round(off * 100)}%)` : ''}`, amount: unit, per: 'шт' }],
          next: next ? { qty: Math.ceil(next.from / n), unit: round(w * h * rate * (1 - next.off) * n) } : undefined,
          notes: [
            `В заказе ${count} стикеров (${sel.qty} × ${n}). Скидка считается по общему числу стикеров: −5% от 100, −10% от 200.`,
            'Стикеры разного размера или сложная раскладка — посчитаем индивидуально.',
            ...(isSmall(sel) ? [smallNote] : []),
          ],
          error: sel.qty < packsMin ? `Минимальный заказ — ${packsMin} наборов.` : undefined,
        };
      },
    },
    tiered({
      id: 'sticker-set',
      name: 'Набор 3D-стикеров 3×3 см',
      short: 'по вашим фото или картинкам, от 3 шт',
      image: '/img/showcase/stickers-3d.webp',
      qty: { min: 3, max: 30, default: 3, moreIn: { product: 'sticker-3d', label: 'как 3D-стикеры', dims: { w: 3, h: 3 } } },
      variants: [{ id: 'std', label: '3×3 см', tiers: tiers([3, 5, 10], [200, 150, 100]) }],
      notes: ['Стикеры 3×3 см по вашим фото или картинкам. От 30 шт выгоднее считать как 3D-стикеры из эпоксидной смолы — по цене за см².'],
    }),
    vinylSticker,
    tiered({
      id: 'vinyl-pack',
      name: 'Стикерпак на виниловой плёнке',
      short: `А6 или А5, контурная резка, от ${VINYL_PACK_MIN} шт`,
      image: '/img/showcase/stickers-3d.webp',
      qty: { min: VINYL_PACK_MIN, max: 200, default: VINYL_PACK_MIN, individualAbove: true },
      variantLabel: 'Формат листа',
      variants: [
        { id: 'a6', label: 'А6', hint: '10,5 × 14,8 см', tiers: tiers([VINYL_PACK_MIN, 100], [80, 70]) },
        { id: 'a5', label: 'А5', hint: '14,8 × 21 см', tiers: tiers([VINYL_PACK_MIN, 100], [120, 105]) },
      ],
      choices: [vinylFilm],
      notes: ['Лист со стикерами на виниловой плёнке с контурной резкой; цена не зависит от формы вырубки.'],
    }),
  ],
};

// ---------------------------------------------------------------- print: cards, flyers, notebooks, office

const cards: Category = {
  id: 'cards',
  name: 'Визитки',
  page: '/vizitki',
  products: [
    tiered({
      id: 'business-cards',
      name: 'Визитки 90×50 мм',
      short: 'цифровая печать, бумага 300 г, глянец или мат',
      image: '/img/showcase/business-cards.webp',
      // Owner, 01.11.2026: fixed runs 96 / 200 / 300, from 500 any quantity
      qty: { min: 96, max: 20000, default: 96, presets: [96, 200, 300], freeFrom: 500 },
      variantLabel: 'Печать',
      variants: [
        { id: 's1', label: 'Односторонняя', hint: '4+0', tiers: tiers([96, 200, 300, 500, 1000, 6000], [6.2, 4.9, 4, 3.5, 3.2, 2.4]) },
        { id: 's2', label: 'Двусторонняя', hint: '4+4', tiers: tiers([96, 200, 300, 500, 1000, 6000], [9.6, 7.1, 5.9, 5, 4.7, 3.2]) },
      ],
      choices: [
        {
          id: 'paper',
          label: 'Бумага 300 г',
          type: 'one',
          choices: [
            { id: 'gloss', label: 'Глянцевая' },
            { id: 'matte', label: 'Матовая' },
          ],
          default: 'gloss',
        },
      ],
      notes: ['До 500 шт визитки печатаются тиражами 96, 200 или 300 шт, от 500 шт — любое количество. Срок — от 1 дня. Глянцевая и матовая бумага — по одной цене.'],
    }),
  ],
};

type FlyerRow = { s: number[]; d: number[] };
const flyerPrices: Record<string, { label: string; hint: string; thin: FlyerRow; thick: FlyerRow }> = {
  a3: { label: 'А3', hint: '297×420 мм', thin: { s: [65, 56, 45], d: [110, 97, 86] }, thick: { s: [120, 108, 96], d: [195, 175, 155] } },
  a4: { label: 'А4', hint: '210×297 мм', thin: { s: [40, 34, 30], d: [60, 54, 48] }, thick: { s: [80, 70, 62], d: [125, 113, 100] } },
  a5: { label: 'А5', hint: '148×210 мм', thin: { s: [25, 20, 18], d: [35, 30, 27] }, thick: { s: [40, 35, 31], d: [65, 56, 50] } },
  euro: { label: 'Еврофлаер', hint: '1/3 А4', thin: { s: [15, 14, 13], d: [25, 20, 18] }, thick: { s: [25, 23, 21], d: [45, 38, 34] } },
  a6: { label: 'А6', hint: '105×148 мм', thin: { s: [25, 20, 18], d: [25, 20, 18] }, thick: { s: [20, 18, 16], d: [30, 29, 25] } },
};
const flyerTierFrom = [50, 100, 200];

const flyerTiers = (sel: Selection): Tier[] => {
  const f = flyerPrices[one(sel, 'format', 'a4')] ?? flyerPrices.a4;
  const paper = one(sel, 'paper', 'thin') === 'thick' ? f.thick : f.thin;
  return tiers(flyerTierFrom, one(sel, 'sides', 's') === 'd' ? paper.d : paper.s);
};

const flyers: Category = {
  id: 'flyers',
  name: 'Листовки и полиграфия',
  page: '/poligrafiya',
  products: [
    {
      id: 'flyers',
      name: 'Листовки и флаеры',
      short: 'цифровая печать от 50 шт',
      image: '/img/showcase/stationery.webp',
      qty: { min: 50, max: 2000, default: 100 },
      options: [
        { id: 'format', label: 'Формат', type: 'one', choices: Object.entries(flyerPrices).map(([id, f]) => ({ id, label: f.label, hint: f.hint })), default: 'a4' },
        {
          id: 'paper',
          label: 'Бумага',
          type: 'one',
          choices: [
            { id: 'thin', label: 'Офсетная 80 г', hint: 'тонкая' },
            { id: 'thick', label: 'Плотная 115–300 г', hint: 'мелованная' },
          ],
          default: 'thin',
        },
        {
          id: 'sides',
          label: 'Печать',
          type: 'one',
          choices: [
            { id: 's', label: 'Односторонняя' },
            { id: 'd', label: 'Двусторонняя' },
          ],
          default: 's',
        },
      ],
      fromPrice: 13,
      table: {
        columns: rangeLabels(flyerTierFrom),
        rows: Object.values(flyerPrices).flatMap((f) => [
          { label: `${f.label}, 80 г, 1 сторона`, cells: f.thin.s.map(rub) },
          { label: `${f.label}, 80 г, 2 стороны`, cells: f.thin.d.map(rub) },
          { label: `${f.label}, 115–300 г, 1 сторона`, cells: f.thick.s.map(rub) },
          { label: `${f.label}, 115–300 г, 2 стороны`, cells: f.thick.d.map(rub) },
        ]),
      },
      ladder: flyerTiers,
      quote: (sel) => {
        const t = flyerTiers(sel);
        const unit = tierPrice(t, sel.qty);
        const nt = nextTier(t, sel.qty);
        return {
          unit,
          total: Math.round(unit * sel.qty),
          breakdown: [{ label: `Листовка ${flyerPrices[one(sel, 'format', 'a4')]?.label ?? 'А4'}`, amount: unit, per: 'шт' }],
          next: nt ? { qty: nt.from, unit: nt.price } : undefined,
          notes: [],
        };
      },
    },
    tiered({
      id: 'notebook',
      name: 'Блокнот с вашей обложкой',
      short: '40 листов',
      image: '/img/showcase/stationery.webp',
      qty: { min: 20, max: 1000, default: 20 },
      variantLabel: 'Формат',
      variants: [
        { id: 'a5', label: 'А5', tiers: tiers([20, 50, 100, 200, 300], [150, 110, 100, 95, 80]) },
        { id: 'a6', label: 'А6', tiers: tiers([20, 50, 100, 200, 300], [85, 75, 70, 65, 60]) },
      ],
    }),
    tiered({
      id: 'office',
      name: 'Печать документов',
      short: 'ч/б и цветная, от 1 листа',
      qty: { min: 1, max: 500, default: 10 },
      variantLabel: 'Формат и цвет',
      variants: [
        { id: 'a4bw', label: 'А4 ч/б', tiers: tiers([1], [15]) },
        { id: 'a4c', label: 'А4 цветная', tiers: tiers([1], [25]) },
        { id: 'a3bw', label: 'А3 ч/б', tiers: tiers([1], [30]) },
        { id: 'a3c', label: 'А3 цветная', tiers: tiers([1], [40]) },
      ],
    }),
  ],
};

// ---------------------------------------------------------------- calendars

const calendars: Category = {
  id: 'calendars',
  name: 'Календари',
  page: '/kalendari',
  products: [
    (() => {
      // Supplier price list 2026–2027 (owner, 03.11.2026) +20%, whole rubles. Price per calendar by print run.
      const up = (xs: number[]) => xs.map((x) => Math.round(x * 1.2));
      const runs = [10, 50, 100, 200, 300, 500, 1000];
      const models: { id: string; label: string; hint: string; prices: number[] }[] = [
        { id: 'midi3', label: 'МИДИ, 3 рекламных поля', hint: '325 мм, 3 блока', prices: up([560, 530, 490, 420, 390, 370, 350]) },
        { id: 'midi1', label: 'МИДИ, 1 рекламное поле', hint: '325 мм, 3 блока', prices: up([460, 420, 390, 360, 340, 320, 290]) },
        { id: 'mini3', label: 'МИНИ, 3 рекламных поля', hint: '297 мм, 3 блока', prices: up([410, 380, 370, 360, 350, 340, 330]) },
        { id: 'mini1', label: 'МИНИ, 1 рекламное поле', hint: '297 мм, 3 блока', prices: up([340, 320, 310, 300, 290, 280, 270]) },
        { id: 'trio', label: '«3 в 1», 1 рекламное поле', hint: '335 мм, один большой блок', prices: up([350, 320, 310, 300]) },
      ];
      const STRIP = { none: 0, silver: 110, gold: 130 }; // owner, 04.11.2026
      const FOLD = 40; // owner, 04.11.2026
      const tiersOf = (m: (typeof models)[number]) => tiers(runs.slice(0, m.prices.length), m.prices);
      const model = (sel: Selection) => models.find((m) => m.id === one(sel, 'model', 'midi3')) ?? models[0];
      const extras = (sel: Selection) => {
        const strip = one(sel, 'strip', 'none') as keyof typeof STRIP;
        const fold = many(sel, 'fold').includes('fold');
        return { strip, stripPrice: STRIP[strip] ?? 0, fold, foldPrice: fold ? FOLD : 0 };
      };
      const p: Product = {
        id: 'cal-quarterly',
        name: 'Квартальный календарь',
        short: 'МИДИ, МИНИ и «3 в 1», от 10 шт',
        image: '/img/showcase/stationery.webp',
        qty: { min: 10, max: 5000, default: 50 },
        options: [
          { id: 'model', label: 'Модель', type: 'one', choices: models.map((m) => ({ id: m.id, label: m.label, hint: m.hint })), default: 'midi3' },
          {
            id: 'strip',
            label: 'Металлическая планка',
            type: 'one',
            choices: [
              { id: 'none', label: 'Без планки' },
              { id: 'silver', label: 'Серебро', hint: `+${STRIP.silver} ₽/шт` },
              { id: 'gold', label: 'Золото', hint: `+${STRIP.gold} ₽/шт` },
            ],
            default: 'none',
          },
          {
            id: 'fold',
            label: 'Постер',
            type: 'many',
            choices: [{ id: 'fold', label: 'Подгиб постера', hint: `+${FOLD} ₽/шт, верх плотнее` }],
            default: [],
          },
        ],
        fromPrice: Math.min(...models.map((m) => Math.min(...m.prices))),
        table: {
          columns: runs.map((r) => `от ${r} шт`),
          rows: [
            ...models.map((m) => ({ label: m.label, cells: runs.map((_, i) => (m.prices[i] ? rub(m.prices[i]) : '—')) })),
            { label: '+ металлическая планка: серебро / золото', cells: runs.map(() => `+${STRIP.silver} / +${STRIP.gold} ₽`) },
            { label: '+ подгиб постера', cells: runs.map(() => `+${rub(FOLD)}`) },
          ],
          note: 'Цена за 1 календарь. «3 в 1» — тиражом до 200 шт, больше — по запросу.',
        },
        ladder: (sel) => tiersOf(model(sel)),
        quote: (sel) => {
          const m = model(sel);
          const t = tiersOf(m);
          const base = tierPrice(t, sel.qty);
          const x = extras(sel);
          const unit = base + x.stripPrice + x.foldPrice;
          const breakdown: Quote['breakdown'] = [{ label: `Календарь ${m.label}`, amount: base, per: 'шт' }];
          if (x.stripPrice) breakdown.push({ label: `Металлическая планка (${x.strip === 'gold' ? 'золото' : 'серебро'})`, amount: x.stripPrice, per: 'шт' });
          if (x.foldPrice) breakdown.push({ label: 'Подгиб постера', amount: x.foldPrice, per: 'шт' });
          const nt = nextTier(t, sel.qty);
          const notes: string[] = [];
          if (m.id === 'trio' && sel.qty > 200) notes.push('«3 в 1» больше 200 шт — цену рассчитаем индивидуально, отправьте заявку.');
          return {
            unit,
            total: Math.round(unit * sel.qty),
            breakdown,
            next: nt ? { qty: nt.from, unit: unit - base + nt.price } : undefined,
            notes,
          };
        },
      };
      return p;
    })(),
    tiered({
      id: 'cal-wall',
      name: 'Настенный календарь',
      short: 'плакат или перекидной',
      qty: { min: 1, max: 1000, default: 10 },
      variantLabel: 'Вид',
      variants: [
        { id: 'poster', label: 'Плакат А3', hint: '1 лист', tiers: tiers([1, 21, 51, 101], [180, 175, 170, 165]) },
        { id: 'flip-a4', label: 'Перекидной А4', hint: '13 листов', tiers: tiers([1, 21, 51, 101], [695, 540, 480, 420]) },
        { id: 'flip-a3', label: 'Перекидной А3', hint: '13 листов', tiers: tiers([1, 21, 51, 101], [1390, 1080, 960, 840]) },
      ],
    }),
    tiered({
      id: 'cal-desk',
      name: 'Настольный календарь «домик»',
      short: '200×95 мм',
      qty: { min: 1, max: 1000, default: 20 },
      variantLabel: 'Вид',
      variants: [
        { id: 'plain', label: 'Обычный домик', tiers: tiers([1, 50, 100], [60, 55, 45]) },
        { id: 'tearoff', label: 'С отрывными месяцами', tiers: tiers([1, 50, 100], [270, 265, 240]) },
      ],
    }),
    (() => {
      const packs: Tier[] = tiers([100, 200, 300, 500, 1000, 10000], [625, 1170, 1795, 2185, 4055, 17160]);
      const p: Product = {
        id: 'cal-pocket',
        name: 'Карманные календари',
        short: 'цена за весь тираж',
        qty: { min: 100, max: 10000, default: 100, presets: packs.map((t) => t.from) },
        fromPrice: 1.72,
        table: { columns: ['Цена за тираж'], rows: packs.map((t) => ({ label: `${t.from.toLocaleString('ru-RU')} шт`, cells: [rub(t.price)] })) },
        quote: (sel) => {
          const pack = packs.find((t) => t.from >= sel.qty) ?? packs[packs.length - 1];
          return {
            unit: round(pack.price / pack.from),
            total: pack.price,
            breakdown: [{ label: `Тираж ${pack.from.toLocaleString('ru-RU')} шт`, amount: pack.price, per: 'заказ' }],
            notes: ['Карманные календари печатаются тиражами. Цена указана за весь тираж.'],
          };
        },
      };
      return p;
    })(),
  ],
};

// ---------------------------------------------------------------- wide format (area)

const wideMaterials: Record<string, { label: string; perM2: number; from?: boolean }> = {
  film: { label: 'Плёнка с печатью', perM2: 1050 },
  'film-cut': { label: 'Плёнка с печатью и контурной резкой', perM2: 1350 },
  'film-mount': { label: 'Плёнка с резкой на монтажной плёнке', perM2: 2300 },
  banner: { label: 'Баннер', perM2: 1300 },
  onevision: { label: 'OneVision (перфорированная плёнка)', perM2: 1450 },
  pvc: { label: 'Плёнка на ПВХ 3–10 мм', perM2: 4800, from: true },
};

const wide: Category = {
  id: 'wide',
  name: 'Широкоформатная печать',
  page: '/shirokoformatnaya-pechat',
  products: [
    {
      id: 'wide-print',
      name: 'Наклейки, баннеры, плёнка',
      short: 'цена за м²',
      image: '/img/showcase/stickers-3d.webp',
      qty: { min: 1, max: 100, default: 1 },
      options: [
        { id: 'material', label: 'Материал', type: 'one', choices: Object.entries(wideMaterials).map(([id, m]) => ({ id, label: m.label, hint: `${m.from ? 'от ' : ''}${m.perM2.toLocaleString('ru-RU')} ₽/м²` })), default: 'film' },
      ],
      dims: [
        { id: 'w', label: 'Ширина', unit: 'см', min: 10, max: 500, default: 100 },
        { id: 'h', label: 'Высота', unit: 'см', min: 10, max: 500, default: 100 },
      ],
      fromPrice: 1050,
      fromUnit: 'м²',
      table: { columns: ['Цена за м²'], rows: Object.values(wideMaterials).map((m) => ({ label: m.label, cells: [`${m.from ? 'от ' : ''}${rub(m.perM2)}`] })) },
      quote: (sel) => {
        const m = wideMaterials[one(sel, 'material', 'film')] ?? wideMaterials.film;
        const area = round(((sel.dims.w ?? 100) * (sel.dims.h ?? 100)) / 10000);
        const unit = Math.round(area * m.perM2);
        return {
          unit,
          total: unit * sel.qty,
          from: m.from,
          breakdown: [{ label: `${m.label}, ${String(area).replace('.', ',')} м²`, amount: unit, per: 'шт' }],
          notes: [`${m.perM2.toLocaleString('ru-RU')} ₽ за м². Монтаж и сложная резка — по договорённости.`],
        };
      },
    },
  ],
};

// ---------------------------------------------------------------- photo gifts (fixed)

const gifts: Category = {
  id: 'gifts',
  name: 'Фотоподарки',
  page: '/fotopodarki',
  products: [
    fixed('puzzle-a3', 'Пазл А3', 950),
    fixed('puzzle-a4', 'Пазл А4', 850),
    fixed('puzzle-a5', 'Пазл А5', 650),
    fixed('puzzle-heart', 'Пазл «Сердце»', 850),
    fixed('pillow', 'Подушка с фото', 1450, { image: '/img/showcase/pillow.webp' }),
    fixed('mousepad', 'Коврик для мыши', 800),
    fixed('pennant', 'Вымпел', 1100),
    fixed('ball', 'Ёлочный шар 70 мм', 450),
    fixed('medal', 'Медаль', 400),
    fixed('car-sticker', 'Наклейка на авто', 700, { from: true }),
  ],
};

// ---------------------------------------------------------------- prints without application (transfers)
// Owner (06.11.2026): DTF transfers sold in А3 sheets (layout field 28×38 cm): 1–4 — 900, 5–9 — 700, 10–29 — 500,
// 30–50 — 400 ₽ per sheet. Sublimation transfer sheets: А3 1–4 — 220, 5–9 — 180, 10–29 — 150, 30–50 — 120 ₽;
// А4 is half of А3 (prices divided by two). More than 50 sheets — individually.
export const SHEET_MAX = 50;
const sheetTiers = [1, 5, 10, 30];
const subSheetA3 = [220, 180, 150, 120];

const transfers: Category = {
  id: 'transfers',
  name: 'DTF и сублимация без нанесения',
  page: '/dtf-pechat',
  products: [
    tiered({
      id: 'dtf-sheet',
      name: 'DTF-печать листами А3',
      short: 'готовые трансферы, поле 28×38 см',
      qty: { min: 1, max: SHEET_MAX, default: 1, individualAbove: true },
      variants: [{ id: 'a3', label: 'Лист А3 — 28×38 см', tiers: tiers(sheetTiers, [900, 700, 500, 400]) }],
      notes: ['Цена за лист: на одном листе можно разместить сколько угодно принтов, которые поместятся в поле 28×38 см.'],
    }),
    tiered({
      id: 'sub-sheet',
      name: 'Сублимационная печать листами',
      short: 'на сублимационной бумаге, А3 или А4',
      qty: { min: 1, max: SHEET_MAX, default: 1, individualAbove: true },
      variantLabel: 'Формат листа',
      variants: [
        { id: 'a3', label: 'А3', hint: '29,7 × 42 см', tiers: tiers(sheetTiers, subSheetA3) },
        { id: 'a4', label: 'А4', hint: '21 × 29,7 см', tiers: tiers(sheetTiers, subSheetA3.map((p) => p / 2)) },
      ],
      notes: ['Цена за лист: на листе можно разместить несколько принтов.'],
    }),
  ],
};

export const categories: Category[] = [textile, transfers, mugs, badges, keychains, magnets, stickers, cards, flyers, calendars, wide, gifts];

export const findCategory = (id: string) => categories.find((c) => c.id === id);
export const findProduct = (categoryId: string, productId?: string) => {
  const c = findCategory(categoryId);
  return c?.products.find((p) => p.id === productId) ?? c?.products[0];
};

/** Lowest "от" price of a category, for cards and JSON-LD. */
export const categoryFrom = (id: string): { price: number; unit: string } => {
  const c = findCategory(id);
  if (!c) return { price: 0, unit: 'шт' };
  // "print on your own item" (DTF or sublimation) has no blank price, so it would make "от" misleadingly low
  const pool = c.products.filter((p) => p.id !== 'own-item' && p.id !== 'sub-print');
  const p = pool.reduce((a, b) => (b.fromPrice < a.fromPrice && !b.fromUnit ? b : a), pool[0]);
  return { price: p.fromPrice, unit: p.fromUnit ?? 'шт' };
};

export const defaultSelection = (p: Product): Selection => {
  const options: Selection['options'] = {};
  for (const g of p.options ?? []) options[g.id] = g.default ?? (g.type === 'many' ? [] : g.choices[0].id);
  const dims: Selection['dims'] = {};
  for (const d of p.dims ?? []) dims[d.id] = d.default;
  return { options, dims, qty: p.qty.default };
};

