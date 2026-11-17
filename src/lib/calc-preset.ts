// Ready-made variants («Готовые варианты») fill the calculator: a button sends CALC_APPLY_EVENT with the settings,
// the calculator turns them into a selection with applyPreset() and scrolls to itself.
import { defaultSelection, rub, type Product, type Selection } from '@/data/pricing';

export const CALC_APPLY_EVENT = 'calc:apply';

export interface CalcPreset {
  options?: Record<string, string | string[]>;
  dims?: Record<string, number>;
  qty?: number;
}

/** what a «Настроить в калькуляторе» button sends with CALC_APPLY_EVENT */
export interface CalcApplyDetail {
  product: string;
  options: Record<string, string | string[]>;
  dims?: Record<string, number>;
  qty: number;
}

/**
 * The product's default selection with the preset laid over it. Unknown groups and values are dropped,
 * the quantity is lifted to the smallest run of the result (coloured garments: 5 pcs) and capped at qty.max.
 */
export function applyPreset(p: Product, preset: CalcPreset): Selection {
  const sel = defaultSelection(p);
  // Apply size before the minimum run: small stickers need a larger run to meet the minimum order sum.
  for (const d of p.dims ?? []) {
    const value = preset.dims?.[d.id];
    if (typeof value === 'number' && Number.isFinite(value)) sel.dims[d.id] = Math.min(d.max, Math.max(d.min, value));
  }
  for (const [groupId, value] of Object.entries(preset.options ?? {})) {
    const g = p.options?.find((x) => x.id === groupId);
    if (!g) continue;
    if (g.type === 'many') {
      const values = Array.isArray(value) ? value : [value];
      sel.options[groupId] = values.filter((v) => g.choices.some((c) => c.id === v));
    } else if (typeof value === 'string' && g.choices.some((c) => c.id === value)) {
      sel.options[groupId] = value;
    }
  }
  const qty = p.qtyFor?.(sel) ?? p.qty;
  const want = Math.max(preset.qty ?? sel.qty, p.minQty?.(sel) ?? 1, qty.min);
  sel.qty = Math.min(qty.max, Math.round(want));
  return sel;
}

/**
 * A button pressed before the calculator island has hydrated (phones hydrate it only when it scrolls into view)
 * leaves its settings here; the calculator takes them right after it attaches its CALC_APPLY_EVENT listener.
 */
const PENDING = '__calcPending';
export const queueCalcPreset = (w: object, d: CalcApplyDetail) => {
  (w as Record<string, unknown>)[PENDING] = d;
};
export const takeCalcPreset = (w: object): CalcApplyDetail | undefined => {
  const rec = w as Record<string, CalcApplyDetail | undefined>;
  const d = rec[PENDING];
  delete rec[PENDING];
  return d;
};

/**
 * a product tile of the calculator: «Своя футболка» = tshirt-unisex with { blank: 'own' } and `own`.
 * `own` — the customer's own item, only the print is charged: the tile's «от» reads «печать от», and the estimate
 * line is called by the tile's label. A product without the «наша / своя» group (own-item: workwear, sport uniform)
 * needs no preset, only `own`.
 */
export interface CalcTile {
  id: string;
  label: string;
  product: string;
  preset?: Record<string, string>;
  own?: boolean;
}

/** the page's calculator products: the tiles' products in their order, without repeats */
export const tileProducts = (tiles: CalcTile[]): string[] => [...new Set(tiles.map((t) => t.product))];

/** what a line is called in the result and the estimate: the tile's label for «свой», else the product's name */
export const tileItemName = (tile: CalcTile | undefined, p: Product): string => (tile?.own ? tile.label : p.name);

/** «от» on a tile: «печать от 280 ₽» for «свой», «от 830 ₽» otherwise (see tileFromPrice) */
export const tileFromLabel = (p: Product, t: CalcTile): string =>
  `${t.own ? 'печать ' : ''}от ${rub(tileFromPrice(p, t))}${p.fromUnit ? `/${p.fromUnit}` : ''}`;

/**
 * Selection after picking tile `next` while `current` is active: undefined (nothing to change) for the same tile;
 * otherwise the new product's defaults with the print sizes (print1…print5) carried over where the product has them,
 * then the tile's preset.
 */
export function switchTile(p: Product, current: CalcTile | undefined, next: CalcTile, sel: Selection): Selection | undefined {
  if (current?.id === next.id) return undefined;
  const prints = Object.fromEntries(
    Object.entries(sel.options).filter((e): e is [string, string] => /^print\d+$/.test(e[0]) && typeof e[1] === 'string'),
  );
  return applyPreset(p, { options: { ...prints, ...next.preset } });
}

/** the tile that matches the product and the selection; with several, the one with the most preset settings wins */
export const activeTile = (tiles: CalcTile[], productId: string, options: Selection['options']): CalcTile | undefined =>
  tiles
    .filter((t) => t.product === productId && Object.entries(t.preset ?? {}).every(([k, v]) => options[k] === v))
    .sort((a, b) => Object.keys(b.preset ?? {}).length - Object.keys(a.preset ?? {}).length)[0];

/**
 * The «от» price on a tile — one base for every tile: one piece at the largest priced run with the smallest print
 * (for «наша» garments this is the product's fromPrice; «своя» is the same without the blank, e.g. 830 → 280 ₽).
 * Falls back to the product's fromPrice if that selection cannot be quoted.
 */
export function tileFromPrice(p: Product, t: CalcTile): number {
  // An area rate is not the price of the default-sized piece at the largest run.
  if (p.fromUnit && p.fromUnit !== 'шт') return p.fromPrice;
  const s = applyPreset(p, { options: t.preset ?? {} });
  const first = p.options?.find((g) => g.id === 'print1')?.choices.find((c) => c.id !== 'none');
  if (first) s.options.print1 = first.id;
  const q = p.quote({ ...s, qty: p.qty.max });
  return q.error || !q.unit ? p.fromPrice : q.unit;
}
