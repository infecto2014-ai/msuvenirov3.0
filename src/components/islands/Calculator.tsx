// The site calculator (3.0): category → product → options → quantity → price → estimate / order.
// Logic ported from 2.0 (Calculator.tsx), look drawn anew on the 3.0 tokens. All prices come from pricing.ts.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import {
  categories,
  defaultSelection,
  extraPrintFactor,
  findCategory,
  rub,
  type Category,
  type Choice,
  type OptionGroup,
  type Product,
  type QtyConfig,
  type Selection,
} from '@/data/pricing';
import { addToEstimate, FILES_EVENT, getOrderFiles, openOrder, setOrderFiles } from '@/lib/estimate';
import { activeTile, applyPreset, CALC_APPLY_EVENT, switchTile, takeCalcPreset, tileFromLabel, tileItemName, tileProducts, type CalcApplyDetail, type CalcTile } from '@/lib/calc-preset';
import { ACCEPT, MAX_FILES, validateFiles } from '@/lib/order';
import { reachGoal } from '@/lib/metrika';
import { ProductIcon } from './productIcons';
import './Calculator.css';

interface Props {
  /** preselected category id */
  category: string;
  /** preselected product id */
  product?: string;
  /** limit the category switcher to these ids; omit for all */
  only?: string[];
  /** hide the category switcher (landing pages) */
  hideCategories?: boolean;
  /** only the preselected product: no product switcher */
  lockProduct?: boolean;
  /** limit the product switcher to these product ids; omit for all products of the category */
  products?: string[];
  /** heading shown above the calculator */
  title?: string;
  /**
   * product tiles instead of the product list (T-shirt page: «Футболка унисекс», «Детская», «Своя футболка»).
   * A tile picks its product and lays its preset over the defaults; the «наша / своя» group (`blank`) is hidden.
   */
  tiles?: CalcTile[];
}

const SLIDER_STEPS = 1000;

/** Logarithmic slider: small quantities get most of the track. */
const toPos = (qty: number, min: number, max: number) => (max <= min ? 0 : Math.round((Math.log(qty / min) / Math.log(max / min)) * SLIDER_STEPS));
const toQty = (pos: number, min: number, max: number) => {
  const raw = min * Math.pow(max / min, pos / SLIDER_STEPS);
  const step = raw >= 1000 ? 50 : raw >= 200 ? 10 : raw >= 50 ? 5 : 1;
  return Math.min(max, Math.max(min, Math.round(raw / step) * step));
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/** Share of the slider given to fixed print runs when larger amounts are free (presets + freeFrom). */
const PRESET_SPAN = 0.4 * SLIDER_STEPS;

/** Slider position <-> quantity for every quantity mode: free, presets only, presets + free from N. */
const sliderMaxOf = (q: QtyConfig) => (q.presets && !q.freeFrom ? q.presets.length - 1 : SLIDER_STEPS);
const qtyToPos = (n: number, q: QtyConfig) => {
  if (!q.presets) return toPos(n, q.min, q.max);
  if (!q.freeFrom) return Math.max(0, q.presets.indexOf(n));
  if (n < q.freeFrom) return Math.round((Math.max(0, q.presets.indexOf(n)) * PRESET_SPAN) / q.presets.length);
  return Math.round(PRESET_SPAN + (toPos(n, q.freeFrom, q.max) / SLIDER_STEPS) * (SLIDER_STEPS - PRESET_SPAN));
};
const posToQty = (pos: number, q: QtyConfig) => {
  if (!q.presets) return toQty(pos, q.min, q.max);
  if (!q.freeFrom) return q.presets[pos];
  if (pos < PRESET_SPAN) return q.presets[Math.min(q.presets.length - 1, Math.round((pos / PRESET_SPAN) * q.presets.length))];
  return toQty(((pos - PRESET_SPAN) / (SLIDER_STEPS - PRESET_SPAN)) * SLIDER_STEPS, q.freeFrom, q.max);
};
/** Snap any number to an allowed quantity. */
const normalizeQty = (n: number, q: QtyConfig) => {
  const v = clamp(n, q.min, q.max);
  if (!q.presets) return v;
  if (q.freeFrom && v >= q.freeFrom) return v;
  return q.presets.find((x) => x >= v) ?? q.freeFrom ?? q.presets[q.presets.length - 1];
};
/** Next allowed quantity up (+1) or down (-1) for the stepper buttons. */
const stepQty = (n: number, dir: 1 | -1, q: QtyConfig) => {
  if (!q.presets || (q.freeFrom && n + dir >= q.freeFrom)) return clamp(n + dir, q.min, q.max);
  const list = q.freeFrom ? [...q.presets, q.freeFrom] : q.presets;
  const i = list.indexOf(n);
  return list[Math.min(list.length - 1, Math.max(0, (i < 0 ? list.length - 1 : i) + dir))];
};

const describe = (p: Product, s: Selection, skip: string[] = []): string => {
  const parts: string[] = [];
  for (const g of p.options ?? []) {
    if (skip.includes(g.id)) continue;
    if (g.hideWhen && s.options[g.hideWhen.group] === g.hideWhen.value) continue;
    if (g.showWhen && s.options[g.showWhen.group] !== g.showWhen.value) continue;
    const v = s.options[g.id];
    if (g.type === 'one') {
      const c = g.choices.find((x) => x.id === v);
      if (c && c.id !== 'none') parts.push(g.id.startsWith('print') ? `${g.label.split(' ·')[0].replace(' (DTF)', '')}: ${c.label}` : c.label);
    } else if (Array.isArray(v) && v.length) {
      parts.push(
        g.choices
          .filter((c) => v.includes(c.id))
          .map((c) => c.label)
          .join(', '),
      );
    }
  }
  for (const d of p.dims ?? []) parts.push(`${d.label.toLowerCase()} ${s.dims[d.id]} ${d.unit}`);
  return parts.join(' · ');
};

/** print formats carry their size in the hint («10×15 см») */
const sheetSize = (c: Choice): [number, number] | null => {
  const m = c.hint?.match(/(\d+(?:[.,]\d+)?)\s*×\s*(\d+(?:[.,]\d+)?)\s*см/);
  return m ? [parseFloat(m[1].replace(',', '.')), parseFloat(m[2].replace(',', '.'))] : null;
};
/** Russian list: «белый», «белый и чёрный», «белый, чёрный и серый» */
const joinRu = (a: string[]) => (a.length < 2 ? (a[0] ?? '') : `${a.slice(0, -1).join(', ')} и ${a[a.length - 1]}`);
const capFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Arrow keys inside a radio group (one tab stop per group): Left/Up — previous, Right/Down — next, Home/End. */
const radioKeys = (e: KeyboardEvent) => {
  const keys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const items = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  if (!items.length) return;
  e.preventDefault();
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  const last = items.length - 1;
  const next =
    e.key === 'Home' ? 0 : e.key === 'End' ? last : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i <= 0 ? last : i - 1) : i < 0 || i === last ? 0 : i + 1;
  items[next].focus();
  items[next].click();
};
/** the checked radio takes the tab stop; with none checked — the first one */
const tabOf = (on: boolean, index: number, anyOn: boolean) => (on || (!anyOn && index === 0) ? 0 : -1);

