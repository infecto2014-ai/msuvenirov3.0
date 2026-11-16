// «Печать на бейсболках» (/pechat-na-kepkah) on the clothing template: ready-made variants, specs, «Где печатаем»,
// care. Texts are taken verbatim from msuvenirov 2.0 (src/data/capsPage.ts), changed only where the owner's rules of
// 16.11.2026 differ: 11 colours (was 7), white and black from 1 pc, coloured from 10; up to 4 prints, all А6 (was 3);
// every next print −30% (no «третий — ещё дешевле»). The 4th print place is not named by the owner — never name it.
// No print-size scheme: a cap is not a flat garment and every print is А6 — the places are cards («Где печатаем»).
// Prices are never written here — a variant's price is quoted by the calculator rules in pricing.ts (presetPrice).
import { COLOR_MIN, extraPrintFactor } from '../pricing';
import type { GarmentPage, GarmentPreset } from './types';

/** the calm product photo is not there yet: a labelled slot in public/img/v3 */
const CAP_PRODUCT = { name: 'cap-product', label: 'cap-product — бейсболка', alt: 'Бейсболка с принтом' };

const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);

// 2.0 drew the named cap red — a coloured cap is from 10 pcs now (owner, 16.11.2026), so the gift of one is black (as on its photo)
const presets: GarmentPreset[] = [
  {
    title: 'Именная кепка',
    note: 'имя, надпись или рисунок спереди — в подарок',
    product: 'cap',
    qty: 1,
    options: { color: 'black', print1: 'a6', print2: 'none' },
    img: '/portfolio/portfolio-8.webp',
  },
  {
    title: 'Логотип спереди и сбоку',
    note: 'два принта на одной кепке: второй — со скидкой',
    product: 'cap',
    qty: 1,
    options: { color: 'black', print1: 'a6', print2: 'a6' },
    pic: CAP_PRODUCT,
  },
  {
    title: '10 кепок для команды',
    note: 'логотип клуба или название команды спереди',
    product: 'cap',
    qty: 10,
    options: { color: 'blue', print1: 'a6', print2: 'none' },
    pic: CAP_PRODUCT,
  },
  {
    title: '30 кепок для персонала',
    note: 'логотип компании спереди — для зала, курьеров, выездной команды',
    product: 'cap',
    qty: 30,
    options: { color: 'black', print1: 'a6', print2: 'none' },
    img: '/portfolio/branded-caps.webp',
  },
  {
    title: '100 кепок для промо',
    note: 'логотип спереди — акции, забеги, фестивали',
    product: 'cap',
    qty: 100,
    options: { color: 'yellow', print1: 'a6', print2: 'none' },
    pic: CAP_PRODUCT,
  },
];

const specs = [
  { label: 'Модель', value: 'бейсболка унисекс, 5 панелей' },
  { label: 'Состав', value: '100% хлопок' },
  { label: 'Ткань', value: 'саржа, 250 г/м²' },
  { label: 'Размер', value: '56–58 см, регулируется' },
  { label: 'Застёжка', value: 'металлическая, сзади' },
  { label: 'Печать', value: 'DTF, любые цвета и мелкие детали' },
  // owner, 16.11.2026: up to 4 prints, all А6 (2.0: «до трёх принтов»)
  { label: 'Места печати', value: 'спереди, сбоку и сзади над застёжкой — до 4 принтов, каждый А6' },
];

const care = [
  'Не стирайте в машинке — козырёк и передняя часть могут потерять форму.',
  'Чистите вручную: тёплая вода, мягкая губка, без отбеливателя.',
  'Не трите принт щёткой.',
  'Сушите на форме — например, на банке или мяче, а не на батарее.',
];

export const cap: GarmentPage = {
  slug: '/pechat-na-kepkah',
  title: 'Печать на бейсболках в Калининграде — кепка с логотипом | Мастерская сувениров',
  description:
    'Печать на кепках и бейсболках в Калининграде от 1 шт: логотип, имя или надпись DTF. Хлопковые бейсболки 11 цветов, кепки с логотипом оптом, счёт без НДС.',
  h1: 'Печать на бейсболках в Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-kepkah', label: 'Бейсболки' },
  ],
  serviceName: 'Печать на бейсболках',
  hero: { priceLabel: 'Бейсболка с печатью' },
  calc: {
    category: 'textile',
    // spec 2026-11-16-shoppers-caps: our cap and the customer's own cap (only the print)
    tiles: [
      { id: 'ours', label: 'Бейсболка', product: 'cap' },
      { id: 'own', label: 'Своя бейсболка', product: 'cap', preset: { blank: 'own' }, own: true },
    ],
    lead: 'Выберите бейсболку, цвет и принты — цена за штуку и за тираж посчитается сразу.',
  },
  presets,
  colors: { product: 'cap', sub: `Белый и чёрный — в наличии, остальные — от ${COLOR_MIN.cap} шт` },
  specs: { items: specs, sub: 'Бейсболка TEXTILLER: 100% хлопок, саржа 250 г/м², 56–58 см' },
  extra: [
    {
      id: 'places',
      title: 'Где печатаем',
      icon: 'scan',
      sub: 'Спереди, сбоку и сзади над застёжкой — до 4 принтов, каждый А6',
      cards: [
        {
          title: 'Спереди',
          tag: 'основной принт',
          rows: [{ label: 'Размер', value: 'до А6 по ширине; по высоте ограничивает панель — около 11 × 6 см' }],
          text: 'Главное место: логотип, имя, название команды или короткая надпись. Широкая передняя панель без шва — принт не разрезается посередине.',
        },
        {
          title: 'Сбоку',
          tag: 'второй принт',
          rows: [{ label: 'Размер', value: 'размер зависит от модели кепки — подскажем по макету' }],
          text: 'Маленький логотип, сайт, дата, имя или номер на боковой панели. Второй принт на той же кепке стоит дешевле первого.',
        },
        {
          // 2.0: «третий принт … — ещё дешевле»; now every next print is −30% (owner, 16.11.2026)
          title: 'Сзади, над застёжкой',
          tag: 'дополнительный принт',
          rows: [{ label: 'Размер', value: 'небольшой — зависит от модели' }],
          text: `Сайт, короткая надпись, номер или год. Каждый следующий принт на той же кепке — тоже на ${extraOff}% дешевле первого.`,
        },
      ],
    },
  ],
  care,
  worksTag: 'kepki',
  reviewWords: ['кепк', 'бейсболк'],
  faqSlug: '/pechat-na-kepkah',
  prices: {
    title: 'Цена печати',
    accent: 'на бейсболках',
    lead: 'Цена указана за одну бейсболку вместе с печатью. Чем больше тираж, тем дешевле каждая бейсболка.',
    products: [{ id: 'cap', title: 'Бейсболка' }],
    rules: [
      { icon: 'palette', text: `Цветные бейсболки — от ${COLOR_MIN.cap} шт. Белые и чёрные — с 1 шт.` },
      { icon: 'layers', text: `На одной бейсболке — до 4 принтов, каждый А6. Каждый следующий принт — со скидкой −${extraOff}%.` },
    ],
  },
  heads: {
    details: 'о бейсболке',
    worksLead: 'Настоящие кепки наших клиентов',
  },
  images: {
    hero: 'cap-hero',
    heroMobile: 'cap-hero-mobile',
    alt: 'Рыжий кот в тёмно-синем худи и бейсболке',
    label: 'кот в бейсболке',
  },
};
