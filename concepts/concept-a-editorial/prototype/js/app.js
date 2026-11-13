/* Прототип концепции A «Издание». Все цены — только из MSPricing (../../shared/pricing.bundle.js). */
(function () {
  'use strict';
  var P = window.MSPricing;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return P.rub(n); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CONTACT = { phone: '+7 952 114-23-50', tel: '+79521142350' };

  /* ---------- Цены «от» в строках-ценниках ---------- */
  function fromOf(spec) {
    var parts = spec.split(':');
    if (parts[0] === 'cat') return P.categoryFrom(parts[1]);
    var p = P.findProduct(parts[1], parts[2]);
    return p ? { price: p.fromPrice, unit: p.fromUnit || 'шт', product: p } : null;
  }
  function fillPrices() {
    $$('[data-p]').forEach(function (el) {
      var f = fromOf(el.getAttribute('data-p'));
      if (!f) return;
      var unit = f.unit && f.unit !== 'шт' ? ' <small>за ' + f.unit + '</small>' : '';
      el.innerHTML = 'от ' + rub(f.price) + unit;
    });
    $$('[data-min]').forEach(function (el) {
      var parts = el.getAttribute('data-min').split(':');
      var p = P.findProduct(parts[0], parts[1]);
      if (p && p.qty && p.qty.min > 1) el.textContent = (el.textContent ? el.textContent + '; ' : '') + 'от ' + p.qty.min + ' шт';
      if (!el.textContent) el.remove();
    });
  }

  /* ---------- Шапка, меню ---------- */
  function initHeader() {
    var hdr = $('.hdr');
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 4); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    $$('[data-pop]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var timer;
      var open = function () { closeAll(btn); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
      var close = function () { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
      btn._close = close;
      btn.addEventListener('click', function () { panel.hidden ? open() : close(); });
      var item = btn.closest('.nav-item');
      if (window.matchMedia('(hover: hover)').matches) {
        item.addEventListener('mouseenter', function () { clearTimeout(timer); timer = setTimeout(open, 150); });
        item.addEventListener('mouseleave', function () { clearTimeout(timer); timer = setTimeout(close, 200); });
        panel.addEventListener('mouseenter', function () { clearTimeout(timer); });
        panel.addEventListener('mouseleave', function () { clearTimeout(timer); timer = setTimeout(close, 200); });
      }
    });
    function closeAll(except) { $$('[data-pop]').forEach(function (b) { if (b !== except && b._close) b._close(); }); }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { var openBtn = $('[data-pop][aria-expanded="true"]'); closeAll(); if (openBtn) openBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item') && !e.target.closest('.mega')) closeAll();
    });

    var menu = $('#dlg-menu');
    $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { menu.showModal(); }); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"], [data-close]')) menu.close(); });
  }

  /* ---------- Заглушки страниц, которых нет в прототипе ---------- */
  var toastT;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-stub]');
    if (!a) return;
    e.preventDefault();
    var t = $('.stub-toast');
    if (!t) { t = document.createElement('div'); t.className = 'stub-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = 'Этой страницы в прототипе нет'; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 1600);
  });

  /* ---------- Переход «строка → заголовок» ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-vt]');
    if (!a) return;
    $$('.vt-title').forEach(function (x) { x.classList.remove('vt-title'); });
    var n = a.querySelector('.toc-name') || a;
    n.classList.add('vt-title');
  });

  /* ---------- Футболка: фраза и цена ---------- */
  var TEE = P.findProduct('textile', 'tshirt-unisex');
  var FMT = { a6: 'А6', a5: 'А5', a4: 'А4', a3: 'А3' };
  function teePhrase(sel, colorText) {
    var o = sel.options, prints = [];
    ['print1', 'print2', 'print3', 'print4'].forEach(function (k) { if (o[k] && o[k] !== 'none') prints.push(FMT[o[k]]); });
    var head;
    if (o.blank === 'own') head = 'Печать на вашей футболке';
    else if (o.color === 'white') head = 'Белая футболка унисекс';
    else if (o.color === 'black') head = 'Чёрная футболка унисекс';
    else head = 'Футболка унисекс, цвет: ' + (colorText && colorText.trim() ? colorText.trim() : 'другой');
    var pr = prints.length === 1 ? 'принт ' + prints[0] : 'принты ' + prints.slice(0, -1).join(', ') + ' и ' + prints[prints.length - 1];
    return head + ', ' + pr + ', ' + sel.qty + ' шт';
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Смета ---------- */
  var KEY = 'msA-estimate';
  var est = [];
  try { est = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { est = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(est)); } catch (e) {} renderCount(true); }
  function itemQuote(it) { if (it.free) return null; var p = P.findProduct(it.cat, it.pid); return p.quote(it.sel); }
  function itemPhrase(it) { return it.free ? it.text : teePhrase(it.sel, it.colorText); }
  function isIndiv(it, q) { var p = P.findProduct(it.cat, it.pid); return it.sel.qty > p.qty.max; }
  function addToEstimate(it) { it.uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); est.push(it); save(); }
  function renderCount(bump) {
    var n = est.length;
    $$('.est-btn').forEach(function (b) {
      b.classList.toggle('has', n > 0);
      var c = $('.cnt', b); if (c) c.textContent = n;
      if (bump && !reduce && n) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
    $$('.mbar .cnt').forEach(function (c) { c.textContent = n; c.hidden = !n; });
  }
  function estTotal() {
    var sum = 0, indiv = 0;
    est.forEach(function (it) { var q = itemQuote(it); if (!q || isIndiv(it, q)) indiv++; else sum += q.total; });
    return { sum: sum, indiv: indiv };
  }
  function renderEstimate() {
    var body = $('#est-list');
    if (!est.length) {
      body.innerHTML = '<p class="est-empty">Смета пока пустая. Посчитайте изделие в калькуляторе и нажмите «Добавить в смету» — позиции соберутся здесь, их можно отправить одной заявкой.</p>';
    } else {
      body.innerHTML = est.map(function (it) {
        var q = itemQuote(it), price;
        if (!q) price = '<span class="p">посчитает менеджер</span>';
        else if (isIndiv(it, q)) price = '<span class="p">индивидуально<small>больше 50 шт</small></span>';
        else price = '<span class="p">' + rub(q.total) + '<small>' + rub(q.unit) + ' за шт</small></span>';
        var qty = it.free ? '' :
          '<div class="qty" role="group" aria-label="Количество"><button type="button" data-q="-1" aria-label="Меньше">−</button>' +
          '<input type="number" inputmode="numeric" min="1" value="' + it.sel.qty + '" aria-label="Количество, шт" data-qin>' +
          '<button type="button" data-q="1" aria-label="Больше">+</button></div>';
        return '<div class="est-item" data-uid="' + it.uid + '"><p class="phrase">' + esc(itemPhrase(it)) + '</p>' +
          '<div class="meta">' + qty + price + '</div>' +
          '<button type="button" class="btn-text rm" data-rm>Удалить</button></div>';
      }).join('');
    }
    var t = estTotal();
    $('#est-total').innerHTML = '<span>Итого</span><span>' + (t.sum ? rub(t.sum) : '—') + '</span>';
    $('#est-note').textContent = (t.indiv ? 'Позиций без цены: ' + t.indiv + ' — их посчитает менеджер. ' : '') + 'Сумма предварительная, точную подтвердит менеджер.';
    $('#est-send').disabled = !est.length;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initEstimate() {
    var dlg = $('#dlg-est');
    $$('[data-open-est]').forEach(function (b) { b.addEventListener('click', function () { renderEstimate(); dlg.showModal(); }); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
      var row = e.target.closest('.est-item');
      if (e.target.closest('[data-close]')) dlg.close();
      if (!row) return;
      var it = est.filter(function (x) { return x.uid === row.dataset.uid; })[0];
      if (e.target.closest('[data-rm]')) { est = est.filter(function (x) { return x !== it; }); save(); renderEstimate(); }
      var st = e.target.closest('[data-q]');
      if (st && it) { it.sel.qty = Math.max(1, it.sel.qty + Number(st.dataset.q)); save(); renderEstimate(); }
    });
    dlg.addEventListener('change', function (e) {
      if (!e.target.matches('[data-qin]')) return;
      var row = e.target.closest('.est-item');
      var it = est.filter(function (x) { return x.uid === row.dataset.uid; })[0];
      it.sel.qty = Math.max(1, parseInt(e.target.value, 10) || 1); save(); renderEstimate();
    });
    $('#free-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = $('#free-text');
      if (!inp.value.trim()) { inp.focus(); return; }
      addToEstimate({ free: true, text: inp.value.trim() }); inp.value = ''; renderEstimate();
    });
    $('#est-send').addEventListener('click', function () { dlg.close(); openForm({ mode: 'estimate' }); });
    renderCount(false);
  }

  /* ---------- Форма заявки ---------- */
  var formCtx = {};
  function openForm(ctx) {
    formCtx = ctx || {};
    var dlg = $('#dlg-form');
    $('#form-view').hidden = false; $('#done-view').hidden = true;
    var items = est.slice();
    if (formCtx.calcItem) items = items.concat([formCtx.calcItem]);
    var box = $('#f-order');
    if (items.length) {
      box.hidden = false;
      $('#f-order-list').innerHTML = items.map(function (it) {
        var q = itemQuote(it);
        var pr = !q ? 'без цены' : (isIndiv(it, q) ? 'индивидуально' : rub(q.total));
        return '<li><span>' + esc(itemPhrase(it)) + '</span><b>' + pr + '</b></li>';
      }).join('');
    } else box.hidden = true;
    $('#f-title').textContent = items.length ? 'Заявка на заказ' : (formCtx.title || 'Быстрая заявка');
    if (formCtx.org) $('#f-type-org').checked = true;
    toggleOrg();
    if (formCtx.layout) { var r = $('input[name="layout"][value="' + formCtx.layout + '"]'); if (r) r.checked = true; }
    toggleLayout();
    dlg.showModal();
    setTimeout(function () { $('#f-name').focus(); }, 30);
  }
  function toggleOrg() {
    var org = $('#f-type-org').checked;
    $('#f-org').hidden = !org;
    $('#f-org-note').hidden = !org;
  }
  function toggleLayout() {
    var v = ($('input[name="layout"]:checked') || {}).value;
    $('#f-comment-label').textContent = v === 'none' ? 'Опишите идею' : 'Комментарий';
    $('#f-comment').placeholder = v === 'none' ? 'Например: надпись «Лучший папа», крупно на груди, футболка размера L' : 'Размер футболки, к какой дате нужно, пожелания';
    $('#f-file-row').hidden = v === 'none';
  }
  function setErr(input, msg) {
    var box = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    box.textContent = msg || '';
  }
  function initForm() {
    var dlg = $('#dlg-form');
    $$('[data-open-form]').forEach(function (b) {
      b.addEventListener('click', function () { openForm({ title: b.dataset.title, layout: b.dataset.layout, org: b.hasAttribute('data-org') }); });
    });
    $$('input[name="ftype"]').forEach(function (r) { r.addEventListener('change', toggleOrg); });
    $$('input[name="layout"]').forEach(function (r) { r.addEventListener('change', toggleLayout); });
    $('#f-file').addEventListener('change', function () {
      var f = this.files; $('#f-file-name').textContent = f.length ? Array.prototype.map.call(f, function (x) { return x.name; }).join(', ') : 'Файл не выбран';
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    $('#order-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#f-name'), phone = $('#f-phone'), ok = true;
      if (!name.value.trim()) { setErr(name, 'Напишите, как к вам обращаться.'); ok = false; } else setErr(name, '');
      var digits = phone.value.replace(/\D/g, '');
      if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) digits = digits.slice(1);
      if (digits.length !== 10) { setErr(phone, 'Проверьте номер: нужно 10 цифр после +7, например +7 952 000-00-00.'); ok = false; } else setErr(phone, '');
      if ($('#f-type-org').checked) {
        var mail = $('#f-mail');
        if (mail.value && !/^\S+@\S+\.\S+$/.test(mail.value)) { setErr(mail, 'В адресе почты не хватает «@» или домена.'); ok = false; } else setErr(mail, '');
      }
      if (!ok) { var bad = $('[aria-invalid="true"]', dlg); if (bad) bad.focus(); return; }
      var no = 'A-' + (1000 + Math.floor(Math.random() * 9000));
      $('#done-no').textContent = 'Заявка № ' + no;
      var how = ($('input[name="how"]:checked') || {}).value || 'Позвонить';
      $('#done-how').textContent = how === 'Позвонить' ? 'Позвоним по номеру ' + phone.value.trim() + ', подтвердим цену и срок.' : 'Напишем в ' + how + ', подтвердим цену и срок.';
      if (formCtx.calcItem) { addToEstimate(formCtx.calcItem); }
      est = []; save();
      $('#form-view').hidden = true; $('#done-view').hidden = false;
      $('#done-view .h2').focus();
      e.target.reset(); toggleOrg(); toggleLayout(); $('#f-file-name').textContent = 'Файл не выбран';
    });
  }

  /* ---------- Калькулятор футболки ---------- */
  function initCalc() {
    var root = $('#calc');
    if (!root) return;
    var sel = P.defaultSelection(TEE);
    var colorText = '';
    var extra = 0; // сколько доп. принтов открыто (0–3)
    // ссылка «поделиться»
    try {
      var m = location.hash.match(/calc=([^&]+)/);
      if (m) { var d = JSON.parse(decodeURIComponent(m[1])); if (d && d.options) { sel = d; extra = ['print2', 'print3', 'print4'].filter(function (k) { return d.options[k] !== 'none'; }).length; colorText = d.ct || ''; } }
    } catch (e) {}

    var grp = function (id) { return TEE.options.filter(function (g) { return g.id === id; })[0]; };
    function optsHTML(g, cls) {
      return '<div class="opts ' + (cls || '') + '">' + g.choices.map(function (c) {
        var inner = cls === 'fmt' ? '<b>' + c.label + '</b><i>' + (c.hint || '') + '</i>' : c.label + (c.hint ? '<i>' + c.hint + '</i>' : '');
        return '<label class="opt"><input type="radio" name="' + g.id + '" value="' + c.id + '"' + (sel.options[g.id] === c.id ? ' checked' : '') + '><span>' + inner + '</span></label>';
      }).join('') + '</div>';
    }
    var g2 = grp('print2');
    function printRow(k, n) {
      var g = { id: k, choices: g2.choices.filter(function (c) { return c.id !== 'none'; }) };
      return '<div class="print-row" data-row="' + k + '"><div class="row-head"><span>' + n + '-й принт — другое место (спина, рукав)</span>' +
        '<button type="button" class="btn-text" data-del="' + k + '">Убрать</button></div>' + optsHTML(g, 'fmt') + '</div>';
    }
    function draw() {
      var own = sel.options.blank === 'own';
      var html = '';
      html += '<fieldset class="q"><span class="q-n" aria-hidden="true">1</span><div><legend>Чья футболка</legend>' + optsHTML(grp('blank')) + '</div></fieldset>';
      if (!own) {
        html += '<fieldset class="q"><span class="q-n" aria-hidden="true">2</span><div><legend>Цвет футболки</legend><p class="q-hint">В наличии белые и чёрные. Другой цвет — под заказ от 10 шт.</p>' + optsHTML(grp('color'));
        if (sel.options.color === 'other') html += '<div class="color-other"><label for="c-other">Какой цвет нужен?</label><input id="c-other" class="field-in" type="text" placeholder="Например, бордовый" value="' + esc(colorText) + '"></div>';
        html += '</div></fieldset>';
      }
      var n = own ? 2 : 3;
      html += '<fieldset class="q"><span class="q-n" aria-hidden="true">' + n + '</span><div><legend>Размер принта</legend><p class="q-hint">Размеры на одежде: А4 — это 21×28 см, а не бумажный лист.</p>' + optsHTML(grp('print1'), 'fmt');
      var keys = ['print2', 'print3', 'print4'];
      for (var i = 0; i < extra; i++) html += printRow(keys[i], i + 2);
      if (extra < 3) html += '<button type="button" class="btn btn-ghost btn-sm add-print" data-add>Добавить принт в другом месте</button>';
      if (extra > 0) html += '<p class="foot-note">Самый дорогой принт — по полной цене, следующий — на 30% дешевле, остальные — на 50%.</p>';
      html += '</div></fieldset>';
      html += '<div class="q"><span class="q-n" aria-hidden="true">' + (n + 1) + '</span><div><label class="q-title" for="qty-in">Сколько штук</label>' +
        '<div class="qty"><button type="button" data-step="-1" aria-label="Меньше на одну">−</button><input id="qty-in" type="number" inputmode="numeric" min="1" value="' + sel.qty + '">' +
        '<button type="button" data-step="1" aria-label="Больше на одну">+</button><span class="unit">шт</span></div>' +
        '<p class="q-hint" style="margin-top:10px">До 50 шт цена считается сразу, больше — индивидуально.</p></div></div>';
      html += '<fieldset class="q"><span class="q-n" aria-hidden="true">' + (n + 2) + '</span><div><legend>Макет</legend><p class="q-hint">Простой макет, на который уходит до 10 минут, сделаем бесплатно.</p>' +
        '<div class="opts compact">' +
        [['ready', 'Есть готовый файл'], ['photo', 'Есть фото или набросок'], ['none', 'Макета нет — опишу словами']].map(function (c, i) {
          return '<label class="opt"><input type="radio" name="calc-layout" value="' + c[0] + '"' + (i === 1 ? ' checked' : '') + '><span>' + c[1] + '</span></label>';
        }).join('') + '</div><div class="file-pick"><input type="file" id="calc-file" accept="image/*,.pdf,.ai,.cdr,.psd"><label class="btn btn-ghost" for="calc-file">Прикрепить фото или макет</label><span class="file-name" id="calc-file-name">Можно и позже, в заявке</span></div></div></fieldset>';
      $('#calc-q').innerHTML = html;
      update();
    }
    var lastPhrase = '';
    function update(changed) {
      var q = TEE.quote(sel);
      var phrase = teePhrase(sel, colorText);
      var ph = $('#sum-phrase');
      ph.innerHTML = esc(phrase);
      if (changed && !reduce && lastPhrase && lastPhrase !== phrase) {
        // подчеркнуть изменившуюся часть: сравнение по частям фразы
        var a = lastPhrase.split(', '), b = phrase.split(', ');
        ph.innerHTML = b.map(function (part, i) { return a[i] === part ? esc(part) : '<mark>' + esc(part) + '</mark>'; }).join(', ');
        setTimeout(function () { $$('mark', ph).forEach(function (m) { m.style.boxShadow = 'none'; }); }, 600);
      }
      lastPhrase = phrase;
      var indiv = sel.qty > TEE.qty.max;
      var tot = $('#sum-total');
      tot.classList.toggle('indiv', indiv);
      var newTotal = indiv ? 'Индивидуально' : rub(q.total);
      if (tot.textContent !== newTotal) { tot.innerHTML = '<span class="tick">' + newTotal + '</span>'; }
      $('#sum-unit').textContent = indiv ? 'Больше 50 шт — цену посчитаем индивидуально. Отправьте заявку, ответим с расчётом.' : rub(q.unit) + ' за штуку × ' + sel.qty + ' шт';
      $('#sum-break').innerHTML = indiv ? '' : q.breakdown.map(function (b) {
        return '<div class="toc-line"><div class="toc-row"><span class="toc-name">' + esc(b.label) + '</span><span class="toc-dots"></span><span class="toc-price">' + rub(b.amount) + '</span></div></div>';
      }).join('');
      // лесенка
      var lad = TEE.ladder(sel);
      $('#ladder').innerHTML = '<p class="ladder-t">Цена за штуку при таком выборе</p>' + lad.map(function (s, i) {
        var to = lad[i + 1] ? lad[i + 1].from - 1 : TEE.qty.max;
        var cur = sel.qty >= s.from && sel.qty <= to;
        return '<button type="button" data-set="' + s.from + '" class="' + (cur ? 'cur' : '') + '" aria-pressed="' + cur + '"><span>' + s.from + '–' + to + ' шт</span><span class="toc-dots"></span><span class="num">' + rub(s.price) + '</span></button>';
      }).join('');
      // подсказка о следующей ступени
      var hint = $('#sum-hint');
      if (q.next && !indiv) {
        var diff = q.next.qty - sel.qty;
        hint.hidden = false;
        hint.innerHTML = 'Ещё ' + diff + ' шт — и за штуку будет ' + rub(q.next.unit) + '. <button type="button" data-set="' + q.next.qty + '">Поставить ' + q.next.qty + ' шт</button>';
      } else hint.hidden = true;
      var err = $('#sum-err');
      if (q.error) { err.hidden = false; err.textContent = q.error; } else err.hidden = true;
      var note = $('#sum-note');
      var notes = (q.notes || []).filter(function (n) { return !/больше 50/i.test(n); });
      note.hidden = !notes.length; note.textContent = notes.join(' ');
      $('#sum-add').disabled = !!q.error; $('#sum-order').disabled = !!q.error;
      $('#sticky-total').textContent = indiv ? 'индивидуально' : rub(q.total);
      $('#sticky-qty').textContent = sel.qty + ' шт';
      var qi = $('#qty-in'); if (qi && document.activeElement !== qi) qi.value = sel.qty;
    }
    function setQty(v) {
      sel.qty = Math.max(1, Math.min(999, v || 1));
      if (sel.options.color === 'other' && sel.options.blank !== 'own' && sel.qty < 10) sel.qty = 10;
      update(true);
    }
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'radio' && sel.options.hasOwnProperty(t.name)) {
        sel.options[t.name] = t.value;
        if (t.name === 'color' && t.value === 'other' && sel.qty < 10) { sel.qty = 10; flash('Другой цвет шьём от 10 шт — количество поставили 10.'); }
        if (t.name === 'blank' || t.name === 'color') { draw(); update(true); var f = $('input[name="' + t.name + '"]:checked'); if (f) f.focus(); return; }
        update(true);
      }
      if (t.id === 'qty-in') setQty(parseInt(t.value, 10));
      if (t.id === 'calc-file') $('#calc-file-name').textContent = t.files.length ? t.files[0].name : 'Можно и позже, в заявке';
    });
    root.addEventListener('input', function (e) {
      if (e.target.id === 'c-other') { colorText = e.target.value; update(false); }
      if (e.target.id === 'qty-in' && e.target.value) { var v = parseInt(e.target.value, 10); if (v >= 1) { sel.qty = Math.min(999, v); update(true); } }
    });
    root.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-step]'))) setQty(sel.qty + Number(t.dataset.step));
      if ((t = e.target.closest('[data-set]'))) setQty(Number(t.dataset.set));
      if (e.target.closest('[data-add]')) { var k = ['print2', 'print3', 'print4'][extra]; sel.options[k] = 'a6'; extra++; draw(); update(true); var r = $('[data-row="' + k + '"] input:checked'); if (r) r.focus(); }
      if ((t = e.target.closest('[data-del]'))) {
        var keys = ['print2', 'print3', 'print4'], idx = keys.indexOf(t.dataset.del);
        for (var i = idx; i < 2; i++) sel.options[keys[i]] = sel.options[keys[i + 1]];
        sel.options.print4 = 'none'; extra--; draw(); update(true);
      }
    });
    function snapshot() { var s = clone(sel); return { cat: 'textile', pid: 'tshirt-unisex', sel: s, colorText: colorText }; }
    function flash(msg) { var a = $('#sum-added'); a.textContent = msg; }
    $('#sum-add').addEventListener('click', function () {
      addToEstimate(snapshot());
      $('#sum-added').innerHTML = 'Добавлено в смету: ' + esc(teePhrase(sel, colorText)) + '. <button type="button" data-open-est>Открыть смету</button>';
      $('#sum-added [data-open-est]').addEventListener('click', function () { renderEstimate(); $('#dlg-est').showModal(); });
    });
    function order() { openForm({ calcItem: snapshot(), layout: ($('input[name="calc-layout"]:checked') || {}).value }); }
    $('#sum-order').addEventListener('click', order);
    $('#sticky-order').addEventListener('click', order);
    $('#sticky-open').addEventListener('click', function () { $('#calc-sum').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
    $('#sum-share').addEventListener('click', function () {
      var d = clone(sel); d.ct = colorText;
      var url = location.href.split('#')[0] + '#calc=' + encodeURIComponent(JSON.stringify(d));
      var done = function () { $('#sum-added').textContent = 'Ссылка на расчёт скопирована — её можно переслать.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { history.replaceState(null, '', url); $('#sum-added').textContent = 'Ссылка на расчёт — в адресной строке.'; });
      else { history.replaceState(null, '', url); $('#sum-added').textContent = 'Ссылка на расчёт — в адресной строке.'; }
    });
    // липкая строка итога — пока калькулятор на экране
    var sticky = $('#sticky-sum');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { sticky.classList.toggle('on', en[0].isIntersecting); }, { threshold: 0.08 }).observe(root);
    }
    draw();
    window.__calc = { sel: sel, setQty: setQty, quote: function () { return TEE.quote(sel); } };
    // готовые варианты → калькулятор
    $$('[data-recipe-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = JSON.parse(b.closest('[data-recipe]').dataset.recipe);
        var base = P.defaultSelection(TEE);
        Object.keys(r.options).forEach(function (k) { base.options[k] = r.options[k]; });
        sel.options = base.options; sel.qty = r.qty;
        extra = ['print2', 'print3', 'print4'].filter(function (k) { return sel.options[k] !== 'none'; }).length;
        draw(); root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Готовые варианты ---------- */
  function initRecipes() {
    $$('[data-recipe]').forEach(function (el) {
      var r = JSON.parse(el.dataset.recipe);
      var sel = P.defaultSelection(TEE);
      Object.keys(r.options).forEach(function (k) { sel.options[k] = r.options[k]; });
      sel.qty = r.qty;
      var q = TEE.quote(sel);
      $('.r-price', el).textContent = rub(q.total);
      $('.r-unit', el).textContent = r.qty > 1 ? rub(q.unit) + ' за шт, ' + r.qty + ' шт' : '1 шт';
      $('[data-recipe-add]', el).addEventListener('click', function () {
        addToEstimate({ cat: 'textile', pid: 'tshirt-unisex', sel: clone(sel) });
        this.textContent = 'В смете';
        var b = this; setTimeout(function () { b.textContent = 'Положить в смету'; }, 1600);
      });
    });
  }

  /* ---------- Первый экран футболок: цена типичного заказа ---------- */
  function initTeeHero() {
    var el = $('[data-tee-hero]');
    if (!el) return;
    var sel = P.defaultSelection(TEE), q = TEE.quote(sel);
    $('.big .v', el).textContent = rub(q.total);
    $('.what', el).textContent = 'Белая или чёрная футболка унисекс с принтом А4, 1 шт. От ' + q.next.qty + ' шт — ' + rub(q.next.unit) + ' за штуку.';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!P) return;
    fillPrices();
    initHeader();
    initEstimate();
    initForm();
    initTeeHero();
    initCalc();
    initRecipes();
  });
})();
