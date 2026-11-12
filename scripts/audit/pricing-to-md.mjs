// Аудит: PRICING_CATALOG.json -> PRICING_CATALOG.md
import { readFileSync } from 'node:fs';
const cats = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const L = [];
L.push('# Каталог изделий и цен старого сайта (выгрузка скриптом)', '',
 'Источник: `src/data/pricing.ts` репозитория msuvenirov2.0 (ветка main, 12.11.2026). Сформировано `scripts/audit/dump-pricing.ts` + `pricing-to-md.mjs` — вручную не править. Полные данные — `PRICING_CATALOG.json`.',
 '', '«Цена по умолчанию» — расчёт калькулятора при настройках, с которыми изделие открывается. «Ступени» — количество, с которого действует цена за штуку (для настроек по умолчанию). Таблица — статичная таблица, которую сайт показывает в прайсе.', '');
let n = 0;
for (const c of cats) {
  L.push(`## ${c.name} (\`${c.id}\`)`, '', `Страница: ${c.page ?? '—'} · цена «от»: ${c.from.price} ₽/${c.from.unit} · изделий: ${c.products.length}`, '');
  for (const p of c.products) {
    n++;
    L.push(`### ${p.name} (\`${p.id}\`)`, '');
    if (p.short) L.push(`- Описание: ${p.short}`);
    L.push(`- Цена «от»: ${p.fromPrice} ₽/${p.fromUnit}`);
    const q = p.qty;
    L.push(`- Количество: от ${q.min} до ${q.max}, по умолчанию ${q.default}` + (q.presets ? `; готовые тиражи: ${q.presets.join(', ')}` : '') + (q.freeFrom ? `; от ${q.freeFrom} — любое количество` : '') + (q.individualAbove ? '; больше максимума — индивидуальный расчёт' : '') + (q.moreIn ? `; больше максимума — переход на изделие \`${q.moreIn.product}\` («${q.moreIn.label}»)` : ''));
    if (p.minQtyDefault != null) L.push(`- Минимальный тираж при настройках по умолчанию: ${p.minQtyDefault}`);
    for (const d of p.dims) L.push(`- Размер «${d.label}»: ${d.min}–${d.max} ${d.unit}, по умолчанию ${d.default}`);
    for (const g of p.options) {
      const cond = (g.showWhen ? ` (только при ${g.showWhen.group}=${g.showWhen.value})` : '') + (g.hideWhen ? ` (скрыто при ${g.hideWhen.group}=${g.hideWhen.value})` : '') + (g.addable ? ' (добавляется кнопкой)' : '');
      L.push(`- Выбор «${g.label}» [${g.type === 'one' ? 'один' : 'несколько'}]${cond}: ` + g.choices.map((ch) => ch.label + (ch.hint ? ` (${ch.hint})` : '')).join(' · '));
    }
    const dq = p.defaultQuote;
    if (dq) {
      L.push(`- Цена по умолчанию (${p.defaultSelection.qty} шт): ${dq.from ? 'от ' : ''}${dq.unit} ₽/шт, итого ${dq.total} ₽` + (dq.error ? ` — ОШИБКА: ${dq.error}` : ''));
      if (dq.breakdown?.length) L.push('  - Состав: ' + dq.breakdown.map((b) => `${b.label} — ${b.amount} ₽/${b.per}`).join('; '));
      if (dq.notes?.length) L.push('  - Примечания калькулятора: ' + dq.notes.join(' | '));
    }
    if (p.ladderDefault?.length) L.push('- Ступени цены (по умолчанию): ' + p.ladderDefault.map((t) => `от ${t.from} — ${t.price} ₽`).join('; '));
    if (p.table) {
      L.push('', `| | ${p.table.columns.join(' | ')} |`, `|---|${p.table.columns.map(() => '---').join('|')}|`);
      for (const r of p.table.rows) L.push(`| ${r.label} | ${r.cells.join(' | ')} |`);
      if (p.table.note) L.push('', `Примечание к таблице: ${p.table.note}`);
    }
    L.push('');
  }
}
L.splice(4, 0, `Всего: категорий ${cats.length}, изделий ${n}.`, '');
console.log(L.join('\n'));
