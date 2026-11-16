import { describe, expect, it } from 'vitest';
import { COLOR_FREE, GARMENT_COLORS, categories, defaultSelection, extraPrintFactor, findProduct, rangeLabels, rub, type Selection } from './pricing';

const sel = (categoryId: string, productId: string, patch: Partial<Selection> & { options?: Selection['options'] } = {}) => {
  const p = findProduct(categoryId, productId)!;
  const base = defaultSelection(p);
  return { p, s: { ...base, ...patch, options: { ...base.options, ...(patch.options ?? {}) }, dims: { ...base.dims, ...(patch.dims ?? {}) } } };
};

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('pricing', () => {
  it('every product quotes its default selection without errors', () => {
    for (const c of categories)
      for (const p of c.products) {
        const q = p.quote(defaultSelection(p));
        expect(q.total, `${c.id}/${p.id}`).toBeGreaterThan(0);
        expect(q.error, `${c.id}/${p.id}`).toBeUndefined();
        expect(p.table?.rows.length, `${c.id}/${p.id} table`).toBeGreaterThan(0);
      }
  });

  it('mugs use tiers 1–4 / 5–9 / 10–49 / 50–199 / 200+', () => {
    const { p, s } = sel('mugs', 'mug', { options: { variant: 'white' } });
    const at = (qty: number) => p.quote({ ...s, qty }).unit;
    expect([at(1), at(4), at(5), at(9), at(10), at(49), at(50), at(199), at(200)]).toEqual([650, 650, 450, 450, 350, 350, 315, 315, 250]);
    expect(p.quote({ ...sel('mugs', 'mug', { options: { variant: 'chameleon' } }).s, qty: 1 }).unit).toBe(1100);
  });

  it('badges: roll −30% from 50 pcs, −50% from 100; pin first discount from 50', () => {
    const roll = findProduct('badges', 'badge-roll')!;
    const r = (qty: number, variant = 'd38') => roll.quote({ ...defaultSelection(roll), qty, options: { variant } }).unit;
    expect([r(10), r(49), r(50), r(99), r(100), r(199), r(200), r(500)]).toEqual([85, 85, 59.5, 59.5, 42.5, 42.5, 38, 30]);
    expect([r(49, 'd56'), r(50, 'd56'), r(100, 'd56'), r(200, 'd56')]).toEqual([100, 70, 50, 45]);
    const pin = findProduct('badges', 'badge-pin')!;
    const p = (qty: number) => pin.quote({ ...defaultSelection(pin), qty, options: { variant: 'd25' } }).unit;
    expect([p(25), p(49), p(50), p(200)]).toEqual([200, 200, 185, 170]);
  });

  it('3D stickers: 5/7 ₽ per cm², min 30, −5% from 100, −10% from 200', () => {
    const { p, s } = sel('stickers', 'sticker-3d', { qty: 30, dims: { w: 4, h: 4 } });
    expect(p.quote(s).unit).toBe(80);
    expect(p.quote(s).total).toBe(2400);
    expect(p.quote({ ...s, options: { cut: 'complex' } }).unit).toBe(112);
    expect(p.quote({ ...s, qty: 100 }).unit).toBe(76);
    expect(p.quote({ ...s, qty: 200 }).unit).toBe(72);
    expect(p.quote({ ...s, qty: 29 }).error).toBeDefined();
    expect(p.qty.max).toBe(300);
    expect(p.table?.columns).toEqual(['30–99 шт', '100–199 шт', '200–300 шт']);
  });

  it('sticker pack: same formula, discount by the total number of stickers', () => {
    const { p, s } = sel('stickers', 'sticker-pack', { qty: 5, options: { count: '6' }, dims: { w: 4, h: 4 } });
    expect(p.quote(s).unit).toBe(6 * 80);
    expect(p.qty.min).toBe(10);
    expect(p.qty.max).toBe(200);
    expect(p.quote({ ...s, qty: 10 }).unit).toBe(6 * 80); // 60 stickers
    expect(p.quote({ ...s, qty: 17 }).unit).toBe(6 * 76); // 102 stickers
    expect(p.ladder!({ ...s, qty: 10 }).map((t) => t.from)).toEqual([10, 17, 34]);
    // 12 in a pack: 10 packs = 120 stickers, the first step is already −5%
    expect(p.ladder!({ ...s, options: { count: '12', cut: 'simple' } }).map((t) => t.from)).toEqual([10, 17]);
  });

  it('vinyl stickers: from 100, 0.25 ₽/см² up to 299, 0.2 from 300; cut and film do not change the price', () => {
    const { p, s } = sel('stickers', 'vinyl-sticker', { qty: 140, dims: { w: 5, h: 5 } });
    expect(p.quote(s).unit).toBe(6.25);
    expect(p.quote({ ...s, qty: 299 }).unit).toBe(6.25);
    expect(p.quote({ ...s, qty: 300 }).unit).toBe(5);
    expect(p.quote({ ...s, options: { film: 'matte' } }).unit).toBe(6.25);
    expect(p.quote({ ...s, qty: 99 }).error).toBeDefined();
  });

  it('stickers: minimum order 850 ₽ — the smallest run grows for small sizes, rounded up to tens', () => {
    const v = findProduct('stickers', 'vinyl-sticker')!;
    const vmin = (w: number, h: number) => v.minQty!({ ...defaultSelection(v), dims: { w, h } });
    expect(vmin(5, 5)).toBe(140); // 6,25 ₽ → 875 ₽
    expect(vmin(10, 10)).toBe(100); // 25 ₽ × 100 = 2500 ₽
    expect(vmin(3, 3)).toBe(480); // from 300 pcs 1,8 ₽ × 480 = 864 ₽
    expect(v.quote({ ...defaultSelection(v), qty: 130, dims: { w: 5, h: 5 } }).error).toBeDefined();
    const e = findProduct('stickers', 'sticker-3d')!;
    const emin = (w: number, h: number, cut = 'simple') => e.minQty!({ ...defaultSelection(e), options: { cut }, dims: { w, h } });
    expect(emin(4, 4)).toBe(30);
    expect(emin(2, 2)).toBe(50); // 20 ₽ × 50 = 1000 ₽ (40 шт — 800 ₽)
    expect(emin(2, 2, 'complex')).toBe(40); // 28 ₽ × 40 = 1120 ₽
    expect(e.ladder!({ ...defaultSelection(e), dims: { w: 2, h: 2 } })[0].from).toBe(50);
    expect(findProduct('stickers', 'vinyl-pack')!.qty.max).toBe(200);
  });

  it('3D stickers under 4 cm² cost +30%', () => {
    const { p, s } = sel('stickers', 'sticker-3d', { qty: 100, dims: { w: 1.5, h: 2 } });
    expect(p.quote(s).unit).toBe(round2(3 * 5 * 1.3 * 0.95));
    expect(p.quote({ ...s, dims: { w: 2, h: 2 } }).unit).toBe(19); // exactly 4 cm² — no surcharge
    expect(p.quote({ ...s, options: { cut: 'complex' } }).unit).toBeCloseTo(3 * 7 * 1.3 * 0.95, 1);
    const pk = sel('stickers', 'sticker-pack', { qty: 10, options: { count: '6' }, dims: { w: 1.5, h: 1.5 } });
    expect(pk.p.quote(pk.s).unit).toBe(round2(6 * round2(2.25 * 6.5)));
  });

  it('vinyl sticker packs: from 50 — А6 80 / А5 120, from 100 — 70 / 105', () => {
    const p = findProduct('stickers', 'vinyl-pack')!;
    const at = (qty: number, variant: string) => p.quote({ ...defaultSelection(p), qty, options: { ...defaultSelection(p).options, variant } }).unit;
    expect([at(50, 'a6'), at(99, 'a6'), at(100, 'a6'), at(50, 'a5'), at(100, 'a5')]).toEqual([80, 80, 70, 120, 105]);
    expect(p.qty.min).toBe(50);
  });

  it('set of 3×3 stickers: 3 — 200, 5 — 150, 10–30 — 100 ₽/шт', () => {
    const p = findProduct('stickers', 'sticker-set')!;
    const at = (qty: number) => p.quote({ ...defaultSelection(p), qty }).unit;
    expect([at(3), at(4), at(5), at(9), at(10), at(30)]).toEqual([200, 200, 150, 150, 100, 100]);
    expect(p.table?.columns).toEqual(['3–4 шт', '5–9 шт', '10–30 шт']);
  });

  it('DTF sheets А3: 900 / 700 / 500 / 400, sublimation sheets А3 220…120, А4 — half; up to 50', () => {
    const d = findProduct('transfers', 'dtf-sheet')!;
    const at = (p: typeof d, qty: number, variant = 'a3') => p.quote({ ...defaultSelection(p), qty, options: { variant } }).unit;
    expect([1, 4, 5, 9, 10, 29, 30, 50].map((q) => at(d, q))).toEqual([900, 900, 700, 700, 500, 500, 400, 400]);
    expect(d.table?.columns).toEqual(['1–4 шт', '5–9 шт', '10–29 шт', '30–50 шт']);
    const sub = findProduct('transfers', 'sub-sheet')!;
    expect([1, 5, 10, 30].map((q) => at(sub, q))).toEqual([220, 180, 150, 120]);
    expect([1, 5, 10, 30].map((q) => at(sub, q, 'a4'))).toEqual([110, 90, 75, 60]);
  });

  it('t-shirt = blank + DTF print, every extra print at 70%', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { options: { print1: 'a4', print2: 'a6', print3: 'a6' }, qty: 1 });
    // 750 + 800 + 600*0.7 + 600*0.7
    expect(p.quote(s).unit).toBe(750 + 800 + 420 + 420);
    const q20 = p.quote({ ...s, options: { ...s.options, print2: 'none', print3: 'none' }, qty: 20 });
    expect(q20.unit).toBe(550 + 450);
    expect(q20.total).toBe(20 * 1000);
  });

  it('several prints are ranked by price: the dearest full, every next −30%', () => {
    const { p, s } = sel('textile', 'own-item', { qty: 1, options: { print1: 'a6', print2: 'a3', print3: 'a4' } });
    const { p: p2, s: s2 } = sel('textile', 'own-item', { qty: 1, options: { print1: 'a3', print2: 'a4', print3: 'a6' } });
    // 1100 + 800 −30% + 600 −30%
    expect(p.quote(s).total).toBe(1100 + 560 + 420);
    expect(p.quote(s).total).toBe(p2.quote(s2).total);
    expect(p.quote(s).breakdown.map((b) => b.label)).toEqual(['Печать DTF А3', 'Печать DTF А4 (−30%)', 'Печать DTF А6 (−30%)']);
  });

  it('the 4th print is also at −30%', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a6', print2: 'a3', print3: 'a6', print4: 'a4' } });
    expect(p.quote(s).total).toBe(750 + 1100 + 800 * 0.7 + 600 * 0.7 + 600 * 0.7);
  });

  // owner, 16.11.2026 (after the hoodie): hoodie like T-shirts — 5 prints up to А3; cap — 4 prints, all А6; shopper — 2 up to А4
  it('prints per product: hoodie 5 × А6–А3, cap 4 × А6, cotton shopper 2 × А6–А4', () => {
    const places = (id: string) => findProduct('textile', id)!.options!.filter((g) => /^print\d$/.test(g.id));
    const formats = (id: string) => places(id)[0].choices.map((c) => c.id);
    expect(places('hoodie')).toHaveLength(5);
    expect(formats('hoodie')).toEqual(['a6', 'a5', 'a4', 'a3']);
    expect(places('cap')).toHaveLength(4);
    expect(formats('cap')).toEqual(['a6']);
    expect(places('shopper')).toHaveLength(2);
    expect(formats('shopper')).toEqual(['a6', 'a5', 'a4']);
    const h = sel('textile', 'hoodie', { qty: 1, options: { print1: 'a3', print2: 'a3', print3: 'a6', print4: 'a6', print5: 'a6' } });
    expect(h.p.quote(h.s).total).toBe(2600 + 1100 + 1100 * 0.7 + 3 * 600 * 0.7);
    const c = sel('textile', 'cap', { qty: 1, options: { print1: 'a6', print2: 'a6', print3: 'a6', print4: 'a6' } });
    expect(c.p.quote(c.s).total).toBe(650 + 600 + 3 * 420);
  });

  // owner, 16.11.2026 (workwear and sport pages): print on the customer's own item — up to 5 prints, each А6–А3
  it('own-item: 5 prints А6–А3, the 5th also −30%; an old line with 3 places still quotes', () => {
    const places = findProduct('textile', 'own-item')!.options!.filter((g) => /^print\d$/.test(g.id));
    expect(places).toHaveLength(5);
    expect(places[0].choices.map((c) => c.id)).toEqual(['a6', 'a5', 'a4', 'a3']);
    const o = sel('textile', 'own-item', { qty: 1, options: { print1: 'a3', print2: 'a3', print3: 'a6', print4: 'a6', print5: 'a6' } });
    expect(o.p.quote(o.s).total).toBe(1100 + 1100 * 0.7 + 3 * 600 * 0.7);
    expect(o.p.quote(o.s).breakdown.filter((b) => b.label.includes('(−30%)'))).toHaveLength(4);
    const old = sel('textile', 'own-item', { qty: 1, options: { print1: 'a6', print2: 'a6', print3: 'a6' } });
    delete (old.s.options as Record<string, unknown>).print4;
    delete (old.s.options as Record<string, unknown>).print5;
    expect(old.p.quote(old.s).total).toBe(600 + 2 * 420);
  });

  it('old estimate lines: hoodie with 4 places, cap with 3 places still quote', () => {
    const h = sel('textile', 'hoodie', { qty: 1, options: { print1: 'a4', print2: 'a6', print3: 'none', print4: 'a6' } });
    delete (h.s.options as Record<string, unknown>).print5;
    expect(h.p.quote(h.s).total).toBe(2600 + 800 + 2 * 420);
    const c = sel('textile', 'cap', { qty: 1, options: { print1: 'a6', print2: 'a6', print3: 'a6' } });
    delete (c.s.options as Record<string, unknown>).print4;
    expect(c.p.quote(c.s).total).toBe(650 + 600 + 2 * 420);
  });

  it('t-shirts (unisex and kids) take up to 5 prints, the 5th also at −30%', () => {
    for (const id of ['tshirt-unisex', 'tshirt-kids']) {
      expect(findProduct('textile', id)!.options!.filter((g) => g.id.startsWith('print')), id).toHaveLength(5);
    }
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a3', print2: 'a6', print3: 'a6', print4: 'a6', print5: 'a6' } });
    expect(p.quote(s).total).toBe(750 + 1100 + 4 * 600 * 0.7);
    expect(p.quote(s).breakdown).toHaveLength(6);
    const own = sel('textile', 'tshirt-unisex', { qty: 1, options: { blank: 'own', print1: 'a4', print5: 'a6' } });
    expect(own.p.quote(own.s).total).toBe(800 + 420);
  });

  it('kids t-shirt: print sizes А6–А3, А3 is priced', () => {
    const p = findProduct('textile', 'tshirt-kids')!;
    expect(p.options!.find((g) => g.id === 'print1')!.choices.map((c) => c.id)).toEqual(['a6', 'a5', 'a4', 'a3']);
    const { s } = sel('textile', 'tshirt-kids', { qty: 1, options: { print1: 'a3' } });
    expect(p.quote(s).total).toBe(750 + 1100);
    expect(p.table!.rows.map((r) => r.label)).toContain('+ печать DTF А3');
  });

  it('old estimate lines (4 prints, kids up to А4) still quote', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a4', print2: 'a6', print3: 'a6', print4: 'a6' } });
    delete (s.options as Record<string, unknown>).print5;
    expect(p.quote(s).total).toBe(750 + 800 + 3 * 420);
    const k = sel('textile', 'tshirt-kids', { qty: 1, options: { print1: 'a4', print2: 'a6' } });
    delete (k.s.options as Record<string, unknown>).print3;
    delete (k.s.options as Record<string, unknown>).print4;
    delete (k.s.options as Record<string, unknown>).print5;
    expect(k.p.quote(k.s).total).toBe(750 + 800 + 420);
  });

  it('hoodie: 2 600 ₽ at any run, exact (no «от»), white and black from 1 pc', () => {
    const p = findProduct('textile', 'hoodie')!;
    for (const qty of [1, 5, 20, 50]) {
      const q = p.quote({ ...defaultSelection(p), qty, options: { ...defaultSelection(p).options, print1: 'none' } });
      expect(q.breakdown[0], `qty ${qty}`).toEqual({ label: 'Худи', amount: 2600, per: 'шт' });
      expect(q.from, `qty ${qty}`).toBeFalsy();
    }
    const q1 = p.quote(defaultSelection(p));
    expect(q1.notes.join(' ')).not.toContain('уточнит');
    expect(p.short).not.toContain('уточняйте');
    expect(p.table!.rows[0].cells.every((c) => !c.startsWith('от'))).toBe(true);
    expect(p.quote({ ...defaultSelection(p), options: { ...defaultSelection(p).options, color: 'black' } }).error).toBeUndefined();
  });

  it('own hoodie: «Наше худи / Своё худи», only the DTF print, colour hidden, no minimum', () => {
    const p = findProduct('textile', 'hoodie')!;
    const blank = p.options!.find((g) => g.id === 'blank')!;
    expect(blank.choices.map((c) => c.label)).toEqual(['Наше худи', 'Своё худи']);
    expect(p.options!.find((g) => g.id === 'color')!.hideWhen).toEqual({ group: 'blank', value: 'own' });
    const { s } = sel('textile', 'hoodie', { qty: 1, options: { blank: 'own', print1: 'a4' } });
    const q = p.quote(s);
    expect(q.total).toBe(800);
    expect(q.error).toBeUndefined();
    expect(q.breakdown.map((b) => b.label)).toEqual(['Печать DTF А4']);
    expect(q.notes.join(' ')).toContain('Своё худи: принесите его в мастерскую, напечатаем на нём.');
    expect(p.minQty!({ ...s, options: { ...s.options, color: 'red' } })).toBe(1);
    // the T-shirt wording stays feminine
    const t = sel('textile', 'tshirt-unisex', { qty: 1, options: { blank: 'own' } });
    expect(t.p.quote(t.s).notes.join(' ')).toContain('Своя футболка: принесите её в мастерскую, напечатаем на ней.');
  });

  // spec 2026-11-16-shoppers-caps: the «Свой шоппер» tile — the customer's shopper, only the DTF print
  it('own shopper: «Наш шоппер / Свой шоппер», only the DTF print, colour hidden, no minimum', () => {
    const p = findProduct('textile', 'shopper')!;
    const blank = p.options!.find((g) => g.id === 'blank')!;
    expect(blank.choices.map((c) => c.label)).toEqual(['Наш шоппер', 'Свой шоппер']);
    expect(p.options!.find((g) => g.id === 'color')!.hideWhen).toEqual({ group: 'blank', value: 'own' });
    const { s } = sel('textile', 'shopper', { qty: 1, options: { blank: 'own', color: 'red', print1: 'a4' } });
    const q = p.quote(s);
    expect(q.total).toBe(800);
    expect(q.error).toBeUndefined();
    expect(q.breakdown.map((b) => b.label)).toEqual(['Печать DTF А4']);
    expect(q.notes.join(' ')).toContain('Свой шоппер: принесите его в мастерскую, напечатаем на нём.');
    expect(p.minQty!(s)).toBe(1);
    // ours stays as it was: 450 + A4 800
    expect(p.quote(sel('textile', 'shopper', { qty: 1, options: { print1: 'a4' } }).s).total).toBe(1250);
  });

  // review 16.11.2026: the shopper-sub table showed 250 ₽ in «21–99 шт» while from 50 pcs it is 230 ₽
  it('sublimation tables: every cell equals what the calculator quotes at the column start', () => {
    for (const id of ['shopper-sub', 'tshirt-sub', 'sub-print']) {
      const p = findProduct('textile', id)!;
      const t = p.table!;
      t.columns.forEach((col, ci) => {
        const qty = Math.max(Number(col.match(/\d+/)![0]), p.qty.min);
        t.rows.forEach((row) => {
          const f = row.label.match(/сублимация (А\d)/)?.[1];
          const fid = f ? { А6: 'a6', А5: 'a5', А4: 'a4', А3: 'a3' }[f]! : 'a6';
          const q = p.quote({ ...defaultSelection(p), options: { ...defaultSelection(p).options, print1: fid }, qty });
          const want = f ? q.breakdown.find((b) => b.label.startsWith(`Сублимация ${f}`))!.amount : q.breakdown[0].amount;
          expect(row.cells[ci], `${id} ${row.label} @ ${col}`).toBe(`${f ? '+' : ''}${rub(want)}`);
        });
      });
    }
    expect(findProduct('textile', 'shopper-sub')!.table!.columns).toContain('50–99 шт');
    // the table starts at the minimum order, not «1–10 шт»
    expect(findProduct('textile', 'shopper-sub')!.table!.columns[0]).toBe('10 шт');
    expect(findProduct('textile', 'tshirt-sub')!.table!.columns[0]).toBe('10 шт');
    expect(findProduct('textile', 'sub-print')!.table!.columns[0]).toBe('1–10 шт');
  });

  it('clothing is priced up to 50 pcs, more — individually', () => {
    const p = findProduct('textile', 'tshirt-unisex')!;
    expect(p.qty.max).toBe(50);
    expect(p.table?.columns).toEqual(['1–4 шт', '5–19 шт', '20–50 шт']);
    const { s } = sel('textile', 'tshirt-unisex', { qty: 50 });
    expect(p.quote(s).notes.some((n) => n.includes('индивидуально'))).toBe(true);
  });

  it('own t-shirt: only the print is charged, colour does not matter', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { blank: 'own', color: 'red', print1: 'a4' } });
    const q = p.quote(s);
    expect(q.total).toBe(800);
    expect(q.error).toBeUndefined();
    expect(q.breakdown.map((b) => b.label)).toEqual(['Печать DTF А4']);
  });

  // owner, 16.11.2026: the colour minimum is set per product — T-shirts and hoodie 5, cotton shopper and cap 10
  const MINS: [string, number, string][] = [
    ['tshirt-unisex', 5, 'Цветные футболки'],
    ['tshirt-kids', 5, 'Цветные футболки'],
    ['hoodie', 5, 'Цветные худи'],
    ['shopper', 10, 'Цветные шопперы'],
    ['cap', 10, 'Цветные бейсболки'],
  ];

  it('white and black from 1 pc; coloured from the product minimum (5 / 5 / 5 / 10 / 10)', () => {
    expect(COLOR_FREE).toEqual(['white', 'black']);
    for (const [id, min] of MINS) {
      const at = (color: string) => {
        const { p, s } = sel('textile', id, { options: { color } });
        return p.minQty!(s);
      };
      expect([at('white'), at('black'), at('red'), at('lilac')], id).toEqual([1, 1, min, min]);
    }
  });

  it('own item: no colour minimum (t-shirt, hoodie, cap)', () => {
    for (const id of ['tshirt-unisex', 'hoodie', 'cap']) {
      const { p, s } = sel('textile', id, { options: { color: 'red', blank: 'own' } });
      expect(p.minQty!(s), id).toBe(1);
      expect(p.quote(s).error, id).toBeUndefined();
    }
  });

  it('old estimate colours (cap «khaki», shopper «light» / «other», unknown) do not crash and count as coloured', () => {
    const old: [string, string, number][] = [
      ['tshirt-unisex', 'other', 5],
      ['tshirt-unisex', 'zzz', 5],
      ['cap', 'khaki', 10],
      ['shopper', 'light', 10],
      ['shopper', 'other', 10],
    ];
    for (const [id, color, min] of old) {
      const { p, s } = sel('textile', id, { qty: min, options: { color } });
      expect(p.minQty!(s), `${id} ${color}`).toBe(min);
      expect(p.quote(s).error, `${id} ${color}`).toBeUndefined();
      expect(p.quote({ ...s, qty: 1 }).error, `${id} ${color}`).toContain(`от ${min} шт`);
    }
  });

  it('the 11 owner colours on T-shirts, hoodie, shopper and cap; no «другой цвет»; hint = the product minimum', () => {
    expect(GARMENT_COLORS.map((c) => c.id)).toEqual(['white', 'black', 'yellow', 'green', 'brown', 'red', 'orange', 'pink', 'gray', 'blue', 'lilac']);
    expect(GARMENT_COLORS.map((c) => c.swatch)).toEqual(['#ffffff', '#1b1b1d', '#ffe000', '#0a7d4a', '#7e4e2a', '#e31e36', '#ff6a2a', '#f2bccb', '#8c8c8c', '#2e5fd8', '#6a64a8']);
    for (const [id, min] of MINS) {
      const ch = findProduct('textile', id)!.options!.find((g) => g.id === 'color')!.choices;
      expect(ch.map((c) => c.id), id).toEqual(GARMENT_COLORS.map((c) => c.id));
      expect(ch.map((c) => c.hint), id).toEqual([undefined, undefined, ...Array(9).fill(`от ${min} шт`)]);
    }
  });

  it('coloured below the minimum: no price, error with the product wording', () => {
    for (const [id, min, noun] of MINS) {
      const err = (color: string, qty: number) => {
        const { p, s } = sel('textile', id, { qty, options: { color } });
        return p.quote(s).error;
      };
      expect(err('red', min - 1), id).toBe(`${noun} — от ${min} шт`);
      expect(err('red', min), id).toBeUndefined();
      expect(err('white', 1), id).toBeUndefined();
      expect(err('black', 1), id).toBeUndefined();
    }
  });

  it('minimum-run note: «Цветные худи / шопперы / бейсболки — от N шт», nothing for white and black', () => {
    const note = (id: string, options: Record<string, string>) => {
      const { p, s } = sel('textile', id, { options });
      return p.minQtyNote?.(s);
    };
    expect(note('tshirt-unisex', { color: 'red' })).toBe('Цветные футболки — от 5 шт');
    expect(note('hoodie', { color: 'red' })).toBe('Цветные худи — от 5 шт');
    expect(note('shopper', { color: 'red' })).toBe('Цветные шопперы — от 10 шт');
    expect(note('cap', { color: 'red' })).toBe('Цветные бейсболки — от 10 шт');
    expect(note('tshirt-unisex', { color: 'white' })).toBeUndefined();
    expect(note('shopper', { color: 'black' })).toBeUndefined();
    expect(note('tshirt-unisex', { color: 'red', blank: 'own' })).toBeUndefined();
  });

  it('every extra print is −30%, note says so', () => {
    expect(extraPrintFactor).toEqual([1, 0.7, 0.7]);
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a4', print2: 'a4' } });
    expect(p.quote(s).unit).toBe(750 + 800 + 560);
    expect(p.quote(s).notes.join(' ')).toContain('каждый следующий −30%');
    const three = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a3', print2: 'a4', print3: 'a6' } });
    expect(three.p.quote(three.s).unit).toBe(750 + 1100 + 800 * 0.7 + 600 * 0.7);
  });

  it('hints the next cheaper tier', () => {
    const { p, s } = sel('mugs', 'mug', { qty: 3 });
    expect(p.quote(s).next).toEqual({ qty: 5, unit: 450 });
  });

  it('wide format is priced by area', () => {
    const { p, s } = sel('wide', 'wide-print', { dims: { w: 200, h: 100 }, options: { material: 'banner' }, qty: 2 });
    expect(p.quote(s).total).toBe(2 * 1300 * 2);
  });

  it('pocket calendars are priced per package', () => {
    const { p, s } = sel('calendars', 'cal-pocket', { qty: 300 });
    expect(p.quote(s).total).toBe(1795);
  });

  it('business cards: fixed runs below 500, any amount from 500', () => {
    const one = (qty: number) => { const { p, s } = sel('cards', 'business-cards', { qty }); return p.quote(s); };
    expect(one(96).total).toBe(595);
    expect(one(300).unit).toBe(4);
    expect(one(750).unit).toBe(3.5);
    expect(one(1000).unit).toBe(3.2);
    expect(one(6000).unit).toBe(2.4);
    const { p, s } = sel('cards', 'business-cards', { qty: 6000, options: { variant: 's2' } });
    expect(p.quote(s).unit).toBe(3.2);
    expect(p.table?.columns).toEqual(['96 шт', '200 шт', '300 шт', '500–999 шт', '1000–5999 шт', 'от 6000 шт']);
  });

  it('quarterly calendars: supplier price +20%, planks and fold extra', () => {
    const q = (qty: number, options: Selection['options'] = {}) => {
      const { p, s } = sel('calendars', 'cal-quarterly', { qty, options });
      return p.quote(s);
    };
    expect(q(10).unit).toBe(672); // МИДИ 3 поля: 560 × 1,2
    expect(q(100, { model: 'mini1' }).unit).toBe(372);
    expect(q(1000, { model: 'midi1' }).unit).toBe(348);
    expect(q(50, { model: 'midi3', strip: 'gold', fold: ['fold'] }).unit).toBe(636 + 130 + 40);
    expect(q(100, { model: 'mini3', strip: 'silver' }).total).toBe((444 + 110) * 100);
    expect(q(300, { model: 'trio' }).unit).toBe(360);
  });

  it('mugs: 330 ml types, 425 ml, coffee set and 600 ml beer mug on the same tiers', () => {
    const u = (id: string, qty: number) => {
      const { p, s } = sel('mugs', id, { qty });
      return p.quote(s).unit;
    };
    expect(u('mug-big', 1)).toBe(800);
    expect(u('mug-big', 200)).toBe(400);
    expect(u('coffee-set', 10)).toBe(890);
    expect(u('beer-mug', 5)).toBe(800);
    expect(u('beer-mug', 50)).toBe(690);
  });

  it('sublimation shopper: blank 250/230 + sublimation print by run', () => {
    const q = (qty: number, options: Selection['options'] = {}) => {
      const { p, s } = sel('textile', 'shopper-sub', { qty, options });
      return p.quote(s).unit;
    };
    expect(q(10)).toBe(250 + 400); // А4 до 10 шт
    expect(q(20, { print1: 'a3' })).toBe(250 + 380);
    expect(q(50, { print1: 'a4', print2: 'a6' })).toBe(230 + 150 + 80);
    expect(q(100, { print1: 'a5' })).toBe(230 + 80);
    const { p: tp, s: ts } = sel('textile', 'tshirt-sub', { qty: 10, options: { print1: 'a4', print2: 'a3' } });
    expect(tp.quote(ts).unit).toBe(720 + 400 + 600);
    const { p, s } = sel('textile', 'sub-print', { qty: 1, options: { print1: 'a6' } });
    expect(p.quote(s).unit).toBe(175);
  });

  it('cap: 650 / 550 / 450 by run + DTF A6, up to 100 pcs', () => {
    const u = (qty: number) => {
      const { p, s } = sel('textile', 'cap', { qty });
      return p.quote(s).unit;
    };
    expect(u(1)).toBe(650 + 600);
    expect(u(10)).toBe(550 + 350);
    expect(u(30)).toBe(450 + 280);
    const p = findProduct('textile', 'cap')!;
    expect(p.qty.max).toBe(100);
    expect(p.table?.columns).toEqual(['1–4 шт', '5–9 шт', '10–19 шт', '20–29 шт', '30–100 шт']);
  });

  it('own cap: only the print is charged', () => {
    const { p, s } = sel('textile', 'cap', { qty: 1, options: { blank: 'own' } });
    expect(p.quote(s).total).toBe(600);
  });

  it('formats labels', () => {
    expect(rangeLabels([1, 5, 10, 50, 200])).toEqual(['1–4 шт', '5–9 шт', '10–49 шт', '50–199 шт', 'от 200 шт']);
    expect(rub(7.5).replace(/\s/g, ' ')).toBe('7,5 ₽');
    expect(rub(1100).replace(/\s/g, ' ')).toBe('1 100 ₽');
  });
});

