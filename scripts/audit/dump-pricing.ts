// Аудит: выгрузка каталога и цен из старого сайта (только чтение).
// Запуск из папки старого сайта: esbuild dump-pricing.ts --bundle --format=esm --platform=node --outfile=dump.mjs && node dump.mjs > PRICING_CATALOG.json
import { categories, defaultSelection, categoryFrom } from '/home/user/msuvenirov2.0/src/data/pricing.ts';

const out = categories.map((c) => ({
  id: c.id, name: c.name, page: c.page ?? null, from: categoryFrom(c.id),
  products: c.products.map((p) => {
    const sel = defaultSelection(p);
    let q: any = null, ladder: any = null, minQty: any = null;
    try { q = p.quote(sel); } catch (e) { q = { error: String(e) }; }
    try { ladder = p.ladder ? p.ladder(sel) : null; } catch { ladder = null; }
    try { minQty = p.minQty ? p.minQty(sel) : null; } catch { minQty = null; }
    return {
      id: p.id, name: p.name, short: p.short ?? null, image: p.image ?? null,
      fromPrice: p.fromPrice, fromUnit: p.fromUnit ?? 'шт', qty: p.qty,
      options: (p.options ?? []).map((g) => ({ id: g.id, label: g.label, type: g.type, default: g.default ?? null,
        addable: !!g.addable, hideWhen: g.hideWhen ?? null, showWhen: g.showWhen ?? null,
        choices: g.choices.map((ch) => ({ id: ch.id, label: ch.label, hint: ch.hint ?? null })) })),
      dims: p.dims ?? [], table: p.table ?? null,
      defaultSelection: sel, defaultQuote: q && { unit: q.unit, total: q.total, from: !!q.from, breakdown: q.breakdown, notes: q.notes, error: q.error ?? null },
      ladderDefault: ladder, minQtyDefault: minQty,
    };
  }),
}));
console.log(JSON.stringify(out, null, 1));
