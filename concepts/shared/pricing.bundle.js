"use strict";
var MSPricing = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../msuvenirov2.0/src/data/pricing.ts
  var pricing_exports = {};
  __export(pricing_exports, {
    GARMENT_MAX: () => GARMENT_MAX,
    PACK_MAX: () => PACK_MAX,
    PACK_MIN: () => PACK_MIN,
    SHEET_MAX: () => SHEET_MAX,
    SMALL_STICKER_AREA: () => SMALL_STICKER_AREA,
    SMALL_STICKER_EXTRA: () => SMALL_STICKER_EXTRA,
    STICKER_MAX: () => STICKER_MAX,
    STICKER_MIN: () => STICKER_MIN,
    STICKER_MIN_SUM: () => STICKER_MIN_SUM,
    VINYL_MIN: () => VINYL_MIN,
    VINYL_PACK_MIN: () => VINYL_PACK_MIN,
    categories: () => categories,
    categoryFrom: () => categoryFrom,
    defaultSelection: () => defaultSelection,
    dtfPrint: () => dtfPrint,
    extraPrintFactor: () => extraPrintFactor,
    findCategory: () => findCategory,
    findProduct: () => findProduct,
    nextTier: () => nextTier,
    qtyLabels: () => qtyLabels,
    rangeLabels: () => rangeLabels,
    rub: () => rub,
    stickerDiscounts: () => stickerDiscounts,
    stickerRate: () => stickerRate,
    subPrint: () => subPrint,
    tierPrice: () => tierPrice,
    vinylTiers: () => vinylTiers
  });
  var tierPrice = (tiers2, qty) => {
    let p = tiers2[0].price;
    for (const t of tiers2) if (qty >= t.from) p = t.price;
    return p;
  };
  var nextTier = (tiers2, qty) => {
    const cur = tierPrice(tiers2, qty);
    return tiers2.find((t) => t.from > qty && t.price < cur);
  };
  var one = (sel, id, fallback) => {
    const v = sel.options[id];
    return typeof v === "string" ? v : fallback;
  };
  var many = (sel, id) => {
    const v = sel.options[id];
    return Array.isArray(v) ? v : [];
  };
  var round = (n) => Math.round(n * 100) / 100;
  var rub = (n) => `${n.toLocaleString("ru-RU", { maximumFractionDigits: n % 1 ? 2 : 0, minimumFractionDigits: n % 1 ? 1 : 0 })} \u20BD`;
  var qtyLabels = (from, qty) => {
    if (qty.individualAbove || qty.moreIn) {
      const labels = rangeLabels(from);
      labels[labels.length - 1] = `${from[from.length - 1]}\u2013${qty.max} \u0448\u0442`;
      return labels;
    }
    if (!qty.presets) return rangeLabels(from);
    const free = qty.freeFrom ?? Infinity;
    const ranges = rangeLabels(from);
    return from.map((f, i) => f < free ? `${f.toLocaleString("ru-RU")} \u0448\u0442` : ranges[i]);
  };
  var rangeLabels = (from) => from.map((f, i) => {
    if (from.length === 1) return `\u043E\u0442 ${f} \u0448\u0442`;
    if (i === from.length - 1) return `\u043E\u0442 ${f} \u0448\u0442`;
    const to = from[i + 1] - 1;
    return to === f ? `${f} \u0448\u0442` : `${f}\u2013${to} \u0448\u0442`;
  });
  var tiers = (from, prices) => from.map((f, i) => ({ from: f, price: prices[i] }));
  var minPrice = (t) => Math.min(...t.map((x) => x.price));
  function tiered(args) {
    const groups = [];
    if (args.variants.length > 1) {
      groups.push({
        id: "variant",
        label: args.variantLabel ?? "\u0412\u0430\u0440\u0438\u0430\u043D\u0442",
        type: "one",
        choices: args.variants.map((v) => ({ id: v.id, label: v.label, hint: v.hint })),
        default: args.variants[0].id
      });
    }
    if (args.choices?.length) groups.push(...args.choices);
    if (args.extras?.length) {
      groups.push({
        id: "extras",
        label: args.extrasLabel ?? "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E",
        type: "many",
        choices: args.extras.map((e) => ({ id: e.id, label: e.label, hint: `+${e.price} \u20BD/\u0448\u0442` })),
        default: []
      });
    }
    const variantOf = (sel) => args.variants.find((v) => v.id === one(sel, "variant", args.variants[0].id)) ?? args.variants[0];
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
          ...(args.extras ?? []).map((e) => ({ label: `+ ${e.label}`, cells: args.variants[0].tiers.map(() => `+${rub(e.price)}`) }))
        ]
      },
      ladder: (sel) => variantOf(sel).tiers,
      quote: (sel) => {
        const v = variantOf(sel);
        const base = tierPrice(v.tiers, sel.qty);
        const breakdown = [{ label: args.variants.length > 1 ? v.label : args.name, amount: base, per: "\u0448\u0442" }];
        let unit = base;
        for (const id of many(sel, "extras")) {
          const e = args.extras?.find((x) => x.id === id);
          if (e) {
            unit += e.price;
            breakdown.push({ label: e.label, amount: e.price, per: "\u0448\u0442" });
          }
        }
        const nt = nextTier(v.tiers, sel.qty);
        return {
          unit,
          total: Math.round(unit * sel.qty),
          breakdown,
          next: nt ? { qty: nt.from, unit: unit - base + nt.price } : void 0,
          notes: args.notes ?? []
        };
      }
    };
  }
  function fixed(id, name, price, opts = {}) {
    return {
      id,
      name,
      short: opts.short,
      image: opts.image,
      qty: { min: 1, max: 100, default: 1 },
      fromPrice: price,
      table: { columns: ["\u0426\u0435\u043D\u0430"], rows: [{ label: name, cells: [`${opts.from ? "\u043E\u0442 " : ""}${rub(price)}`] }] },
      quote: (sel) => ({
        unit: price,
        total: price * sel.qty,
        from: opts.from,
        breakdown: [{ label: name, amount: price, per: "\u0448\u0442" }],
        notes: opts.from ? ["\u0418\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u0438 \u043C\u0430\u043A\u0435\u0442\u0430 \u2014 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442 \u0435\u0451 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430."] : []
      })
    };
  }
  var dtfPrint = {
    a6: { label: "\u04106", size: "10\xD715 \u0441\u043C", tiers: tiers([1, 5, 20], [600, 350, 280]) },
    a5: { label: "\u04105", size: "15\xD721 \u0441\u043C", tiers: tiers([1, 5, 20], [600, 450, 330]) },
    a4: { label: "\u04104", size: "21\xD728 \u0441\u043C", tiers: tiers([1, 5, 20], [800, 650, 450]) },
    a3: { label: "\u04103", size: "28\xD738 \u0441\u043C", tiers: tiers([1, 5, 20], [1100, 900, 680]) }
  };
  var extraPrintFactor = [1, 0.7, 0.5];
  var formatChoices = (formats, withNone) => [
    ...withNone ? [{ id: "none", label: "\u041D\u0435\u0442" }] : [],
    ...formats.map((f) => ({ id: f, label: dtfPrint[f].label, hint: dtfPrint[f].size }))
  ];
  var GARMENT_MAX = 50;
  function garment(args) {
    const placeLabels = ["\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u043F\u0440\u0438\u043D\u0442", "\u0412\u0442\u043E\u0440\u043E\u0439 \u043F\u0440\u0438\u043D\u0442", "\u0422\u0440\u0435\u0442\u0438\u0439 \u043F\u0440\u0438\u043D\u0442", "\u0427\u0435\u0442\u0432\u0451\u0440\u0442\u044B\u0439 \u043F\u0440\u0438\u043D\u0442"];
    const options = [];
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    if (args.own) {
      options.push({
        id: "blank",
        label: cap(args.own),
        type: "one",
        choices: [
          { id: "ours", label: `\u041D\u0430\u0448\u0430 ${args.own}`, hint: "\u0441 \u043F\u0435\u0447\u0430\u0442\u044C\u044E" },
          { id: "own", label: `\u0421\u0432\u043E\u044F ${args.own}`, hint: "\u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0435\u0447\u0430\u0442\u044C" }
        ],
        default: "ours"
      });
    }
    const isOwn = (sel) => !!args.own && one(sel, "blank", "ours") === "own";
    const colorSet = args.colorSet ?? (args.colors ? { choices: [{ id: "white", label: "\u0411\u0435\u043B\u044B\u0439" }, { id: "black", label: "\u0427\u0451\u0440\u043D\u044B\u0439" }], otherMin: 10, what: "\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0438 \u0434\u0440\u0443\u0433\u0438\u0445 \u0446\u0432\u0435\u0442\u043E\u0432 (\u043A\u0440\u043E\u043C\u0435 \u0431\u0435\u043B\u043E\u0433\u043E \u0438 \u0447\u0451\u0440\u043D\u043E\u0433\u043E)" } : void 0);
    if (colorSet) {
      options.push({
        ...args.own ? { hideWhen: { group: "blank", value: "own" } } : {},
        id: "color",
        label: "\u0426\u0432\u0435\u0442 \u0438\u0437\u0434\u0435\u043B\u0438\u044F",
        type: "one",
        // otherMin 0 → only the listed colours, no «другой цвет»
        choices: colorSet.otherMin ? [...colorSet.choices, { id: "other", label: "\u0414\u0440\u0443\u0433\u043E\u0439 \u0446\u0432\u0435\u0442", hint: `\u043E\u0442 ${colorSet.otherMin} \u0448\u0442` }] : colorSet.choices,
        default: colorSet.choices[0].id
      });
    }
    for (let i = 0; i < args.places; i++) {
      options.push({
        id: `print${i + 1}`,
        label: i === 0 ? `${placeLabels[i]} (DTF)` : placeLabels[i],
        type: "one",
        choices: formatChoices(args.formats, i > 0),
        default: i === 0 ? args.formats.includes("a4") ? "a4" : args.formats[0] : "none",
        addable: i > 0
      });
    }
    const prints = (sel) => {
      const out = [];
      for (let i = 0; i < args.places; i++) {
        const v = one(sel, `print${i + 1}`, i === 0 ? args.formats[0] : "none");
        if (v !== "none" && v in dtfPrint) out.push(v);
      }
      return out;
    };
    const ranked = (sel, qty) => prints(sel).map((f) => ({ f, base: dtfPrint[f].tiers.length ? tierPrice(dtfPrint[f].tiers, qty) : 0 })).sort((a, b) => b.base - a.base).map((p, i) => ({ ...p, k: extraPrintFactor[Math.min(i, 2)] }));
    const unitAt = (sel, qty) => {
      let u = args.blank && !isOwn(sel) ? tierPrice(args.blank, qty) : 0;
      for (const p of ranked(sel, qty)) u += p.base * p.k;
      return round(u);
    };
    const breakpoints = (sel) => {
      const set = /* @__PURE__ */ new Set([1, 5, 20]);
      args.blank?.forEach((t) => set.add(t.from));
      return [...set].sort((a, b) => a - b).map((from) => ({ from, price: unitAt(sel, from) }));
    };
    const blankMin = args.blank ? minPrice(args.blank) : 0;
    const maxQty = args.max ?? GARMENT_MAX;
    const cols = [.../* @__PURE__ */ new Set([1, 5, 20, ...(args.blank ?? []).map((t) => t.from)])].sort((a, b) => a - b);
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
          ...args.blank ? [{ label: args.name, cells: cols.map((q) => `${args.blankFrom ? "\u043E\u0442 " : ""}${rub(tierPrice(args.blank, q))}`) }] : [],
          ...args.formats.map((f) => ({ label: `+ \u043F\u0435\u0447\u0430\u0442\u044C DTF ${dtfPrint[f].label}`, cells: cols.map((q) => `+${rub(tierPrice(dtfPrint[f].tiers, q))}`) }))
        ],
        note: `\u0411\u043E\u043B\u044C\u0448\u0435 ${maxQty} \u0448\u0442 \u2014 \u0446\u0435\u043D\u0430 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E.`
      },
      ladder: breakpoints,
      quote: (sel) => {
        const qty = sel.qty;
        const breakdown = [];
        const notes = [];
        if (args.blank && !isOwn(sel)) {
          breakdown.push({ label: args.blankFrom ? `${args.name} (\u043E\u0442)` : args.name, amount: tierPrice(args.blank, qty), per: "\u0448\u0442" });
        }
        const rp = ranked(sel, qty);
        for (const p of rp) {
          breakdown.push({
            label: `\u041F\u0435\u0447\u0430\u0442\u044C DTF ${dtfPrint[p.f].label}${p.k < 1 ? ` (\u2212${Math.round((1 - p.k) * 100)}%)` : ""}`,
            amount: round(p.base * p.k),
            per: "\u0448\u0442"
          });
        }
        if (rp.length > 1) notes.push("\u041D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438\u043D\u0442\u043E\u0432: \u0441\u0430\u043C\u044B\u0439 \u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u2014 \u043F\u043E \u043F\u043E\u043B\u043D\u043E\u0439 \u0446\u0435\u043D\u0435, \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u221230%, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u221250%.");
        const unit = unitAt(sel, qty);
        const nb = breakpoints(sel).find((t) => t.from > qty && t.price < unit);
        let error;
        if (colorSet && !isOwn(sel) && one(sel, "color", colorSet.choices[0].id) === "other" && qty < colorSet.otherMin) {
          error = `${colorSet.what} \u2014 \u043F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437 \u043E\u0442 ${colorSet.otherMin} \u0448\u0442.`;
        }
        if (args.blankFrom && !isOwn(sel)) notes.push("\u041D\u0430\u043B\u0438\u0447\u0438\u0435 \u0438 \u0442\u043E\u0447\u043D\u0443\u044E \u0446\u0435\u043D\u0443 \u0438\u0437\u0434\u0435\u043B\u0438\u044F \u0443\u0442\u043E\u0447\u043D\u0438\u0442 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440.");
        if (isOwn(sel)) notes.push(`${cap(`\u0441\u0432\u043E\u044F ${args.own}`)}: \u043F\u0440\u0438\u043D\u0435\u0441\u0438\u0442\u0435 \u0435\u0451 \u0432 \u043C\u0430\u0441\u0442\u0435\u0440\u0441\u043A\u0443\u044E, \u043D\u0430\u043F\u0435\u0447\u0430\u0442\u0430\u0435\u043C \u043D\u0430 \u043D\u0435\u0439. \u041F\u043E\u0434\u043E\u0439\u0434\u0443\u0442 \u0445\u043B\u043E\u043F\u043E\u043A, \u0441\u043C\u0435\u0441\u043E\u0432\u044B\u0435 \u0442\u043A\u0430\u043D\u0438, \u0441\u0438\u043D\u0442\u0435\u0442\u0438\u043A\u0430.`);
        if (!args.blank) notes.push("\u041F\u0435\u0447\u0430\u0442\u044C \u043D\u0430 \u0432\u0430\u0448\u0435\u043C \u0438\u0437\u0434\u0435\u043B\u0438\u0438. \u041F\u043E\u0434\u043E\u0439\u0434\u0443\u0442 \u0445\u043B\u043E\u043F\u043E\u043A, \u0441\u043C\u0435\u0441\u043E\u0432\u044B\u0435 \u0442\u043A\u0430\u043D\u0438, \u0441\u0438\u043D\u0442\u0435\u0442\u0438\u043A\u0430.");
        if (qty >= maxQty) notes.push(`\u041D\u0443\u0436\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435 ${maxQty} \u0448\u0442? \u0426\u0435\u043D\u0443 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E \u2014 \u043E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u0437\u0430\u044F\u0432\u043A\u0443.`);
        return {
          unit,
          total: Math.round(unit * qty),
          from: args.blankFrom && !isOwn(sel),
          breakdown,
          next: nb ? { qty: nb.from, unit: nb.price } : void 0,
          notes,
          error
        };
      }
    };
  }
  var subPrint = {
    a6: { label: "\u04106", size: "10,5\xD714,8 \u0441\u043C", tiers: tiers([1, 11, 21, 100], [175, 110, 80, 60]) },
    a5: { label: "\u04105", size: "14,8\xD721 \u0441\u043C", tiers: tiers([1, 11, 21, 100], [240, 150, 100, 80]) },
    a4: { label: "\u04104", size: "21\xD729,7 \u0441\u043C", tiers: tiers([1, 11, 21, 100], [400, 210, 150, 130]) },
    a3: { label: "\u04103", size: "29,7\xD742 \u0441\u043C", tiers: tiers([1, 11, 21, 100], [600, 380, 250, 200]) }
  };
  var subTierFrom = [1, 11, 21, 100];
  function sublimated(args) {
    const placeLabels = args.places_ ?? ["\u0421\u0442\u043E\u0440\u043E\u043D\u0430 1", "\u0421\u0442\u043E\u0440\u043E\u043D\u0430 2"];
    const options = [];
    for (let i = 0; i < args.places; i++) {
      options.push({
        id: `print${i + 1}`,
        label: args.places > 1 ? `${placeLabels[i]} \xB7 \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F` : "\u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u0435\u0447\u0430\u0442\u0438 \xB7 \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F",
        type: "one",
        choices: [
          ...i > 0 ? [{ id: "none", label: "\u041D\u0435\u0442" }] : [],
          ...args.formats.map((f) => ({ id: f, label: subPrint[f].label, hint: subPrint[f].size }))
        ],
        default: i === 0 ? args.formats.includes("a4") ? "a4" : args.formats[0] : "none",
        addable: i > 0
      });
    }
    const prints = (sel) => options.map((g, i) => one(sel, g.id, i === 0 ? args.formats[0] : "none")).filter((v) => v in subPrint);
    const unitAt = (sel, qty) => round((args.blank ? tierPrice(args.blank, qty) : 0) + prints(sel).reduce((a, f) => a + tierPrice(subPrint[f].tiers, qty), 0));
    const breaks = [.../* @__PURE__ */ new Set([args.min, ...subTierFrom.filter((t) => t > args.min), ...(args.blank ?? []).map((t) => t.from)])].sort((a, b) => a - b);
    return {
      id: args.id,
      name: args.name,
      short: args.short,
      image: args.image,
      qty: { min: args.min, max: 2e3, default: args.min },
      options,
      fromPrice: (args.blank ? minPrice(args.blank) : 0) + Math.min(...args.formats.map((f) => minPrice(subPrint[f].tiers))),
      table: {
        columns: rangeLabels(subTierFrom),
        rows: [
          ...args.blank ? [{ label: args.name, cells: subTierFrom.map((q) => rub(tierPrice(args.blank, Math.max(q, args.min)))) }] : [],
          ...args.formats.map((f) => ({ label: `+ \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F ${subPrint[f].label}`, cells: subPrint[f].tiers.map((t) => `+${rub(t.price)}`) }))
        ]
      },
      ladder: (sel) => breaks.map((from) => ({ from, price: unitAt(sel, from) })),
      quote: (sel) => {
        const qty = sel.qty;
        const breakdown = [];
        if (args.blank) breakdown.push({ label: args.name, amount: tierPrice(args.blank, qty), per: "\u0448\u0442" });
        prints(sel).forEach((f, i) => breakdown.push({ label: `\u0421\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F ${subPrint[f].label}${args.places > 1 ? ` (${placeLabels[i].toLowerCase()})` : ""}`, amount: tierPrice(subPrint[f].tiers, qty), per: "\u0448\u0442" }));
        const unit = unitAt(sel, qty);
        const nb = breaks.map((from) => ({ from, price: unitAt(sel, from) })).find((t) => t.from > qty && t.price < unit);
        return { unit, total: Math.round(unit * qty), breakdown, next: nb ? { qty: nb.from, unit: nb.price } : void 0, notes: args.notes };
      }
    };
  }
  var textile = {
    id: "textile",
    name: "\u041E\u0434\u0435\u0436\u0434\u0430 \u0438 \u0442\u0435\u043A\u0441\u0442\u0438\u043B\u044C",
    page: "/pechat-na-futbolkah",
    products: [
      garment({
        id: "tshirt-unisex",
        name: "\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0430 \u0443\u043D\u0438\u0441\u0435\u043A\u0441",
        short: "160\u2013180 \u0433/\u043C\xB2, \u0431\u0435\u043B\u0430\u044F \u0438\u043B\u0438 \u0447\u0451\u0440\u043D\u0430\u044F",
        image: "/img/showcase/tshirt.webp",
        blank: tiers([1, 5, 20], [750, 650, 550]),
        formats: ["a6", "a5", "a4", "a3"],
        places: 4,
        colors: true,
        own: "\u0444\u0443\u0442\u0431\u043E\u043B\u043A\u0430"
      }),
      garment({
        id: "tshirt-kids",
        name: "\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0430 \u0434\u0435\u0442\u0441\u043A\u0430\u044F",
        short: "100% \u0445\u043B\u043E\u043F\u043E\u043A, \u0440\u0430\u0437\u043C\u0435\u0440\u044B 98\u2013164",
        image: "/img/showcase/tshirt.webp",
        blank: tiers([1, 5, 20], [750, 550, 500]),
        formats: ["a6", "a5", "a4"],
        places: 2,
        colors: true
      }),
      garment({
        id: "hoodie",
        name: "\u0425\u0443\u0434\u0438",
        short: "\u0443\u0442\u043E\u0447\u043D\u044F\u0439\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435",
        image: "/img/showcase/hoodie.webp",
        blank: tiers([1], [2e3]),
        blankFrom: true,
        formats: ["a6", "a5", "a4", "a3"],
        places: 4
      }),
      garment({
        id: "oversize",
        name: "\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0430 \u043E\u0432\u0435\u0440\u0441\u0430\u0439\u0437",
        short: "\u043E\u0442 180 \u0433/\u043C\xB2, \u0443\u0442\u043E\u0447\u043D\u044F\u0439\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435",
        image: "/img/showcase/tshirt.webp",
        blank: tiers([1], [1200]),
        blankFrom: true,
        formats: ["a6", "a5", "a4", "a3"],
        places: 3
      }),
      garment({
        id: "polo",
        name: "\u041F\u043E\u043B\u043E",
        short: "\u0443\u0442\u043E\u0447\u043D\u044F\u0439\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435",
        image: "/portfolio/corporate-polo.webp",
        blank: tiers([1], [1200]),
        blankFrom: true,
        formats: ["a6", "a5", "a4"],
        places: 2
      }),
      garment({
        id: "cap",
        name: "\u0411\u0435\u0439\u0441\u0431\u043E\u043B\u043A\u0430",
        short: "TEXTILLER, 100% \u0445\u043B\u043E\u043F\u043E\u043A, \u0441\u0430\u0440\u0436\u0430, 5 \u043F\u0430\u043D\u0435\u043B\u0435\u0439",
        image: "/img/showcase/cap.webp",
        // owner, 06.11.2026: 1–9 — 650, 10–29 — 550, 30–100 — 450; print priced as DTF A6; more than 100 — individually
        blank: tiers([1, 10, 30], [650, 550, 450]),
        formats: ["a6"],
        // owner, 06.11.2026: front (≈11×6 cm), side (size depends on the cap), back above the clasp; own cap — print only
        places: 3,
        own: "\u0431\u0435\u0439\u0441\u0431\u043E\u043B\u043A\u0430",
        max: 100,
        colorSet: {
          choices: [
            { id: "black", label: "\u0427\u0451\u0440\u043D\u044B\u0439", swatch: "#111111" },
            { id: "white", label: "\u0411\u0435\u043B\u044B\u0439", swatch: "#ffffff" },
            { id: "red", label: "\u041A\u0440\u0430\u0441\u043D\u044B\u0439", swatch: "#e10f0f" },
            { id: "blue", label: "\u0421\u0438\u043D\u0438\u0439", swatch: "#2a5be8" },
            { id: "yellow", label: "\u0416\u0451\u043B\u0442\u044B\u0439", swatch: "#ffee00" },
            { id: "green", label: "\u0417\u0435\u043B\u0451\u043D\u044B\u0439", swatch: "#0f8a0f" },
            { id: "khaki", label: "\u0425\u0430\u043A\u0438", swatch: "#7d6a2c" }
          ],
          otherMin: 0,
          what: ""
        }
      }),
      garment({
        id: "shopper",
        name: "\u0428\u043E\u043F\u043F\u0435\u0440",
        short: "\u0445\u043B\u043E\u043F\u043A\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043A\u0430",
        image: "/img/showcase/shopper.webp",
        blank: tiers([1, 5, 20], [450, 350, 250]),
        formats: ["a6", "a5", "a4"],
        places: 2,
        // owner, 05.11.2026: light (linen-like) and black in stock, any other colour sewn to order from 20 pcs
        colorSet: { choices: [{ id: "light", label: "\u0421\u0432\u0435\u0442\u043B\u044B\u0439", hint: "\u043A\u0430\u043A \u043B\u0451\u043D" }, { id: "black", label: "\u0427\u0451\u0440\u043D\u044B\u0439" }], otherMin: 20, what: "\u0428\u043E\u043F\u043F\u0435\u0440\u044B \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0446\u0432\u0435\u0442\u0430 \u0448\u044C\u0451\u043C" }
      }),
      // owner, 05.11.2026: light linen shopper for sublimation, from 10 pcs
      sublimated({
        id: "shopper-sub",
        name: "\u0428\u043E\u043F\u043F\u0435\u0440 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438",
        short: "\u043D\u0435\u0431\u0435\u043B\u0451\u043D\u044B\u0439 \u043B\u0451\u043D, 330 \u0433/\u043C\xB2, \u043E\u0442 10 \u0448\u0442",
        image: "/img/showcase/shopper.webp",
        blank: tiers([10, 50], [250, 230]),
        min: 10,
        places: 2,
        formats: ["a6", "a5", "a4", "a3"],
        notes: ["\u0421\u0432\u0435\u0442\u043B\u044B\u0439 \u0448\u043E\u043F\u043F\u0435\u0440 \u0446\u0432\u0435\u0442\u0430 \u043D\u0435\u0431\u0435\u043B\u0451\u043D\u043E\u0433\u043E \u043B\u044C\u043D\u0430, 330 \u0433/\u043C\xB2, 36\xD742 \u0441\u043C (\xB13 \u0441\u043C), \u0440\u0443\u0447\u043A\u0438 70 \u0441\u043C. \u0421\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F \u2014 \u044F\u0440\u043A\u0430\u044F \u043F\u043E\u043B\u043D\u043E\u0446\u0432\u0435\u0442\u043D\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C, \u043E\u0442 10 \u0448\u0442."]
      }),
      // owner, 05.11.2026: synthetic t-shirt for sublimation, 720 ₽, from 10 pcs
      sublimated({
        id: "tshirt-sub",
        name: "\u0424\u0443\u0442\u0431\u043E\u043B\u043A\u0430 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438",
        short: "50% \u043F\u043E\u043B\u0438\u044D\u0441\u0442\u0435\u0440 / 50% \u0445\u043B\u043E\u043F\u043E\u043A, \u043E\u0442 10 \u0448\u0442",
        image: "/img/showcase/tshirt.webp",
        blank: tiers([10], [720]),
        min: 10,
        places: 2,
        places_: ["\u041F\u0435\u0440\u0435\u0434", "\u0421\u043F\u0438\u043D\u0430"],
        formats: ["a6", "a5", "a4", "a3"],
        notes: ["\u0411\u0435\u043B\u0430\u044F \u0444\u0443\u0442\u0431\u043E\u043B\u043A\u0430 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438: 50% \u043F\u043E\u043B\u0438\u044D\u0441\u0442\u0435\u0440 / 50% \u0445\u043B\u043E\u043F\u043E\u043A, \u043A\u0443\u043B\u0438\u0440\u043D\u0430\u044F \u0433\u043B\u0430\u0434\u044C, 180 \u0433/\u043C\xB2, \u0420\u043E\u0441\u0441\u0438\u044F. \u0420\u0430\u0437\u043C\u0435\u0440\u044B \u0434\u0435\u0442\u0441\u043A\u0438\u0435 128\u2013152 \u0438 \u0432\u0437\u0440\u043E\u0441\u043B\u044B\u0435 42\u201360 (XS\u20136XL). \u0417\u0430\u043A\u0430\u0437 \u043E\u0442 10 \u0448\u0442."]
      }),
      sublimated({
        id: "sub-print",
        name: "\u0421\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C",
        short: "\u043D\u0430 \u0432\u0430\u0448\u0435\u043C \u0438\u0437\u0434\u0435\u043B\u0438\u0438 \u0438\u0437 \u0441\u0432\u0435\u0442\u043B\u043E\u0439 \u0441\u0438\u043D\u0442\u0435\u0442\u0438\u043A\u0438",
        min: 1,
        places: 1,
        formats: ["a6", "a5", "a4", "a3"],
        notes: ["\u0421\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u0441\u0432\u0435\u0442\u043B\u044B\u0445 \u0442\u043A\u0430\u043D\u0435\u0439 \u0438\u0437 \u043F\u043E\u043B\u0438\u044D\u0441\u0442\u0435\u0440\u0430 \u0438 \u0438\u0437\u0434\u0435\u043B\u0438\u0439 \u0441 \u043F\u043E\u043B\u0438\u043C\u0435\u0440\u043D\u044B\u043C \u043F\u043E\u043A\u0440\u044B\u0442\u0438\u0435\u043C. \u041F\u043E\u0434\u043E\u0439\u0434\u0451\u0442 \u043B\u0438 \u0432\u0430\u0448\u0435 \u0438\u0437\u0434\u0435\u043B\u0438\u0435 \u2014 \u043F\u043E\u0434\u0441\u043A\u0430\u0436\u0435\u043C."]
      }),
      garment({
        id: "apron",
        name: "\u0424\u0430\u0440\u0442\u0443\u043A",
        short: "\u0443\u0442\u043E\u0447\u043D\u044F\u0439\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435",
        blank: tiers([1], [1e3]),
        blankFrom: true,
        formats: ["a6", "a5", "a4"],
        places: 1
      }),
      garment({
        id: "own-item",
        name: "\u041F\u0435\u0447\u0430\u0442\u044C \u043D\u0430 \u0432\u0430\u0448\u0435\u043C \u0438\u0437\u0434\u0435\u043B\u0438\u0438",
        short: "\u043F\u0440\u0438\u043D\u0435\u0441\u0438\u0442\u0435 \u0441\u0432\u043E\u044E \u0432\u0435\u0449\u044C",
        formats: ["a6", "a5", "a4", "a3"],
        places: 3
      })
    ]
  };
  var mugTiers = [1, 5, 10, 50, 200];
  var mugs = {
    id: "mugs",
    name: "\u041A\u0440\u0443\u0436\u043A\u0438",
    page: "/pechat-na-kruzhkah",
    products: [
      tiered({
        id: "mug",
        name: "\u041A\u0440\u0443\u0436\u043A\u0430 330 \u043C\u043B",
        short: "\u043A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F, d=82 \u043C\u043C \u2014 \u043A\u0440\u0443\u0436\u043A\u0430 \u0438 \u043F\u0435\u0447\u0430\u0442\u044C \u0432 \u0446\u0435\u043D\u0435",
        image: "/img/showcase/mug.webp",
        qty: { min: 1, max: 300, default: 1 },
        variantLabel: "\u0412\u0438\u0434 \u043A\u0440\u0443\u0436\u043A\u0438",
        variants: [
          { id: "white", label: "\u0411\u0435\u043B\u0430\u044F", hint: "330 \u043C\u043B", tiers: tiers(mugTiers, [650, 450, 350, 315, 250]) },
          { id: "color", label: "\u0426\u0432\u0435\u0442\u043D\u0430\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u0438\u043B\u0438 \u0440\u0443\u0447\u043A\u0430", tiers: tiers(mugTiers, [750, 550, 470, 425, 340]) },
          { id: "chameleon", label: "\u0425\u0430\u043C\u0435\u043B\u0435\u043E\u043D", hint: "\u0440\u0438\u0441\u0443\u043D\u043E\u043A \u043F\u0440\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043E\u0442 \u0433\u043E\u0440\u044F\u0447\u0435\u0433\u043E", tiers: tiers(mugTiers, [1100, 980, 890, 815, 650]) },
          { id: "glitter", label: "\u0413\u043B\u0438\u0442\u0442\u0435\u0440", hint: "4 \u0446\u0432\u0435\u0442\u0430 \u0431\u043B\u0451\u0441\u0442\u043E\u043A", tiers: tiers(mugTiers, [1630, 980, 890, 815, 650]) },
          { id: "marble", label: "\u041C\u0440\u0430\u043C\u043E\u0440, \u0437\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u043E\u043B\u043E\u0442\u043E \u0438\u043B\u0438 \u0441\u0435\u0440\u0435\u0431\u0440\u043E", hint: "3 \u0446\u0432\u0435\u0442\u0430 \u043C\u0440\u0430\u043C\u043E\u0440\u0430", tiers: tiers(mugTiers, [1945, 1170, 1070, 970, 780]) },
          { id: "gold", label: "\u0417\u043E\u043B\u043E\u0442\u043E, \u0441\u0435\u0440\u0435\u0431\u0440\u043E, \u0441\u0442\u0435\u043A\u043B\u043E", tiers: tiers(mugTiers, [1320, 790, 730, 660, 530]) }
        ],
        choices: [
          {
            // owner, 04.11.2026: 9 colours of the handle and the inside
            id: "inner",
            label: "\u0426\u0432\u0435\u0442 \u0440\u0443\u0447\u043A\u0438 \u0438 \u0432\u043D\u0443\u0442\u0440\u0438",
            type: "one",
            showWhen: { group: "variant", value: "color" },
            choices: [
              { id: "navy", label: "\u0422\u0451\u043C\u043D\u043E-\u0441\u0438\u043D\u0438\u0439", swatch: "#0d1f8c" },
              { id: "darkgreen", label: "\u0422\u0451\u043C\u043D\u043E-\u0437\u0435\u043B\u0451\u043D\u044B\u0439", swatch: "#0f5a40" },
              { id: "black", label: "\u0427\u0451\u0440\u043D\u044B\u0439", swatch: "#141414" },
              { id: "pink", label: "\u0420\u043E\u0437\u043E\u0432\u044B\u0439", swatch: "#efb3c2" },
              { id: "blue", label: "\u0421\u0438\u043D\u0438\u0439", swatch: "#2c5fd6" },
              { id: "lime", label: "\u0421\u0430\u043B\u0430\u0442\u043E\u0432\u044B\u0439", swatch: "#7ed321" },
              { id: "red", label: "\u041A\u0440\u0430\u0441\u043D\u044B\u0439", swatch: "#d9261c" },
              { id: "orange", label: "\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0439", swatch: "#f26a1b" },
              { id: "yellow", label: "\u0416\u0451\u043B\u0442\u044B\u0439", swatch: "#f6c21a" }
            ],
            default: "red"
          },
          {
            // owner's photo, 04.11.2026
            id: "glitter",
            label: "\u0426\u0432\u0435\u0442 \u0433\u043B\u0438\u0442\u0442\u0435\u0440\u0430",
            type: "one",
            showWhen: { group: "variant", value: "glitter" },
            choices: [
              { id: "gold", label: "\u0417\u043E\u043B\u043E\u0442\u043E\u0439", swatch: "#e2bf3c" },
              { id: "silver", label: "\u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u044B\u0439", swatch: "#c9ccd0" },
              { id: "turquoise", label: "\u0411\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0439", swatch: "#8fcbd0" },
              { id: "pink", label: "\u0420\u043E\u0437\u043E\u0432\u044B\u0439", swatch: "#ea9ccb" }
            ],
            default: "gold"
          },
          {
            id: "marble",
            label: "\u041F\u043E\u043A\u0440\u044B\u0442\u0438\u0435",
            type: "one",
            showWhen: { group: "variant", value: "marble" },
            choices: [
              { id: "grey", label: "\u041C\u0440\u0430\u043C\u043E\u0440 \u0441\u0435\u0440\u044B\u0439", swatch: "#8e8b94" },
              { id: "pink", label: "\u041C\u0440\u0430\u043C\u043E\u0440 \u0440\u043E\u0437\u043E\u0432\u044B\u0439", swatch: "#e88a98" },
              { id: "blue", label: "\u041C\u0440\u0430\u043C\u043E\u0440 \u0433\u043E\u043B\u0443\u0431\u043E\u0439", swatch: "#7fb0dc" },
              { id: "mgold", label: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u043E\u043B\u043E\u0442\u043E", swatch: "#d4af37" },
              { id: "msilver", label: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u0435\u0440\u0435\u0431\u0440\u043E", swatch: "#bfc3c8" }
            ],
            default: "grey"
          }
        ],
        notes: ["\u041A\u0440\u0443\u0436\u043A\u0430 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438 330 \u043C\u043B, d=82 \u043C\u043C. \u0426\u0435\u043D\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043A\u0440\u0443\u0436\u043A\u0443, \u043F\u0435\u0447\u0430\u0442\u044C \u043F\u043E \u043A\u0440\u0443\u0433\u0443 \u0438 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0443 \u043C\u0430\u043A\u0435\u0442\u0430."]
      }),
      // owner, 04.11.2026
      tiered({
        id: "mug-big",
        name: "\u041A\u0440\u0443\u0436\u043A\u0430 425 \u043C\u043B",
        short: "\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u043E\u0439 \u0451\u043C\u043A\u043E\u0441\u0442\u0438, \u0431\u0435\u043B\u0430\u044F, d=82 \u043C\u043C",
        image: "/img/showcase/mug.webp",
        qty: { min: 1, max: 300, default: 1 },
        variants: [{ id: "white", label: "\u0411\u0435\u043B\u0430\u044F 425 \u043C\u043B", tiers: tiers(mugTiers, [800, 600, 500, 425, 400]) }],
        notes: ["\u041A\u0440\u0443\u0436\u043A\u0430 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u043E\u0439 \u0451\u043C\u043A\u043E\u0441\u0442\u0438, 425 \u043C\u043B, d=82 \u043C\u043C. \u0426\u0435\u043D\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043A\u0440\u0443\u0436\u043A\u0443 \u0438 \u043F\u0435\u0447\u0430\u0442\u044C."]
      }),
      tiered({
        id: "coffee-set",
        name: "\u041A\u043E\u0444\u0435\u0439\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440",
        short: "\u0447\u0430\u0448\u043A\u0430 150 \u043C\u043B, \u0431\u043B\u044E\u0434\u0446\u0435 \u0438 \u043B\u043E\u0436\u043A\u0430, \u0431\u0435\u043B\u044B\u0439",
        image: "/img/showcase/mug.webp",
        qty: { min: 1, max: 300, default: 1 },
        variants: [{ id: "white", label: "\u0411\u0435\u043B\u044B\u0439 150 \u043C\u043B", tiers: tiers(mugTiers, [1630, 980, 890, 815, 650]) }],
        notes: ["\u041A\u043E\u0444\u0435\u0439\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438: \u0447\u0430\u0448\u043A\u0430 150 \u043C\u043B (d=78 \u043C\u043C), \u0431\u043B\u044E\u0434\u0446\u0435 \u0438 \u043B\u043E\u0436\u043A\u0430. \u0426\u0435\u043D\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043D\u0430\u0431\u043E\u0440 \u0438 \u043F\u0435\u0447\u0430\u0442\u044C."]
      }),
      tiered({
        id: "beer-mug",
        name: "\u041F\u0438\u0432\u043D\u0430\u044F \u043A\u0440\u0443\u0436\u043A\u0430 600 \u043C\u043B",
        short: "\u0431\u0435\u043B\u0430\u044F, d=82 \u043C\u043C",
        image: "/img/mug/gallery-3.jpg",
        qty: { min: 1, max: 300, default: 1 },
        variants: [{ id: "white", label: "\u0411\u0435\u043B\u0430\u044F 600 \u043C\u043B", tiers: tiers(mugTiers, [950, 800, 750, 690, 650]) }],
        notes: ["\u041F\u0438\u0432\u043D\u0430\u044F \u043A\u0440\u0443\u0436\u043A\u0430 \u0434\u043B\u044F \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u0438, 600 \u043C\u043B, d=82 \u043C\u043C. \u0426\u0435\u043D\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043A\u0440\u0443\u0436\u043A\u0443 \u0438 \u043F\u0435\u0447\u0430\u0442\u044C."]
      })
    ]
  };
  var badgeTiers = [25, 50, 200, 300, 400, 500];
  var rollTiers = [10, 50, 100, 200, 300, 400, 500];
  var rollPrices = (base, rest) => [base, Math.round(base * 7) / 10, Math.round(base * 5) / 10, ...rest];
  var badges = {
    id: "badges",
    name: "\u0417\u043D\u0430\u0447\u043A\u0438",
    page: "/znachki",
    products: [
      tiered({
        id: "badge-roll",
        name: "\u0417\u043D\u0430\u0447\u043E\u043A \u0437\u0430\u043A\u0430\u0442\u043D\u043E\u0439",
        short: "\u043A\u0440\u0443\u0433\u043B\u044B\u0439, \u043D\u0430 \u0431\u0443\u043B\u0430\u0432\u043A\u0435",
        image: "/img/showcase/keychains.webp",
        qty: { min: 10, max: 1e3, default: 25 },
        variantLabel: "\u0414\u0438\u0430\u043C\u0435\u0442\u0440",
        variants: [
          { id: "d38", label: "38 \u043C\u043C", tiers: tiers(rollTiers, rollPrices(85, [38, 35, 32, 30])) },
          { id: "d56", label: "56 \u043C\u043C", tiers: tiers(rollTiers, rollPrices(100, [45, 41, 38, 33])) }
        ]
      }),
      tiered({
        id: "badge-pin",
        name: "\u0417\u043D\u0430\u0447\u043E\u043A \u043D\u0430 \u0446\u0430\u043D\u0433\u0435",
        short: "\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439, \u043A\u0440\u0443\u0433\u043B\u044B\u0439",
        qty: { min: 25, max: 1e3, default: 25 },
        variantLabel: "\u0414\u0438\u0430\u043C\u0435\u0442\u0440",
        variants: [
          { id: "d15", label: "15 \u043C\u043C", tiers: tiers(badgeTiers, [120, 110, 100, 92, 85, 75]) },
          { id: "d25", label: "25 \u043C\u043C", tiers: tiers(badgeTiers, [200, 185, 170, 155, 140, 125]) },
          { id: "d30", label: "30 \u043C\u043C", tiers: tiers(badgeTiers, [250, 230, 210, 190, 170, 150]) },
          { id: "d35", label: "35 \u043C\u043C", tiers: tiers(badgeTiers, [310, 285, 260, 240, 210, 190]) }
        ]
      })
    ]
  };
  var keychains = {
    id: "keychains",
    name: "\u0411\u0440\u0435\u043B\u043E\u043A\u0438",
    page: "/breloki",
    products: [
      tiered({
        id: "keychain-acrylic",
        name: "\u0411\u0440\u0435\u043B\u043E\u043A \u0430\u043A\u0440\u0438\u043B\u043E\u0432\u044B\u0439",
        short: "40\xD756 \u043C\u043C, \u043F\u0435\u0447\u0430\u0442\u044C \u0441 \u0434\u0432\u0443\u0445 \u0441\u0442\u043E\u0440\u043E\u043D",
        image: "/img/showcase/keychains.webp",
        qty: { min: 1, max: 1e3, default: 1 },
        variants: [{ id: "std", label: "40\xD756 \u043C\u043C", tiers: tiers([1, 25, 100, 200, 300, 400, 500], [150, 130, 65, 60, 54, 49, 43]) }]
      }),
      tiered({
        id: "keychain-metal",
        name: "\u0411\u0440\u0435\u043B\u043E\u043A \u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439",
        short: "\u0441 \u043F\u043E\u043B\u043D\u043E\u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u043F\u0435\u0447\u0430\u0442\u044C\u044E",
        qty: { min: 1, max: 1e3, default: 1 },
        variants: [{ id: "std", label: "\u041C\u0435\u0442\u0430\u043B\u043B", tiers: tiers([1, 100, 200, 300, 400, 500], [500, 420, 400, 380, 350, 330]) }]
      })
    ]
  };
  var magnetTiers = [100, 200, 300, 400, 500];
  var magnets = {
    id: "magnets",
    name: "\u041C\u0430\u0433\u043D\u0438\u0442\u044B",
    page: "/magnity",
    products: [
      tiered({
        id: "magnet-vinyl",
        name: "\u041C\u0430\u0433\u043D\u0438\u0442 \u0432\u0438\u043D\u0438\u043B\u043E\u0432\u044B\u0439",
        short: "\u0442\u0438\u0440\u0430\u0436\u0438 \u043E\u0442 100 \u0448\u0442",
        qty: { min: 100, max: 3e3, default: 100 },
        variantLabel: "\u0420\u0430\u0437\u043C\u0435\u0440",
        variants: [
          { id: "r4060", label: "40\xD760 \u043C\u043C", tiers: tiers(magnetTiers, [35, 30, 28, 28, 26]) },
          { id: "s6060", label: "60\xD760 \u043C\u043C", tiers: tiers(magnetTiers, [36, 31, 30, 29, 28]) },
          { id: "r6080", label: "60\xD780 \u043C\u043C", tiers: tiers(magnetTiers, [39, 35, 33, 30, 29]) },
          { id: "c68", label: "\u041A\u0440\u0443\u0433 68 \u043C\u043C", tiers: tiers(magnetTiers, [36, 31, 30, 29, 28]) },
          { id: "c50", label: "\u041A\u0440\u0443\u0433 50 \u043C\u043C", tiers: tiers(magnetTiers, [35, 30, 28, 28, 26]) }
        ]
      }),
      tiered({
        id: "magnet-acrylic",
        name: "\u041C\u0430\u0433\u043D\u0438\u0442 \u0430\u043A\u0440\u0438\u043B\u043E\u0432\u044B\u0439",
        short: "\u0442\u0438\u0440\u0430\u0436\u0438 \u043E\u0442 100 \u0448\u0442",
        qty: { min: 100, max: 3e3, default: 100 },
        variantLabel: "\u0420\u0430\u0437\u043C\u0435\u0440",
        variants: [
          { id: "s105", label: "105\xD7105 \u043C\u043C", tiers: tiers(magnetTiers, [160, 140, 120, 110, 90]) },
          { id: "r10570", label: "105\xD770 \u043C\u043C", tiers: tiers(magnetTiers, [160, 140, 120, 110, 90]) },
          { id: "r8055", label: "80\xD755 \u043C\u043C", tiers: tiers(magnetTiers, [130, 100, 90, 80, 75]) }
        ]
      }),
      fixed("photo-magnet", "\u0424\u043E\u0442\u043E\u043C\u0430\u0433\u043D\u0438\u0442 \u0430\u043A\u0440\u0438\u043B\u043E\u0432\u044B\u0439, 1 \u0448\u0442", 250, { short: "\u043F\u043E\u0434\u0430\u0440\u043E\u043A \u0441 \u0432\u0430\u0448\u0438\u043C \u0444\u043E\u0442\u043E" })
    ]
  };
  var STICKER_MIN = 30;
  var stickerRate = { simple: 5, complex: 7 };
  var stickerDiscounts = [
    { from: 100, off: 0.05 },
    { from: 200, off: 0.1 }
  ];
  var stickerOff = (count) => stickerDiscounts.filter((d) => count >= d.from).reduce((m, d) => Math.max(m, d.off), 0);
  var cutGroup = {
    id: "cut",
    label: "\u0412\u044B\u0440\u0443\u0431\u043A\u0430",
    type: "one",
    choices: [
      { id: "simple", label: "\u041F\u0440\u043E\u0441\u0442\u0430\u044F", hint: `\u043A\u0440\u0443\u0433, \u043A\u0432\u0430\u0434\u0440\u0430\u0442, \u043F\u0440\u044F\u043C\u043E\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A \xB7 ${stickerRate.simple} \u20BD/\u0441\u043C\xB2` },
      { id: "complex", label: "\u0421\u043B\u043E\u0436\u043D\u0430\u044F", hint: `\u043F\u043E \u043A\u043E\u043D\u0442\u0443\u0440\u0443 \u0440\u0438\u0441\u0443\u043D\u043A\u0430 \xB7 ${stickerRate.complex} \u20BD/\u0441\u043C\xB2` }
    ],
    default: "simple"
  };
  var baseRateOf = (sel) => one(sel, "cut", "simple") === "complex" ? stickerRate.complex : stickerRate.simple;
  var SMALL_STICKER_AREA = 4;
  var SMALL_STICKER_EXTRA = 0.3;
  var isSmall = (sel) => (sel.dims.w ?? 4) * (sel.dims.h ?? 4) < SMALL_STICKER_AREA;
  var rateOf = (sel) => round(baseRateOf(sel) * (isSmall(sel) ? 1 + SMALL_STICKER_EXTRA : 1));
  var smallNote = `\u0421\u0442\u0438\u043A\u0435\u0440 \u043C\u0435\u043D\u044C\u0448\u0435 ${SMALL_STICKER_AREA} \u0441\u043C\xB2 \u2014 \u0446\u0435\u043D\u0430 +${Math.round(SMALL_STICKER_EXTRA * 100)}%.`;
  var STICKER_MAX = 300;
  var STICKER_MIN_SUM = 850;
  var minRun = (base, max, unitAt) => {
    if (base * unitAt(base) >= STICKER_MIN_SUM) return base;
    let n = Math.ceil(base / 10) * 10;
    while (n < max && n * unitAt(n) < STICKER_MIN_SUM) n += 10;
    return Math.min(n, max);
  };
  var PACK_MIN = 10;
  var PACK_MAX = 200;
  var stickerTable = (label) => ({
    columns: [`${STICKER_MIN}\u201399 \u0448\u0442`, "100\u2013199 \u0448\u0442", `200\u2013${STICKER_MAX} \u0448\u0442`],
    rows: [
      { label: `${label}: \u043F\u0440\u043E\u0441\u0442\u0430\u044F \u0432\u044B\u0440\u0443\u0431\u043A\u0430, \u0437\u0430 \u0441\u043C\xB2`, cells: [0, 0.05, 0.1].map((o) => rub(round(stickerRate.simple * (1 - o)))) },
      { label: `${label}: \u0441\u043B\u043E\u0436\u043D\u0430\u044F \u0432\u044B\u0440\u0443\u0431\u043A\u0430, \u0437\u0430 \u0441\u043C\xB2`, cells: [0, 0.05, 0.1].map((o) => rub(round(stickerRate.complex * (1 - o)))) }
    ],
    note: `\u0421\u0442\u0438\u043A\u0435\u0440 \u043C\u0435\u043D\u044C\u0448\u0435 ${SMALL_STICKER_AREA} \u0441\u043C\xB2 \u2014 +${Math.round(SMALL_STICKER_EXTRA * 100)}% \u043A \u0446\u0435\u043D\u0435. \u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u2014 ${STICKER_MIN} \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 \u0438 \u043D\u0435 \u043C\u0435\u043D\u044C\u0448\u0435 ${STICKER_MIN_SUM} \u20BD (\u0434\u043B\u044F \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0445 \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 \u2014 \u0431\u043E\u043B\u044C\u0448\u0435 \u0448\u0442\u0443\u043A), \u0431\u043E\u043B\u044C\u0448\u0435 ${STICKER_MAX} \u2014 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E. \u0426\u0435\u043D\u0430 \u0441\u0442\u0438\u043A\u0435\u0440\u0430 = \u043F\u043B\u043E\u0449\u0430\u0434\u044C (\u0448\u0438\u0440\u0438\u043D\u0430 \xD7 \u0432\u044B\u0441\u043E\u0442\u0430, \u0441\u043C\xB2) \xD7 \u0446\u0435\u043D\u0430 \u0437\u0430 \u0441\u043C\xB2.`
  });
  var PACK_SIZES = [3, 4, 5, 6, 8, 10, 12];
  var epoxyMin = (sel) => minRun(STICKER_MIN, STICKER_MAX, (n) => round((sel.dims.w ?? 4) * (sel.dims.h ?? 4) * rateOf(sel) * (1 - stickerOff(n))));
  var minError = (n, w, h) => `\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u2014 ${STICKER_MIN_SUM} \u20BD: \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 ${w}\xD7${h} \u0441\u043C \u2014 \u043E\u0442 ${n} \u0448\u0442.`;
  var VINYL_MIN = 100;
  var VINYL_PACK_MIN = 50;
  var vinylTiers = tiers([VINYL_MIN, 300], [0.25, 0.2]);
  var vinylRate = (qty) => [...vinylTiers].reverse().find((t) => qty >= t.from)?.price ?? vinylTiers[0].price;
  var vinylMin = (sel) => minRun(VINYL_MIN, 1e4, (n) => round((sel.dims.w ?? 5) * (sel.dims.h ?? 5) * vinylRate(n)));
  var vinylFilm = {
    id: "film",
    label: "\u041F\u043B\u0451\u043D\u043A\u0430",
    type: "one",
    choices: [
      { id: "gloss", label: "\u0413\u043B\u044F\u043D\u0446\u0435\u0432\u0430\u044F" },
      { id: "matte", label: "\u041C\u0430\u0442\u043E\u0432\u0430\u044F" }
    ],
    default: "gloss"
  };
  var vinylSticker = {
    id: "vinyl-sticker",
    name: "\u0412\u0438\u043D\u0438\u043B\u043E\u0432\u044B\u0435 \u0441\u0442\u0438\u043A\u0435\u0440\u044B \u0441 \u043A\u043E\u043D\u0442\u0443\u0440\u043D\u043E\u0439 \u0440\u0435\u0437\u043A\u043E\u0439",
    short: `\u0433\u043B\u044F\u043D\u0435\u0446 \u0438\u043B\u0438 \u043C\u0430\u0442, \u043E\u0442 ${VINYL_MIN} \u0448\u0442`,
    image: "/img/showcase/stickers-3d.webp",
    qty: { min: VINYL_MIN, max: 1e4, default: 140 },
    options: [vinylFilm],
    dims: [
      { id: "w", label: "\u0428\u0438\u0440\u0438\u043D\u0430", unit: "\u0441\u043C", min: 1, max: 30, default: 5 },
      { id: "h", label: "\u0412\u044B\u0441\u043E\u0442\u0430", unit: "\u0441\u043C", min: 1, max: 30, default: 5 }
    ],
    fromPrice: vinylTiers[vinylTiers.length - 1].price,
    fromUnit: "\u0441\u043C\xB2",
    table: {
      columns: [`${VINYL_MIN}\u2013299 \u0448\u0442`, "\u043E\u0442 300 \u0448\u0442"],
      rows: [{ label: "\u0412\u0438\u043D\u0438\u043B\u043E\u0432\u044B\u0439 \u0441\u0442\u0438\u043A\u0435\u0440, \u0437\u0430 \u0441\u043C\xB2", cells: vinylTiers.map((t) => rub(t.price)) }],
      note: `\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u2014 ${VINYL_MIN} \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 \u0438 \u043D\u0435 \u043C\u0435\u043D\u044C\u0448\u0435 ${STICKER_MIN_SUM} \u20BD (\u0434\u043B\u044F \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0445 \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 \u2014 \u0431\u043E\u043B\u044C\u0448\u0435 \u0448\u0442\u0443\u043A). \u0426\u0435\u043D\u0430 \u0441\u0442\u0438\u043A\u0435\u0440\u0430 = \u043F\u043B\u043E\u0449\u0430\u0434\u044C (\u0448\u0438\u0440\u0438\u043D\u0430 \xD7 \u0432\u044B\u0441\u043E\u0442\u0430, \u0441\u043C\xB2) \xD7 \u0446\u0435\u043D\u0430 \u0437\u0430 \u0441\u043C\xB2, \u0444\u043E\u0440\u043C\u0430 \u0432\u044B\u0440\u0443\u0431\u043A\u0438 \u043D\u0430 \u0446\u0435\u043D\u0443 \u043D\u0435 \u0432\u043B\u0438\u044F\u0435\u0442.`
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
        breakdown: [{ label: `\u0421\u0442\u0438\u043A\u0435\u0440 ${w}\xD7${h} \u0441\u043C, ${one(sel, "film", "gloss") === "matte" ? "\u043C\u0430\u0442\u043E\u0432\u0430\u044F" : "\u0433\u043B\u044F\u043D\u0446\u0435\u0432\u0430\u044F"} \u043F\u043B\u0451\u043D\u043A\u0430`, amount: unit, per: "\u0448\u0442" }],
        next: next ? { qty: next.from, unit: round(area * next.price) } : void 0,
        notes: [`\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0441\u0442\u0438\u043A\u0435\u0440\u0430 ${String(area).replace(".", ",")} \u0441\u043C\xB2 \xD7 ${String(rate).replace(".", ",")} \u20BD/\u0441\u043C\xB2.`],
        error: sel.qty < vinylMin(sel) ? minError(vinylMin(sel), w, h) : void 0
      };
    }
  };
  var stickers = {
    id: "stickers",
    name: "\u0421\u0442\u0438\u043A\u0435\u0440\u044B",
    page: "/nakleyki",
    products: [
      {
        id: "sticker-3d",
        name: "3D-\u0441\u0442\u0438\u043A\u0435\u0440\u044B \u0441 \u044D\u043F\u043E\u043A\u0441\u0438\u0434\u043D\u043E\u0439 \u0441\u043C\u043E\u043B\u043E\u0439",
        short: `\u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0435 \u043D\u0430\u043A\u043B\u0435\u0439\u043A\u0438, \u043E\u0442 ${STICKER_MIN} \u0448\u0442`,
        image: "/img/showcase/stickers-3d.webp",
        qty: { min: STICKER_MIN, max: STICKER_MAX, default: 50, individualAbove: true },
        options: [cutGroup],
        dims: [
          { id: "w", label: "\u0428\u0438\u0440\u0438\u043D\u0430", unit: "\u0441\u043C", min: 1, max: 20, default: 4 },
          { id: "h", label: "\u0412\u044B\u0441\u043E\u0442\u0430", unit: "\u0441\u043C", min: 1, max: 20, default: 4 }
        ],
        fromPrice: stickerRate.simple,
        fromUnit: "\u0441\u043C\xB2",
        table: stickerTable("\u0421\u0442\u0438\u043A\u0435\u0440"),
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
          const notes = [`\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0441\u0442\u0438\u043A\u0435\u0440\u0430 ${String(area).replace(".", ",")} \u0441\u043C\xB2 \xD7 ${String(rate).replace(".", ",")} \u20BD/\u0441\u043C\xB2${off ? ` \u2212 ${Math.round(off * 100)}% \u0437\u0430 \u0442\u0438\u0440\u0430\u0436` : ""}.`];
          if (isSmall(sel)) notes.push(smallNote);
          const next = stickerDiscounts.find((d) => d.from > sel.qty);
          return {
            unit,
            total: Math.round(unit * sel.qty),
            breakdown: [{ label: `\u0421\u0442\u0438\u043A\u0435\u0440 ${w}\xD7${h} \u0441\u043C, ${baseRateOf(sel) === stickerRate.complex ? "\u0441\u043B\u043E\u0436\u043D\u0430\u044F" : "\u043F\u0440\u043E\u0441\u0442\u0430\u044F"} \u0432\u044B\u0440\u0443\u0431\u043A\u0430${isSmall(sel) ? ", \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 +30%" : ""}${off ? ` (\u2212${Math.round(off * 100)}%)` : ""}`, amount: unit, per: "\u0448\u0442" }],
            next: next ? { qty: next.from, unit: round(area * rate * (1 - next.off)) } : void 0,
            notes,
            error: sel.qty < epoxyMin(sel) ? minError(epoxyMin(sel), w, h) : void 0
          };
        }
      },
      {
        id: "sticker-pack",
        name: "\u0421\u0442\u0438\u043A\u0435\u0440\u043F\u0430\u043A \u0438\u0437 3D-\u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432",
        short: "\u043D\u0430\u0431\u043E\u0440 \u0438\u0437 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u0440\u0430\u0437\u043D\u044B\u0445 \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432",
        image: "/img/showcase/stickers-3d.webp",
        qty: { min: PACK_MIN, max: PACK_MAX, default: PACK_MIN, individualAbove: true },
        options: [
          {
            id: "count",
            label: "\u0421\u0442\u0438\u043A\u0435\u0440\u043E\u0432 \u0432 \u043E\u0434\u043D\u043E\u043C \u043D\u0430\u0431\u043E\u0440\u0435",
            type: "one",
            choices: PACK_SIZES.map((n) => ({ id: String(n), label: `${n} \u0448\u0442` })),
            default: "6"
          },
          cutGroup
        ],
        dims: [
          { id: "w", label: "\u0428\u0438\u0440\u0438\u043D\u0430 \u0441\u0442\u0438\u043A\u0435\u0440\u0430", unit: "\u0441\u043C", min: 1, max: 20, default: 4 },
          { id: "h", label: "\u0412\u044B\u0441\u043E\u0442\u0430 \u0441\u0442\u0438\u043A\u0435\u0440\u0430", unit: "\u0441\u043C", min: 1, max: 20, default: 4 }
        ],
        fromPrice: stickerRate.simple,
        fromUnit: "\u0441\u043C\xB2",
        table: {
          columns: ["\u0426\u0435\u043D\u0430"],
          rows: [{ label: "\u0421\u0442\u0438\u043A\u0435\u0440\u043F\u0430\u043A", cells: ["\u043F\u043E \u0442\u043E\u0439 \u0436\u0435 \u0446\u0435\u043D\u0435 \u0437\u0430 \u0441\u043C\xB2"] }],
          note: `\u0421\u0442\u0438\u043A\u0435\u0440\u044B \u0432 \u043D\u0430\u0431\u043E\u0440\u0435 \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u043F\u043E \u043F\u043B\u043E\u0449\u0430\u0434\u0438, \u043A\u0430\u043A \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435; \u043E\u0442 ${PACK_MIN} \u0434\u043E ${PACK_MAX} \u043D\u0430\u0431\u043E\u0440\u043E\u0432, \u0431\u043E\u043B\u044C\u0448\u0435 \u2014 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E. \u0421\u0442\u0438\u043A\u0435\u0440\u044B \u0440\u0430\u0437\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u2014 \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E.`
        },
        ladder: (sel) => {
          const n = Number(one(sel, "count", "6"));
          const per = (sel.dims.w ?? 4) * (sel.dims.h ?? 4) * rateOf(sel) * n;
          const breaks = [.../* @__PURE__ */ new Set([PACK_MIN, ...stickerDiscounts.map((d) => Math.max(PACK_MIN, Math.ceil(d.from / n)))])].sort((x, y) => x - y);
          return breaks.map((from) => ({ from, price: round(per * (1 - stickerOff(from * n))) }));
        },
        quote: (sel) => {
          const n = Number(one(sel, "count", "6"));
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
            breakdown: [{ label: `${n} \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 ${w}\xD7${h} \u0441\u043C \u043F\u043E ${rub(sticker)}${off ? ` (\u2212${Math.round(off * 100)}%)` : ""}`, amount: unit, per: "\u0448\u0442" }],
            next: next ? { qty: Math.ceil(next.from / n), unit: round(w * h * rate * (1 - next.off) * n) } : void 0,
            notes: [
              `\u0412 \u0437\u0430\u043A\u0430\u0437\u0435 ${count} \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 (${sel.qty} \xD7 ${n}). \u0421\u043A\u0438\u0434\u043A\u0430 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043F\u043E \u043E\u0431\u0449\u0435\u043C\u0443 \u0447\u0438\u0441\u043B\u0443 \u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432: \u22125% \u043E\u0442 100, \u221210% \u043E\u0442 200.`,
              "\u0421\u0442\u0438\u043A\u0435\u0440\u044B \u0440\u0430\u0437\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u0438\u043B\u0438 \u0441\u043B\u043E\u0436\u043D\u0430\u044F \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u2014 \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E.",
              ...isSmall(sel) ? [smallNote] : []
            ],
            error: sel.qty < packsMin ? `\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u2014 ${packsMin} \u043D\u0430\u0431\u043E\u0440\u043E\u0432.` : void 0
          };
        }
      },
      tiered({
        id: "sticker-set",
        name: "\u041D\u0430\u0431\u043E\u0440 3D-\u0441\u0442\u0438\u043A\u0435\u0440\u043E\u0432 3\xD73 \u0441\u043C",
        short: "\u043F\u043E \u0432\u0430\u0448\u0438\u043C \u0444\u043E\u0442\u043E \u0438\u043B\u0438 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430\u043C, \u043E\u0442 3 \u0448\u0442",
        image: "/img/showcase/stickers-3d.webp",
        qty: { min: 3, max: 30, default: 3, moreIn: { product: "sticker-3d", label: "\u043A\u0430\u043A 3D-\u0441\u0442\u0438\u043A\u0435\u0440\u044B", dims: { w: 3, h: 3 } } },
        variants: [{ id: "std", label: "3\xD73 \u0441\u043C", tiers: tiers([3, 5, 10], [200, 150, 100]) }],
        notes: ["\u0421\u0442\u0438\u043A\u0435\u0440\u044B 3\xD73 \u0441\u043C \u043F\u043E \u0432\u0430\u0448\u0438\u043C \u0444\u043E\u0442\u043E \u0438\u043B\u0438 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430\u043C. \u041E\u0442 30 \u0448\u0442 \u0432\u044B\u0433\u043E\u0434\u043D\u0435\u0435 \u0441\u0447\u0438\u0442\u0430\u0442\u044C \u043A\u0430\u043A 3D-\u0441\u0442\u0438\u043A\u0435\u0440\u044B \u0438\u0437 \u044D\u043F\u043E\u043A\u0441\u0438\u0434\u043D\u043E\u0439 \u0441\u043C\u043E\u043B\u044B \u2014 \u043F\u043E \u0446\u0435\u043D\u0435 \u0437\u0430 \u0441\u043C\xB2."]
      }),
      vinylSticker,
      tiered({
        id: "vinyl-pack",
        name: "\u0421\u0442\u0438\u043A\u0435\u0440\u043F\u0430\u043A \u043D\u0430 \u0432\u0438\u043D\u0438\u043B\u043E\u0432\u043E\u0439 \u043F\u043B\u0451\u043D\u043A\u0435",
        short: `\u04106 \u0438\u043B\u0438 \u04105, \u043A\u043E\u043D\u0442\u0443\u0440\u043D\u0430\u044F \u0440\u0435\u0437\u043A\u0430, \u043E\u0442 ${VINYL_PACK_MIN} \u0448\u0442`,
        image: "/img/showcase/stickers-3d.webp",
        qty: { min: VINYL_PACK_MIN, max: 200, default: VINYL_PACK_MIN, individualAbove: true },
        variantLabel: "\u0424\u043E\u0440\u043C\u0430\u0442 \u043B\u0438\u0441\u0442\u0430",
        variants: [
          { id: "a6", label: "\u04106", hint: "10,5 \xD7 14,8 \u0441\u043C", tiers: tiers([VINYL_PACK_MIN, 100], [80, 70]) },
          { id: "a5", label: "\u04105", hint: "14,8 \xD7 21 \u0441\u043C", tiers: tiers([VINYL_PACK_MIN, 100], [120, 105]) }
        ],
        choices: [vinylFilm],
        notes: ["\u041B\u0438\u0441\u0442 \u0441\u043E \u0441\u0442\u0438\u043A\u0435\u0440\u0430\u043C\u0438 \u043D\u0430 \u0432\u0438\u043D\u0438\u043B\u043E\u0432\u043E\u0439 \u043F\u043B\u0451\u043D\u043A\u0435 \u0441 \u043A\u043E\u043D\u0442\u0443\u0440\u043D\u043E\u0439 \u0440\u0435\u0437\u043A\u043E\u0439; \u0446\u0435\u043D\u0430 \u043D\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0444\u043E\u0440\u043C\u044B \u0432\u044B\u0440\u0443\u0431\u043A\u0438."]
      })
    ]
  };
  var cards = {
    id: "cards",
    name: "\u0412\u0438\u0437\u0438\u0442\u043A\u0438",
    page: "/vizitki",
    products: [
      tiered({
        id: "business-cards",
        name: "\u0412\u0438\u0437\u0438\u0442\u043A\u0438 90\xD750 \u043C\u043C",
        short: "\u0446\u0438\u0444\u0440\u043E\u0432\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C, \u0431\u0443\u043C\u0430\u0433\u0430 300 \u0433, \u0433\u043B\u044F\u043D\u0435\u0446 \u0438\u043B\u0438 \u043C\u0430\u0442",
        image: "/img/showcase/business-cards.webp",
        // Owner, 01.11.2026: fixed runs 96 / 200 / 300, from 500 any quantity
        qty: { min: 96, max: 2e4, default: 96, presets: [96, 200, 300], freeFrom: 500 },
        variantLabel: "\u041F\u0435\u0447\u0430\u0442\u044C",
        variants: [
          { id: "s1", label: "\u041E\u0434\u043D\u043E\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u044F\u044F", hint: "4+0", tiers: tiers([96, 200, 300, 500, 1e3, 6e3], [6.2, 4.9, 4, 3.5, 3.2, 2.4]) },
          { id: "s2", label: "\u0414\u0432\u0443\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u044F\u044F", hint: "4+4", tiers: tiers([96, 200, 300, 500, 1e3, 6e3], [9.6, 7.1, 5.9, 5, 4.7, 3.2]) }
        ],
        choices: [
          {
            id: "paper",
            label: "\u0411\u0443\u043C\u0430\u0433\u0430 300 \u0433",
            type: "one",
            choices: [
              { id: "gloss", label: "\u0413\u043B\u044F\u043D\u0446\u0435\u0432\u0430\u044F" },
              { id: "matte", label: "\u041C\u0430\u0442\u043E\u0432\u0430\u044F" }
            ],
            default: "gloss"
          }
        ],
        notes: ["\u0414\u043E 500 \u0448\u0442 \u0432\u0438\u0437\u0438\u0442\u043A\u0438 \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0442\u0441\u044F \u0442\u0438\u0440\u0430\u0436\u0430\u043C\u0438 96, 200 \u0438\u043B\u0438 300 \u0448\u0442, \u043E\u0442 500 \u0448\u0442 \u2014 \u043B\u044E\u0431\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E. \u0421\u0440\u043E\u043A \u2014 \u043E\u0442 1 \u0434\u043D\u044F. \u0413\u043B\u044F\u043D\u0446\u0435\u0432\u0430\u044F \u0438 \u043C\u0430\u0442\u043E\u0432\u0430\u044F \u0431\u0443\u043C\u0430\u0433\u0430 \u2014 \u043F\u043E \u043E\u0434\u043D\u043E\u0439 \u0446\u0435\u043D\u0435."]
      })
    ]
  };
  var flyerPrices = {
    a3: { label: "\u04103", hint: "297\xD7420 \u043C\u043C", thin: { s: [65, 56, 45], d: [110, 97, 86] }, thick: { s: [120, 108, 96], d: [195, 175, 155] } },
    a4: { label: "\u04104", hint: "210\xD7297 \u043C\u043C", thin: { s: [40, 34, 30], d: [60, 54, 48] }, thick: { s: [80, 70, 62], d: [125, 113, 100] } },
    a5: { label: "\u04105", hint: "148\xD7210 \u043C\u043C", thin: { s: [25, 20, 18], d: [35, 30, 27] }, thick: { s: [40, 35, 31], d: [65, 56, 50] } },
    euro: { label: "\u0415\u0432\u0440\u043E\u0444\u043B\u0430\u0435\u0440", hint: "1/3 \u04104", thin: { s: [15, 14, 13], d: [25, 20, 18] }, thick: { s: [25, 23, 21], d: [45, 38, 34] } },
    a6: { label: "\u04106", hint: "105\xD7148 \u043C\u043C", thin: { s: [25, 20, 18], d: [25, 20, 18] }, thick: { s: [20, 18, 16], d: [30, 29, 25] } }
  };
  var flyerTierFrom = [50, 100, 200];
  var flyerTiers = (sel) => {
    const f = flyerPrices[one(sel, "format", "a4")] ?? flyerPrices.a4;
    const paper = one(sel, "paper", "thin") === "thick" ? f.thick : f.thin;
    return tiers(flyerTierFrom, one(sel, "sides", "s") === "d" ? paper.d : paper.s);
  };
  var flyers = {
    id: "flyers",
    name: "\u041B\u0438\u0441\u0442\u043E\u0432\u043A\u0438 \u0438 \u043F\u043E\u043B\u0438\u0433\u0440\u0430\u0444\u0438\u044F",
    page: "/poligrafiya",
    products: [
      {
        id: "flyers",
        name: "\u041B\u0438\u0441\u0442\u043E\u0432\u043A\u0438 \u0438 \u0444\u043B\u0430\u0435\u0440\u044B",
        short: "\u0446\u0438\u0444\u0440\u043E\u0432\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C \u043E\u0442 50 \u0448\u0442",
        image: "/img/showcase/stationery.webp",
        qty: { min: 50, max: 2e3, default: 100 },
        options: [
          { id: "format", label: "\u0424\u043E\u0440\u043C\u0430\u0442", type: "one", choices: Object.entries(flyerPrices).map(([id, f]) => ({ id, label: f.label, hint: f.hint })), default: "a4" },
          {
            id: "paper",
            label: "\u0411\u0443\u043C\u0430\u0433\u0430",
            type: "one",
            choices: [
              { id: "thin", label: "\u041E\u0444\u0441\u0435\u0442\u043D\u0430\u044F 80 \u0433", hint: "\u0442\u043E\u043D\u043A\u0430\u044F" },
              { id: "thick", label: "\u041F\u043B\u043E\u0442\u043D\u0430\u044F 115\u2013300 \u0433", hint: "\u043C\u0435\u043B\u043E\u0432\u0430\u043D\u043D\u0430\u044F" }
            ],
            default: "thin"
          },
          {
            id: "sides",
            label: "\u041F\u0435\u0447\u0430\u0442\u044C",
            type: "one",
            choices: [
              { id: "s", label: "\u041E\u0434\u043D\u043E\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u044F\u044F" },
              { id: "d", label: "\u0414\u0432\u0443\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u044F\u044F" }
            ],
            default: "s"
          }
        ],
        fromPrice: 13,
        table: {
          columns: rangeLabels(flyerTierFrom),
          rows: Object.values(flyerPrices).flatMap((f) => [
            { label: `${f.label}, 80 \u0433, 1 \u0441\u0442\u043E\u0440\u043E\u043D\u0430`, cells: f.thin.s.map(rub) },
            { label: `${f.label}, 80 \u0433, 2 \u0441\u0442\u043E\u0440\u043E\u043D\u044B`, cells: f.thin.d.map(rub) },
            { label: `${f.label}, 115\u2013300 \u0433, 1 \u0441\u0442\u043E\u0440\u043E\u043D\u0430`, cells: f.thick.s.map(rub) },
            { label: `${f.label}, 115\u2013300 \u0433, 2 \u0441\u0442\u043E\u0440\u043E\u043D\u044B`, cells: f.thick.d.map(rub) }
          ])
        },
        ladder: flyerTiers,
        quote: (sel) => {
          const t = flyerTiers(sel);
          const unit = tierPrice(t, sel.qty);
          const nt = nextTier(t, sel.qty);
          return {
            unit,
            total: Math.round(unit * sel.qty),
            breakdown: [{ label: `\u041B\u0438\u0441\u0442\u043E\u0432\u043A\u0430 ${flyerPrices[one(sel, "format", "a4")]?.label ?? "\u04104"}`, amount: unit, per: "\u0448\u0442" }],
            next: nt ? { qty: nt.from, unit: nt.price } : void 0,
            notes: []
          };
        }
      },
      tiered({
        id: "notebook",
        name: "\u0411\u043B\u043E\u043A\u043D\u043E\u0442 \u0441 \u0432\u0430\u0448\u0435\u0439 \u043E\u0431\u043B\u043E\u0436\u043A\u043E\u0439",
        short: "40 \u043B\u0438\u0441\u0442\u043E\u0432",
        image: "/img/showcase/stationery.webp",
        qty: { min: 20, max: 1e3, default: 20 },
        variantLabel: "\u0424\u043E\u0440\u043C\u0430\u0442",
        variants: [
          { id: "a5", label: "\u04105", tiers: tiers([20, 50, 100, 200, 300], [150, 110, 100, 95, 80]) },
          { id: "a6", label: "\u04106", tiers: tiers([20, 50, 100, 200, 300], [85, 75, 70, 65, 60]) }
        ]
      }),
      tiered({
        id: "office",
        name: "\u041F\u0435\u0447\u0430\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432",
        short: "\u0447/\u0431 \u0438 \u0446\u0432\u0435\u0442\u043D\u0430\u044F, \u043E\u0442 1 \u043B\u0438\u0441\u0442\u0430",
        qty: { min: 1, max: 500, default: 10 },
        variantLabel: "\u0424\u043E\u0440\u043C\u0430\u0442 \u0438 \u0446\u0432\u0435\u0442",
        variants: [
          { id: "a4bw", label: "\u04104 \u0447/\u0431", tiers: tiers([1], [15]) },
          { id: "a4c", label: "\u04104 \u0446\u0432\u0435\u0442\u043D\u0430\u044F", tiers: tiers([1], [25]) },
          { id: "a3bw", label: "\u04103 \u0447/\u0431", tiers: tiers([1], [30]) },
          { id: "a3c", label: "\u04103 \u0446\u0432\u0435\u0442\u043D\u0430\u044F", tiers: tiers([1], [40]) }
        ]
      })
    ]
  };
  var calendars = {
    id: "calendars",
    name: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u0438",
    page: "/kalendari",
    products: [
      (() => {
        const up = (xs) => xs.map((x) => Math.round(x * 1.2));
        const runs = [10, 50, 100, 200, 300, 500, 1e3];
        const models = [
          { id: "midi3", label: "\u041C\u0418\u0414\u0418, 3 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u044B\u0445 \u043F\u043E\u043B\u044F", hint: "325 \u043C\u043C, 3 \u0431\u043B\u043E\u043A\u0430", prices: up([560, 530, 490, 420, 390, 370, 350]) },
          { id: "midi1", label: "\u041C\u0418\u0414\u0418, 1 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435", hint: "325 \u043C\u043C, 3 \u0431\u043B\u043E\u043A\u0430", prices: up([460, 420, 390, 360, 340, 320, 290]) },
          { id: "mini3", label: "\u041C\u0418\u041D\u0418, 3 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u044B\u0445 \u043F\u043E\u043B\u044F", hint: "297 \u043C\u043C, 3 \u0431\u043B\u043E\u043A\u0430", prices: up([410, 380, 370, 360, 350, 340, 330]) },
          { id: "mini1", label: "\u041C\u0418\u041D\u0418, 1 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435", hint: "297 \u043C\u043C, 3 \u0431\u043B\u043E\u043A\u0430", prices: up([340, 320, 310, 300, 290, 280, 270]) },
          { id: "trio", label: "\xAB3 \u0432 1\xBB, 1 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435", hint: "335 \u043C\u043C, \u043E\u0434\u0438\u043D \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0431\u043B\u043E\u043A", prices: up([350, 320, 310, 300]) }
        ];
        const STRIP = { none: 0, silver: 110, gold: 130 };
        const FOLD = 40;
        const tiersOf = (m) => tiers(runs.slice(0, m.prices.length), m.prices);
        const model = (sel) => models.find((m) => m.id === one(sel, "model", "midi3")) ?? models[0];
        const extras = (sel) => {
          const strip = one(sel, "strip", "none");
          const fold = many(sel, "fold").includes("fold");
          return { strip, stripPrice: STRIP[strip] ?? 0, fold, foldPrice: fold ? FOLD : 0 };
        };
        const p = {
          id: "cal-quarterly",
          name: "\u041A\u0432\u0430\u0440\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C",
          short: "\u041C\u0418\u0414\u0418, \u041C\u0418\u041D\u0418 \u0438 \xAB3 \u0432 1\xBB, \u043E\u0442 10 \u0448\u0442",
          image: "/img/showcase/stationery.webp",
          qty: { min: 10, max: 5e3, default: 50 },
          options: [
            { id: "model", label: "\u041C\u043E\u0434\u0435\u043B\u044C", type: "one", choices: models.map((m) => ({ id: m.id, label: m.label, hint: m.hint })), default: "midi3" },
            {
              id: "strip",
              label: "\u041C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u043B\u0430\u043D\u043A\u0430",
              type: "one",
              choices: [
                { id: "none", label: "\u0411\u0435\u0437 \u043F\u043B\u0430\u043D\u043A\u0438" },
                { id: "silver", label: "\u0421\u0435\u0440\u0435\u0431\u0440\u043E", hint: `+${STRIP.silver} \u20BD/\u0448\u0442` },
                { id: "gold", label: "\u0417\u043E\u043B\u043E\u0442\u043E", hint: `+${STRIP.gold} \u20BD/\u0448\u0442` }
              ],
              default: "none"
            },
            {
              id: "fold",
              label: "\u041F\u043E\u0441\u0442\u0435\u0440",
              type: "many",
              choices: [{ id: "fold", label: "\u041F\u043E\u0434\u0433\u0438\u0431 \u043F\u043E\u0441\u0442\u0435\u0440\u0430", hint: `+${FOLD} \u20BD/\u0448\u0442, \u0432\u0435\u0440\u0445 \u043F\u043B\u043E\u0442\u043D\u0435\u0435` }],
              default: []
            }
          ],
          fromPrice: Math.min(...models.map((m) => Math.min(...m.prices))),
          table: {
            columns: runs.map((r) => `\u043E\u0442 ${r} \u0448\u0442`),
            rows: [
              ...models.map((m) => ({ label: m.label, cells: runs.map((_, i) => m.prices[i] ? rub(m.prices[i]) : "\u2014") })),
              { label: "+ \u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u043B\u0430\u043D\u043A\u0430: \u0441\u0435\u0440\u0435\u0431\u0440\u043E / \u0437\u043E\u043B\u043E\u0442\u043E", cells: runs.map(() => `+${STRIP.silver} / +${STRIP.gold} \u20BD`) },
              { label: "+ \u043F\u043E\u0434\u0433\u0438\u0431 \u043F\u043E\u0441\u0442\u0435\u0440\u0430", cells: runs.map(() => `+${rub(FOLD)}`) }
            ],
            note: "\u0426\u0435\u043D\u0430 \u0437\u0430 1 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C. \xAB3 \u0432 1\xBB \u2014 \u0442\u0438\u0440\u0430\u0436\u043E\u043C \u0434\u043E 200 \u0448\u0442, \u0431\u043E\u043B\u044C\u0448\u0435 \u2014 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443."
          },
          ladder: (sel) => tiersOf(model(sel)),
          quote: (sel) => {
            const m = model(sel);
            const t = tiersOf(m);
            const base = tierPrice(t, sel.qty);
            const x = extras(sel);
            const unit = base + x.stripPrice + x.foldPrice;
            const breakdown = [{ label: `\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C ${m.label}`, amount: base, per: "\u0448\u0442" }];
            if (x.stripPrice) breakdown.push({ label: `\u041C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u043B\u0430\u043D\u043A\u0430 (${x.strip === "gold" ? "\u0437\u043E\u043B\u043E\u0442\u043E" : "\u0441\u0435\u0440\u0435\u0431\u0440\u043E"})`, amount: x.stripPrice, per: "\u0448\u0442" });
            if (x.foldPrice) breakdown.push({ label: "\u041F\u043E\u0434\u0433\u0438\u0431 \u043F\u043E\u0441\u0442\u0435\u0440\u0430", amount: x.foldPrice, per: "\u0448\u0442" });
            const nt = nextTier(t, sel.qty);
            const notes = [];
            if (m.id === "trio" && sel.qty > 200) notes.push("\xAB3 \u0432 1\xBB \u0431\u043E\u043B\u044C\u0448\u0435 200 \u0448\u0442 \u2014 \u0446\u0435\u043D\u0443 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E, \u043E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u0437\u0430\u044F\u0432\u043A\u0443.");
            return {
              unit,
              total: Math.round(unit * sel.qty),
              breakdown,
              next: nt ? { qty: nt.from, unit: unit - base + nt.price } : void 0,
              notes
            };
          }
        };
        return p;
      })(),
      tiered({
        id: "cal-wall",
        name: "\u041D\u0430\u0441\u0442\u0435\u043D\u043D\u044B\u0439 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C",
        short: "\u043F\u043B\u0430\u043A\u0430\u0442 \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u043A\u0438\u0434\u043D\u043E\u0439",
        qty: { min: 1, max: 1e3, default: 10 },
        variantLabel: "\u0412\u0438\u0434",
        variants: [
          { id: "poster", label: "\u041F\u043B\u0430\u043A\u0430\u0442 \u04103", hint: "1 \u043B\u0438\u0441\u0442", tiers: tiers([1, 21, 51, 101], [180, 175, 170, 165]) },
          { id: "flip-a4", label: "\u041F\u0435\u0440\u0435\u043A\u0438\u0434\u043D\u043E\u0439 \u04104", hint: "13 \u043B\u0438\u0441\u0442\u043E\u0432", tiers: tiers([1, 21, 51, 101], [695, 540, 480, 420]) },
          { id: "flip-a3", label: "\u041F\u0435\u0440\u0435\u043A\u0438\u0434\u043D\u043E\u0439 \u04103", hint: "13 \u043B\u0438\u0441\u0442\u043E\u0432", tiers: tiers([1, 21, 51, 101], [1390, 1080, 960, 840]) }
        ]
      }),
      tiered({
        id: "cal-desk",
        name: "\u041D\u0430\u0441\u0442\u043E\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C \xAB\u0434\u043E\u043C\u0438\u043A\xBB",
        short: "200\xD795 \u043C\u043C",
        qty: { min: 1, max: 1e3, default: 20 },
        variantLabel: "\u0412\u0438\u0434",
        variants: [
          { id: "plain", label: "\u041E\u0431\u044B\u0447\u043D\u044B\u0439 \u0434\u043E\u043C\u0438\u043A", tiers: tiers([1, 50, 100], [60, 55, 45]) },
          { id: "tearoff", label: "\u0421 \u043E\u0442\u0440\u044B\u0432\u043D\u044B\u043C\u0438 \u043C\u0435\u0441\u044F\u0446\u0430\u043C\u0438", tiers: tiers([1, 50, 100], [270, 265, 240]) }
        ]
      }),
      (() => {
        const packs = tiers([100, 200, 300, 500, 1e3, 1e4], [625, 1170, 1795, 2185, 4055, 17160]);
        const p = {
          id: "cal-pocket",
          name: "\u041A\u0430\u0440\u043C\u0430\u043D\u043D\u044B\u0435 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u0438",
          short: "\u0446\u0435\u043D\u0430 \u0437\u0430 \u0432\u0435\u0441\u044C \u0442\u0438\u0440\u0430\u0436",
          qty: { min: 100, max: 1e4, default: 100, presets: packs.map((t) => t.from) },
          fromPrice: 1.72,
          table: { columns: ["\u0426\u0435\u043D\u0430 \u0437\u0430 \u0442\u0438\u0440\u0430\u0436"], rows: packs.map((t) => ({ label: `${t.from.toLocaleString("ru-RU")} \u0448\u0442`, cells: [rub(t.price)] })) },
          quote: (sel) => {
            const pack = packs.find((t) => t.from >= sel.qty) ?? packs[packs.length - 1];
            return {
              unit: round(pack.price / pack.from),
              total: pack.price,
              breakdown: [{ label: `\u0422\u0438\u0440\u0430\u0436 ${pack.from.toLocaleString("ru-RU")} \u0448\u0442`, amount: pack.price, per: "\u0437\u0430\u043A\u0430\u0437" }],
              notes: ["\u041A\u0430\u0440\u043C\u0430\u043D\u043D\u044B\u0435 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u0438 \u043F\u0435\u0447\u0430\u0442\u0430\u044E\u0442\u0441\u044F \u0442\u0438\u0440\u0430\u0436\u0430\u043C\u0438. \u0426\u0435\u043D\u0430 \u0443\u043A\u0430\u0437\u0430\u043D\u0430 \u0437\u0430 \u0432\u0435\u0441\u044C \u0442\u0438\u0440\u0430\u0436."]
            };
          }
        };
        return p;
      })()
    ]
  };
  var wideMaterials = {
    film: { label: "\u041F\u043B\u0451\u043D\u043A\u0430 \u0441 \u043F\u0435\u0447\u0430\u0442\u044C\u044E", perM2: 1050 },
    "film-cut": { label: "\u041F\u043B\u0451\u043D\u043A\u0430 \u0441 \u043F\u0435\u0447\u0430\u0442\u044C\u044E \u0438 \u043A\u043E\u043D\u0442\u0443\u0440\u043D\u043E\u0439 \u0440\u0435\u0437\u043A\u043E\u0439", perM2: 1350 },
    "film-mount": { label: "\u041F\u043B\u0451\u043D\u043A\u0430 \u0441 \u0440\u0435\u0437\u043A\u043E\u0439 \u043D\u0430 \u043C\u043E\u043D\u0442\u0430\u0436\u043D\u043E\u0439 \u043F\u043B\u0451\u043D\u043A\u0435", perM2: 2300 },
    banner: { label: "\u0411\u0430\u043D\u043D\u0435\u0440", perM2: 1300 },
    onevision: { label: "OneVision (\u043F\u0435\u0440\u0444\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043F\u043B\u0451\u043D\u043A\u0430)", perM2: 1450 },
    pvc: { label: "\u041F\u043B\u0451\u043D\u043A\u0430 \u043D\u0430 \u041F\u0412\u0425 3\u201310 \u043C\u043C", perM2: 4800, from: true }
  };
  var wide = {
    id: "wide",
    name: "\u0428\u0438\u0440\u043E\u043A\u043E\u0444\u043E\u0440\u043C\u0430\u0442\u043D\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C",
    page: "/shirokoformatnaya-pechat",
    products: [
      {
        id: "wide-print",
        name: "\u041D\u0430\u043A\u043B\u0435\u0439\u043A\u0438, \u0431\u0430\u043D\u043D\u0435\u0440\u044B, \u043F\u043B\u0451\u043D\u043A\u0430",
        short: "\u0446\u0435\u043D\u0430 \u0437\u0430 \u043C\xB2",
        image: "/img/showcase/stickers-3d.webp",
        qty: { min: 1, max: 100, default: 1 },
        options: [
          { id: "material", label: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B", type: "one", choices: Object.entries(wideMaterials).map(([id, m]) => ({ id, label: m.label, hint: `${m.from ? "\u043E\u0442 " : ""}${m.perM2.toLocaleString("ru-RU")} \u20BD/\u043C\xB2` })), default: "film" }
        ],
        dims: [
          { id: "w", label: "\u0428\u0438\u0440\u0438\u043D\u0430", unit: "\u0441\u043C", min: 10, max: 500, default: 100 },
          { id: "h", label: "\u0412\u044B\u0441\u043E\u0442\u0430", unit: "\u0441\u043C", min: 10, max: 500, default: 100 }
        ],
        fromPrice: 1050,
        fromUnit: "\u043C\xB2",
        table: { columns: ["\u0426\u0435\u043D\u0430 \u0437\u0430 \u043C\xB2"], rows: Object.values(wideMaterials).map((m) => ({ label: m.label, cells: [`${m.from ? "\u043E\u0442 " : ""}${rub(m.perM2)}`] })) },
        quote: (sel) => {
          const m = wideMaterials[one(sel, "material", "film")] ?? wideMaterials.film;
          const area = round((sel.dims.w ?? 100) * (sel.dims.h ?? 100) / 1e4);
          const unit = Math.round(area * m.perM2);
          return {
            unit,
            total: unit * sel.qty,
            from: m.from,
            breakdown: [{ label: `${m.label}, ${String(area).replace(".", ",")} \u043C\xB2`, amount: unit, per: "\u0448\u0442" }],
            notes: [`${m.perM2.toLocaleString("ru-RU")} \u20BD \u0437\u0430 \u043C\xB2. \u041C\u043E\u043D\u0442\u0430\u0436 \u0438 \u0441\u043B\u043E\u0436\u043D\u0430\u044F \u0440\u0435\u0437\u043A\u0430 \u2014 \u043F\u043E \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0451\u043D\u043D\u043E\u0441\u0442\u0438.`]
          };
        }
      }
    ]
  };
  var gifts = {
    id: "gifts",
    name: "\u0424\u043E\u0442\u043E\u043F\u043E\u0434\u0430\u0440\u043A\u0438",
    page: "/fotopodarki",
    products: [
      fixed("puzzle-a3", "\u041F\u0430\u0437\u043B \u04103", 950),
      fixed("puzzle-a4", "\u041F\u0430\u0437\u043B \u04104", 850),
      fixed("puzzle-a5", "\u041F\u0430\u0437\u043B \u04105", 650),
      fixed("puzzle-heart", "\u041F\u0430\u0437\u043B \xAB\u0421\u0435\u0440\u0434\u0446\u0435\xBB", 850),
      fixed("pillow", "\u041F\u043E\u0434\u0443\u0448\u043A\u0430 \u0441 \u0444\u043E\u0442\u043E", 1450, { image: "/img/showcase/pillow.webp" }),
      fixed("mousepad", "\u041A\u043E\u0432\u0440\u0438\u043A \u0434\u043B\u044F \u043C\u044B\u0448\u0438", 800),
      fixed("pennant", "\u0412\u044B\u043C\u043F\u0435\u043B", 1100),
      fixed("ball", "\u0401\u043B\u043E\u0447\u043D\u044B\u0439 \u0448\u0430\u0440 70 \u043C\u043C", 450),
      fixed("medal", "\u041C\u0435\u0434\u0430\u043B\u044C", 400),
      fixed("car-sticker", "\u041D\u0430\u043A\u043B\u0435\u0439\u043A\u0430 \u043D\u0430 \u0430\u0432\u0442\u043E", 700, { from: true })
    ]
  };
  var SHEET_MAX = 50;
  var sheetTiers = [1, 5, 10, 30];
  var subSheetA3 = [220, 180, 150, 120];
  var transfers = {
    id: "transfers",
    name: "DTF \u0438 \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u044F \u0431\u0435\u0437 \u043D\u0430\u043D\u0435\u0441\u0435\u043D\u0438\u044F",
    page: "/dtf-pechat",
    products: [
      tiered({
        id: "dtf-sheet",
        name: "DTF-\u043F\u0435\u0447\u0430\u0442\u044C \u043B\u0438\u0441\u0442\u0430\u043C\u0438 \u04103",
        short: "\u0433\u043E\u0442\u043E\u0432\u044B\u0435 \u0442\u0440\u0430\u043D\u0441\u0444\u0435\u0440\u044B, \u043F\u043E\u043B\u0435 28\xD738 \u0441\u043C",
        qty: { min: 1, max: SHEET_MAX, default: 1, individualAbove: true },
        variants: [{ id: "a3", label: "\u041B\u0438\u0441\u0442 \u04103 \u2014 28\xD738 \u0441\u043C", tiers: tiers(sheetTiers, [900, 700, 500, 400]) }],
        notes: ["\u0426\u0435\u043D\u0430 \u0437\u0430 \u043B\u0438\u0441\u0442: \u043D\u0430 \u043E\u0434\u043D\u043E\u043C \u043B\u0438\u0441\u0442\u0435 \u043C\u043E\u0436\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443\u0433\u043E\u0434\u043D\u043E \u043F\u0440\u0438\u043D\u0442\u043E\u0432, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u043E\u043C\u0435\u0441\u0442\u044F\u0442\u0441\u044F \u0432 \u043F\u043E\u043B\u0435 28\xD738 \u0441\u043C."]
      }),
      tiered({
        id: "sub-sheet",
        name: "\u0421\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043F\u0435\u0447\u0430\u0442\u044C \u043B\u0438\u0441\u0442\u0430\u043C\u0438",
        short: "\u043D\u0430 \u0441\u0443\u0431\u043B\u0438\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u0431\u0443\u043C\u0430\u0433\u0435, \u04103 \u0438\u043B\u0438 \u04104",
        qty: { min: 1, max: SHEET_MAX, default: 1, individualAbove: true },
        variantLabel: "\u0424\u043E\u0440\u043C\u0430\u0442 \u043B\u0438\u0441\u0442\u0430",
        variants: [
          { id: "a3", label: "\u04103", hint: "29,7 \xD7 42 \u0441\u043C", tiers: tiers(sheetTiers, subSheetA3) },
          { id: "a4", label: "\u04104", hint: "21 \xD7 29,7 \u0441\u043C", tiers: tiers(sheetTiers, subSheetA3.map((p) => p / 2)) }
        ],
        notes: ["\u0426\u0435\u043D\u0430 \u0437\u0430 \u043B\u0438\u0441\u0442: \u043D\u0430 \u043B\u0438\u0441\u0442\u0435 \u043C\u043E\u0436\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438\u043D\u0442\u043E\u0432."]
      })
    ]
  };
  var categories = [textile, transfers, mugs, badges, keychains, magnets, stickers, cards, flyers, calendars, wide, gifts];
  var findCategory = (id) => categories.find((c) => c.id === id);
  var findProduct = (categoryId, productId) => {
    const c = findCategory(categoryId);
    return c?.products.find((p) => p.id === productId) ?? c?.products[0];
  };
  var categoryFrom = (id) => {
    const c = findCategory(id);
    if (!c) return { price: 0, unit: "\u0448\u0442" };
    const pool = c.products.filter((p2) => p2.id !== "own-item" && p2.id !== "sub-print");
    const p = pool.reduce((a, b) => b.fromPrice < a.fromPrice && !b.fromUnit ? b : a, pool[0]);
    return { price: p.fromPrice, unit: p.fromUnit ?? "\u0448\u0442" };
  };
  var defaultSelection = (p) => {
    const options = {};
    for (const g of p.options ?? []) options[g.id] = g.default ?? (g.type === "many" ? [] : g.choices[0].id);
    const dims = {};
    for (const d of p.dims ?? []) dims[d.id] = d.default;
    return { options, dims, qty: p.qty.default };
  };
  return __toCommonJS(pricing_exports);
})();
