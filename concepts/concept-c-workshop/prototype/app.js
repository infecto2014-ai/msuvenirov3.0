/* Концепция C «Формула изделия» — прототип. Все цены — только из MSPricing (../../shared/pricing.bundle.js). */
(function () {
  'use strict';
  var P = window.MSPricing;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return P.rub(n); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '+79521142350';
  var TG = 'https://t.me/msuvenirov39zakaz';
  var IMG = '../../shared/portfolio/';

  /* ---------- Цифры: смена с «прокруткой» (объясняет, что цена изменилась) ---------- */
  function setNum(el, text) {
    if (!el) return;
    if (el.textContent === text) return;
    el.textContent = text;
    if (reduce || !el.animate) return;
    el.animate([{ transform: 'translateY(45%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 180, easing: 'cubic-bezier(.2,0,0,1)' });
  }
  function priceHTML(n) { // «1 550 ₽» → число + знак рубля помельче
    var s = rub(n); var i = s.lastIndexOf('₽');
    return i < 0 ? s : s.slice(0, i).trim() + '<span class="r"> ₽</span>';
  }

  /* ---------- Схемы изделий (SVG). Подпись на сайте: «Схема» ---------- */
  var TEE = 'M70 12 C80 22 120 22 130 12 L168 26 L196 70 L168 86 L158 72 L158 222 L42 222 L42 72 L32 86 L4 70 L32 26 Z';
  var FR = { a6: [22, 33, '10×15'], a5: [33, 47, '15×21'], a4: [47, 62, '21×28'], a3: [62, 85, '28×38'] };
  function teeSVG(o) {
    o = o || {};
    var fill = o.fill || '#FAFAF8', line = o.line || '#26231F', dim = o.dim || '#9FD6BB';
    var back = !!o.back;
    var s = '<svg viewBox="0 0 200 236" role="img" aria-label="' + (o.label || 'Схема футболки') + '"><path d="' + TEE + '" fill="' + fill + '" stroke="' + line + '" stroke-width="2" stroke-linejoin="round"/>';
    s += back ? '<path d="M70 12 C84 19 116 19 130 12" fill="none" stroke="' + line + '" stroke-width="2"/>' : '<path d="M70 12 C82 32 118 32 130 12" fill="none" stroke="' + line + '" stroke-width="2"/>';
    if (o.frame && FR[o.frame]) {
      var f = FR[o.frame], w = f[0], h = f[1], x = 100 - w / 2, y = back ? 42 : 50;
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + dim + '" stroke-width="2"/>';
      if (o.dims !== false) {
        var yy = y + h + 9;
        s += '<path d="M' + x + ' ' + (yy - 4) + 'v8M' + (x + w) + ' ' + (yy - 4) + 'v8M' + x + ' ' + yy + 'H' + (x + w) + '" stroke="' + dim + '" stroke-width="1.4" fill="none"/>';
        s += '<text x="100" y="' + (yy + 20) + '" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="19" fill="' + dim + '">' + f[2] + ' см</text>';
      }
    }
    return s + '</svg>';
  }
  function mugSVG(o) {
    o = o || {}; var l = o.line || '#26231F', f = o.fill || '#FAFAF8', d = o.dim || '#9FD6BB';
    var s = '<svg viewBox="0 0 200 200" role="img" aria-label="Схема кружки 330 мл"><rect x="40" y="40" width="96" height="120" rx="6" fill="' + f + '" stroke="' + l + '" stroke-width="2"/><path d="M136 66 h16 a22 22 0 0 1 0 44 h-16" fill="none" stroke="' + l + '" stroke-width="10" stroke-linecap="round"/><path d="M136 66 h16 a22 22 0 0 1 0 44 h-16" fill="none" stroke="' + f + '" stroke-width="6" stroke-linecap="round"/><ellipse cx="88" cy="40" rx="48" ry="7" fill="' + f + '" stroke="' + l + '" stroke-width="2"/>';
    if (o.print) s += '<rect x="48" y="62" width="80" height="80" fill="none" stroke="' + d + '" stroke-width="2"/><path d="M48 178v-8M128 178v-8M48 174H128" stroke="' + d + '" stroke-width="1.4"/><text x="88" y="196" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="14" fill="' + d + '">по кругу</text>';
    else s += '<path d="M40 174H136M40 170v8M136 170v8" stroke="' + d + '" stroke-width="1.4"/><text x="88" y="194" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="14" fill="' + d + '">d 82 мм</text>';
    return s + '</svg>';
  }
  function badgeSVG(o) {
    o = o || {}; var l = o.line || '#26231F', f = o.fill || '#FAFAF8', d = o.dim || '#9FD6BB';
    var s = '<svg viewBox="0 0 200 200" role="img" aria-label="Схема закатного значка"><circle cx="100" cy="92" r="64" fill="' + f + '" stroke="' + l + '" stroke-width="2"/><circle cx="100" cy="92" r="56" fill="none" stroke="' + l + '" stroke-width="1" opacity=".35"/>';
    if (o.print) s += '<circle cx="100" cy="92" r="46" fill="none" stroke="' + d + '" stroke-width="2"/><text x="100" y="98" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="15" fill="' + d + '">на всё поле</text>';
    s += '<path d="M36 176H164M36 172v8M164 172v8" stroke="' + d + '" stroke-width="1.4"/><text x="100" y="196" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="14" fill="' + d + '">38 мм</text>';
    return s + '</svg>';
  }
  function cardSVG(o) {
    o = o || {}; var l = o.line || '#26231F', f = o.fill || '#FAFAF8', d = o.dim || '#9FD6BB';
    var s = '<svg viewBox="0 0 200 200" role="img" aria-label="Схема визитки 90×50 мм"><rect x="28" y="64" width="144" height="80" rx="3" fill="' + f + '" stroke="' + l + '" stroke-width="2" transform="rotate(-4 100 104)"/><rect x="22" y="56" width="144" height="80" rx="3" fill="' + f + '" stroke="' + l + '" stroke-width="2"/>';
    if (o.print) s += '<rect x="32" y="66" width="124" height="60" fill="none" stroke="' + d + '" stroke-width="2"/>';
    s += '<path d="M22 162H166M22 158v8M166 158v8" stroke="' + d + '" stroke-width="1.4"/><text x="94" y="184" text-anchor="middle" font-family="FiraEC,Arial Narrow,sans-serif" font-weight="700" font-size="14" fill="' + d + '">90×50 мм</text>';
    return s + '</svg>';
  }
  /* Мини-схемы для прейскуранта (линия Умбра, без заливки) */
  var ICONS = {
    tee: '<path d="M22 8c3 4 17 4 20 0l12 5 8 14-9 5-3-4v34H14V28l-3 4-9-5 8-14z"/>',
    hoodie: '<path d="M24 8c0 8 16 8 16 0l13 6 8 16-9 4-3-5v33H13V29l-3 5-9-4 8-16z"/><path d="M24 8c-2 10 4 14 8 14s10-4 8-14M26 46h12"/>',
    cap: '<path d="M8 40c0-16 10-26 24-26s24 10 24 26z"/><path d="M8 40h52c2 0 3 4 0 5H8M32 14v26"/>',
    shopper: '<path d="M12 22h40l-2 38H14z"/><path d="M22 22c0-14 20-14 20 0"/>',
    mug: '<path d="M12 14h34v40a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z"/><path d="M46 22h4a8 8 0 0 1 0 16h-4"/>',
    badge: '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="17" opacity=".45"/>',
    sticker: '<path d="M14 18c8-10 28-10 36 2 8 12 0 30-14 32-16 2-30-18-22-34z"/><path d="M20 30c6-8 18-8 24 0" opacity=".5"/>',
    key: '<rect x="18" y="22" width="28" height="36" rx="4"/><circle cx="32" cy="14" r="6"/><path d="M32 20v2"/>',
    gift: '<rect x="10" y="16" width="44" height="34" rx="2"/><path d="M10 42l12-12 10 10 8-8 14 14"/><circle cx="42" cy="26" r="4"/>',
    cards: '<rect x="8" y="20" width="44" height="26" rx="2" transform="rotate(-6 30 33)"/><rect x="12" y="24" width="44" height="26" rx="2"/>',
    cal: '<rect x="12" y="10" width="40" height="12"/><rect x="14" y="24" width="36" height="12"/><rect x="14" y="38" width="36" height="12"/><path d="M14 52h36"/>',
    wide: '<path d="M6 16h52v30H6z"/><path d="M6 46l10 8M58 46l-10 8M14 26h20M14 32h30"/>'
  };
  function icon(k) { return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  var CHEV = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  var ARR = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="#ECEFE9" stroke-width="1.8"/></svg>';

  /* ---------- Каталог: строки прейскуранта ---------- */
  var ROWS = [
    { g: 'Одежда', cap: 'От 1 штуки. Можно на вашей вещи.', items: [
      { c: 'textile', p: 'tshirt-unisex', name: 'Футболки', href: 'futbolki.html', ic: 'tee', what: 'С фото, надписью или логотипом', from: 'Хлопок 100%, 160–180 г/м²; белые и чёрные в наличии', how: 'Принт переносится прессом с плёнки (DTF), до 28×38 см' },
      { c: 'textile', p: 'hoodie', name: 'Худи', ic: 'hoodie', what: 'Принт на груди, спине, рукаве', from: 'Наличие и цвета уточните у мастера', how: 'Печать с плёнки (DTF), до 4 мест' },
      { c: 'textile', p: 'cap', name: 'Бейсболки', ic: 'cap', what: 'Логотип спереди, сбоку, сзади', from: 'Хлопок, саржа, 5 панелей, 56–58 см', how: 'Печать с плёнки (DTF), до 3 мест' },
      { c: 'textile', p: 'shopper', name: 'Шопперы', ic: 'shopper', what: 'Сумка с вашим рисунком', from: 'Хлопок, саржа, 240 г/м²; светлый или чёрный', how: 'Печать с плёнки (DTF)' }
    ] },
    { g: 'Подарки и сувениры', cap: 'Кружки, значки, стикеры, фотоподарки.', items: [
      { c: 'mugs', p: 'mug', name: 'Кружки', ic: 'mug', what: 'С фото или надписью по кругу', from: 'Керамика 330 мл, d 82 мм; ещё 425 мл, пивная, кофейный набор', how: 'Краска впитывается в покрытие (сублимация); печать в цене' },
      { c: 'badges', p: 'badge-roll', name: 'Значки', ic: 'badge', what: 'Закатные и на цанге', from: 'Закатные 38 и 56 мм; на цанге 15–35 мм', how: 'Картинка под защитной плёнкой на металле' },
      { c: 'stickers', p: 'sticker-3d', name: '3D-стикеры', ic: 'sticker', what: 'Объёмные, под смолой', from: 'Плёнка и эпоксидная смола', how: 'Печатаем, вырезаем по контуру, заливаем смолой' },
      { c: 'keychains', p: 'keychain-acrylic', name: 'Брелоки', ic: 'key', what: 'Акриловые и металлические', from: 'Акрил 40×56 мм или металл', how: 'Полноцветная печать с двух сторон' },
      { c: 'gifts', cat: true, name: 'Фотоподарки', ic: 'gift', what: 'Пазлы, подушки, ёлочные шары, медали', from: '10 видов изделий', how: 'Печать вашего фото на изделии' }
    ] },
    { g: 'Полиграфия', cap: 'Визитки, календари, баннеры и плёнка.', items: [
      { c: 'cards', p: 'business-cards', name: 'Визитки', ic: 'cards', what: '90×50 мм, с одной или двух сторон', from: 'Бумага 300 г, глянец или мат', how: 'Цифровая печать; тиражи 96, 200, 300 и от 500' },
      { c: 'calendars', cat: true, name: 'Календари', ic: 'cal', what: 'Квартальные, настенные, «домики»', from: 'Квартальные МИДИ, МИНИ и «3 в 1»', how: 'Цифровая печать, курсор в комплекте' },
      { c: 'wide', p: 'wide-print', name: 'Широкоформатная печать', ic: 'wide', what: 'Баннеры, плёнка, перфоплёнка', from: 'Цена за квадратный метр', how: 'Только печать, без монтажа' }
    ] }
  ];
  function unitWord(u) { return u === 'шт' || !u ? 'за шт' : 'за ' + u; }
  function rowData(it) {
    if (it.cat) { var cf = P.categoryFrom(it.c); var cat = P.findCategory(it.c); return { from: cf.price, unit: cf.unit, min: 1, cat: cat }; }
    var p = P.findProduct(it.c, it.p);
    return { from: p.fromPrice, unit: p.fromUnit || 'шт', min: p.qty.min, p: p };
  }
  function tableHTML(d) {
    var t;
    if (d.p) t = d.p.table;
    else t = { columns: ['от'], rows: d.cat.products.map(function (x) { return { label: x.name, cells: [rub(x.fromPrice)] }; }) };
    if (!t) return '';
    var h = '<div class="tbl"><table><thead><tr><th scope="col">Вариант</th>' + t.columns.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    h += t.rows.map(function (r) { return '<tr><th scope="row" style="font-weight:400">' + r.label + '</th>' + r.cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('');
    h += '</tbody></table>' + (t.note ? '<p class="spec-note">' + t.note + '</p>' : '') + '</div>';
    return h;
  }
  function renderPricelist() {
    var host = $('#pricelist'); if (!host) return;
    var h = '';
    ROWS.forEach(function (g, gi) {
      h += '<div class="pl-group"><div><h3>' + g.g + '</h3><p class="gcap">' + g.cap + '</p></div><ul class="pl">';
      g.items.forEach(function (it, ii) {
        var d = rowData(it), id = 'sp-' + gi + '-' + ii;
        h += '<li class="row"><div class="row-main">' +
          '<div class="thumb">' + icon(it.ic) + '</div>' +
          '<div class="r-name"><a href="' + (it.href || '#') + '"' + (it.href ? '' : ' title="Страница в прототипе не собрана"') + '>' + it.name + '</a><p>' + it.what + '</p></div>' +
          '<div class="r-col r-mat"><span class="k">Из чего</span>' + it.from + '</div>' +
          '<div class="r-col r-how"><span class="k">Как печатаем</span>' + it.how + '</div>' +
          '<div class="r-col r-min"><span class="k">Тираж</span>от ' + d.min + ' шт</div>' +
          '<div class="r-price"><b>от ' + rub(d.from) + '</b><span>' + unitWord(d.unit) + '</span></div>' +
          '<button class="r-more" aria-expanded="false" aria-controls="' + id + '"><span class="lb">Цены по тиражу</span>' + CHEV + '<span class="sr"> — ' + it.name + '</span></button>' +
          '</div><div class="spec sheet" id="' + id + '" hidden>' + tableHTML(d) +
          '<div class="spec-acts">' + (it.href ? '<a class="btn" href="' + it.href + '#calc">Рассчитать ' + it.name.toLowerCase() + '</a><a class="btn-line" href="' + it.href + '">Страница изделия</a>' : '<button class="btn" data-order="' + it.name + '">Заказать расчёт</button><span class="cap">Страница этого изделия в прототипе не собрана</span>') + '</div></div></li>';
      });
      h += '</ul></div>';
    });
    host.innerHTML = h;
    $$('.r-more', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var sp = document.getElementById(b.getAttribute('aria-controls'));
        var open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!open)); sp.hidden = open;
        if (!open && !reduce && sp.animate) sp.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,0,0,1)' });
      });
    });
  }

  /* ---------- Указатель цен и меню ---------- */
  var INDEX = [['Футболки', 'textile', 'tshirt-unisex', 'futbolki.html'], ['Худи', 'textile', 'hoodie'], ['Кружки', 'mugs', 'mug'], ['Значки', 'badges', 'badge-roll'], ['Бейсболки', 'textile', 'cap'], ['Шопперы', 'textile', 'shopper'], ['3D-стикеры', 'stickers', 'sticker-3d'], ['Брелоки', 'keychains', 'keychain-acrylic'], ['Магниты', 'magnets', null], ['Визитки', 'cards', 'business-cards'], ['Календари', 'calendars', null], ['Фотоподарки', 'gifts', null]];
  function fromOf(c, p) { if (!p) { var cf = P.categoryFrom(c); return { v: cf.price, u: cf.unit }; } var x = P.findProduct(c, p); return { v: x.fromPrice, u: x.fromUnit || 'шт' }; }
  function renderIndex() {
    var host = $('#index-list'); if (!host) return;
    host.innerHTML = INDEX.map(function (r) { var f = fromOf(r[1], r[2]); return '<li><a href="' + (r[3] || '#prices') + '"><span>' + r[0] + '</span><b>от ' + rub(f.v) + (f.u !== 'шт' ? '/' + f.u : '') + '</b></a></li>'; }).join('');
    var more = $('#index-more');
    if (more) more.addEventListener('click', function () { $('.index').classList.add('all'); more.remove(); });
  }
  var MENU = [
    ['Одежда', [['Печать на одежде', 'textile', null, '#'], ['Футболки', 'textile', 'tshirt-unisex', 'futbolki.html', 1], ['Худи', 'textile', 'hoodie', '#', 1], ['Шопперы', 'textile', 'shopper', '#', 1], ['Бейсболки', 'textile', 'cap', '#', 1], ['Спецодежда', 'textile', 'own-item', '#', 1], ['Спортивная форма', null, null, '#', 1, 'по прайсу печати'], ['На вашей вещи', 'textile', 'own-item', '#', 1], ['Сублимационная печать', 'textile', 'sub-print', '#'], ['DTF и сублимация без нанесения', 'transfers', null, '#']]],
    ['Подарки и сувениры', [['Кружки', 'mugs', null, '#'], ['Значки', 'badges', null, '#'], ['Брелоки', 'keychains', null, '#'], ['Магниты', 'magnets', null, '#'], ['Стикеры', 'stickers', null, '#'], ['Фотоподарки', 'gifts', null, '#']]],
    ['Полиграфия', [['Полиграфия', 'flyers', null, '#'], ['Визитки', 'cards', null, '#'], ['Календари', 'calendars', null, '#'], ['Широкоформатная печать', 'wide', null, '#']]],
    ['По задаче', [['Подарки к празднику', null, null, '#'], ['Для класса и команды', null, null, '#'], ['Печать на вашей вещи', null, null, '#'], ['Для компаний', null, null, '#'], ['Все услуги', null, null, '#'], ['Все цены и калькулятор', null, null, '#']]]
  ];
  function menuItem(m) {
    var pr = m[1] ? fromOf(m[1], m[2]) : null;
    return '<li' + (m[4] ? ' class="sub"' : '') + '><a href="' + m[3] + '"><span class="nm">' + m[0] + '</span>' + (pr ? '<span class="pr">от ' + rub(pr.v) + (pr.u !== 'шт' ? '/' + pr.u : '') + '</span>' : (m[5] ? '<span class="pr">' + m[5] + '</span>' : '')) + '</a></li>';
  }
  function renderMenus() {
    var mega = $('#mega');
    if (mega) mega.innerHTML = '<div class="mega-in">' + MENU.map(function (g) { return '<div><h4>' + g[0] + '</h4><ul>' + g[1].map(menuItem).join('') + '</ul></div>'; }).join('') + '</div>';
    var mm = $('#mnav-body');
    if (mm) mm.innerHTML = '<p style="margin:6px 0 14px"><a class="btn" style="width:100%" href="tel:' + PHONE + '">Позвонить: +7 952 114-23-50</a></p>' +
      MENU.map(function (g, i) { return '<details class="mgrp"' + (i === 0 ? ' open' : '') + '><summary>' + g[0] + '</summary><ul class="mlist">' + g[1].map(menuItem).join('') + '</ul></details>'; }).join('') +
      '<ul class="mlist top">' + ['Цены', 'Подарки', 'Компаниям', 'Работы', 'Статьи', 'О мастерской', 'Контакты'].map(function (t) { return '<li><a href="#">' + t + '</a></li>'; }).join('') + '</ul>' +
      '<p class="cap" style="margin-top:18px">Калининград, ул. Генерала Челнокова, 11, стр. 1, ТЦ «Экватор», 2 этаж. Ежедневно 10:00–20:00.</p>';
    $$('[data-pop]').forEach(function (btn) {
      var pop = document.getElementById(btn.getAttribute('data-pop'));
      var t;
      function open() { closeAll(pop); pop.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); if (pop.classList.contains('mini')) pop.style.left = (btn.getBoundingClientRect().left) + 'px'; }
      function close() { pop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
      btn.addEventListener('click', function () { pop.classList.contains('open') ? close() : open(); });
      btn.addEventListener('mouseenter', function () { t = setTimeout(open, 150); });
      btn.addEventListener('mouseleave', function () { clearTimeout(t); });
      $('.hdr').addEventListener('mouseleave', function () { clearTimeout(t); close(); });
    });
    function closeAll(except) { $$('.mega,.mini').forEach(function (p) { if (p !== except) p.classList.remove('open'); }); $$('[data-pop]').forEach(function (b) { if (document.getElementById(b.getAttribute('data-pop')) !== except) b.setAttribute('aria-expanded', 'false'); }); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.hdr')) closeAll(null); });
  }

  /* ---------- Формула на первом экране главной ---------- */
  function formulaData(key) {
    var p, s, q;
    if (key === 'tee') { p = P.findProduct('textile', 'tshirt-unisex'); s = P.defaultSelection(p); q = p.quote(s);
      return { art1: teeSVG({ line: '#ECEFE9', fill: '#FAFAF8', label: 'Схема белой футболки' }), art2: teeSVG({ line: '#ECEFE9', fill: '#FAFAF8', frame: 'a4', label: 'Схема: принт А4 на груди' }),
        n1: 'Футболка унисекс', s1: 'хлопок, 160–180 г/м², белая', p1: rub(q.breakdown[0].amount), n2: 'Принт А4', s2: '21×28 см, печать с плёнки', p2: rub(q.breakdown[1].amount), total: q.unit, per: 'за 1 шт', img: 'wedding-tshirts.webp', cap: 'Работа мастерской: парные свадебные футболки', href: 'futbolki.html#calc' }; }
    if (key === 'mug') { p = P.findProduct('mugs', 'mug'); s = P.defaultSelection(p); q = p.quote(s);
      return { art1: mugSVG({ line: '#ECEFE9' }), art2: mugSVG({ line: '#ECEFE9', print: true }), n1: 'Кружка 330 мл', s1: 'белая, керамика', p1: rub(q.unit), n2: 'Печать по кругу и макет', s2: 'сублимация', p2: 'в цене', total: q.unit, per: 'за 1 шт', img: 'portfolio-2.webp', cap: 'Работа мастерской: кружка «Kaliningrad»', href: '#prices' }; }
    if (key === 'badge') { p = P.findProduct('badges', 'badge-roll'); s = P.defaultSelection(p); q = p.quote(s);
      return { art1: badgeSVG({ line: '#ECEFE9' }), art2: badgeSVG({ line: '#ECEFE9', print: true }), n1: 'Значок закатной', s1: '38 мм, на булавке', p1: rub(q.unit), n2: 'Ваша картинка', s2: 'на всё поле', p2: 'в цене', total: q.unit, per: 'за шт при ' + s.qty + ' шт; от ' + p.qty.min + ' шт', img: null, href: '#prices' }; }
    p = P.findProduct('cards', 'business-cards'); s = P.defaultSelection(p); q = p.quote(s);
    return { art1: cardSVG({ line: '#ECEFE9' }), art2: cardSVG({ line: '#ECEFE9', print: true }), n1: 'Визитки 90×50 мм', s1: 'бумага 300 г, глянец или мат', p1: rub(q.unit) + '/шт', n2: 'Печать с одной стороны', s2: 'цифровая, 4+0', p2: 'в цене', total: q.total, per: 'за ' + s.qty + ' шт', img: null, href: '#prices' };
  }
  function renderFormula(key, animate) {
    var host = $('#formula'); if (!host) return;
    var d = formulaData(key);
    var swap = $$('.f-swap', host);
    function fill() {
      $('#f-art1').innerHTML = d.art1; $('#f-art2').innerHTML = d.art2;
      $('#f-n1').innerHTML = d.n1 + '<span class="f-sub">' + d.s1 + '</span>'; $('#f-p1').textContent = d.p1;
      $('#f-n2').innerHTML = d.n2 + '<span class="f-sub">' + d.s2 + '</span>'; $('#f-p2').textContent = d.p2;
      $('#f-total').innerHTML = priceHTML(d.total); $('#f-per').textContent = d.per;
      var fig = $('#f-fig');
      fig.innerHTML = d.img ? '<img src="' + IMG + d.img + '" alt="' + d.cap.replace('Работа мастерской: ', '') + '" width="128" height="128"><figcaption>' + d.cap + '</figcaption>'
        : '<div style="width:128px;height:128px;color:#26231F">' + (key === 'badge' ? badgeSVG({ print: true, dim: '#213A31' }) : cardSVG({ print: true, dim: '#213A31' })) + '</div><figcaption>Схема изделия</figcaption>';
      $('#f-go').setAttribute('href', d.href);
    }
    if (!animate || reduce) { fill(); return; }
    swap.forEach(function (e) { e.classList.add('out'); });
    setTimeout(function () { fill(); swap.forEach(function (e) { e.classList.remove('out'); e.classList.add('in'); }); requestAnimationFrame(function () { requestAnimationFrame(function () { swap.forEach(function (e) { e.classList.remove('in'); }); }); }); }, 160);
  }
  function initFormula() {
    var keys = $$('#f-keys .key'); if (!keys.length) return;
    renderFormula('tee', false);
    keys.forEach(function (k) { k.addEventListener('click', function () { if (k.getAttribute('aria-pressed') === 'true') return; keys.forEach(function (x) { x.setAttribute('aria-pressed', String(x === k)); }); renderFormula(k.dataset.k, true); }); });
  }

  /* ---------- Срез: слои расходятся один раз при появлении ---------- */
  function initCuts() {
    var c = $('.cuts'); if (!c) return;
    var btn = $('.cut-toggle');
    if (reduce || !('IntersectionObserver' in window)) return;
    c.classList.add('closed');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { c.classList.remove('closed'); io.disconnect(); } }); }, { threshold: .4 });
    io.observe(c);
    if (btn) btn.addEventListener('click', function () { c.classList.toggle('closed'); btn.textContent = c.classList.contains('closed') ? 'Разобрать по слоям' : 'Собрать обратно'; });
  }

  /* ---------- Смета ---------- */
  var KEY = 'msC.estimate';
  var est = [];
  try { est = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { est = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(est)); } catch (e) {} paintCount(); }
  function itemQuote(it) { if (it.free) return null; var p = P.findProduct(it.c, it.p); var s = JSON.parse(JSON.stringify(it.sel)); s.qty = it.qty; return p.quote(s); }
  function estTotal() { return est.reduce(function (a, it) { var q = itemQuote(it); return a + (q && !q.error ? q.total : 0); }, 0); }
  function paintCount() {
    $$('.est-btn .n').forEach(function (n) { setNum(n, String(est.length)); if (est.length) n.removeAttribute('data-zero'); else n.setAttribute('data-zero', ''); });
  }
  function addToEstimate(item) { est.push(item); save(); renderEstimate(); toast('Добавлено в смету: ' + item.name + ', ' + item.qty + ' шт'); }
  function renderEstimate() {
    var b = $('#est-body'); if (!b) return;
    if (!est.length) { b.innerHTML = '<p class="est-empty">В смете пока пусто. Посчитайте изделие и нажмите «В смету» — позиции соберутся здесь, их можно отправить одной заявкой.</p>'; }
    else b.innerHTML = est.map(function (it, i) {
      var q = itemQuote(it);
      var over = it.free ? '' : (P.findProduct(it.c, it.p).qty.max < it.qty);
      return '<div class="est-item"><div class="nm">' + it.name + '</div><div class="ds">' + (it.desc || '') + '</div>' +
        '<div class="ln">' + (it.free ? '<span class="ds">Посчитает мастер</span>' : '<span class="stepper"><button type="button" data-d="-1" data-i="' + i + '" aria-label="Меньше">−</button><input inputmode="numeric" aria-label="Количество" value="' + it.qty + '" data-i="' + i + '"><button type="button" data-d="1" data-i="' + i + '" aria-label="Больше">+</button></span>') +
        '<span class="sum">' + (it.free ? '—' : over ? 'посчитает мастер' : rub(q.total)) + '</span></div><button class="del" data-del="' + i + '">Убрать из сметы</button></div>';
    }).join('');
    $('#est-total').textContent = rub(estTotal());
    $$('[data-d]', b).forEach(function (x) { x.addEventListener('click', function () { var it = est[+x.dataset.i]; var p = P.findProduct(it.c, it.p); it.qty = Math.max(p.qty.min, it.qty + (+x.dataset.d)); save(); renderEstimate(); }); });
    $$('input[data-i]', b).forEach(function (x) { x.addEventListener('change', function () { var it = est[+x.dataset.i]; var p = P.findProduct(it.c, it.p); it.qty = Math.max(p.qty.min, parseInt(x.value, 10) || p.qty.min); save(); renderEstimate(); }); });
    $$('[data-del]', b).forEach(function (x) { x.addEventListener('click', function () { est.splice(+x.dataset.del, 1); save(); renderEstimate(); }); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var d = $('.drawer.open'); if (!d) return;
    var f = $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary', d).filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (!d.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  var lastFocus = null;
  function openDrawer(id) { lastFocus = document.activeElement; var d = document.getElementById(id); d.classList.add('open'); $('.scrim').classList.add('open'); d.setAttribute('aria-hidden', 'false'); var f = $('.x', d); f && f.focus(); if (id === 'estimate') renderEstimate(); }
  function closeDrawers() { $$('.drawer.open').forEach(function (d) { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); }); $('.scrim').classList.remove('open'); lastFocus && lastFocus.focus && lastFocus.focus(); }
  function initEstimate() {
    paintCount();
    $$('[data-open-est]').forEach(function (b) { b.addEventListener('click', function () { openDrawer('estimate'); }); });
    $$('[data-open-nav]').forEach(function (b) { b.addEventListener('click', function () { openDrawer('mnav'); }); });
    $$('.drawer .x').forEach(function (b) { b.addEventListener('click', closeDrawers); });
    $('.scrim').addEventListener('click', closeDrawers);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('.drawer.open')) closeDrawers(); });
    var ff = $('#free-form');
    if (ff) ff.addEventListener('submit', function (e) { e.preventDefault(); var v = $('#free-in').value.trim(); if (!v) { $('#free-in').focus(); return; } est.push({ free: true, name: v, desc: 'Нет в прайсе — цену назовёт мастер', qty: 1 }); $('#free-in').value = ''; save(); renderEstimate(); });
    var so = $('#est-send'); if (so) so.addEventListener('click', function () { closeDrawers(); openOrder({ mode: 'estimate' }); });
  }
  var tt;
  function toast(msg) {
    var t = $('#toast'); $('#toast-msg').textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---------- Форма заявки ---------- */
  function openOrder(opt) {
    opt = opt || {};
    var dlg = $('#order'); var form = $('#order-form');
    $('#od-done').hidden = true; form.hidden = false;
    var sum = $('#od-sum');
    if (opt.mode === 'estimate' && est.length) { sum.hidden = false; sum.innerHTML = 'Смета: ' + est.length + ' ' + plural(est.length) + ' · <b>' + rub(estTotal()) + '</b><br><span class="cap">Сумма предварительная, точную подтвердит мастер.</span>'; }
    else if (opt.item) { sum.hidden = false; var q = itemQuote(opt.item); sum.innerHTML = opt.item.name + ' · ' + opt.item.desc + ' · ' + opt.item.qty + ' шт · <b>' + (q && !q.error ? rub(q.total) : 'посчитает мастер') + '</b>'; }
    else if (opt.topic) { sum.hidden = false; sum.textContent = 'Тема: ' + opt.topic; }
    else sum.hidden = true;
    $('#od-title').textContent = opt.mode === 'estimate' || opt.item ? 'Отправить заказ' : 'Заявка';
    dlg._opt = opt;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { $('#f-name').focus(); }, 30);
  }
  function plural(n) { var a = n % 10, b = n % 100; if (a === 1 && b !== 11) return 'позиция'; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'позиции'; return 'позиций'; }
  function initOrder() {
    var dlg = $('#order'); if (!dlg) return;
    var form = $('#order-form');
    $$('[data-order]').forEach(function (b) { b.addEventListener('click', function () { openOrder({ topic: b.getAttribute('data-order') || '' }); }); });
    $$('.od-close').forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $$('input[name=mk]', form).forEach(function (r) { r.addEventListener('change', function () { $('#idea').hidden = !(form.mk.value === 'none'); $('#file-hint').hidden = form.mk.value === 'none'; }); });
    $('#f-org').addEventListener('change', function () { $('#org-fields').hidden = !this.checked; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var nm = $('#f-name'), ph = $('#f-phone');
      var fn = nm.closest('.fld'), fp = ph.closest('.fld');
      fn.classList.toggle('bad', !nm.value.trim()); if (!nm.value.trim()) ok = false;
      var digits = ph.value.replace(/\D/g, '');
      var badP = digits.length < 10; fp.classList.toggle('bad', badP); if (badP) ok = false;
      if (!ok) { (fn.classList.contains('bad') ? nm : ph).focus(); return; }
      var num = 'МС-' + String(Math.floor(1000 + Math.random() * 9000));
      $('#od-num').textContent = num;
      var how = form.contact.value;
      $('#od-how').textContent = how === 'call' ? 'позвоним по номеру ' + ph.value : how === 'tg' ? 'напишем в Telegram' : how === 'max' ? 'напишем в MAX' : 'напишем во ВКонтакте';
      form.hidden = true; $('#od-done').hidden = false; $('#od-done-btn').focus();
      if (dlg._opt && dlg._opt.mode === 'estimate') { est = []; save(); }
    });
    $('#od-done-btn').addEventListener('click', function () { dlg.close(); });
  }

  /* ---------- Калькулятор футболки ---------- */
  function initCalc() {
    var root = $('#calc'); if (!root) return;
    var p = P.findProduct('textile', 'tshirt-unisex');
    var sel = P.defaultSelection(p);
    var prints = 1; // сколько принтов показано
    var prev = {};
    var COLORS = { white: ['Белый', '#FAFAF8'], black: ['Чёрный', '#191A1B'], other: ['Другой цвет', '#9aa39b'] };
    var FMT = ['a6', 'a5', 'a4', 'a3'];
    var PLACE = { print1: 'спереди', print2: 'сзади', print3: 'третье место', print4: 'четвёртое место' };
    var otherText = '';

    function q() { return p.quote(sel); }
    function sizesHTML(grp) {
      return '<div class="sizes" role="radiogroup" aria-label="Размер принта">' + FMT.map(function (f) {
        var d = P.dtfPrint[f]; var w = FR[f][0] * 0.62, h = FR[f][1] * 0.62;
        return '<button type="button" class="key size" role="radio" data-g="' + grp + '" data-v="' + f + '" aria-checked="' + (sel.options[grp] === f) + '"><i style="width:' + w + 'px;height:' + h + 'px"></i><b>' + d.label + '</b><small>' + d.size + '</small></button>';
      }).join('') + '</div>';
    }
    function render() {
      var own = sel.options.blank === 'own';
      // шаг 1
      $$('[data-g=blank]', root).forEach(function (b) { b.setAttribute('aria-checked', String(sel.options.blank === b.dataset.v)); });
      $('#c-color').hidden = own;
      $$('.sw', root).forEach(function (b) { b.setAttribute('aria-checked', String(sel.options.color === b.dataset.v)); });
      $('#sw-label').textContent = COLORS[sel.options.color][0] + (sel.options.color === 'other' ? ' — от 10 шт' : ' — есть в наличии');
      $('#other-color').hidden = sel.options.color !== 'other';
      // шаг 2: схема спереди/сзади
      var fill = own ? '#E6E1D6' : COLORS[sel.options.color][1];
      $('#scheme-front').innerHTML = teeSVG({ fill: fill, line: '#ECEFE9', frame: sel.options.print1, label: 'Схема: спереди, принт ' + P.dtfPrint[sel.options.print1].label });
      $('#scheme-back').innerHTML = teeSVG({ fill: fill, line: '#ECEFE9', back: true, frame: sel.options.print2 !== 'none' ? sel.options.print2 : null, label: 'Схема: сзади' });
      $$('.size[data-g]', root).forEach(function (b) { b.setAttribute('aria-checked', String(sel.options[b.dataset.g] === b.dataset.v)); });
      for (var i = 2; i <= 4; i++) $('#extra' + i).hidden = i > prints;
      $('#add-print').hidden = prints >= 4;
      $('#add-print .t').textContent = 'Добавить место печати (' + (prints + 1) + '-е)';
      // шаг 3
      var qi = $('#qty'); if (document.activeElement !== qi) qi.value = sel.qty;
      paintRuler();
      // итог
      var r = q();
      var over = sel.qty > p.qty.max;
      var lines = r.breakdown.map(function (b, i) { return '<li data-k="' + b.label + '"><span>' + (i ? '<span class="op">+</span>' : '') + b.label.replace('Печать DTF', 'Принт') + '</span><b>' + rub(b.amount) + '</b></li>'; });
      var bd = $('#bd'); bd.innerHTML = lines.join('');
      $$('#bd li').forEach(function (li) { var k = li.dataset.k; if (prev[k] === undefined || prev[k] !== li.querySelector('b').textContent) { if (Object.keys(prev).length) { li.classList.add('chg'); setTimeout(function () { li.classList.remove('chg'); }, 600); } } });
      prev = {}; $$('#bd li').forEach(function (li) { prev[li.dataset.k] = li.querySelector('b').textContent; });
      setNum($('#t-unit'), rub(r.unit));
      setNum($('#t-qty'), sel.qty + ' шт');
      setNum($('#t-total'), over ? 'по запросу' : rub(r.total));
      $('#t-total').closest('.t-total').querySelector('span').textContent = over ? 'Больше 50 шт' : 'Итого за ' + sel.qty + ' шт';
      $('#t-notes').innerHTML = r.notes.filter(function (n) { return n.indexOf('Нужно больше') < 0; }).map(function (n) { return '<p class="t-note">' + n + '</p>'; }).join('');
      setNum($('#sb-total'), over ? 'по запросу' : rub(r.total));
      $('#sb-unit').textContent = rub(r.unit) + ' за шт · ' + sel.qty + ' шт';
      // подсказка следующей ступени
      var h = $('#hint');
      if (over) { h.hidden = true; }
      else if (r.next) { h.hidden = false; var dlt = r.next.qty - sel.qty; h.innerHTML = 'Ещё ' + dlt + ' шт — и футболка будет стоить ' + rub(r.next.unit) + ' за штуку.<button type="button" id="to-next">Поставить ' + r.next.qty + ' шт</button>'; $('#to-next').onclick = function () { setQty(r.next.qty); }; }
      else h.hidden = true;
      $('#over').hidden = !over;
      // формула первого экрана — по умолчанию
    }
    function setOpt(g, v) {
      sel.options[g] = v;
      if (g === 'color' && v === 'other' && sel.qty < 10) { sel.qty = 10; toastCalc('Другой цвет делаем от 10 шт — поставили 10'); }
      render();
    }
    function toastCalc(m) { var n = $('#c-msg'); n.textContent = m; n.hidden = false; clearTimeout(n._t); n._t = setTimeout(function () { n.hidden = true; }, 4000); }
    function minQty() { return sel.options.color === 'other' && sel.options.blank !== 'own' ? 10 : 1; }
    function setQty(n) { n = Math.max(minQty(), Math.min(60, n | 0)); if (sel.qty !== n) { var crossed = ladder.some(function (st) { return (sel.qty < st.from) !== (n < st.from); }); sel.qty = n; render(); if (crossed) flashStop(n); } }
    // линейка тиража
    var ladder = p.ladder(sel);
    var track = $('#track');
    function pos(n) { return ((Math.min(n, 50) - 1) / 49) * 100; }
    function paintRuler() {
      var ld = p.ladder(sel);
      track.querySelectorAll('.stop').forEach(function (x) { x.remove(); });
      ld.concat([{ from: 50, price: null }]).forEach(function (st) {
        var d = document.createElement('div'); d.className = 'stop'; d.style.left = pos(st.from) + '%'; d.dataset.from = st.from;
        d.innerHTML = (st.price ? '<span class="p">' + rub(st.price) + '</span>' : '') + '<span class="q">' + (st.from === 50 ? '50' : st.from) + '</span>';
        track.appendChild(d);
      });
      var th = $('#thumb2'); th.style.left = pos(sel.qty) + '%'; th.setAttribute('aria-valuenow', sel.qty); th.setAttribute('aria-valuetext', sel.qty + ' шт, ' + rub(q().unit) + ' за штуку');
    }
    function flashStop(n) { var st = null; $$('.stop', track).forEach(function (s) { if (+s.dataset.from <= n) st = s; }); if (st) { st.classList.add('hit'); setTimeout(function () { st.classList.remove('hit'); }, 260); } }
    function fromX(x) { var r = track.getBoundingClientRect(); var t = Math.max(0, Math.min(1, (x - r.left) / r.width)); var n = Math.round(1 + t * 49); var ld = p.ladder(sel); ld.forEach(function (st) { if (Math.abs(n - st.from) <= 1) n = st.from; }); return n; }
    var drag = false;
    track.addEventListener('pointerdown', function (e) { drag = true; track.setPointerCapture(e.pointerId); setQty(fromX(e.clientX)); });
    track.addEventListener('pointermove', function (e) { if (drag) setQty(fromX(e.clientX)); });
    track.addEventListener('pointerup', function () { drag = false; });
    $('#thumb2').addEventListener('keydown', function (e) {
      var ld = p.ladder(sel).map(function (s) { return s.from; }).concat([50]);
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setQty(sel.qty + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setQty(sel.qty - 1); e.preventDefault(); }
      if (e.key === 'PageUp') { setQty(ld.filter(function (x) { return x > sel.qty; })[0] || 50); e.preventDefault(); }
      if (e.key === 'PageDown') { setQty(ld.filter(function (x) { return x < sel.qty; }).pop() || 1); e.preventDefault(); }
      if (e.key === 'Home') { setQty(1); e.preventDefault(); } if (e.key === 'End') { setQty(50); e.preventDefault(); }
    });
    $('#q-minus').addEventListener('click', function () { setQty(sel.qty - 1); });
    $('#q-plus').addEventListener('click', function () { setQty(sel.qty + 1); });
    $('#qty').addEventListener('change', function () { setQty(parseInt(this.value, 10) || 1); });
    $('#q-over').addEventListener('click', function () { setQty(sel.qty > 50 ? 50 : 51); });
    // выбор
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b || !root.contains(b)) return;
      setOpt(b.dataset.g, b.dataset.v);
    });
    $('#add-print').addEventListener('click', function () { prints++; sel.options['print' + prints] = 'a6'; render(); var f = $('#extra' + prints + ' .size[aria-checked=true]'); f && f.focus(); });
    $$('.rm', root).forEach(function (b) { b.addEventListener('click', function () { var i = +b.dataset.i; for (var k = i; k < 4; k++) sel.options['print' + k] = sel.options['print' + (k + 1)] || 'none'; sel.options.print4 = 'none'; prints--; render(); $('#add-print').focus(); }); });
    $('#other-in').addEventListener('input', function () { otherText = this.value.trim(); });
    // в смету / заказать
    function desc() {
      var parts = [];
      parts.push(sel.options.blank === 'own' ? 'ваша футболка' : (sel.options.color === 'other' ? 'другой цвет' + (otherText ? ': ' + otherText : '') : COLORS[sel.options.color][0].toLowerCase()));
      ['print1', 'print2', 'print3', 'print4'].forEach(function (k) { var v = sel.options[k]; if (v && v !== 'none') parts.push(P.dtfPrint[v].label + ' ' + PLACE[k]); });
      return parts.join(', ');
    }
    function item() { return { c: 'textile', p: 'tshirt-unisex', name: 'Футболка', desc: desc(), sel: JSON.parse(JSON.stringify(sel)), qty: sel.qty }; }
    $$('[data-add]').forEach(function (b) { b.addEventListener('click', function () { addToEstimate(item()); }); });
    $$('[data-buy]').forEach(function (b) { b.addEventListener('click', function () { openOrder({ item: item() }); }); });
    for (var zi = 1; zi <= 4; zi++) { var zz = document.getElementById('sz' + zi); if (zz) zz.innerHTML = sizesHTML('print' + zi); }
    // липкая полоса итога на телефоне
    var sb = $('#stickybar');
    if (sb && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var tot = $('.total').getBoundingClientRect(); var vis = e.isIntersecting && !(tot.top < window.innerHeight - 140 && tot.bottom > 0); sb.classList.toggle('show', vis); }); }, { threshold: [0, .05] });
      io.observe(root);
      window.addEventListener('scroll', function () { var r = root.getBoundingClientRect(), tot = $('.total').getBoundingClientRect(); var vis = r.top < window.innerHeight * .7 && r.bottom > 120 && !(tot.top < window.innerHeight - 140 && tot.bottom > 0); sb.classList.toggle('show', vis); }, { passive: true });
    }
    // формула первого экрана страницы
    var dq = p.quote(P.defaultSelection(p));
    $('#pf-base').textContent = rub(dq.breakdown[0].amount); $('#pf-print').textContent = rub(dq.breakdown[1].amount); $('#pf-total').textContent = rub(dq.unit);
    var dl = p.ladder(P.defaultSelection(p)); $('#pf-step').textContent = 'От ' + dl[1].from + ' шт — ' + rub(dl[1].price) + ' за штуку, от ' + dl[2].from + ' шт — ' + rub(dl[2].price) + '.';
    render();
    window.__calcSel = sel; window.__calcSetQty = setQty; // для самопроверки
  }

  /* ---------- Готовые варианты ---------- */
  function initVariants() {
    var host = $('#variants'); if (!host) return;
    var p = P.findProduct('textile', 'tshirt-unisex');
    var V = [
      { t: ['Белая футболка', 'принт А6 на груди'], o: { print1: 'a6' }, d: 'белый, А6 спереди' },
      { t: ['Белая футболка', 'А4 спереди', 'А6 сзади'], o: { print1: 'a4', print2: 'a6' }, d: 'белый, А4 спереди, А6 сзади' },
      { t: ['Чёрная футболка', 'принт А3'], o: { color: 'black', print1: 'a3' }, d: 'чёрный, А3' },
      { t: ['Ваша футболка', 'принт А4'], o: { blank: 'own', print1: 'a4' }, d: 'ваша футболка, А4' }
    ];
    host.innerHTML = V.map(function (v, i) {
      var s = P.defaultSelection(p); Object.keys(v.o).forEach(function (k) { s.options[k] = v.o[k]; }); v.s = s;
      var q = p.quote(s);
      return '<li><div class="vf">' + v.t.join('<span class="op">+</span>') + '</div><div class="vp">' + rub(q.unit) + '<span>за 1 шт</span></div><div class="v-acts"><button class="btn" data-v="' + i + '">В смету</button><a class="btn-line" href="#calc" data-vset="' + i + '">Изменить</a></div></li>';
    }).join('');
    $$('[data-v]', host).forEach(function (b) { b.addEventListener('click', function () { var v = V[+b.dataset.v]; addToEstimate({ c: 'textile', p: 'tshirt-unisex', name: 'Футболка', desc: v.d, sel: JSON.parse(JSON.stringify(v.s)), qty: 1 }); }); });
  }

  /* ---------- Работы ---------- */
  function initWorks() {
    $$('img[data-src]').forEach(function (i) { i.src = IMG + i.dataset.src; });
  }

  /* ---------- Шапка ---------- */
  function initHeader() {
    var h = $('.hdr'); if (!h) return;
    window.addEventListener('scroll', function () { h.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });
    $$('[data-order-quick]').forEach(function (b) { b.addEventListener('click', function () { openOrder(est.length ? { mode: 'estimate' } : { topic: b.getAttribute('data-order-quick') || '' }); }); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!P) return;
    renderMenus(); renderIndex(); renderPricelist(); initFormula(); initCuts();
    initEstimate(); initOrder(); initHeader(); initCalc(); initVariants(); initWorks();
  });
})();
