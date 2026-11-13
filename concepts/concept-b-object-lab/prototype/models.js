/* Прототип B «Стенд примерки». Векторные модели изделий в миллиметрах (1 единица = 1 мм изделия).
   Схемы: размеры и места печати — по фактам владельца; вид ткани условный. */
(function () {
  'use strict';

  /* ---------- Футболка унисекс (плоская раскладка, ≈ размер M: ширина 52 см, длина 72 см) ---------- */
  // Правая половина силуэта (для зрителя), левая — зеркально.
  const TEE = {
    hps: [92, 2],              // точка у ворота
    sp: [233, 40],             // плечевая точка
    so: [394, 170],            // край рукава сверху
    si: [304, 294],            // край рукава снизу
    ua: [257, 252],            // подмышка
    hem: [262, 716],           // низ бокового шва
  };
  const m = (p) => [-p[0], p[1]];
  const P = (p) => p[0] + ',' + p[1];

  function teeOutline() {
    const t = TEE;
    return [
      'M', P(m(t.hps)),
      'C -60,10 -30,13 0,13 C 30,13 60,10', P(t.hps),
      'Q 166,13', P(t.sp),
      'Q 322,88', P(t.so),
      'Q 352,236', P(t.si),
      'Q 276,268', P(t.ua),
      'C 252,420 259,600', P(t.hem),
      'Q 0,730', P(m(t.hem)),
      'C -259,600 -252,420', P(m(t.ua)),
      'Q -276,268', P(m(t.si)),
      'Q -352,236', P(m(t.so)),
      'Q -322,88', P(m(t.sp)),
      'Q -166,13', P(m(t.hps)), 'Z'
    ].join(' ');
  }
  const BODY = teeOutline();
  // Правый и левый рукав (для затенения низа рукава)
  const SLEEVE_R = 'M 233,40 Q 322,88 394,170 Q 352,236 304,294 Q 276,268 257,252 Q 224,150 233,40 Z';
  const SLEEVE_L = 'M -233,40 Q -322,88 -394,170 Q -352,236 -304,294 Q -276,268 -257,252 Q -224,150 -233,40 Z';

  // Общие определения (клип по силуэту, мягкое размытие для складок и света) — один раз на страницу
  function ensureDefs() {
    if (document.getElementById('ms-defs')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="ms-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <clipPath id="ms-teeclip"><path d="${BODY}"/></clipPath>
      <filter id="ms-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11"/></filter>
      <filter id="ms-softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="34"/></filter>
      <radialGradient id="contactShadow"><stop offset="0" stop-color="#1C1F23" stop-opacity=".30"/><stop offset=".6" stop-color="#1C1F23" stop-opacity=".10"/><stop offset="1" stop-color="#1C1F23" stop-opacity="0"/></radialGradient>
      <linearGradient id="ms-side" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".16" stop-color="#000" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    </defs></svg>`;
    document.body.appendChild(d.firstElementChild);
  }

  const SHADE_COMMON = `
      <rect x="-262" y="240" width="524" height="490" fill="url(#ms-side)" class="tee-shade-g"/>
      <path class="tee-shade" d="M 304,294 Q 276,268 257,252 Q 246,215 238,190 Q 300,232 352,236 Z"/>
      <path class="tee-shade" d="M -304,294 Q -276,268 -257,252 Q -246,215 -238,190 Q -300,232 -352,236 Z"/>
      <path class="tee-fold" d="M 244,272 C 204,298 166,316 128,328"/>
      <path class="tee-fold" d="M -244,272 C -204,298 -166,316 -128,328"/>

`;

  function teeFront() {
    return `
      <path class="tee-body" d="${BODY}"/>
      <g clip-path="url(#ms-teeclip)">
        <g filter="url(#ms-soft)">${SHADE_COMMON}
        </g>
        <g filter="url(#ms-softer)">
          <ellipse class="tee-light" cx="-110" cy="250" rx="120" ry="190"/>
          <ellipse class="tee-light" cx="-300" cy="150" rx="70" ry="44" opacity=".7"/>
          <ellipse class="tee-light" cx="150" cy="520" rx="70" ry="120" opacity=".35"/>
        </g>
      </g>
      <!-- воротник: задний край, изнанка, передняя бейка -->
      <path class="tee-rib" d="M -92,2 C -60,10 -30,13 0,13 C 30,13 60,10 92,2 L 80,9 C 56,22 30,27 0,27 C -30,27 -56,22 -80,9 Z"/>
      <path class="tee-inside" d="M -80,9 C -56,22 -30,27 0,27 C 30,27 56,22 80,9 C 77,50 46,80 0,82 C -46,80 -77,50 -80,9 Z"/>
      <path class="tee-shade" d="M -80,9 C -56,22 -30,27 0,27 C 30,27 56,22 80,9 C 77,30 60,40 0,42 C -60,40 -77,30 -80,9 Z" style="opacity:calc(var(--shade) * 1.6)"/>
      <path class="tee-rib" d="M -92,2 C -90,62 -50,99 0,99 C 50,99 90,62 92,2 L 80,9 C 77,50 46,80 0,82 C -46,80 -77,50 -80,9 Z"/>
      <path class="tee-seam" d="M -86,10 C -83,60 -46,92 0,92 C 46,92 83,60 86,10"/>
      <path class="tee-seam" d="M 92,2 Q 166,13 233,40"/><path class="tee-seam" d="M -92,2 Q -166,13 -233,40"/>
      <path class="tee-seam" d="M 233,40 Q 224,150 257,252"/><path class="tee-seam" d="M -233,40 Q -224,150 -257,252"/>
      <path class="tee-seam" d="M 381,186 Q 343,240 297,281"/><path class="tee-seam" d="M -381,186 Q -343,240 -297,281"/>
      <path class="tee-seam" d="M 261,696 Q 0,710 -261,696"/>
      <path class="tee-edge" d="${BODY}"/>
      <path class="tee-edge" d="M -92,2 C -90,62 -50,99 0,99 C 50,99 90,62 92,2" opacity=".5"/>`;
  }

  function teeBack() {
    return `
      <path class="tee-body" d="${BODY}"/>
      <g clip-path="url(#ms-teeclip)">
        <g filter="url(#ms-soft)">${SHADE_COMMON}
        </g>
        <g filter="url(#ms-softer)">
          <ellipse class="tee-light" cx="110" cy="250" rx="120" ry="190"/>
          <ellipse class="tee-light" cx="300" cy="150" rx="70" ry="44" opacity=".7"/>
        </g>
      </g>
      <path class="tee-rib" d="M -92,2 C -60,10 -30,13 0,13 C 30,13 60,10 92,2 L 90,18 C 60,26 30,29 0,29 C -30,29 -60,26 -90,18 Z"/>
      <path class="tee-seam" d="M -90,18 C -60,26 -30,29 0,29 C 30,29 60,26 90,18"/>
      <path class="tee-seam" d="M 92,2 Q 166,13 233,40"/><path class="tee-seam" d="M -92,2 Q -166,13 -233,40"/>
      <path class="tee-seam" d="M 233,40 Q 224,150 257,252"/><path class="tee-seam" d="M -233,40 Q -224,150 -257,252"/>
      <path class="tee-seam" d="M 381,186 Q 343,240 297,281"/><path class="tee-seam" d="M -381,186 Q -343,240 -297,281"/>
      <path class="tee-seam" d="M 261,696 Q 0,710 -261,696"/>
      <path class="tee-edge" d="${BODY}"/>`;
  }

  // Места печати (мм): x — центр, y — верх рамки; side — сторона; rot — поворот (рукав)
  const PLACES = {
    'front':      { label: 'Грудь, по центру', side: 'front', x: 0, y: 172 },
    'front-left': { label: 'Грудь, слева', side: 'front', x: 128, y: 150, anchor: 'top' },
    'back':       { label: 'Спина, по центру', side: 'back', x: 0, y: 105 },
    'back-top':   { label: 'Спина, под воротом', side: 'back', x: 0, y: 48 },
    'sleeve-l':   { label: 'Левый рукав', side: 'front', x: 312, y: 168, rot: -52, center: true },
    'sleeve-r':   { label: 'Правый рукав', side: 'front', x: -312, y: 168, rot: 52, center: true },
  };
  const FORMATS = { a6: [100, 150], a5: [150, 210], a4: [210, 280], a3: [280, 380] };

  // Цвета футболок (владелец, 02.11.2026): в наличии белый и чёрный, остальные — от 10 шт
  const COLORS = [
    { id: 'white', name: 'Белый', hex: '#F7F7F4', stock: true },
    { id: 'black', name: 'Чёрный', hex: '#232427', stock: true, dark: true },
    { id: 'grey', name: 'Серый', hex: '#A3A6A8' },
    { id: 'yellow', name: 'Жёлтый', hex: '#EBC64C' },
    { id: 'orange', name: 'Оранжевый', hex: '#E27434' },
    { id: 'red', name: 'Красный', hex: '#B9282F', dark: true },
    { id: 'pink', name: 'Розовый', hex: '#EBA3BC' },
    { id: 'lilac', name: 'Сиреневый', hex: '#AB9BCF' },
    { id: 'blue', name: 'Синий', hex: '#27467F', dark: true },
    { id: 'green', name: 'Зелёный', hex: '#2E6A47', dark: true },
    { id: 'brown', name: 'Коричневый', hex: '#5E4335', dark: true },
  ];

  function shadeHex(hex, f) { // f<0 — темнее
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = f < 0 ? 0 : 255, p = Math.abs(f);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function colorVars(c) {
    return `--garment:${c.hex};--garment-in:${shadeHex(c.hex, c.dark ? -0.35 : -0.16)};--garment-2:${shadeHex(c.hex, c.dark ? 0.1 : -0.07)};` +
      `--shade:${c.dark ? 0.22 : 0.085};--light:${c.dark ? 0.07 : 0.32};--meas:${c.dark ? '#9DB0FF' : '#1F3DB8'}`;
  }

  /* ---------- Простые модели для «Раскладки» (в мм, стоят на горизонте y = h) ---------- */
  const fill = 'class="m-fill"', edge = 'class="m-edge"', sh = 'class="m-sh"';
  const MODELS = {
    tee: { w: 790, h: 732, ox: 395, oy: 0, svg: () => `<g transform="translate(395,6)"><path ${fill} d="${BODY}"/><path ${sh} d="M -80,9 C -56,22 -30,27 0,27 C 30,27 56,22 80,9 C 77,50 46,80 0,82 C -46,80 -77,50 -80,9 Z"/><path ${edge} d="${BODY}"/><path ${edge} d="M -92,2 C -90,62 -50,99 0,99 C 50,99 90,62 92,2"/></g>` },
    hoodie: { w: 760, h: 800, svg: () => `<g transform="translate(380,0)">
        <path ${fill} d="M -120,120 C -150,40 -110,0 0,0 C 110,0 150,40 120,120 L 250,170 C 300,200 330,260 352,420 L 372,700 L 300,712 L 270,440 L 268,760 Q 0,780 -268,760 L -270,440 L -300,712 L -372,700 L -352,420 C -330,260 -300,200 -250,170 Z"/>
        <path ${sh} d="M -92,124 C -110,50 -80,22 0,22 C 80,22 110,50 92,124 C 60,150 -60,150 -92,124 Z"/>
        <path ${sh} d="M -150,520 L 150,520 L 170,660 L -170,660 Z" opacity=".5"/>
        <path ${edge} d="M -120,120 C -150,40 -110,0 0,0 C 110,0 150,40 120,120 L 250,170 C 300,200 330,260 352,420 L 372,700 L 300,712 L 270,440 L 268,760 Q 0,780 -268,760 L -270,440 L -300,712 L -372,700 L -352,420 C -330,260 -300,200 -250,170 Z"/>
        <path ${edge} d="M -150,520 L 150,520 L 170,660 M -150,520 L -170,660"/><path ${edge} d="M -20,140 L -26,240 M 20,140 L 26,240"/></g>` },
    shopper: { w: 380, h: 770, svg: () => `<g><path ${edge} d="M 92,352 C 92,40 160,0 190,0 C 220,0 288,40 288,352" style="stroke-width:7;stroke:var(--m-col)"/>
        <path ${edge} d="M 92,352 C 92,40 160,0 190,0 C 220,0 288,40 288,352"/>
        <rect ${fill} x="0" y="350" width="380" height="420"/><rect ${sh} x="0" y="350" width="380" height="22"/><rect ${edge} x="0" y="350" width="380" height="420"/></g>` },
    cap: { w: 240, h: 160, svg: () => `<g><path ${fill} d="M 20,120 C 20,40 70,0 120,0 C 170,0 220,40 220,120 Z"/><path ${sh} d="M 120,0 C 100,30 96,80 98,120 L 120,120 Z" opacity=".5"/>
        <path ${fill} d="M 6,122 Q 120,108 234,122 Q 236,150 120,160 Q 4,150 6,122 Z"/><path ${sh} d="M 6,122 Q 120,108 234,122 Q 236,150 120,160 Q 4,150 6,122 Z" opacity=".6"/>
        <path ${edge} d="M 20,120 C 20,40 70,0 120,0 C 170,0 220,40 220,120"/><path ${edge} d="M 6,122 Q 120,108 234,122 Q 236,150 120,160 Q 4,150 6,122 Z"/><circle ${edge} cx="120" cy="3" r="6"/></g>` },
    mug: { w: 118, h: 95, svg: () => `<g><path ${edge} d="M 82,22 C 112,18 118,40 116,52 C 113,70 98,76 82,74" style="stroke-width:9;stroke:var(--m-col)"/><path ${edge} d="M 82,22 C 112,18 118,40 116,52 C 113,70 98,76 82,74"/>
        <rect ${fill} x="0" y="0" width="82" height="95" rx="6"/><rect class="m-print" x="12" y="18" width="58" height="52" rx="3"/><rect ${sh} x="62" y="0" width="20" height="95" rx="6" opacity=".5"/><rect ${edge} x="0" y="0" width="82" height="95" rx="6"/></g>` },
    puzzle: { w: 210, h: 297, svg: () => `<g><rect ${fill} width="210" height="297"/><rect class="m-print" x="12" y="12" width="186" height="273"/>
        <path class="m-seam" d="M 70,12 V 285 M 140,12 V 285 M 12,80 H 198 M 12,148 H 198 M 12,216 H 198"/><rect ${edge} width="210" height="297"/></g>` },
    sheet: { w: 280, h: 380, svg: () => `<g><rect ${fill} width="280" height="380" style="fill:#FBFBF9"/>
        <rect class="m-print" x="14" y="14" width="150" height="150" rx="75"/><rect class="m-print" x="178" y="14" width="88" height="88" rx="10"/><rect class="m-print" x="178" y="114" width="88" height="50" rx="6"/>
        <rect class="m-print" x="14" y="180" width="252" height="110" rx="8"/><rect class="m-print" x="14" y="304" width="120" height="62" rx="6"/><rect class="m-print" x="146" y="304" width="120" height="62" rx="6"/><rect ${edge} width="280" height="380"/></g>` },
    card: { w: 90, h: 50, svg: () => `<g><rect ${fill} width="90" height="50" rx="1.5" style="fill:#FBFBF9"/><rect class="m-print" x="8" y="9" width="30" height="5"/><rect class="m-print" x="8" y="30" width="44" height="3"/><rect class="m-print" x="8" y="36" width="36" height="3"/><rect ${edge} width="90" height="50" rx="1.5"/></g>` },
    badge56: { w: 56, h: 56, svg: () => `<g><circle ${fill} cx="28" cy="28" r="28"/><circle class="m-print" cx="28" cy="28" r="20"/><circle ${edge} cx="28" cy="28" r="28"/><path class="m-hl" d="M 10,16 A 22,22 0 0 1 24,6" /></g>` },
    badge38: { w: 38, h: 38, svg: () => `<g><circle ${fill} cx="19" cy="19" r="19"/><circle class="m-print" cx="19" cy="19" r="13"/><circle ${edge} cx="19" cy="19" r="19"/><path class="m-hl" d="M 7,11 A 15,15 0 0 1 16,4"/></g>` },
    keychain: { w: 40, h: 78, svg: () => `<g><circle ${edge} cx="20" cy="11" r="10" style="stroke-width:2.2;stroke:#8C9096"/><rect ${fill} x="0" y="22" width="40" height="56" rx="5" style="fill:#F3F5F6"/><rect class="m-print" x="5" y="27" width="30" height="46" rx="2"/><rect ${edge} x="0" y="22" width="40" height="56" rx="5"/><circle cx="20" cy="27" r="2.2" class="m-edge"/></g>` },
    magnet: { w: 60, h: 60, svg: () => `<g><rect ${fill} width="60" height="60" rx="3"/><rect class="m-print" x="5" y="5" width="50" height="50" rx="2"/><rect ${edge} width="60" height="60" rx="3"/></g>` },
    sticker: { w: 40, h: 40, svg: () => `<g><rect ${fill} width="40" height="40" rx="9"/><rect class="m-print" x="4" y="4" width="32" height="32" rx="7"/><path class="m-hl" d="M 8,10 Q 12,5 20,5"/><rect ${edge} width="40" height="40" rx="9"/></g>` },
    bankcard: { w: 85.6, h: 54, svg: () => `<g><rect class="m-card" width="85.6" height="54" rx="3.2"/><rect x="8" y="18" width="11" height="8.5" rx="1.5" class="m-card-chip"/></g>` },
  };

  window.MSModels = { ensureDefs, TEE, BODY, teeFront, teeBack, PLACES, FORMATS, COLORS, colorVars, shadeHex, MODELS };
})();