const Svg = ({ size = 20, children }: { size?: number; children: ComponentChildren }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** groups the tiles take over: «наша / своя» is chosen by a tile */
const TILE_GROUPS = ['blank'];

export default function Calculator({ category, product, only, hideCategories, lockProduct, products: productsProp, title, tiles }: Props) {
  // with tiles the product list is the tiles' products
  const products = tiles?.length ? tileProducts(tiles) : productsProp;
  const cats: Category[] = useMemo(() => (only ? categories.filter((c) => only.includes(c.id)) : categories), [only]);
  const [catId, setCatId] = useState(() => findCategory(category)?.id ?? cats[0].id);
  const cat = findCategory(catId) ?? cats[0];
  /** products offered in the switcher: the whole category or only the listed ids */
  const listOf = (c: Category) => {
    const l = products ? c.products.filter((p) => products.includes(p.id)) : c.products;
    return l.length ? l : c.products;
  };
  const list = listOf(cat);
  const [prodId, setProdId] = useState(() => {
    // without `product` a tiled calculator opens on its first tile (list order is the catalogue's, not the tiles')
    const first = product ?? tiles?.[0]?.product;
    return list.find((p) => p.id === first)?.id ?? list[0].id;
  });
  const prod = list.find((p) => p.id === prodId) ?? list[0];
  const showProducts = (tiles?.length ? tiles.length > 1 : list.length > 1) && !lockProduct;
  const [sel, setSel] = useState<Selection>(() => defaultSelection(prod));
  /** files attached right here; the order form gets the same list */
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  useEffect(() => {
    setFiles(getOrderFiles());
    const on = (e: Event) => setFiles([...(e as CustomEvent<File[]>).detail]);
    window.addEventListener(FILES_EVENT, on);
    return () => window.removeEventListener(FILES_EVENT, on);
  }, []);
  const attach = (fl: FileList | null) => {
    if (!fl || !fl.length) return;
    const next = [...getOrderFiles(), ...Array.from(fl)].slice(0, MAX_FILES);
    const err = validateFiles(next);
    setFileError(err ?? '');
    if (!err) setOrderFiles(next);
  };
  const tile = tiles?.length ? activeTile(tiles, prod.id, sel.options) : undefined;
  /** what the line is called in the result and the estimate: «Своя футболка» for an `own` tile */
  const itemName = tileItemName(tile, prod);
  const details = describe(prod, sel, tiles?.length ? TILE_GROUPS : []);
  const [qtyText, setQtyText] = useState(String(sel.qty));
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const rootRef = useRef<HTMLDivElement>(null);
  // phone: the compact total bar hides while the full result panel is on screen
  const resultRef = useRef<HTMLDivElement>(null);
  const [resultSeen, setResultSeen] = useState(false);
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setResultSeen(e.isIntersecting), { rootMargin: '0px 0px -96px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = (c: Category, p: Product, s: Selection) => {
    setCatId(c.id);
    setProdId(p.id);
    setSel(s);
    setQtyText(String(s.qty));
  };

  // read ?calc=category:product from the URL (links from cards and landing pages)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('calc');
    if (!q) return;
    const [c, p] = q.split(':');
    const fc = findCategory(c);
    if (fc && (!only || only.includes(fc.id))) {
      const fl = listOf(fc);
      const fp = fl.find((x) => x.id === p) ?? fl[0];
      show(fc, fp, defaultSelection(fp));
    }
  }, []);

  // «Настроить в калькуляторе» on a ready-made variant: fill the calculator and scroll to it
  useEffect(() => {
    const apply = (d: CalcApplyDetail | undefined) => {
      if (!d?.product) return;
      const fc = cats.find((c) => listOf(c).some((p) => p.id === d.product));
      const fp = fc && listOf(fc).find((p) => p.id === d.product);
      if (!fc || !fp) return;
      show(fc, fp, applyPreset(fp, { options: d.options, dims: d.dims, qty: d.qty }));
      const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      rootRef.current?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    };
    const on = (e: Event) => {
      takeCalcPreset(window);
      apply((e as CustomEvent<CalcApplyDetail>).detail);
    };
    window.addEventListener(CALC_APPLY_EVENT, on);
    // pressed before this island hydrated: the settings are waiting in the queue
    apply(takeCalcPreset(window));
    return () => window.removeEventListener(CALC_APPLY_EVENT, on);
  }, [cats]);

  const pickCategory = (id: string) => {
    const c = findCategory(id)!;
    const first = listOf(c)[0];
    show(c, first, defaultSelection(first));
  };

  const pickProduct = (p: Product) => show(cat, p, defaultSelection(p));
  // the active tile again — nothing is reset; another tile keeps the chosen print sizes
  const pickTile = (t: CalcTile) => {
    const p = list.find((x) => x.id === t.product);
    const next = p && switchTile(p, tile, t, sel);
    if (p && next) show(cat, p, next);
  };

  // the smallest run depends on the selection (coloured garments: 5 pcs; stickers: minimum order sum)
  const qcfg = useMemo(() => {
    const q = prod.qtyFor?.(sel) ?? prod.qty;
    return prod.minQty ? { ...q, min: Math.min(q.max, prod.minQty(sel)) } : q;
  }, [prod, sel.dims, sel.options]);
  useEffect(() => {
    if (sel.qty < qcfg.min || sel.qty > qcfg.max) {
      const qty = Math.min(qcfg.max, Math.max(qcfg.min, sel.qty));
      setSel((s) => ({ ...s, qty }));
      setQtyText(String(qty));
    }
  }, [qcfg.min, qcfg.max]);

  const setQty = (n: number) => {
    const q = normalizeQty(n, qcfg);
    setSel((s) => ({ ...s, qty: q }));
    setQtyText(String(q));
  };

  const setOption = (groupId: string, value: string, multi: boolean) =>
    setSel((s) => {
      if (!multi) return { ...s, options: { ...s.options, [groupId]: value } };
      const cur = Array.isArray(s.options[groupId]) ? (s.options[groupId] as string[]) : [];
      return {
        ...s,
        options: {
          ...s.options,
          [groupId]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value],
        },
      };
    });

  const quote = useMemo(() => prod.quote(sel), [prod, sel]);

  const { min, max, presets, freeFrom } = qcfg;
  const sliderMax = sliderMaxOf(qcfg);
  const sliderVal = qtyToPos(sel.qty, qcfg);
  // marks on the quantity bar: where the price per piece drops and by how much
  const ladder = useMemo(() => prod.ladder?.(sel) ?? [], [prod, sel]);
  const marks = (() => {
    // discounts are counted from the price of the smallest allowed run (coloured T-shirts: from 5 pcs)
    const top = [...ladder].reverse().find((t) => t.from <= min)?.price ?? ladder[0]?.price ?? 0;
    const out: { qty: number; pct: number; save: number; row: number }[] = [];
    const lastAt = [-1, -1]; // where the last mark of each row stands
    const GAP = 0.13; // the least distance between two marks in one row
    for (const t of ladder.slice(1)) {
      if (t.from <= min) continue; // already reached by the smallest run
      const pct = qtyToPos(t.from, qcfg) / sliderMax;
      const save = top > 0 ? Math.round((1 - t.price / top) * 100) : 0;
      if (save <= 0 || pct > 1) continue;
      const prev = out[out.length - 1];
      // a mark only where the discount really grows
      if (prev && save <= prev.save) continue;
      if (prev && pct - prev.pct < 0.04) continue;
      // close neighbours go to a second, higher row; if both rows are taken there, skip it
      const row = lastAt[0] < 0 || pct - lastAt[0] >= GAP ? 0 : lastAt[1] < 0 || pct - lastAt[1] >= GAP ? 1 : -1;
      if (row < 0) continue;
      lastAt[row] = pct;
      out.push({ qty: t.from, pct, save, row });
    }
    return out;
  })();

  // why the smallest run is above one piece now («Цветные футболки — от 5 шт»), from pricing.ts
  const minNote = min > prod.qty.min ? prod.minQtyNote?.(sel) : undefined;

  const add = (thenOrder: boolean) => {
    if (quote.error) return;
    addToEstimate({
      title: itemName,
      details,
      qty: sel.qty,
      unitPrice: quote.unit,
      total: quote.total,
      from: quote.from,
      calc: { cat: cat.id, product: prod.id, sel },
    });
    reachGoal(thenOrder ? 'calc_order' : 'calc_add', { product: prod.id, tile: tile?.id, total: quote.total });
    if (thenOrder) openOrder({ source: 'calculator' });
    else {
      setToast(`${itemName} — в смете`);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(''), 2600);
    }
  };

  const fromLabel = (p: Product) => `от ${rub(p.fromPrice)}${p.fromUnit ? `/${p.fromUnit}` : ''}`;
  const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);
  const n = (x: number) => x.toLocaleString('ru-RU');

  /** one option group drawn by its kind: colour circles, print sheets or a segmented track */
  const choicesOf = (g: OptionGroup) => {
    const shown = g.choices.filter((c) => !(g.addable && c.id === 'none'));
    const v = sel.options[g.id];
    const isOn = (c: Choice) => (g.type === 'many' ? Array.isArray(v) && v.includes(c.id) : v === c.id);
    const pick = (c: Choice) => setOption(g.id, c.id, g.type === 'many');

    if (g.type === 'one' && shown.every((c) => c.swatch)) {
      // colours: circles without captions, the name is in the tooltip and for screen readers
      // the smallest run of each colour, as pricing.ts counts it (white and black — 1, coloured — 5)
      const runOf = (c: Choice) => prod.minQty?.({ ...sel, options: { ...sel.options, [g.id]: c.id } }) ?? 1;
      const free = shown.filter((c) => runOf(c) <= 1);
      const paid = shown.filter((c) => runOf(c) > 1);
      const anyOn = shown.some(isOn);
      return (
        <>
          <div class="calc-swatches" role="radiogroup" aria-label={g.label} onKeyDown={radioKeys}>
            {shown.map((c, i) => (
              <button
                type="button"
                role="radio"
                aria-checked={isOn(c)}
                tabIndex={tabOf(isOn(c), i, anyOn)}
                class={`calc-swatch${runOf(c) > 1 ? ' is-min' : ''}`}
                aria-label={c.hint ? `${c.label}, ${c.hint}` : c.label}
                title={c.hint ? `${c.label} — ${c.hint}` : c.label}
                onClick={() => pick(c)}
              >
                <span class="calc-swatch-dot" style={{ background: c.swatch }} />
              </button>
            ))}
          </div>
          {free.length > 0 && paid.length > 0 && (
            <p class="calc-swatch-note">
              <span class="calc-swatch-mark" aria-hidden="true" />
              {capFirst(joinRu(free.map((c) => c.label.toLowerCase())))} — с 1 шт, остальные цвета — от {runOf(paid[0])} шт
            </p>
          )}
        </>
      );
    }

    if (g.type === 'one' && shown.every((c) => c.id === 'none' || sheetSize(c))) {
      // print formats: a tiny sheet drawn to scale (A3 = 40 px tall)
      const k = 40 / 38;
      return (
        <div class="calc-sheets" role="radiogroup" aria-label={g.label} onKeyDown={radioKeys}>
          {shown.map((c, i) => {
            const s = sheetSize(c);
            return (
              <button type="button" role="radio" aria-checked={isOn(c)} tabIndex={tabOf(isOn(c), i, shown.some(isOn))} class="calc-sheet" onClick={() => pick(c)}>
                <span class="calc-sheet-box" aria-hidden="true">
                  {s && <span class="calc-sheet-paper" style={{ width: `${Math.max(8, s[0] * k)}px`, height: `${Math.max(10, s[1] * k)}px` }} />}
                </span>
                <span class="calc-sheet-label">{c.label}</span>
                {c.hint && <small>{c.hint}</small>}
              </button>
            );
          })}
        </div>
      );
    }

    const short = shown.every((c) => c.label.length <= 4 && !c.hint);
    return (
      <div
        class={`calc-seg${shown.length >= 5 && !short ? ' calc-seg-grid' : ''}`}
        role={g.type === 'one' ? 'radiogroup' : 'group'}
        aria-label={g.label}
        onKeyDown={g.type === 'one' ? radioKeys : undefined}
      >
        {shown.map((c, i) => (
          <button
            type="button"
            class="calc-opt"
            {...(g.type === 'one' ? { role: 'radio', 'aria-checked': isOn(c), tabIndex: tabOf(isOn(c), i, shown.some(isOn)) } : { 'aria-pressed': isOn(c) })}
            onClick={() => pick(c)}
          >
            {g.type === 'many' && (
              <span class="calc-check" aria-hidden="true">
                <Svg size={14}>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </Svg>
              </span>
            )}
            <span class="calc-opt-text">
              <span>{c.label}</span>
              {c.hint && <small>{c.hint}</small>}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const selectedName = (g: OptionGroup) => g.choices.find((c) => c.id === sel.options[g.id])?.label;

  return (
    <div class="calc" id="calc" ref={rootRef}>
      {title && <h2 class="calc-title">{title}</h2>}

      {!hideCategories && cats.length > 1 && (
        <div class="calc-cats" role="tablist" aria-label="Категория">
          {cats.map((c) => (
            <button type="button" role="tab" aria-selected={c.id === catId} class="calc-cat" onClick={() => pickCategory(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div class="calc-grid">
        <div class="calc-config">
          {showProducts && (
            <fieldset class="calc-group">
              <legend class="calc-legend">
                <span class="calc-step">1</span>
                <span class="calc-legend-text">Изделие</span>
              </legend>
              {tiles?.length ? (
                <div class="calc-products calc-tiles" role="radiogroup" aria-label="Изделие" onKeyDown={radioKeys}>
                  {tiles.map((t, i) => {
                    const p = list.find((x) => x.id === t.product);
                    if (!p) return null;
                    const on = tile?.id === t.id;
                    return (
                      <button type="button" role="radio" aria-checked={on} tabIndex={tabOf(on, i, !!tile)} class="calc-product" onClick={() => pickTile(t)}>
                        <span class="calc-product-ico" aria-hidden="true">
                          <ProductIcon id={p.id} cat={cat.id} />
                        </span>
                        <span class="calc-product-text">
                          <span class="calc-product-name">{t.label}</span>
                          <span class="calc-product-from">{tileFromLabel(p, t)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div class="calc-products">
                  {list.map((p) => (
                    <button type="button" class="calc-product" aria-pressed={p.id === prod.id} onClick={() => pickProduct(p)}>
                      <span class="calc-product-ico" aria-hidden="true">
                        <ProductIcon id={p.id} cat={cat.id} />
                      </span>
                      <span class="calc-product-text">
                        <span class="calc-product-name">{p.name}</span>
                        <span class="calc-product-from">{fromLabel(p)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          {(() => {
            // extra prints (addable groups) are hidden until the customer adds them; numbering follows the visible groups
            const groups = prod.options ?? [];
            const hidden = (g: OptionGroup) =>
              (!!tiles?.length && TILE_GROUPS.includes(g.id)) ||
              (!!g.hideWhen && sel.options[g.hideWhen.group] === g.hideWhen.value) || (!!g.showWhen && sel.options[g.showWhen.group] !== g.showWhen.value);
            const isOn = (g: OptionGroup) => !hidden(g) && (!g.addable || (sel.options[g.id] ?? 'none') !== 'none');
            const visible = groups.filter(isOn);
            const nextAdd = groups.find((g) => g.addable && !hidden(g) && !isOn(g));
            const addGroup = (g: OptionGroup) => setOption(g.id, g.choices.find((c) => c.id !== 'none')!.id, false);
            const removeGroup = (g: OptionGroup) =>
              setSel((s) => {
                // shift the following extra prints up so the filled ones stay first
                const extra = groups.filter((x) => x.addable);
                const vals = extra.map((x) => s.options[x.id] ?? 'none').filter((v, i) => extra[i].id !== g.id && v !== 'none');
                const next = { ...s.options };
                extra.forEach((x, i) => (next[x.id] = vals[i] ?? 'none'));
                return { ...s, options: next };
              });
            const first = showProducts ? 2 : 1;
            const sublimation = nextAdd?.label.includes('сублимация');
            return (
              <>
                {visible.map((g, vi) => {
                  const swatches = g.type === 'one' && g.choices.every((c) => c.swatch);
                  return (
                    <fieldset class="calc-group" key={`${prod.id}-${g.id}`}>
                      <legend class="calc-legend">
                        <span class="calc-step">{vi + first}</span>
                        <span class="calc-legend-text">
                          {g.label}
                          {swatches && <b class="calc-legend-value">{selectedName(g)}</b>}
                        </span>
                        {g.addable && (
                          <button type="button" class="calc-remove" onClick={() => removeGroup(g)} aria-label={`Убрать: ${g.label.toLowerCase()}`}>
                            <Svg size={16}>
                              <path d="M18 6 6 18M6 6l12 12" />
                            </Svg>
                            Убрать
                          </button>
                        )}
                      </legend>
                      {choicesOf(g)}
                    </fieldset>
                  );
                })}
                {nextAdd && (
                  <button type="button" class="calc-add" onClick={() => addGroup(nextAdd)}>
                    <span class="calc-add-plus" aria-hidden="true">
                      <Svg size={20}>
                        <path d="M12 5v14M5 12h14" />
                      </Svg>
                    </span>
                    <span class="calc-add-text">
                      <span>Добавить принт</span>
                      <small>
                        {sublimation
                          ? `${nextAdd.label.split(' ·')[0].toLowerCase()} — по цене выбранного формата`
                          : `${nextAdd.label.toLowerCase()} — на ${extraOff}% дешевле`}
                      </small>
                    </span>
                  </button>
                )}
              </>
            );
          })()}

          {prod.dims && (
            <fieldset class="calc-group">
              <legend class="calc-legend">
                <span class="calc-step" aria-hidden="true">
                  <Svg size={14}>
                    <path d="M21 3 3 21M21 3h-6M21 3v6M3 21h6M3 21v-6" />
                  </Svg>
                </span>
                <span class="calc-legend-text">Размер одного изделия</span>
              </legend>
              <div class="calc-dims">
                {prod.dims.map((d) => (
                  <label class="calc-dim">
                    <span>
                      {d.label}, {d.unit}
                    </span>
                    <input
                      class="calc-input"
                      type="number"
                      inputMode="decimal"
                      min={d.min}
                      max={d.max}
                      step="0.5"
                      value={sel.dims[d.id]}
                      onInput={(e) => {
                        const v = Number((e.target as HTMLInputElement).value);
                        if (Number.isFinite(v) && v > 0) setSel((s) => ({ ...s, dims: { ...s.dims, [d.id]: Math.min(d.max, v) } }));
                      }}
                      onBlur={(e) => {
                        const v = Number((e.target as HTMLInputElement).value);
                        setSel((s) => ({
                          ...s,
                          dims: { ...s.dims, [d.id]: Math.min(d.max, Math.max(d.min, Number.isFinite(v) ? v : d.default)) },
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset class="calc-group">
            <legend class="calc-legend">
              <span class="calc-step" aria-hidden="true">
                <Svg size={14}>
                  <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
                </Svg>
              </span>
              <span class="calc-legend-text">Количество</span>
            </legend>
            <div class="calc-qty">
              <div class="calc-stepper">
                <button type="button" aria-label="Меньше" onClick={() => setQty(stepQty(sel.qty, -1, qcfg))} disabled={sel.qty <= min}>
                  <Svg size={20}>
                    <path d="M5 12h14" />
                  </Svg>
                </button>
                <input
                  class="calc-qty-input"
                  type="number"
                  inputMode="numeric"
                  aria-label="Количество, шт"
                  min={min}
                  max={max}
                  value={qtyText}
                  onInput={(e) => {
                    const t = (e.target as HTMLInputElement).value;
                    setQtyText(t);
                    const v = Number(t);
                    if (Number.isFinite(v) && v >= min && (!presets || (freeFrom && v >= freeFrom))) setSel((s) => ({ ...s, qty: clamp(v, min, max) }));
                  }}
                  onBlur={() => setQty(Number(qtyText) || min)}
                />
                <span class="calc-qty-unit">шт</span>
                <button type="button" aria-label="Больше" onClick={() => setQty(stepQty(sel.qty, 1, qcfg))} disabled={sel.qty >= max}>
                  <Svg size={20}>
                    <path d="M12 5v14M5 12h14" />
                  </Svg>
                </button>
              </div>
              {minNote && (
                <p class="calc-min">
                  <Svg size={18}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16.5h.01" />
                  </Svg>
                  {minNote}
                </p>
              )}
            </div>
            <div class={`calc-slider-wrap${marks.length ? ' has-marks' : ''}${marks.some((x) => x.row) ? ' two-rows' : ''}`}>
              {marks.map((m) => (
                <button
                  type="button"
                  class={`calc-mark${sel.qty >= m.qty ? ' is-on' : ''}${m.row ? ' is-up' : ''}`}
                  style={{ left: `calc(14px + (100% - 28px) * ${m.pct})` }}
                  onClick={() => setQty(m.qty)}
                  aria-label={`От ${m.qty} шт — дешевле на ${m.save}%`}
                  title={`от ${m.qty} шт`}
                >
                  <span>−{m.save}%</span>
                </button>
              ))}
              <input
                class="calc-slider"
                type="range"
                aria-label="Количество"
                aria-valuetext={`${n(sel.qty)} шт`}
                min={0}
                max={sliderMax}
                value={sliderVal}
                style={{ '--p': `${(sliderVal / sliderMax) * 100}%` }}
                onInput={(e) => setQty(posToQty(Number((e.target as HTMLInputElement).value), qcfg))}
              />
            </div>
            <div class="calc-scale" aria-hidden="true">
              <span>{n(min)}</span>
              <span>
                {n(max)}
                {qcfg.individualAbove && ' · больше — цена индивидуально'}
                {qcfg.moreIn && ` · больше — ${qcfg.moreIn.label}`}
              </span>
            </div>
            {presets && (
              <div class="calc-seg calc-presets" role="radiogroup" aria-label="Готовые тиражи" onKeyDown={radioKeys}>
                {presets.map((q, i) => (
                  <button
                    type="button"
                    class="calc-opt"
                    role="radio"
                    aria-checked={q === sel.qty}
                    tabIndex={tabOf(q === sel.qty, i, presets.includes(sel.qty))}
                    onClick={() => setQty(q)}
                  >
                    <span class="calc-opt-text">
                      <span>{n(q)} шт</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {!quote.next && !quote.error && qcfg.individualAbove && ladder.length > 1 && sel.qty >= ladder[ladder.length - 1].from && (
              // the best price is reached: tell about larger runs (clothing: more than 50 pcs is priced individually)
              <button type="button" class="calc-boost is-ink" data-order={`Индивидуальный расчёт: ${itemName}, больше ${max} шт`}>
                <span class="calc-boost-badge">{max}+</span>
                <span class="calc-boost-text">
                  <span>
                    Нужно <b>больше {max} шт</b>? Цену рассчитаем индивидуально
                  </span>
                  <small>Нажмите, чтобы отправить заявку — менеджер посчитает ваш тираж</small>
                </span>
              </button>
            )}
            {!quote.next &&
              !quote.error &&
              qcfg.moreIn &&
              sel.qty >= max &&
              (() => {
                // more than the set allows: switch to the product that takes larger runs
                const more = qcfg.moreIn!;
                const target = list.find((x) => x.id === more.product);
                if (!target) return null;
                return (
                  <button
                    type="button"
                    class="calc-boost is-ink"
                    onClick={() => {
                      pickProduct(target);
                      if (more.dims) setSel((s) => ({ ...s, dims: { ...s.dims, ...more.dims } }));
                    }}
                  >
                    <span class="calc-boost-badge">{max}+</span>
                    <span class="calc-boost-text">
                      <span>
                        Нужно <b>больше {max} шт</b>? Считайте как «{target.name}»
                      </span>
                      <small>Нажмите — калькулятор переключится</small>
                    </span>
                  </button>
                );
              })()}
            {quote.next &&
              !quote.error &&
              (() => {
                // how many more pieces to the next, cheaper price
                const nx = quote.next!;
                const more = nx.qty - sel.qty;
                const pct = quote.unit > 0 ? Math.round((1 - nx.unit / quote.unit) * 100) : 0;
                const fixedRun = presets && nx.qty < (freeFrom ?? Infinity);
                return (
                  <button type="button" class="calc-boost" onClick={() => setQty(nx.qty)}>
                    <span class="calc-boost-badge">−{pct}%</span>
                    <span class="calc-boost-text">
                      <span>
                        {fixedRun ? (
                          <>
                            Возьмите <b>{n(nx.qty)} шт</b> — и каждая будет на {pct}% дешевле
                          </>
                        ) : (
                          <>
                            Ещё <b>{n(more)} шт</b> — и цена за штуку будет на {pct}% дешевле
                          </>
                        )}
                      </span>
                      <small>
                        {rub(nx.unit)} вместо {rub(quote.unit)} · нажмите, чтобы выбрать
                      </small>
                    </span>
                  </button>
                );
              })()}
          </fieldset>

          {/* phone only (hidden on desktop by CSS): compact total stuck above the site's bottom bar */}
          <div class={`calc-dock${resultSeen ? ' is-off' : ''}`} aria-hidden="true">
            <div class="calc-dock-bar">
              <button type="button" class="calc-dock-sum" tabIndex={-1} onClick={() => resultRef.current?.scrollIntoView({ block: 'center' })}>
                <small>Итого за {n(sel.qty)} шт</small>
                <b>
                  {quote.from ? 'от ' : ''}
                  {quote.error ? '—' : rub(quote.total)}
                </b>
              </button>
              <button type="button" class="calc-btn calc-btn-primary" tabIndex={-1} disabled={!!quote.error} onClick={() => add(true)}>
                Заказать
              </button>
            </div>
          </div>
        </div>

        <aside class="calc-result" aria-label="Расчёт">
          <p class="visually-hidden" role="status" aria-live="polite">
            {quote.error ? 'Цена индивидуально' : `Итого ${quote.from ? 'от ' : ''}${rub(quote.total)} за ${n(sel.qty)} шт`}
          </p>
          <div class="calc-result-inner" ref={resultRef}>
            <div class="calc-result-head">
              <span class="calc-result-ico" aria-hidden="true">
                <ProductIcon id={prod.id} cat={cat.id} />
              </span>
              <span class="calc-result-name">{itemName}</span>
            </div>
            <p class="calc-result-desc">{details || prod.short}</p>

            <dl class="calc-sum">
              <div>
                <dt>За штуку</dt>
                <dd>
                  {quote.from ? 'от ' : ''}
                  {rub(quote.unit)}
                </dd>
              </div>
              <div class="calc-total">
                <dt>Итого за {n(sel.qty)} шт</dt>
                <dd>
                  {quote.from && <small>от </small>}
                  {rub(quote.total)}
                </dd>
              </div>
            </dl>

            {quote.breakdown.length > 1 && (
              <ul class="calc-breakdown" role="list">
                {quote.breakdown.map((b) => (
                  <li>
                    <span>{b.label}</span>
                    <span class="calc-num">
                      {rub(b.amount)}
                      {b.per === 'шт' ? '/шт' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {quote.error && (
              <p class="calc-error" role="alert">
                {quote.error}
              </p>
            )}
            {quote.notes.map((t) => (
              <p class="calc-note">{t}</p>
            ))}

            <div class="calc-actions">
              <button type="button" class="calc-btn calc-btn-primary" disabled={!!quote.error} onClick={() => add(true)}>
                Оформить заявку
                <Svg size={20}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </Svg>
              </button>
              <button type="button" class="calc-btn calc-btn-line" disabled={!!quote.error} onClick={() => add(false)}>
                <Svg size={20}>
                  <path d="M12 5v14M5 12h14" />
                </Svg>
                В смету
              </button>
            </div>
            <div class="calc-files">
              <label class="calc-attach">
                <input
                  type="file"
                  multiple
                  accept={ACCEPT}
                  class="visually-hidden"
                  onChange={(e) => {
                    attach((e.target as HTMLInputElement).files);
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
                <Svg size={18}>
                  <path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9" />
                </Svg>
                <span>{files.length ? 'Добавить ещё файл' : 'Прикрепить макет или фото'}</span>
              </label>
              {fileError && (
                <p class="calc-files-err" role="alert">
                  {fileError}
                </p>
              )}
              {files.length > 0 && (
                <ul class="calc-files-list" role="list">
                  {files.map((f, i) => (
                    <li>
                      <span>{f.name}</span>
                      <button type="button" aria-label={`Убрать файл ${f.name}`} onClick={() => setOrderFiles(files.filter((_, j) => j !== i))}>
                        <Svg size={16}>
                          <path d="M18 6 6 18M6 6l12 12" />
                        </Svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {files.length > 0 && <p class="calc-files-note">Файлы уйдут вместе с заявкой</p>}
            </div>
            <p class="calc-fine">Без наценки за срочность. Макет поможем подготовить бесплатно.</p>
          </div>
        </aside>
      </div>

      <div class={`calc-toast${toast ? ' is-shown' : ''}`} role="status">
        {toast && <span>{toast}</span>}
        {toast && (
          <button type="button" onClick={() => openOrder({ source: 'toast' })}>
            Открыть смету
          </button>
        )}
      </div>
    </div>
  );
}
