// Client-side estimate ("смета"): several calculator lines sent as one order.
// Stored in localStorage; every change is broadcast with a window event.
import { ESTIMATE_EVENT, ESTIMATE_KEY } from './estimate-count';
import { findProduct, type Product, type QtyConfig, type Selection } from '@/data/pricing';

export interface EstimateItem {
  id: string;
  title: string;
  details: string;
  qty: number;
  unitPrice: number;
  total: number;
  /** price is a lower bound */
  from?: boolean;
  /** what the calculator had selected — lets the estimate recalculate when the quantity changes */
  calc?: { cat: string; product: string; sel: Selection };
  /** quantity outside the product's limits (price is individual) */
  note?: string;
}

const KEY = ESTIMATE_KEY;
export { ESTIMATE_EVENT };
export const ORDER_OPEN_EVENT = 'order:open';

/** an old or broken `calc` (no options object, no numeric qty) is dropped; the line itself stays */
const sane = (i: EstimateItem): EstimateItem => {
  const c = i.calc as unknown as { cat?: unknown; product?: unknown; sel?: { options?: unknown; qty?: unknown } } | undefined;
  const ok =
    !!c && typeof c === 'object' && typeof c.cat === 'string' && typeof c.product === 'string' &&
    !!c.sel && typeof c.sel === 'object' && !!c.sel.options && typeof c.sel.options === 'object' && typeof c.sel.qty === 'number';
  if (ok || i.calc === undefined) return i;
  const { calc: _drop, ...rest } = i;
  return rest;
};

const read = (): EstimateItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((i): i is EstimateItem => !!i && typeof i === 'object' && typeof i.id === 'string')
          .map(sane)
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
};

const write = (items: EstimateItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* private mode or storage full — the estimate still lives in memory for this page */
  }
  memory = items;
  window.dispatchEvent(new CustomEvent(ESTIMATE_EVENT, { detail: items }));
};

let memory: EstimateItem[] | null = null;

export const getEstimate = (): EstimateItem[] => {
  if (typeof window === 'undefined') return [];
  if (!memory) memory = read();
  return memory;
};

export const addToEstimate = (item: Omit<EstimateItem, 'id'>) => {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  write([...getEstimate(), { ...item, id }].slice(-30));
};

/** next allowed quantity up (dir = 1) or down (dir = -1), following presets where the product has them;
 * `min` — smallest run for the current selection (Product.minQty), default q.min */
export const stepQty = (q: QtyConfig, cur: number, dir: 1 | -1, min: number = q.min): number => {
  if (q.presets && (!q.freeFrom || cur + dir < q.freeFrom)) {
    const list = q.freeFrom ? [...q.presets.filter((x) => x < q.freeFrom!), q.freeFrom] : q.presets;
    if (dir > 0) return list.find((x) => x > cur) ?? (q.freeFrom ? cur + 1 : cur);
    return [...list].reverse().find((x) => x < cur) ?? cur;
  }
  return Math.min(q.max, Math.max(min, cur + dir));
};

/** Change the quantity of one line and recalculate its price with the same rules as the calculator. */
export const setEstimateQty = (id: string, qty: number) => {
  const items = getEstimate();
  const it = items.find((i) => i.id === id);
  if (!it?.calc) return;
  const p: Product | undefined = findProduct(it.calc.cat, it.calc.product);
  if (!p) return;
  if (!Number.isFinite(qty)) return;
  // below the smallest run for this selection — raise to it
  const q = Math.max(Math.round(qty), p.qty.min, p.minQty?.(it.calc.sel) ?? 0);
  const sel = { ...it.calc.sel, qty: q };
  const quote = q > p.qty.max ? undefined : p.quote(sel);
  const next: EstimateItem = quote && !quote.error
    ? { ...it, qty: q, unitPrice: quote.unit, total: quote.total, from: quote.from, note: undefined, calc: { ...it.calc, sel } }
    : { ...it, qty: q, note: quote?.error ?? 'Цена за такой тираж — индивидуально, менеджер посчитает', calc: { ...it.calc, sel } };
  write(items.map((i) => (i.id === id ? next : i)));
};

export const removeFromEstimate = (id: string) => write(getEstimate().filter((i) => i.id !== id));

export const clearEstimate = () => write([]);

export const estimateTotal = (items: EstimateItem[]) => items.reduce((a, i) => a + (i.note ? 0 : i.total), 0);

/** Files for the order, shared by the calculators and the order form (owner, 07.11.2026: attach files right in the
 * calculator). Kept in memory only — a File cannot be stored; every change is broadcast with FILES_EVENT. */
export const FILES_EVENT = 'orderfiles:change';
let orderFiles: File[] = [];
export const getOrderFiles = () => orderFiles;
export const setOrderFiles = (files: File[]) => {
  orderFiles = files;
  window.dispatchEvent(new CustomEvent(FILES_EVENT, { detail: files }));
};

/** Open the order dialog from anywhere: buttons with [data-order] or code. */
export const openOrder = (detail: { source?: string } = {}) =>
  window.dispatchEvent(new CustomEvent(ORDER_OPEN_EVENT, { detail }));
