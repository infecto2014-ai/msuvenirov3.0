// Ready-made variants («Готовые варианты») fill the calculator: a button sends CALC_APPLY_EVENT with the settings,
// the calculator turns them into a selection with applyPreset() and scrolls to itself.
import { defaultSelection, type Product, type Selection } from '@/data/pricing';

export const CALC_APPLY_EVENT = 'calc:apply';

export interface CalcPreset {
  options?: Record<string, string>;
  qty?: number;
}

/** what a «Настроить в калькуляторе» button sends with CALC_APPLY_EVENT */
export interface CalcApplyDetail {
  product: string;
  options: Record<string, string>;
  qty: number;
}

/**
 * The product's default selection with the preset laid over it. Unknown groups and values are dropped,
 * the quantity is lifted to the smallest run of the result (coloured garments: 5 pcs) and capped at qty.max.
 */
export function applyPreset(p: Product, preset: CalcPreset): Selection {
  const sel = defaultSelection(p);
  for (const [groupId, value] of Object.entries(preset.options ?? {})) {
    const g = p.options?.find((x) => x.id === groupId);
    if (!g || !g.choices.some((c) => c.id === value)) continue;
    sel.options[groupId] = g.type === 'many' ? [value] : value;
  }
  const want = Math.max(preset.qty ?? sel.qty, p.minQty?.(sel) ?? 1, p.qty.min);
  sel.qty = Math.min(p.qty.max, Math.round(want));
  return sel;
}
