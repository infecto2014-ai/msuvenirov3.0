/* Прототип B «Стенд примерки»: шапка, меню, смета, форма, стенд, раскладка, калькулятор футболки.
   Все цены — только из MSPricing (../../shared/pricing.bundle.js). */
(function () {
  'use strict';
  const P = window.MSPricing, M = window.MSModels;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rub = (v) => P.rub(v);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHOTO = '../../shared/portfolio/';
  const PROTO_PAGE = 'futbolki.html';
  const NS = 'http://www.w3.org/2000/svg';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); };
  M.ensureDefs();

  /* ======================== Модели-миниатюры ======================== */
  function modelSVG(key, opts = {}) {
    const md = M.MODELS[key]; if (!md) return '';
    const pad = opts.pad ?? 4;
    const style = opts.col ? ` style="--m-col:${opts.col}"` : '';
    const cls = opts.cls ? ` class="${opts.cls}"` : '';
    return `<svg${cls}${style} viewBox="${-pad} ${-pad} ${md.w + pad * 2} ${md.h + pad * 2}" aria-hidden="true" focusable="false">${md.svg()}</svg>`;
  }
  function fromText(cat, prod) {
    let price, u;
    if (prod === "*") { const f = P.categoryFrom(cat); if (!f) return ""; price = f.price; u = f.unit; }
    else { const p = P.findProduct(cat, prod); if (!p) return ""; price = p.fromPrice; u = p.fromUnit; }
    const unit = u && u !== "шт" ? ` за ${u}` : "";
    return "от " + rub(price) + unit;
  }
  // Цены «от» и силуэты в разметке: data-from="cat/prod", data-sil="model"
  function hydrateStatic(root = document) {
    $$('[data-from]', root).forEach((el) => { const [c, p] = el.dataset.from.split('/'); el.textContent = fromText(c, p); });
    $$('[data-sil]', root).forEach((el) => { el.innerHTML = modelSVG(el.dataset.sil, { cls: 'sil-svg', pad: 8 }); });
    $$('[data-proto]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toast('В прототипе собраны только главная и страница футболок'); }));
  }

  /* ======================== Тост, перелёт ======================== */
  let toastT;
  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }
  function flyTo(fromEl, html) {
    const target = $$('.smeta-chip').find((c) => c.offsetParent !== null) || $('.mbar .go');
    if (!fromEl || !target || REDUCED) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'flyer'; f.innerHTML = html;
    f.style.left = (a.left + a.width / 2 - 32) + 'px'; f.style.top = (a.top + a.height / 2 - 32) + 'px';
    document.body.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.35)`;
      f.style.opacity = '.2';
    }));
    setTimeout(() => f.remove(), 460);
  }

  /* ======================== Шапка и меню ======================== */
  function initHeader() {
    const hdr = $('.hdr');
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY; hdr.classList.toggle('scrolled', y > 8); lastY = y;
    }, { passive: true });
    $$('.nav [data-drop]').forEach((btn) => {
      const li = btn.closest('li');
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); const open = !li.classList.contains('open');
        $$('.nav li.open').forEach((x) => { x.classList.remove('open'); $('[data-drop]', x).setAttribute('aria-expanded', 'false'); });
        li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) $$('.nav li.open').forEach((x) => { x.classList.remove('open'); $('[data-drop]', x).setAttribute('aria-expanded', 'false'); }); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const o = $('.nav li.open'); if (o) { o.classList.remove('open'); const b = $('[data-drop]', o); b.setAttribute('aria-expanded', 'false'); b.focus(); }
      if ($('.mnav.on')) closeMnav();
      if ($('.drawer.on')) closeSmeta();
    });
    $$('[data-mnav]').forEach((b) => b.addEventListener('click', openMnav));
    $$('[data-mnav-close]').forEach((b) => b.addEventListener('click', closeMnav));
    $$('[data-order]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); closeMnav(); openForm({ mode: 'quick', topic: b.dataset.order || '' }); }));
    $$('[data-smeta]').forEach((b) => b.addEventListener('click', () => { closeMnav(); openSmeta(); }));
  }
  function openMnav() { const m = $('.mnav'); m.classList.add('on'); document.body.style.overflow = 'hidden'; $('[data-mnav-close]', m).focus(); }
  function closeMnav() { const m = $('.mnav'); if (!m || !m.classList.contains('on')) return; m.classList.remove('on'); document.body.style.overflow = ''; const b = $('[data-mnav]'); b && b.focus(); }

  /* ======================== Смета ======================== */
  const KEY = 'msb-smeta';
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (items) => { try { sessionStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* без хранилища смета живёт до перезагрузки */ } memItems = items; };
  let memItems = load();
  function itemQuote(it) {
    const p = P.findProduct(it.cat, it.prod); const sel = JSON.parse(JSON.stringify(it.sel)); sel.qty = it.qty;
    return p.quote(sel);
  }
  function itemTotal(it) { if (it.qty > (it.max || 50)) return null; const q = itemQuote(it); return q.error ? null : q.total; }
  function smetaCount() { return memItems.length; }
  function updateChips(bump) {
    const n = smetaCount();
    $$('.smeta-chip').forEach((c) => {
      $('.cnt', c).textContent = n; c.classList.toggle('empty', n === 0);
      c.setAttribute('aria-label', n ? `Смета: ${n} ${plural(n, 'позиция', 'позиции', 'позиций')}` : 'Смета пуста');
      if (bump && !REDUCED) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    });
  }
  function addToSmeta(item, fromEl) {
    const items = memItems.slice(); item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5); items.push(item); save(items);
    flyTo(fromEl, teeMini(item.look));
    updateChips(true); toast('Добавлено в смету: ' + item.title.toLowerCase());
  }
  function buildDrawer() {
    if ($('.drawer')) return;
    const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.addEventListener('click', closeSmeta);
    const d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('aria-label', 'Смета'); d.setAttribute('aria-hidden', 'true');
    d.innerHTML = `<div class="drawer-head"><h2 class="d3">Смета</h2><button class="x-btn" type="button" data-close-smeta aria-label="Закрыть смету"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div class="drawer-body" id="smetaList"></div>
      <div class="drawer-foot"><div class="s-total"><span>Итого по смете</span><b id="smetaTotal">0 ₽</b></div>
      <p class="tiny muted" id="smetaNote" style="margin:0"></p>
      <button class="btn btn-main btn-block" type="button" id="smetaSend">Отправить смету</button>
      <button class="btn btn-line btn-block" type="button" id="smetaLink">Скопировать ссылку на смету</button></div>`;
    document.body.append(scrim, d);
    $('[data-close-smeta]', d).addEventListener('click', closeSmeta);
    $('#smetaSend').addEventListener('click', () => { closeSmeta(); openForm({ mode: 'smeta' }); });
    $('#smetaLink').addEventListener('click', () => {
      const url = location.href.split('#')[0] + '#smeta';
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        () => toast('Ссылка скопирована. В прототипе она открывает страницу, а не смету'),
        () => toast('Не получилось скопировать. Скопируйте адрес страницы вручную'));
    });
  }
  function renderSmeta() {
    const list = $('#smetaList'); const items = memItems;
    if (!items.length) { list.innerHTML = '<p class="s-empty">Смета пуста. Настройте футболку на стенде и нажмите «В смету» — позиция появится здесь.</p>'; }
    else list.innerHTML = items.map((it) => {
      const t = itemTotal(it);
      return `<div class="s-item" data-id="${it.id}"><div class="s-thumb">${teeMini(it.look)}</div><div>
        <div class="s-name">${esc(it.title)}</div><div class="s-par">${esc(it.params)}</div>
        <div class="s-row"><div class="step"><button type="button" data-q="-1" aria-label="Меньше">−</button><input type="number" inputmode="numeric" min="${it.min || 1}" value="${it.qty}" aria-label="Количество, шт"><button type="button" data-q="1" aria-label="Больше">+</button></div>
        <span class="s-price">${t == null ? '<span class="tiny muted">посчитает мастер</span>' : rub(t)}</span></div>
        <button class="s-del" type="button" data-del>Убрать из сметы</button></div></div>`;
    }).join('');
    const sum = items.reduce((s, it) => s + (itemTotal(it) || 0), 0);
    const manual = items.filter((it) => itemTotal(it) == null).length;
    $('#smetaTotal').textContent = rub(sum);
    $('#smetaNote').textContent = manual ? `Ещё ${manual} ${plural(manual, 'позицию', 'позиции', 'позиций')} посчитает мастер — их нет в итоге.` : '';
    $('#smetaSend').disabled = !items.length; $('#smetaLink').disabled = !items.length;
    $$('.s-item', list).forEach((row) => {
      const id = row.dataset.id; const it = memItems.find((x) => x.id === id);
      const set = (q) => { q = Math.max(it.min || 1, Math.min(999, q | 0 || 1)); it.qty = q; save(memItems.slice()); renderSmeta(); updateChips(); };
      $$('[data-q]', row).forEach((b) => b.addEventListener('click', () => set(it.qty + +b.dataset.q)));
      $('input', row).addEventListener('change', (e) => set(+e.target.value));
      $('[data-del]', row).addEventListener('click', () => { save(memItems.filter((x) => x.id !== id)); renderSmeta(); updateChips(); toast('Позиция убрана из сметы'); });
    });
  }

  /* Ловушка фокуса для выезжающих панелей (Tab / Shift+Tab по кругу) */
  function trapTab(e, panel) {
    if (e.key !== 'Tab' || !panel) return;
    const f = Array.from(panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter((x) => x.offsetParent !== null || x === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', (e) => { const d = $('.drawer.on'); if (d) trapTab(e, d); const m = $('.mnav.on'); if (m) trapTab(e, m); });
  let smetaReturn;
  function openSmeta() {
    buildDrawer(); renderSmeta(); smetaReturn = document.activeElement;
    $('.scrim').classList.add('on'); const d = $('.drawer'); d.classList.add('on'); d.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; setTimeout(() => $('[data-close-smeta]').focus(), 50);
  }
  function closeSmeta() {
    const d = $('.drawer'); if (!d || !d.classList.contains('on')) return;
    d.classList.remove('on'); d.setAttribute('aria-hidden', 'true'); $('.scrim').classList.remove('on'); document.body.style.overflow = '';
    smetaReturn && smetaReturn.focus && smetaReturn.focus();
  }

  /* ======================== Форма заявки ======================== */
  function buildForm() {
    if ($('#orderDlg')) return;
    const dl = document.createElement('dialog'); dl.id = 'orderDlg'; dl.className = 'form-dlg'; dl.setAttribute('aria-labelledby', 'fTitle');
    dl.innerHTML = `<form class="form-in" id="orderForm" novalidate>
      <button class="x-btn" type="button" data-close-form aria-label="Закрыть форму"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <h2 id="fTitle">Заявка</h2>
      <div class="f-ctx" id="fCtx"></div>
      <div class="f-row"><label class="l" for="fName">Как к вам обращаться</label><input class="f-in" id="fName" name="name" autocomplete="name" required><div class="f-err" id="eName" hidden></div></div>
      <div class="f-row"><label class="l" for="fPhone">Телефон</label><input class="f-in" id="fPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required><div class="f-err" id="ePhone" hidden></div></div>
      <fieldset class="f-row"><legend>Как с вами связаться</legend><div class="choice">
        <label><input type="radio" name="via" value="Звонок" checked><span>Звонок</span></label>
        <label><input type="radio" name="via" value="Telegram"><span>Telegram</span></label>
        <label><input type="radio" name="via" value="MAX"><span>MAX</span></label>
        <label><input type="radio" name="via" value="ВКонтакте"><span>ВКонтакте</span></label></div></fieldset>
      <fieldset class="f-row"><legend>Макет</legend><div class="choice">
        <label><input type="radio" name="maket" value="Есть макет"><span>Есть макет</span></label>
        <label><input type="radio" name="maket" value="Фото или набросок" checked><span>Фото или набросок</span></label>
        <label><input type="radio" name="maket" value="Макета нет"><span>Макета нет</span></label></div>
        <p class="tiny muted" id="fMaketHint" style="margin:8px 0 0">Простой макет соберём бесплатно, если работы до 10 минут.</p></fieldset>
      <details class="f-more"><summary>Добавить комментарий или данные организации</summary>
        <div class="f-row"><label class="l" for="fComment">Комментарий <span class="opt">— по желанию</span></label><textarea class="f-in" id="fComment" name="comment" placeholder="Например: к субботе, размеры M и L"></textarea></div>
        <div class="f-row"><label class="choice"><input type="checkbox" id="fOrg"><span>Заказываю от организации</span></label></div>
        <div id="fOrgBox" hidden>
          <div class="f-row"><label class="l" for="fCompany">Название организации</label><input class="f-in" id="fCompany" autocomplete="organization"></div>
          <div class="f-row"><label class="l" for="fEmail">Почта для счёта</label><input class="f-in" id="fEmail" type="email" inputmode="email" autocomplete="email"></div>
          <p class="tiny muted">Организациям — счёт без НДС, договор, акт / УПД. Оплата возможна после выполнения.</p></div>
      </details>
      <button class="btn btn-main btn-block" type="submit">Отправить заявку</button>
      <p class="f-note">Нажимая «Отправить заявку», вы соглашаетесь на обработку данных для ответа на заявку.</p>
    </form>
    <div class="form-in done" id="orderDone" hidden></div>`;
    document.body.appendChild(dl);
    $('[data-close-form]', dl).addEventListener('click', () => dl.close());
    dl.addEventListener('click', (e) => { if (e.target === dl) dl.close(); });
    $('#fOrg').addEventListener('change', (e) => { $('#fOrgBox').hidden = !e.target.checked; });
    $$('input[name="maket"]', dl).forEach((r) => r.addEventListener('change', () => {
      const v = $('input[name="maket"]:checked', dl).value;
      $('#fMaketHint').textContent = v === 'Макета нет' ? 'Опишите идею в комментарии — простой макет соберём бесплатно.' : v === 'Есть макет' ? 'Файл пришлёте в мессенджер после ответа — или прикрепите на странице изделия.' : 'Простой макет соберём бесплатно, если работы до 10 минут.';
    }));
    $('#orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#fName'), phone = $('#fPhone'); let ok = true;
      const err = (inp, box, msg) => { $(box).hidden = !msg; $(box).textContent = msg || ''; inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) ok = false; };
      err(name, '#eName', name.value.trim() ? '' : 'Напишите имя — так мы будем знать, как к вам обращаться');
      const digits = phone.value.replace(/\D/g, '');
      err(phone, '#ePhone', !digits ? 'Укажите телефон — по нему мы свяжемся с вами' : digits.length < 10 ? 'В номере не хватает цифр. Проверьте его' : '');
      if (!ok) { (name.getAttribute('aria-invalid') === 'true' ? name : phone).focus(); return; }
      const via = $('input[name="via"]:checked', dl).value;
      const num = 'П-' + String(Math.floor(100000 + Math.random() * 899999));
      const done = $('#orderDone');
      done.innerHTML = `<button class="x-btn" type="button" data-close-form2 aria-label="Закрыть"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <svg class="check" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="none" stroke="#C4C7C0" stroke-width="2"/><path d="M17 29l7 7 15-16"/></svg>
        <h2 tabindex="-1" id="doneTitle">Заявка ${num} принята</h2>
        <p style="margin-top:12px"><span class="proto-flag">Это прототип: заявка никуда не отправлена</span></p>
        <p class="muted" style="margin-top:16px">Что дальше:</p>
        <ol><li>Мастер посмотрит заявку и свяжется с вами: ${esc(via === 'Звонок' ? 'позвонит' : 'напишет в ' + via)}.</li>
        <li>Согласуем макет до печати — без согласования не печатаем.</li>
        <li>Заберёте заказ в ТЦ «Экватор», 2 этаж. Работаем ежедневно, <span class="nb">10:00–20:00</span>.</li></ol>
        <p class="small muted">Если нужно быстрее — позвоните: <a class="nb" href="tel:+79521142350">+7 952 114-23-50</a>.</p>
        <button class="btn btn-main" type="button" data-close-form2>Готово</button>`;
      $('#orderForm').hidden = true; done.hidden = false;
      $$('[data-close-form2]', done).forEach((b) => b.addEventListener('click', () => dl.close()));
      $('#doneTitle').focus();
    });
  }
  function openForm(opts) {
    buildForm(); const dl = $('#orderDlg');
    $('#orderForm').hidden = false; $('#orderDone').hidden = true; $('#orderForm').reset(); $('#fOrgBox').hidden = true;
    $$('.f-err', dl).forEach((e) => (e.hidden = true)); $$('[aria-invalid]', dl).forEach((e) => e.setAttribute('aria-invalid', 'false'));
    let ctx = '', title = 'Заявка';
    if (opts.mode === 'smeta') {
      title = 'Отправить смету';
      const items = memItems; const sum = items.reduce((s, it) => s + (itemTotal(it) || 0), 0);
      ctx = items.length ? `<b>В заявке ${items.length} ${plural(items.length, 'позиция', 'позиции', 'позиций')}</b>, итого ${rub(sum)}.<br>` + items.map((it) => esc(it.title + ' — ' + it.params + ', ' + it.qty + ' шт')).join('<br>') : 'Смета пуста — опишите задачу в комментарии.';
    } else if (opts.mode === 'item') {
      title = 'Заказать'; ctx = opts.ctx;
    } else {
      title = opts.topic === 'help' ? 'Подскажем, что выбрать' : 'Заявка';
      ctx = opts.topic === 'help' ? 'Расскажите, для кого и к какой дате нужен подарок или мерч — предложим варианты с ценой.' : 'Опишите задачу или пришлите фото — посчитаем и предложим варианты.';
    }
    $('#fTitle').textContent = title; $('#fCtx').innerHTML = ctx;
    if (opts.comment) { $('#fComment').value = opts.comment; $('.f-more', dl).open = true; }
    dl.showModal(); setTimeout(() => $('#fName').focus(), 30);
  }

  /* ======================== Стенд футболки ======================== */
  const KF = { a6: 'А6', a5: 'А5', a4: 'А4', a3: 'А3' };
  const SIZE = { a6: '10×15 см', a5: '15×21 см', a4: '21×28 см', a3: '28×38 см' };
  function frameRect(place, fmt) {
    const pl = M.PLACES[place]; const [w, h] = M.FORMATS[fmt];
    if (pl.center) return { x: pl.x - w / 2, y: pl.y - h / 2, w, h, rot: pl.rot, cx: pl.x, cy: pl.y };
    return { x: pl.x - w / 2, y: pl.y, w, h, rot: 0 };
  }
  function rulerSVG(x0, x1, y, opt = {}) {
    // Линейка в мм модели: деление каждый 1 см, подпись каждые opt.every см
    const every = opt.every || 10, tick = opt.tick || 10; let s = `<g class="ruler" aria-hidden="true"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>`;
    for (let mm = 0, i = 0; x0 + mm <= x1 + 0.01; mm += 10, i++) {
      const big = i % every === 0, mid = i % 5 === 0;
      s += `<line x1="${x0 + mm}" y1="${y}" x2="${x0 + mm}" y2="${y + (big ? tick * 1.6 : mid ? tick : tick * 0.55)}"/>`;
      if (big) s += `<text x="${x0 + mm}" y="${y + tick * 1.6 + (opt.fsu || 20)}" text-anchor="middle">${i}</text>`;
    }
    return s + `<text x="${x1 + tick * 1.4}" y="${y + tick * 1.6 + (opt.fsu || 20)}" text-anchor="start">см</text></g>`;
  }
  // Полный стенд: state = {view, color, own, prints:[{place, fmt}], active, qty, file}
  function teeStandSVG(st, opts = {}) {
    const col = M.COLORS.find((c) => c.id === st.color) || M.COLORS[0];
    const view = st.view; const k = opts.k || 1;
    const copies = st.qty >= 50 || st.over ? 3 : st.qty >= 20 ? 2 : st.qty >= 5 ? 1 : 0;
    let s = `<ellipse class="contact" cx="0" cy="726" rx="360" ry="30"/>`;
    for (let i = copies; i >= 1; i--) s += `<g class="stack-copy" transform="translate(${24 * i},${-22 * i})"><path class="tee-body" d="${M.BODY}"/><path class="tee-edge" d="${M.BODY}"/></g>`;
    s += `<g class="turn">${view === 'front' ? M.teeFront() : M.teeBack()}`;
    // рамки принтов этой стороны
    st.prints.forEach((pr, i) => {
      const pl = M.PLACES[pr.place]; if (pl.side !== view) return;
      const r = frameRect(pr.place, pr.fmt); const act = i === st.active;
      const tr = r.rot ? ` transform="rotate(${r.rot} ${r.cx} ${r.cy})"` : '';
      if (act && !pl.center && opts.ghosts !== false) {
        Object.keys(M.FORMATS).filter((f) => f !== pr.fmt).forEach((f) => { const g = frameRect(pr.place, f); s += `<rect class="frame-ghost" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}"/>`; });
      }
      const img = i === 0 && st.file;
      s += `<g${tr}>`;
      if (img && st.file.img) s += `<image class="print-img" href="${st.file.url}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" preserveAspectRatio="xMidYMid meet"/>`;
      s += `<rect class="frame${img ? ' has-img' : ''}" data-i="${i}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`;
      if (img && !st.file.img) s += `<text class="tee-file-name" x="${r.x + r.w / 2}" y="${r.y + r.h / 2}" text-anchor="middle">${esc(st.file.name.length > 18 ? st.file.name.slice(0, 16) + '…' : st.file.name)}</text>`;
      else if (!img && (!act || opts.noLabel)) s += `<text class="frame-txt" x="${r.x + r.w / 2}" y="${r.y + r.h / 2}" text-anchor="middle" dominant-baseline="central">${KF[pr.fmt]}</text>`;
      s += `</g>`;
    });
    s += `</g>`;
    // выноска к активному принту
    const ap = st.prints[st.active];
    if (ap && !opts.noLabel && M.PLACES[ap.place].side === view) {
      const r = frameRect(ap.place, ap.fmt); const pl = M.PLACES[ap.place];
      let x1, y1, x2, y2, anchor = 'start';
      if (pl.center) { const right = pl.x > 0; x1 = pl.x + (right ? 30 : -30); y1 = pl.y + 40; x2 = right ? 410 : -410; y2 = 330; anchor = right ? 'start' : 'end'; }
      else { x1 = r.x + r.w; y1 = r.y; x2 = 300; y2 = Math.max(r.y + 40, 330); }
      const tx = x2 + (anchor === 'start' ? 10 : -10);
      s += `<g class="leader"><circle cx="${x1}" cy="${y1}" r="${5 / k}" fill="var(--meas,#1F3DB8)"/><path class="lead-line" d="M ${x1} ${y1} L ${x2} ${y2} L ${x2 + (anchor === 'start' ? 6 : -6)} ${y2}"/>
        <text class="meas-lbl" x="${tx}" y="${y2}" text-anchor="${anchor}" dominant-baseline="central" style="font-weight:700">${KF[ap.fmt]}</text>
        <text class="meas-lbl" x="${tx}" y="${y2}" dy="1.25em" text-anchor="${anchor}" dominant-baseline="central">${SIZE[ap.fmt]}</text></g>`;
    }
    if (copies && !opts.noLabel) s += `<text class="meas-lbl" x="${430}" y="${-4}" text-anchor="start">×${st.over ? '50+' : st.qty}</text>`;
    if (!opts.noRuler) s += rulerSVG(-300, 300, 772, { every: 10, tick: 12, fsu: 22 / k });
    return { inner: s, cls: (col.dark ? 'tee-dark' : '') + (st.own ? ' tee-own' : ''), style: M.colorVars(col) };
  }
  function teeMini(look) {
    if (!look) return '';
    const st = Object.assign({ active: -1, qty: 1 }, look);
    const front = st.prints.some((p) => M.PLACES[p.place].side === 'front') || !st.prints.length;
    st.view = front ? 'front' : 'back';
    const r = teeStandSVG(st, { noLabel: true, noRuler: true, ghosts: false });
    return `<svg class="stand-svg ${r.cls}" style="${r.style}" viewBox="-420 -30 840 780" aria-hidden="true" focusable="false">${r.inner}</svg>`;
  }
  function fitText(svg) {
    const vb = svg.viewBox.baseVal; const r = svg.getBoundingClientRect();
    const k = Math.min(r.width / vb.width, r.height / vb.height) || 0.6;
    svg.style.setProperty('--fs', (13.5 / k).toFixed(1) + 'px');
    svg.style.setProperty('--fs2', (15 / k).toFixed(1) + 'px');
    return k;
  }

  /* ======================== Главная: стенд первого экрана ======================== */
  function initHero() {
    const host = $('#heroStand'); if (!host) return;
    const svgBox = $('#heroSvg'); const tag = $('#heroTag'); const fmtBox = $('#heroFmt'); const ev = $('#heroEvidence');
    let obj = 'tee', fmt = 'a4';
    const VB = { tee: '-520 -50 1040 880', mug: '-70 -40 300 200', badge: '-12 -30 196 128', card: '-12 -30 214 128' };
    const vbW = (o) => +VB[o].split(' ')[2];
    function quoteOf(cat, prod, mut) { const p = P.findProduct(cat, prod); const s = P.defaultSelection(p); mut && mut(s); return { p, s, q: p.quote(s) }; }
    function draw() {
      let inner = '', cls = '', style = '', price = '', per = '', link = '#', linkTxt = '', photo = null;
      if (obj === 'tee') {
        const st = { view: 'front', color: 'white', own: false, prints: [{ place: 'front', fmt }], active: 0, qty: 1 };
        const r = teeStandSVG(st, { k: 0.6 }); inner = r.inner; cls = r.cls; style = r.style;
        const { q } = quoteOf('textile', 'tshirt-unisex', (s) => { s.options.print1 = fmt; });
        price = rub(q.total); per = `1 футболка с принтом ${KF[fmt]} ${SIZE[fmt]}`; link = PROTO_PAGE; linkTxt = 'Настроить футболку';
        photo = { src: 'portfolio-23.webp', t: 'Персонализированная футболка «Dmitry»' };
      } else if (obj === 'mug') {
        inner = `<ellipse class="contact" cx="59" cy="96" rx="70" ry="7"/><g style="--m-col:#F7F7F4">${M.MODELS.mug.svg()}</g>
          <path class="lead-line" d="M 0,-14 H 82 M 0,-19 V -9 M 82,-19 V -9"/><text class="meas-lbl" x="41" y="-24" text-anchor="middle">d 82 мм</text>
          <path class="lead-line" d="M 136,0 V 95 M 131,0 H 141 M 131,95 H 141"/><text class="meas-lbl" x="146" y="48" dominant-baseline="central">95 мм</text>` + rulerSVG(0, 120, 112, { every: 5, tick: 4, fsu: 9 });
        const { p, q } = quoteOf('mugs', 'mug'); price = rub(q.total); per = `${p.name}, ${P.defaultSelection(p).qty} шт с печатью`; linkTxt = 'Все кружки';
        photo = { src: 'portfolio-2.webp', t: 'Сувенирная кружка «Kaliningrad»' };
      } else if (obj === 'badge') {
        inner = `<g transform="translate(0,6)"><g style="--m-col:#F7F7F4" transform="translate(96,0)">${M.MODELS.badge56.svg()}</g><g style="--m-col:#F7F7F4" transform="translate(160,18)">${M.MODELS.badge38.svg()}</g>
          <g transform="translate(0,2)">${M.MODELS.bankcard.svg()}</g>
          <text class="meas-lbl" x="124" y="72" text-anchor="middle">56 мм</text><text class="meas-lbl" x="179" y="72" text-anchor="middle">38 мм</text>
          <text class="lbl" x="0" y="72">Банковская карта для сравнения</text></g>` + rulerSVG(0, 180, 92, { every: 5, tick: 4, fsu: 9 });
        const { p, s, q } = quoteOf('badges', 'badge-roll'); price = rub(q.total); per = `${s.qty} закатных значков, ${rub(q.unit)} за штуку`; linkTxt = 'Все значки';
      } else {
        inner = `<g transform="translate(0,8)"><g transform="translate(0,0)">${M.MODELS.bankcard.svg()}</g><g transform="translate(100,2)" style="--m-col:#FBFBF9">${M.MODELS.card.svg()}</g>
          <text class="meas-lbl" x="145" y="68" text-anchor="middle">90×50 мм</text><text class="lbl" x="0" y="74">Банковская карта</text></g>` + rulerSVG(0, 190, 96, { every: 5, tick: 4, fsu: 9 });
        const { s, q } = quoteOf('cards', 'business-cards'); price = rub(q.total); per = `${s.qty} визиток 90×50 мм, бумага 300 г`; linkTxt = 'Все варианты визиток';
      }
      svgBox.innerHTML = `<svg class="stand-svg ${cls}" style="${style}" viewBox="${VB[obj]}" role="img" aria-label="${obj === 'tee' ? 'Схема футболки с областью печати ' + KF[fmt] + ' ' + SIZE[fmt] : 'Схема изделия в масштабе'}">${inner}</svg>`;
      const svg = $('svg', svgBox); requestAnimationFrame(() => fitText(svg, vbW(obj)));
      $('.tag-price', tag).textContent = price; $('.tag-per', tag).textContent = per;
      const a = $('.tag-link', tag); a.textContent = linkTxt; a.href = link; a.toggleAttribute('data-proto-link', link === '#');
      fmtBox.hidden = obj !== 'tee';
      if (photo) { ev.hidden = false; ev.innerHTML = `<img src="${PHOTO + photo.src}" alt="${esc(photo.t)}" width="120" loading="lazy"><figcaption><b>Работа мастерской</b>${esc(photo.t)}</figcaption>`; }
      else ev.hidden = true;
      $$('.hero-cta').forEach((c) => { c.href = obj === 'tee' ? PROTO_PAGE + '#calc' : '#'; });
      if (!REDUCED) { $('.tag-price', tag).classList.remove('flash'); void tag.offsetWidth; $('.tag-price', tag).classList.add('flash'); }
    }
    $$('[data-obj]', host).forEach((b) => b.addEventListener('click', () => {
      obj = b.dataset.obj; $$('[data-obj]', host).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw();
    }));
    $$('[data-fmt]', fmtBox).forEach((b) => b.addEventListener('click', () => {
      fmt = b.dataset.fmt; $$('[data-fmt]', fmtBox).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw();
    }));
    $$('.hero-cta').forEach((c) => c.addEventListener('click', (e) => { if (c.getAttribute('href') === '#') { e.preventDefault(); toast('В прототипе собрана только страница футболок'); } }));
    $('.tag-link', tag).addEventListener('click', (e) => { if (e.currentTarget.hasAttribute('data-proto-link')) { e.preventDefault(); toast('В прототипе собрана только страница футболок'); } });
    window.addEventListener('resize', () => { const s = $('svg', svgBox); s && fitText(s, vbW(obj)); });
    draw();
  }

  /* ======================== Главная: раскладка в одном масштабе ======================== */
  function initLayout() {
    const row = $('#rkRow'); if (!row) return;
    const items = $$('.rk-item', row);
    items.forEach((a) => { const key = a.dataset.model; $('.rk-pic', a).innerHTML = modelSVG(key, { col: a.dataset.col, pad: 0 }); });
    $$('.loupe [data-model]').forEach((el) => { el.innerHTML = modelSVG(el.dataset.model, { col: el.dataset.col, pad: 0 }); });
    const MIN = 100, GAP = 20;
    function layout() {
      const narrow = window.innerWidth <= 760;
      const W = row.clientWidth - (narrow ? 0 : 0);
      let k = narrow ? 0.2 : 0.4;
      if (!narrow) {
        for (let it = 0; it < 30; it++) { // подбираем масштаб, чтобы ряд занял ширину
          const sum = items.reduce((s, a) => s + Math.max(+a.dataset.w * k, MIN), 0) + GAP * (items.length - 1);
          k *= Math.pow(W / sum, 0.6);
        }
      }
      const maxH = Math.max(...items.map((a) => +a.dataset.h)) * k;
      row.style.setProperty('--rk-h', maxH.toFixed(0) + 'px');
      items.forEach((a) => {
        const w = +a.dataset.w * k, h = +a.dataset.h * k;
        const pic = $('.rk-pic', a); pic.style.width = w.toFixed(1) + 'px'; pic.style.height = h.toFixed(1) + 'px';
        a.style.width = Math.max(w, MIN).toFixed(0) + 'px';
      });
      // линейка под рядом: деление каждые 10 см
      const ruler = $('#rkRuler'); const tenCm = 100 * k; const n = Math.floor(row.scrollWidth / tenCm);
      let s = ''; for (let i = 0; i <= n; i++) { const x = i * tenCm; s += `<line x1="${x}" y1="0" x2="${x}" y2="${i % 5 === 0 ? 10 : 6}"/>` + (i % 5 === 0 ? `<text x="${x}" y="24" text-anchor="${i ? 'middle' : 'start'}">${i * 10}${i === Math.floor(n / 5) * 5 ? ' см' : ''}</text>` : ''); }
      ruler.setAttribute('width', row.scrollWidth); ruler.innerHTML = `<line x1="0" y1="0" x2="${n * tenCm}" y2="0"/>` + s;
      $('#rkScale').textContent = 'Линейка в сантиметрах — одна для всех вещей.';
      const lx = $('#loupeX'); const b56 = $('.loupe-item[data-model="badge56"]'); if (lx && b56) { const z = b56.getBoundingClientRect().width / 56; const n = Math.round(z / k); lx.textContent = 'Увеличено в ' + n + ' ' + plural(n, 'раз', 'раза', 'раз'); }
    }
    layout(); window.addEventListener('resize', layout);
    $$('[data-group]').forEach((b) => b.addEventListener('click', () => {
      const g = b.dataset.group; $$('[data-group]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.rk-item, .loupe-item').forEach((a) => a.classList.toggle('dim', g !== 'all' && a.dataset.g !== g));
      $('.loupe').classList.toggle('dim', g !== 'all' && g !== 'gifts');
    }));
  }

  /* ======================== Работы (лента) ======================== */
  function initWorks() {
    $$('[data-works]').forEach((box) => {
      const tag = box.dataset.works; const list = (window.MS_PORTFOLIO || []).filter((w) => !w.src.includes('portfolio-14') && (!tag || w.tags.includes(tag))).slice(0, +box.dataset.limit || 12);
      box.innerHTML = list.map((w) => `<figure class="work"><img src="${PHOTO + w.src.split('/').pop()}" alt="${esc(w.title)}, ${esc(w.tech)}" loading="lazy" height="180"><figcaption><span>Работа мастерской</span>${esc(w.title)}</figcaption></figure>`).join('');
    });
  }

  /* ======================== Страница футболок: калькулятор ======================== */
  function initCalc() {
    const root = $('#calc'); if (!root) return;
    const prod = P.findProduct('textile', 'tshirt-unisex');
    const MAX = prod.qty.max; // 50
    const st = { view: 'front', color: 'white', own: false, prints: [{ place: 'front', fmt: 'a4' }], active: 0, qty: 1, over: false, file: null };
    const DEF_PLACES = ['front', 'back', 'sleeve-l', 'sleeve-r'];
    const svgBox = $('#teeSvg'); const VBW = 1040;
    let lastTotal = null;

    function selection() {
      const s = P.defaultSelection(prod);
      s.options.blank = st.own ? 'own' : 'ours';
      const c = M.COLORS.find((x) => x.id === st.color);
      s.options.color = c.stock ? c.id : 'other';
      ['print1', 'print2', 'print3', 'print4'].forEach((k, i) => { s.options[k] = st.prints[i] ? st.prints[i].fmt : 'none'; });
      s.qty = st.over ? MAX : st.qty; return s;
    }
    function colorObj() { return M.COLORS.find((x) => x.id === st.color); }
    function needsMin() { return !st.own && !colorObj().stock ? 10 : 1; }
    function look() { return { color: st.color, own: st.own, prints: st.prints.map((p) => ({ ...p })) }; }
    function params() {
      const parts = [];
      if (st.own) parts.push('своя футболка'); else parts.push(colorObj().name.toLowerCase());
      st.prints.forEach((p) => parts.push(`${KF[p.fmt]} — ${M.PLACES[p.place].label.toLowerCase()}`));
      if (st.file) parts.push('файл: ' + st.file.name);
      return parts.join(', ');
    }

    function drawStand(turn) {
      const r = teeStandSVG(st, { k: 0.6 });
      const paint = () => {
        svgBox.innerHTML = `<svg class="stand-svg ${r.cls}" style="${r.style}" viewBox="-520 -50 1040 880" role="img" aria-label="Схема футболки, ${st.view === 'front' ? 'вид спереди' : 'вид сзади'}: ${esc(params())}">${r.inner}</svg>`;
        fitText($('svg', svgBox), VBW);
      };
      if (turn && !REDUCED) {
        const g = $('.turn', svgBox); if (g) { g.classList.add('squeeze'); setTimeout(() => { paint(); const g2 = $('.turn', svgBox); g2.classList.add('squeeze'); requestAnimationFrame(() => requestAnimationFrame(() => g2.classList.remove('squeeze'))); }, 120); return; }
      }
      paint();
      // мини-стенд в липкой полосе
      const mini = $('#stickyMini'); if (mini) mini.innerHTML = teeMini(look());
    }

    function renderPrints() {
      const box = $('#prints');
      box.innerHTML = st.prints.map((p, i) => `
        <div class="print-row${i === st.active ? ' act' : ''}" data-i="${i}">
          <div class="print-head"><span class="print-n">Принт ${i + 1}${i ? ' <small>' + (i === 1 ? '−30 %' : '−50 %') + '</small>' : ''}</span>
            <label class="vh" for="pl${i}">Место принта ${i + 1}</label>
            <select class="place-sel" id="pl${i}">${Object.entries(M.PLACES).map(([k, v]) => `<option value="${k}"${k === p.place ? ' selected' : ''}>${v.label}</option>`).join('')}</select>
            ${i ? `<button class="s-del" type="button" data-rm="${i}" aria-label="Убрать принт ${i + 1}">Убрать</button>` : ''}</div>
          <div class="seg fmt-seg" role="group" aria-label="Формат принта ${i + 1}">${Object.keys(M.FORMATS).map((f) => {
            const [w, h] = M.FORMATS[f]; const sc = 16 / 380;
            return `<button class="pill fmt" type="button" data-fmt="${f}" aria-pressed="${p.fmt === f}"><svg class="fmt-mini" viewBox="0 0 18 18" aria-hidden="true"><rect x="${(18 - w * sc) / 2}" y="${(18 - h * sc) / 2}" width="${w * sc}" height="${h * sc}" rx=".6"/></svg>${KF[f]} <small>${SIZE[f]}</small></button>`; }).join('')}</div>
          ${p.place.startsWith('sleeve') && p.fmt !== 'a6' ? '<p class="tiny muted" style="margin:8px 0 0">Принт крупнее рукава — точное место согласуем на макете.</p>' : ''}
        </div>`).join('');
      $('#addPrint').hidden = st.prints.length >= 4;
      $$('.print-row', box).forEach((row) => {
        const i = +row.dataset.i;
        $$('[data-fmt]', row).forEach((b) => b.addEventListener('click', () => { st.prints[i].fmt = b.dataset.fmt; st.active = i; ensureView(i); renderPrints(); update(); const nb = $(`.print-row[data-i="${i}"] [data-fmt="${b.dataset.fmt}"]`); nb && nb.focus(); }));
        $('.place-sel', row).addEventListener('change', (e) => { st.prints[i].place = e.target.value; st.active = i; ensureView(i); renderPrints(); update(); });
        row.addEventListener('focusin', () => { if (st.active !== i) { st.active = i; $$('.print-row', box).forEach((r) => r.classList.toggle('act', +r.dataset.i === i)); ensureView(i, true); } });
        const rm = $('[data-rm]', row); rm && rm.addEventListener('click', () => { st.prints.splice(i, 1); st.active = Math.min(st.active, st.prints.length - 1); renderPrints(); update(); $('#addPrint').focus(); });
      });
    }
    function ensureView(i, redraw) {
      const side = M.PLACES[st.prints[i].place].side;
      if (side !== st.view) { st.view = side; syncViewBtns(); if (redraw) drawStand(true); return true; }
      if (redraw) drawStand(false); return false;
    }
    function syncViewBtns() { $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === st.view))); }

    function renderLadder(sel) {
      const lad = prod.ladder ? prod.ladder(sel) : [];
      const base = lad.length ? lad[0].price : 0;
      const box = $('#ladder');
      box.innerHTML = lad.map((t, i) => {
        const next = lad[i + 1] ? lad[i + 1].from - 1 : MAX; const on = !st.over && st.qty >= t.from && st.qty <= next;
        const off = base ? Math.round((1 - t.price / base) * 100) : 0;
        return `<button class="tier${on ? ' on' : ''}" type="button" data-tier="${t.from}" aria-pressed="${on}"><span class="t-q">${t.from === 1 ? '1–' + next : t.from + '–' + next} шт</span><span class="t-p">${rub(t.price)}</span>${off > 0 ? `<span class="t-off">−${off} %</span>` : ''}</button>`;
      }).join('') + `<button class="tier${st.over ? ' on' : ''}" type="button" data-tier="over" aria-pressed="${st.over}"><span class="t-q">больше ${MAX}</span><span class="t-p">посчитаем</span></button>`;
      $$('[data-tier]', box).forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.tier === 'over') { st.over = true; } else { st.over = false; st.qty = Math.max(+b.dataset.tier, needsMin()); }
        update();
      }));
    }

    function update() {
      // минимум для цветов «под заказ»
      if (st.qty < needsMin()) st.qty = needsMin();
      const sel = selection(); const q = prod.quote(sel);
      drawStand(false);
      $('#qty').value = st.over ? '' : st.qty; $('#qty').placeholder = st.over ? `больше ${MAX}` : '';
      $('#qty').min = needsMin();
      renderLadder(sel);
      const tot = $('#tTotal'), per = $('#tPer');
      const sticky = $('#stickyTotal');
      if (st.over) {
        tot.textContent = 'Посчитаем отдельно';
        tot.classList.add('tag-over');
        per.textContent = `Больше ${MAX} шт — цену рассчитаем индивидуально. Укажите количество в заявке.`;
        $('#bOrder').textContent = 'Запросить расчёт';
        sticky.innerHTML = `<b>больше ${MAX} шт</b><span>посчитаем отдельно</span>`;
        $('#tNext').hidden = false; $('#tNext').textContent = (q.notes && q.notes[0]) || 'Больше 50 шт считаем индивидуально — пришлите заявку';
      } else {
        tot.classList.remove('tag-over');
        tot.textContent = rub(q.total);
        per.textContent = `${st.qty} шт × ${rub(q.unit)} за штуку`;
        $('#bOrder').textContent = 'Заказать';
        sticky.innerHTML = `<b>${rub(q.total)}</b><span>${st.qty} шт × ${rub(q.unit)}</span>`;
        if (q.next) { $('#tNext').hidden = false; const d = q.next.qty - st.qty; $('#tNext').innerHTML = `Ещё ${d} шт — и цена за штуку будет <b>${rub(q.next.unit)}</b>`; }
        else $('#tNext').hidden = true;
        if (lastTotal !== null && lastTotal !== q.total && !REDUCED) { tot.classList.remove('flash'); void tot.offsetWidth; tot.classList.add('flash'); }
        lastTotal = q.total;
      }
      $('#tBreak').innerHTML = q.breakdown.map((b) => `<li><span>${esc(b.label)}</span><b>${rub(b.amount)}</b></li>`).join('') + (st.over ? '' : `<li class="sum"><span>За штуку</span><b>${rub(q.unit)}</b></li>`);
      const notes = (q.notes || []).filter((n) => !/больше 50/i.test(n));
      $('#tNotes').innerHTML = notes.map((n) => `<p>${esc(n)}</p>`).join('');
      $('#colorNote').textContent = st.own ? '' : colorObj().stock ? `${colorObj().name} — есть в наличии.` : `${colorObj().name} — шьём под заказ от 10 шт, поэтому поставили 10.`;
      $('#colorBox').hidden = st.own;
      $$('[data-blank]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.blank === 'own') === st.own)));
      $$('[data-color]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.color === st.color)));
      $('#evidence').innerHTML = evidence();
    }
    function evidence() {
      let src = 'portfolio-23.webp', t = 'Персонализированная футболка «Dmitry»';
      const back = st.prints.some((p) => M.PLACES[p.place].side === 'back');
      if (st.qty >= 20 || st.over) { src = 'portfolio-20.webp'; t = 'Корпоративная партия футболок'; }
      else if (st.color === 'black' && back) { src = 'dtf-bestdad.webp'; t = 'Футболка «Best Dad» с семейным фотоколлажем'; }
      else if (st.color === 'black') { src = 'portfolio-28.webp'; t = 'Футболка с портретом Иммануила Канта'; }
      else if (st.qty === 2) { src = 'wedding-tshirts.webp'; t = 'Парные свадебные футболки'; }
      return `<img src="${PHOTO + src}" alt="${esc(t)}" width="96" loading="lazy"><figcaption><b>Работа мастерской</b>${esc(t)}</figcaption>`;
    }

    // события пульта
    $$('[data-blank]').forEach((b) => b.addEventListener('click', () => { st.own = b.dataset.blank === 'own'; update(); }));
    $$('[data-color]').forEach((b) => b.addEventListener('click', () => {
      const prev = needsMin(); st.color = b.dataset.color; const now = needsMin();
      if (now > prev && st.qty < now) toast(`${colorObj().name} — под заказ от 10 шт. Поставили 10 шт.`);
      update();
    }));
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => { if (st.view === b.dataset.view) return; st.view = b.dataset.view; syncViewBtns(); drawStand(true); }));
    $('#addPrint').addEventListener('click', () => {
      if (st.prints.length >= 4) return;
      const used = st.prints.map((p) => p.place); const place = DEF_PLACES.find((p) => !used.includes(p)) || 'back';
      st.prints.push({ place, fmt: st.prints.length === 1 ? 'a4' : 'a6' }); st.active = st.prints.length - 1;
      renderPrints(); ensureView(st.active); update();
      toast(`Принт ${st.prints.length}: ${M.PLACES[place].label.toLowerCase()} — ${st.prints.length === 2 ? 'со скидкой 30 %' : 'со скидкой 50 %'}`);
    });
    const qty = $('#qty');
    const setQty = (v) => { st.over = false; v = Math.round(+v || 0); if (v > MAX) { st.over = true; } else st.qty = Math.max(needsMin(), v || 1); update(); };
    $$('[data-step]').forEach((b) => b.addEventListener('click', () => { if (st.over && +b.dataset.step < 0) { st.over = false; st.qty = MAX; update(); return; } setQty((st.over ? MAX : st.qty) + +b.dataset.step); }));
    qty.addEventListener('change', () => setQty(qty.value));
    $('#file').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (st.file && st.file.url) URL.revokeObjectURL(st.file.url);
      const img = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(f.type);
      st.file = { name: f.name, img, url: img ? URL.createObjectURL(f) : '' };
      st.active = 0; ensureView(0); update();
      $('#fileName').innerHTML = `${esc(f.name)} <button class="s-del" type="button" id="fileRm">Убрать файл</button>`;
      $('#fileRm').addEventListener('click', () => { if (st.file.url) URL.revokeObjectURL(st.file.url); st.file = null; e.target.value = ''; $('#fileName').textContent = ''; update(); });
      toast(img ? 'Файл стоит в рамке принта. Он не покидает ваш браузер' : 'Этот формат не показываем на схеме, но приложим к заявке');
    });
    $('#bAdd').addEventListener('click', (e) => {
      const item = { cat: 'textile', prod: 'tshirt-unisex', sel: selection(), qty: st.over ? MAX + 1 : st.qty, max: MAX, min: needsMin(),
        title: st.own ? 'Печать на своей футболке' : 'Футболка унисекс с печатью', params: params(), look: look() };
      addToSmeta(item, $('#teeSvg'));
    });
    $('#bOrder').addEventListener('click', () => {
      const q = prod.quote(selection());
      const ctx = st.over ? `<b>Футболки, больше ${MAX} шт</b> — ${esc(params())}. Цену посчитаем отдельно.`
        : `<b>Футболка унисекс, ${st.qty} шт — ${rub(q.total)}</b><br>${esc(params())}`;
      openForm({ mode: 'item', ctx, comment: st.over ? 'Количество: ' : '' });
    });
    $('#stickyOrder').addEventListener('click', () => $('#bOrder').click());
    $('#stickyMini').addEventListener('click', () => $('#teeSvg').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }));

    // липкая полоса итога на телефоне: показываем, когда ценник ушёл с экрана
    const bar = $('#stickyBar');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((ents) => { const vis = ents.some((e) => e.isIntersecting); bar.classList.toggle('on', !vis); }, { threshold: 0 });
      io.observe($('#tag')); io.observe($('#teeSvg'));
    }

    // готовые варианты
    $$('[data-ready]').forEach((card) => {
      const cfg = JSON.parse(card.dataset.ready);
      const s = P.defaultSelection(prod); s.qty = cfg.qty; cfg.prints.forEach((p, i) => { s.options['print' + (i + 1)] = p.fmt; });
      s.options.color = cfg.color;
      const q = prod.quote(s);
      $('.r-price', card).textContent = rub(q.total);
      $('.r-per', card).textContent = cfg.qty > 1 ? `${cfg.qty} шт × ${rub(q.unit)}` : 'за 1 шт';
      const views = cfg.views || ['front'];
      $('.r-pic', card).innerHTML = views.map((v) => {
        const r = teeStandSVG({ view: v, color: cfg.color, own: false, prints: cfg.prints, active: -1, qty: cfg.qty > 2 ? cfg.qty : 1 }, { noLabel: true, noRuler: true, ghosts: false });
        return `<svg class="stand-svg ${r.cls}" style="${r.style}" viewBox="-430 -60 860 800" role="img" aria-label="Схема: ${v === 'front' ? 'перед' : 'спина'}">${r.inner}</svg>`;
      }).join('');
      $('[data-ready-add]', card).addEventListener('click', (e) => {
        addToSmeta({ cat: 'textile', prod: 'tshirt-unisex', sel: s, qty: cfg.qty, max: MAX, min: 1, title: cfg.title, params: cfg.params, look: { color: cfg.color, own: false, prints: cfg.prints } }, $('.r-pic', card));
      });
      $('[data-ready-set]', card).addEventListener('click', () => {
        st.color = cfg.color; st.own = false; st.prints = cfg.prints.map((p) => ({ ...p })); st.qty = cfg.qty; st.over = false; st.active = 0;
        st.view = M.PLACES[st.prints[0].place].side; syncViewBtns(); renderPrints(); update();
        $('#calc').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        toast('Вариант перенесён на стенд — меняйте как нужно');
      });
    });

    window.addEventListener('resize', () => { const s = $('svg', svgBox); s && fitText(s, VBW); });
    renderPrints(); syncViewBtns(); update();
    // для проверки скриптом
    window.__calc = { st, selection, quote: () => prod.quote(selection()), setQty, addPrint: () => $('#addPrint').click() };
  }

  /* ======================== Старт ======================== */
  document.addEventListener('DOMContentLoaded', () => {
    hydrateStatic(); initHeader(); updateChips(); initHero(); initLayout(); initWorks(); initCalc();
    if (location.hash === '#smeta') openSmeta();
    window.__smeta = { items: () => memItems, open: openSmeta };
  });
})();
