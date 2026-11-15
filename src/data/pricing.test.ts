import { describe, expect, it } from 'vitest';
import { categories, defaultSelection, findProduct, rangeLabels, rub, type Selection } from './pricing';

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

  it('t-shirt = blank + DTF print, extra prints at 70% and 50%', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { options: { print1: 'a4', print2: 'a6', print3: 'a6' }, qty: 1 });
    // 750 + 800 + 600*0.7 + 600*0.5
    expect(p.quote(s).unit).toBe(750 + 800 + 420 + 300);
    const q20 = p.quote({ ...s, options: { ...s.options, print2: 'none', print3: 'none' }, qty: 20 });
    expect(q20.unit).toBe(550 + 450);
    expect(q20.total).toBe(20 * 1000);
  });

  it('several prints are ranked by price: the dearest full, next −30%, rest −50%', () => {
    const { p, s } = sel('textile', 'own-item', { qty: 1, options: { print1: 'a6', print2: 'a3', print3: 'a4' } });
    const { p: p2, s: s2 } = sel('textile', 'own-item', { qty: 1, options: { print1: 'a3', print2: 'a4', print3: 'a6' } });
    // owner's example: 1100 + 800 −30% + 600 −50%
    expect(p.quote(s).total).toBe(1100 + 560 + 300);
    expect(p.quote(s).total).toBe(p2.quote(s2).total);
    expect(p.quote(s).breakdown.map((b) => b.label)).toEqual(['Печать DTF А3', 'Печать DTF А4 (−30%)', 'Печать DTF А6 (−50%)']);
  });

  it('t-shirt and hoodie take up to 4 prints, the 4th also at −50%', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { print1: 'a6', print2: 'a3', print3: 'a6', print4: 'a4' } });
    expect(p.quote(s).total).toBe(750 + 1100 + 800 * 0.7 + 600 * 0.5 + 600 * 0.5);
    expect(findProduct('textile', 'hoodie')!.options!.filter((g) => g.id.startsWith('print'))).toHaveLength(4);
    expect(findProduct('textile', 'cap')!.options!.filter((g) => g.id.startsWith('print'))).toHaveLength(3);
  });

  it('clothing is priced up to 50 pcs, more — individually', () => {
    const p = findProduct('textile', 'tshirt-unisex')!;
    expect(p.qty.max).toBe(50);
    expect(p.table?.columns).toEqual(['1–4 шт', '5–19 шт', '20–50 шт']);
    const { s } = sel('textile', 'tshirt-unisex', { qty: 50 });
    expect(p.quote(s).notes.some((n) => n.includes('индивидуально'))).toBe(true);
  });

  it('own t-shirt: only the print is charged, colour does not matter', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { qty: 1, options: { blank: 'own', color: 'other', print1: 'a4' } });
    const q = p.quote(s);
    expect(q.total).toBe(800);
    expect(q.error).toBeUndefined();
    expect(q.breakdown.map((b) => b.label)).toEqual(['Печать DTF А4']);
  });

  it('coloured t-shirts need at least 10 pcs', () => {
    const { p, s } = sel('textile', 'tshirt-unisex', { options: { color: 'other' }, qty: 5 });
    expect(p.quote(s).error).toBeTruthy();
    expect(p.quote({ ...s, qty: 10 }).error).toBeUndefined();
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

  it('cotton shopper: other colours sewn from 20 pcs', () => {
    const { p, s } = sel('textile', 'shopper', { qty: 5, options: { color: 'other' } });
    expect(p.quote(s).error).toContain('от 20 шт');
    expect(p.quote({ ...s, qty: 20 }).error).toBeUndefined();
    expect(p.quote({ ...s, options: { ...s.options, color: 'black' } }).error).toBeUndefined();
  });

  it('cap: 650 / 550 / 450 by run + DTF A6, up to 100 pcs, 7 colours', () => {
    const u = (qty: number) => {
      const { p, s } = sel('textile', 'cap', { qty });
      return p.quote(s).unit;
    };
    expect(u(1)).toBe(650 + 600);
    expect(u(10)).toBe(550 + 350);
    expect(u(30)).toBe(450 + 280);
    const p = findProduct('textile', 'cap')!;
    expect(p.qty.max).toBe(100);
    expect(p.options!.find((g) => g.id === 'color')!.choices).toHaveLength(7);
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