describe('colorChoices: цвета изделия и их минимум — из правил прайса, не из подсказок', async () => {
  const { colorChoices } = await import('./pricing');
  it('футболка и худи: белый и чёрный с 1 шт, остальные 9 — от 5 шт', () => {
    for (const id of ['tshirt-unisex', 'hoodie']) {
      const c = colorChoices('textile', id);
      expect(c.map((x) => x.id), id).toEqual(GARMENT_COLORS.map((x) => x.id));
      expect(c.filter((x) => x.min === 1).map((x) => x.id), id).toEqual(['white', 'black']);
      expect(c.filter((x) => x.min > 1).map((x) => x.min), id).toEqual(Array(9).fill(5));
    }
  });
  it('шоппер и бейсболка: 11 цветов, белый и чёрный с 1 шт, остальные — от 10 шт; «другого цвета» нет', () => {
    for (const id of ['shopper', 'cap']) {
      const c = colorChoices('textile', id);
      expect(c, id).toHaveLength(11);
      expect(c.some((x) => x.id === 'other'), id).toBe(false);
      expect(c.filter((x) => x.min > 1).map((x) => x.min), id).toEqual(Array(9).fill(10));
    }
  });
  it('у изделия без цветов — пусто', () => {
    expect(colorChoices('textile', 'own-item')).toEqual([]);
  });
});
