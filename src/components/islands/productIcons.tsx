import type { ComponentChildren } from 'preact';
import './productIcons.css';

/**
 * Минималистичные значки изделий для плиток калькулятора.
 * Линия currentColor, без заливки + один цветной акцент-«принт». Цвета акцентов (--c / --m / --y)
 * и подложки (--paper-2) задаёт productIcons.css на токенах 3.0; размер — CSS (.calc-product-ico).
 */

const C = 'var(--c)';
const M = 'var(--m)';
const Y = 'var(--y)';

const acc = (children: ComponentChildren) => <g class="ico-acc">{children}</g>;
const Dot = ({ x, y, r = 3, f = M }: { x: number; y: number; r?: number; f?: string }) => <circle cx={x} cy={y} r={r} fill={f} stroke="none" />;
const Sq = ({ x, y, w, h = w, f = M, rx = 1.5 }: { x: number; y: number; w: number; h?: number; f?: string; rx?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={rx} fill={f} stroke="none" />
);
const star = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return pts;
};
const Star = ({ cx, cy, r = 4, f = Y }: { cx: number; cy: number; r?: number; f?: string }) => (
  <polygon points={star(cx, cy, r)} fill={f} stroke="none" />
);
const Heart = ({ x, y, s = 1, f = M }: { x: number; y: number; s?: number; f?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 2 C-4 -2 -1 -6 0 -3 C1 -6 4 -2 0 2 Z M0 4 L0 4" fill={f} stroke="none" />
);

const SHIRT = 'M17 8 L7 13 L10 21 L14 19 L14 40 L34 40 L34 19 L38 21 L41 13 L31 8 C30 11 27 12 24 12 C21 12 18 11 17 8 Z';
const OVER = 'M16 8 L4 15 L6 25 L12 22 L12 40 L36 40 L36 22 L42 25 L44 15 L32 8 C30 11 27 12 24 12 C21 12 18 11 16 8 Z';

const Shirt = ({ accent }: { accent: ComponentChildren }) => (
  <>
    <path d={SHIRT} />
    {accent}
  </>
);

const icons: Record<string, () => preact.JSX.Element> = {
  'tshirt-unisex': () => <Shirt accent={acc(<Sq x={19.5} y={21} w={9} f={M} />)} />,
  'tshirt-kids': () => (
    <g transform="translate(24 41) scale(0.86) translate(-24 -41)">
      <path d={SHIRT} />
      {acc(<Dot x={24} y={27} r={4.5} f={Y} />)}
    </g>
  ),
  oversize: () => (
    <>
      <path d={OVER} />
      {acc(<Sq x={18} y={22} w={12} h={9} f={C} />)}
    </>
  ),
  polo: () => (
    <>
      <path d="M17 8 L7 13 L10 21 L14 19 L14 40 L34 40 L34 19 L38 21 L41 13 L31 8 L27 11 L24 15 L21 11 Z" />
      <path d="M24 15 V25" />
      {acc(<Sq x={28} y={23} w={4} h={4} f={M} />)}
      <circle cx="24" cy="19" r="0.6" fill="currentColor" />
      <circle cx="24" cy="23" r="0.6" fill="currentColor" />
    </>
  ),
  'tshirt-sub': () => (
    <>
      <path d={SHIRT} />
      {acc(
        <>
          <Dot x={21.5} y={26} r={3.5} f={C} />
          <Dot x={26.5} y={26} r={3.5} f={M} />
          <Dot x={24} y={30} r={3.5} f={Y} />
        </>,
      )}
    </>
  ),
  hoodie: () => (
    <>
      <path d="M16 10 L5 16 L8 28 L13 26 V40 H35 V26 L40 28 L43 16 L32 10 C31 6 28 4 24 4 C20 4 17 6 16 10 Z" />
      <path d="M17 10 C18 16 21 18 24 18 C27 18 30 16 31 10" />
      <path d="M22 18 V24 M26 18 V24" />
      {acc(<Sq x={19} y={30} w={10} h={5} f={M} rx={2} />)}
    </>
  ),
  cap: () => (
    <>
      <path d="M9 31 C8 18 15 11 24 11 C33 11 40 18 39 31 Z" />
      <path d="M9 31 C16 29 30 29 42 32 C44 34 41 36 38 35 C30 33 16 33 9 34 Z" />
      <path d="M24 11 V29" />
      {acc(<Dot x={24} y={21} r={3.5} f={Y} />)}
    </>
  ),
  shopper: () => (
    <>
      <path d="M11 15 H37 L38 41 H10 Z" />
      <path d="M17 15 C17 5 31 5 31 15" />
      {acc(<Heart x={24} y={28} s={2} f={M} />)}
    </>
  ),
  'shopper-sub': () => (
    <>
      <path d="M11 15 H37 L38 41 H10 Z" />
      <path d="M17 15 C17 5 31 5 31 15" />
      {acc(
        <>
          <Dot x={21} y={28} r={3.5} f={C} />
          <Dot x={27} y={28} r={3.5} f={M} />
          <Dot x={24} y={32} r={3.5} f={Y} />
        </>,
      )}
    </>
  ),
  apron: () => (
    <>
      <path d="M18 5 H30 L31 15 C31 17 35 18 35 22 L37 42 H11 L13 22 C13 18 17 17 17 15 Z" />
      <path d="M18 5 C18 10 30 10 30 5" />
      {acc(<Sq x={19} y={29} w={10} h={7} f={Y} rx={2} />)}
    </>
  ),
  'sub-print': () => (
    <>
      <path d={SHIRT} />
      {acc(<Star cx={24} cy={26} r={6} f={C} />)}
    </>
  ),
  'own-item': () => (
    <>
      <path d={SHIRT} strokeDasharray="3 3" />
      {acc(<Sq x={19.5} y={21} w={9} f={M} />)}
    </>
  ),
  'dtf-sheet': () => (
    <>
      <rect x="9" y="6" width="30" height="36" rx="2.5" />
      {acc(
        <>
          <Dot x={19} y={17} r={4} f={M} />
          <Sq x={25} y={13} w={9} f={C} />
          <Star cx={19} cy={32} r={5} f={Y} />
          <Sq x={26} y={29} w={8} h={6} f={M} />
        </>,
      )}
    </>
  ),
  'sub-sheet': () => (
    <>
      <path d="M9 6 H39 V42 H9 Z" strokeDasharray="4 2.5" />
      {acc(
        <>
          <Dot x={19} y={17} r={4} f={C} />
          <Sq x={25} y={13} w={9} f={Y} />
          <Star cx={19} cy={32} r={5} f={M} />
          <Sq x={26} y={29} w={8} h={6} f={C} />
        </>,
      )}
    </>
  ),
  mug: () => (
    <>
      <path d="M10 13 H32 V37 C32 40 30 41 28 41 H14 C12 41 10 40 10 37 Z" />
      <path d="M32 18 H35 C39 18 39 30 35 30 H32" />
      {acc(<Dot x={21} y={27} r={4.5} f={M} />)}
    </>
  ),
  'mug-big': () => (
    <>
      <path d="M9 8 H31 V39 C31 42 29 43 27 43 H13 C11 43 9 42 9 39 Z" />
      <path d="M31 14 H34 C39 14 39 28 34 28 H31" />
      {acc(<Dot x={20} y={25} r={4.5} f={C} />)}
    </>
  ),
  'coffee-set': () => (
    <>
      <path d="M12 17 H31 V28 C31 32 28 34 25 34 H18 C15 34 12 32 12 28 Z" />
      <path d="M31 20 H33 C37 20 37 28 33 28 H31" />
      <path d="M6 38 H38 C37 41 34 42 22 42 C10 42 7 41 6 38 Z" />
      {acc(<Dot x={21.5} y={25} r={3} f={Y} />)}
      <path d="M18 8 C16 11 20 12 18 14 M24 8 C22 11 26 12 24 14" />
    </>
  ),
  'beer-mug': () => (
    <>
      <path d="M9 9 H30 L29 40 C29 42 28 43 26 43 H13 C11 43 10 42 10 40 Z" />
      <path d="M30 15 H34 C39 15 39 32 34 32 H29.5" />
      <path d="M9 9 C9 5 14 5 16 8 C18 5 24 5 25 8 C27 6 31 7 30 9" />
      {acc(<Sq x={14} y={20} w={11} h={10} f={Y} rx={2.5} />)}
    </>
  ),
  'badge-roll': () => (
    <>
      <circle cx="24" cy="24" r="16" />
      <circle cx="24" cy="24" r="12" strokeDasharray="1.5 2.5" />
      {acc(<Star cx={24} cy={24} r={6.5} f={M} />)}
    </>
  ),
  'badge-pin': () => (
    <>
      <circle cx="24" cy="21" r="13" />
      <path d="M15 37 L24 43 L33 37" />
      {acc(<Heart x={24} y={21} s={2.2} f={C} />)}
    </>
  ),
  'keychain-acrylic': () => (
    <>
      <circle cx="24" cy="9" r="4" />
      <path d="M24 13 V18" />
      <rect x="12" y="18" width="24" height="24" rx="6" />
      {acc(<Heart x={24} y={30} s={2.4} f={M} />)}
    </>
  ),
  'keychain-metal': () => (
    <>
      <circle cx="24" cy="9" r="4" />
      <path d="M24 13 V17" />
      <path d="M24 17 L38 30 L24 43 L10 30 Z" />
      {acc(<Dot x={24} y={30} r={4} f={Y} />)}
    </>
  ),
  'magnet-vinyl': () => (
    <>
      <rect x="8" y="12" width="32" height="24" rx="3" />
      <path d="M8 31 H40" strokeDasharray="2 3" />
      {acc(<Sq x={14} y={17} w={11} h={9} f={C} />)}
    </>
  ),
  'magnet-acrylic': () => (
    <>
      <rect x="9" y="9" width="30" height="30" rx="7" />
      <path d="M14 15 L18 11" />
      {acc(<Dot x={24} y={24} r={6} f={M} />)}
    </>
  ),
  'photo-magnet': () => (
    <>
      <rect x="8" y="11" width="32" height="26" rx="4" />
      <path d="M12 33 L20 24 L26 30 L30 26 L36 33" />
      {acc(<Dot x={30} y={19} r={3} f={Y} />)}
    </>
  ),
  'sticker-3d': () => (
    <>
      <path d="M24 6 C34 6 42 14 42 24 C42 34 34 42 24 42 C14 42 6 34 6 24 C6 14 14 6 24 6 Z" strokeLinejoin="round" />
      <path d="M13 17 C15 12 19 10 23 10" />
      {acc(<Star cx={24} cy={25} r={9} f={M} />)}
    </>
  ),
  'sticker-pack': () => (
    <>
      <rect x="7" y="7" width="34" height="34" rx="5" />
      {acc(
        <>
          <Dot x={17} y={17} r={4.5} f={M} />
          <Star cx={31} cy={17} r={5.5} f={Y} />
          <Sq x={13} y={26} w={9} f={C} />
          <Heart x={31} y={31} s={1.9} f={M} />
        </>,
      )}
    </>
  ),
  'sticker-set': () => (
    <>
      <rect x="6" y="12" width="14" height="14" rx="4" />
      <rect x="28" y="12" width="14" height="14" rx="4" />
      <rect x="17" y="26" width="14" height="14" rx="4" />
      {acc(
        <>
          <Dot x={13} y={19} r={2.5} f={M} />
          <Dot x={35} y={19} r={2.5} f={C} />
          <Dot x={24} y={33} r={2.5} f={Y} />
        </>,
      )}
    </>
  ),
  'vinyl-sticker': () => (
    <>
      <path d="M10 8 H32 L40 16 V40 H10 Z" />
      <path d="M32 8 V16 H40" />
      {acc(<Heart x={25} y={28} s={2.8} f={C} />)}
    </>
  ),
  'vinyl-pack': () => (
    <>
      <rect x="9" y="6" width="30" height="36" rx="3" />
      <path d="M9 24 H39" strokeDasharray="2 3" />
      {acc(
        <>
          <Dot x={19} y={15} r={4} f={M} />
          <Sq x={26} y={11} w={8} f={Y} />
          <Star cx={19} cy={33} r={5} f={C} />
          <Heart x={30} y={33} s={1.7} f={M} />
        </>,
      )}
    </>
  ),
  'business-cards': () => (
    <>
      <rect x="5" y="11" width="38" height="26" rx="3" />
      <path d="M26 20 H37 M26 25 H35 M26 30 H33" />
      {acc(<Sq x={10} y={17} w={11} f={M} />)}
    </>
  ),
  flyers: () => (
    <>
      <path d="M11 5 H37 V43 H11 Z" />
      {acc(<Sq x={16} y={10} w={16} h={10} f={C} />)}
      <path d="M16 27 H32 M16 32 H32 M16 37 H26" />
    </>
  ),
  notebook: () => (
    <>
      <rect x="11" y="5" width="28" height="38" rx="3" />
      <path d="M17 5 V43" />
      <path d="M7 12 H14 M7 20 H14 M7 28 H14 M7 36 H14" />
      {acc(<Sq x={22} y={13} w={10} h={8} f={Y} />)}
    </>
  ),
  office: () => (
    <>
      <path d="M11 5 H31 L38 12 V43 H11 Z" />
      <path d="M31 5 V12 H38" />
      <path d="M17 20 H32 M17 26 H32 M17 32 H27" />
      {acc(<Sq x={17} y={13} w={7} h={3.5} f={M} rx={1} />)}
    </>
  ),
  'cal-quarterly': () => (
    <>
      <rect x="8" y="5" width="32" height="38" rx="3" />
      <path d="M8 17 H40 M8 27 H40 M8 37 H40" />
      {acc(<Sq x={14} y={9} w={20} h={5} f={C} rx={1} />)}
      <path d="M14 22 H34 M14 32 H34" />
    </>
  ),
  'cal-wall': () => (
    <>
      <rect x="9" y="9" width="30" height="35" rx="3" />
      <path d="M9 18 H39" />
      <path d="M18 5 V12 M30 5 V12" />
      {acc(<Sq x={14} y={23} w={5} f={M} rx={1} />)}
      <path d="M23 25.5 H34 M14 33 H34 M14 38 H28" />
    </>
  ),
  'cal-desk': () => (
    <>
      <path d="M6 42 L14 12 H34 L42 42 Z" />
      <path d="M11 24 H37" />
      <path d="M18 8 V15 M30 8 V15" />
      {acc(<Sq x={20} y={28} w={8} h={7} f={Y} rx={1} />)}
    </>
  ),
  'cal-pocket': () => (
    <>
      <rect x="13" y="6" width="22" height="36" rx="3" />
      <path d="M13 15 H35" />
      {acc(<Sq x={18} y={21} w={12} h={10} f={M} />)}
      <path d="M18 36 H30" />
    </>
  ),
  'wide-print': () => (
    <>
      <rect x="5" y="12" width="38" height="22" rx="2" />
      <path d="M10 38 V43 M38 38 V43 M10 34 V38 M38 34 V38" />
      <circle cx="9" cy="16" r="0.8" fill="currentColor" />
      <circle cx="39" cy="16" r="0.8" fill="currentColor" />
      {acc(<Star cx={24} cy={23} r={6} f={M} />)}
    </>
  ),
  pillow: () => (
    <>
      <path d="M8 12 C16 9 32 9 40 12 C38 20 38 28 40 36 C32 39 16 39 8 36 C10 28 10 20 8 12 Z" />
      {acc(<Heart x={24} y={24} s={2.8} f={M} />)}
    </>
  ),
  mousepad: () => (
    <>
      <rect x="5" y="12" width="38" height="24" rx="7" />
      {acc(<Dot x={24} y={24} r={6} f={C} />)}
      <rect x="21" y="19" width="6" height="9" rx="3" stroke="currentColor" fill="var(--paper-2)" />
    </>
  ),
  pennant: () => (
    <>
      <path d="M8 6 V43" />
      <path d="M8 9 L42 18 L8 28 Z" />
      {acc(<Star cx={18} cy={18} r={4.5} f={Y} />)}
    </>
  ),
  ball: () => (
    <>
      <circle cx="24" cy="28" r="14" />
      <rect x="20" y="11" width="8" height="4" rx="1" />
      <path d="M24 11 V7 C24 4 28 4 28 7" />
      {acc(<Star cx={24} cy={28} r={7} f={M} />)}
    </>
  ),
  medal: () => (
    <>
      <path d="M14 4 L22 20 M34 4 L26 20" />
      <circle cx="24" cy="31" r="11" />
      {acc(<Star cx={24} cy={31} r={6.5} f={Y} />)}
    </>
  ),
  'car-sticker': () => (
    <>
      <path d="M6 31 L10 21 C11 19 13 18 15 18 H33 C35 18 37 19 38 21 L42 31 V37 H6 Z" />
      <circle cx="14" cy="37" r="4" fill="var(--paper-2)" />
      <circle cx="34" cy="37" r="4" fill="var(--paper-2)" />
      {acc(<Sq x={19} y={22} w={10} h={5} f={M} rx={2} />)}
    </>
  ),
};

// puzzle: общий рисунок, разные формы
const puzzle = (kind: 'rect' | 'heart' | 'small') => () => {
  if (kind === 'heart') {
    return (
      <>
        <path d="M24 42 C8 30 5 22 5 17 C5 11 9 7 14 7 C19 7 22 10 24 13 C26 10 29 7 34 7 C39 7 43 11 43 17 C43 22 40 30 24 42 Z" />
        {acc(<Sq x={19} y={17} w={8} f={M} rx={2} />)}
        <path d="M24 13 V17" />
      </>
    );
  }
  const h = kind === 'small' ? 24 : 30;
  const y = (48 - h) / 2;
  return (
    <>
      <rect x="7" y={y} width="34" height={h} rx="2" />
      <path d={`M24 ${y} V${y + h} M7 ${y + h / 2} H41`} />
      {acc(<Sq x={11} y={y + 4} w={9} h={h / 2 - 8} f={kind === 'small' ? Y : C} />)}
      <Dot x={24} y={y + h / 2} r={2.2} f="var(--paper-2)" />
    </>
  );
};
icons['puzzle-a3'] = puzzle('rect');
icons['puzzle-a4'] = puzzle('rect');
icons['puzzle-a5'] = puzzle('small');
icons['puzzle-heart'] = puzzle('heart');

const catIcons: Record<string, string> = {
  textile: 'tshirt-unisex',
  transfers: 'dtf-sheet',
  mugs: 'mug',
  badges: 'badge-roll',
  keychains: 'keychain-acrylic',
  magnets: 'magnet-vinyl',
  stickers: 'sticker-3d',
  cards: 'business-cards',
  flyers: 'flyers',
  calendars: 'cal-wall',
  wide: 'wide-print',
  gifts: 'pillow',
};

export const hasOwnIcon = (id: string) => id in icons;

/** Значок изделия: по id, иначе по категории, иначе общий. */
export function ProductIcon({ id, cat }: { id: string; cat?: string }) {
  const draw = icons[id] ?? (cat && catIcons[cat] ? icons[catIcons[cat]] : undefined);
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {draw ? (
        draw()
      ) : (
        <>
          <rect x="8" y="8" width="32" height="32" rx="8" />
          {acc(<Dot x={24} y={24} r={6} f={M} />)}
        </>
      )}
    </svg>
  );
}
