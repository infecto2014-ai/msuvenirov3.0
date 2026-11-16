// «DTF и сублимация без нанесения» (/dtf-pechat) on the clothing template: ready transfer sheets that the customer applies
// themselves — DTF sheets 28×38 cm (dtf-sheet) and sublimation sheets A3 / A4 (sub-sheet) of the category 'transfers'.
// Texts are taken verbatim from msuvenirov 2.0 (src/data/transfersPage.ts, buildTransfersFaq), changed only where the 3.0
// template differs: the sections «Что поместится на лист», «DTF или сублимация», «Нужно нанести? Сделаем сами» and
// «Какой макет подойдёт» are cards of «Подробнее о листах»; «Ваша вещь» (2.0: the calculator of the hub, which does not
// exist yet) leads to the T-shirt page. No «own» tile — a sheet is not a print on a garment. The price is per sheet and does
// not depend on how many pictures are on it; more than 50 sheets — individually (SHEET_MAX). No delivery, no rush
// surcharge. Prices are never written here: the variants are quoted by pricing.ts (presetPrice), and the numbers in the
// questions come from pricing.ts, as 2.0 computed them on the page.
import { SHEET_MAX, defaultSelection, findProduct, rub, type Selection } from '../pricing';
import type { Faq } from '../types';
import type { DetailCard, GarmentPage, GarmentPreset } from './types';

/** the calm photo of a sheet is not there yet: labelled slots in public/img/v3 */
const DTF_PIC = { name: 'dtf-sheet-product', label: 'dtf-sheet-product — лист DTF-плёнки', alt: 'Лист DTF-плёнки с принтами' };
const SUB_PIC = { name: 'sub-sheet-product', label: 'sub-sheet-product — сублимационный лист', alt: 'Сублимационный лист с принтами' };

const dtf = findProduct('transfers', 'dtf-sheet')!;
const sub = findProduct('transfers', 'sub-sheet')!;
const quoteOf = (p: typeof dtf, qty: number, options: Selection['options'] = {}) => {
  const b = defaultSelection(p);
  return p.quote({ ...b, qty, options: { ...b.options, ...options } });
};

/** the five variants of 2.0 (packages) */
const presets: GarmentPreset[] = [
  { title: 'Один лист DTF', note: 'пробный лист или небольшой заказ', product: 'dtf-sheet', qty: 1, options: {}, pic: DTF_PIC },
  { title: '5 листов DTF', note: 'небольшая партия принтов для футболок', product: 'dtf-sheet', qty: 5, options: {}, pic: DTF_PIC },
  { title: '10 листов DTF', note: 'логотипы и бирки для бренда одежды', product: 'dtf-sheet', qty: 10, options: {}, pic: DTF_PIC },
  { title: '10 сублимационных листов А3', note: 'для футболок, шопперов и заготовок', product: 'sub-sheet', qty: 10, options: { variant: 'a3' }, pic: SUB_PIC },
  { title: '5 сублимационных листов А4', note: 'для кружек, пазлов и мелочей', product: 'sub-sheet', qty: 5, options: { variant: 'a4' }, pic: SUB_PIC },
];

/** «Что поместится на лист 28 × 38 см» — 2.0 `layouts` */
const layouts: DetailCard[] = [
  { title: 'Один большой принт', text: 'Принт до 28 × 38 см — на спину футболки или худи.' },
  { title: 'Четыре принта А6', text: 'Четыре картинки 10 × 15 см — на грудь, рукав, шоппер.' },
  { title: 'Много маленьких логотипов', text: 'Около 30 логотипов 5 × 5 см — бирки, нашивки, кепки.' },
  { title: 'Ваша раскладка', text: 'Любой набор картинок разного размера — цена за лист та же.' },
];

/** «DTF или сублимация» — 2.0 `tech` */
const tech: DetailCard[] = [
  {
    tag: 'на любую ткань',
    title: 'DTF-трансферы',
    text: 'Принт на прозрачной плёнке с клеевым слоем. Переносится нагревом — термопрессом или утюгом — на хлопок, синтетику и смесовые ткани, светлые и тёмные. Яркие цвета и мелкие детали.',
    points: ['Хлопок и синтетика', 'Светлая и тёмная ткань', 'Лист 28 × 38 см'],
  },
  {
    tag: 'светлая синтетика',
    title: 'Сублимационные листы',
    text: 'Принт на сублимационной бумаге. Подходит для светлой синтетики и сублимационных заготовок — кружек, пазлов, брелоков. На бумаге цвета выглядят бледнее и надписи зеркальные — яркими они становятся после переноса.',
    points: ['Светлая синтетика и заготовки', 'Листы А3 и А4', 'А4 — вдвое дешевле А3'],
  },
];

/** «Нужно нанести? Сделаем сами» — 2.0 `applyLinks` without prices; the title is a link («Ваша вещь» — to the T-shirt page) */
const apply: DetailCard[] = [
  { title: 'Футболки', href: '/pechat-na-futbolkah', text: 'Наши футболки с печатью от 1 шт' },
  { title: 'Худи', href: '/pechat-na-hudi', text: 'Тёплый мерч и худи для команды' },
  { title: 'Ваша вещь', href: '/pechat-na-futbolkah', text: 'Принесите свою — платите только за печать' },
  { title: 'Спецодежда', href: '/pechat-na-specodezhde', text: 'Логотип на куртки, жилеты, фартуки' },
  { title: 'Спортивная форма', href: '/pechat-na-sportivnoy-forme', text: 'Номера и фамилии по списку' },
  { title: 'Бейсболки', href: '/pechat-na-kepkah', text: 'Кепки с логотипом от 1 шт' },
  { title: 'Шопперы', href: '/pechat-na-shopperah', text: 'Сумки с принтом и логотипом' },
  { title: 'Сублимация на изделиях', href: '/sublimacionnaya-pechat', text: 'Светлая синтетика, кружки, заготовки' },
];

/** «Какой макет подойдёт» — 2.0 `layout` */
const layoutPoints = [
  'PNG с прозрачным фоном, 300 dpi, в натуральную величину.',
  'Готовая раскладка на лист 28 × 38 см — или отдельные картинки с нужными размерами, поможем разложить.',
  'Тонкие линии и мелкий текст лучше делать не тоньше 1 мм.',
  'Не уверены в файле — пришлите, проверим перед печатью.',
];

/** the questions of 2.0 (buildTransfersFaq), the prices from pricing.ts */
const dtf1 = rub(quoteOf(dtf, 1).unit);
const dtf30 = rub(quoteOf(dtf, 30).unit);
const subA3 = rub(quoteOf(sub, 1, { variant: 'a3' }).unit);
const subA4 = rub(quoteOf(sub, 1, { variant: 'a4' }).unit);
const faq: Faq[] = [
  {
    q: 'Сколько стоит DTF-печать?',
    a: `Цена за лист 28 × 38 см: ${dtf1} за один лист, от 30 листов — ${dtf30} за лист. На лист можно разложить сколько угодно картинок — цена не меняется. Точная сумма — в калькуляторе на этой странице.`,
  },
  {
    q: 'Сколько картинок поместится на лист?',
    a: 'Сколько поместится в поле 28 × 38 см: например, один большой принт, четыре принта 10 × 15 см или около 30 логотипов 5 × 5 см. Пришлите картинки с размерами — поможем разложить.',
  },
  { q: 'Можно заказать один лист?', a: 'Да, печатаем от одного листа. Чем больше листов, тем ниже цена за лист.' },
  {
    q: 'Чем DTF отличается от сублимации?',
    a: 'DTF-трансфер переносится на любую ткань — хлопок, синтетику, светлую и тёмную. Сублимация — только на светлую синтетику и сублимационные заготовки, зато принт не чувствуется на ткани.',
  },
  {
    q: 'Сколько стоят сублимационные листы?',
    a: `Лист А3 — ${subA3}, лист А4 — ${subA4} при заказе одного листа; от 5, 10 и 30 листов дешевле. А4 всегда вдвое дешевле А3.`,
  },
  {
    q: 'Почему на сублимационном листе бледные цвета и зеркальный текст?',
    a: 'Так и должно быть: сублимационные чернила на бумаге выглядят бледнее, а яркими становятся после переноса. Надписи печатаются зеркально, чтобы на изделии читались правильно.',
  },
  {
    q: 'Какой макет нужен?',
    a: 'PNG с прозрачным фоном, 300 dpi, в натуральную величину. Можно прислать готовую раскладку на лист или отдельные картинки с размерами.',
  },
  {
    q: 'Можно заказать больше 50 листов?',
    a: `Да. В калькуляторе — до ${SHEET_MAX} листов, большие объёмы и регулярные заказы считаем индивидуально.`,
  },
];

export const transfers: GarmentPage = {
  slug: '/dtf-pechat',
  title: 'DTF-печать на заказ в Калининграде — трансферы листами А3 | Мастерская сувениров',
  description:
    'DTF-печать без нанесения в Калининграде: готовые трансферы листами 28×38 см для переноса на одежду. Сублимационная печать листами А3 и А4. Цена за лист, от 1 листа.',
  h1: 'DTF и сублимация без нанесения в Калининграде',
  accent: 'от 1 листа',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/dtf-pechat', label: 'DTF и сублимация без нанесения' },
  ],
  serviceName: 'DTF и сублимация без нанесения',
  // the «от» price is of the cheapest sheet (sublimation A4), so the label says what it is for
  // the cheapest sheet is the А4 sublimation one — say so, or «от 60 ₽» reads as the DTF price
  hero: { priceLabel: 'Сублимационный лист А4' },
  calc: {
    category: 'transfers',
    tiles: [
      { id: 'dtf', label: 'DTF-лист 28×38', product: 'dtf-sheet' },
      { id: 'sub', label: 'Сублимационный лист', product: 'sub-sheet' },
    ],
    lead: 'DTF-листы 28 × 38 см или сублимационные А3 и А4: выберите и укажите количество листов — цена пересчитается сразу. Больше 50 листов — индивидуально.',
  },
  presets,
  extra: [
    { id: 'layouts', title: 'Что поместится на лист 28 × 38 см', icon: 'layers', sub: 'Платите за лист, а не за картинку: разложите на нём сколько угодно принтов', cards: layouts },
    { id: 'tech', title: 'DTF или сублимация', icon: 'droplets', sub: 'Чем отличаются листы и что выбрать', cards: tech },
    { id: 'apply', title: 'Нужно нанести? Сделаем сами', icon: 'shirt', sub: 'Тот же DTF и сублимация — с нанесением на изделие в мастерской', cards: apply },
    { id: 'layout', title: 'Какой макет подойдёт', icon: 'file-text', sub: 'Файл, размеры, тонкие линии', cards: [{ title: 'Что прислать', points: layoutPoints }] },
  ],
  // transfers of the T-shirts (as in 2.0: the printed designs carried over)
  worksTag: 'futbolki',
  reviewWords: ['dtf', 'трансфер', 'плёнк', 'пленк'],
  faqSlug: '/dtf-pechat',
  faq,
  prices: {
    title: 'Цена печати',
    accent: 'листами',
    lead: 'Цена указана за один лист. Чем больше листов, тем ниже цена за лист.',
    products: [
      { id: 'dtf-sheet', title: 'DTF-лист 28 × 38 см' },
      { id: 'sub-sheet', title: 'Сублимационный лист' },
    ],
    rules: [
      { icon: 'layers', text: 'Цена за лист — на лист помещается сколько угодно картинок.' },
      { icon: 'ruler', text: 'Лист А4 вдвое дешевле А3.' },
      { icon: 'info', text: `Больше ${SHEET_MAX} листов — индивидуально.` },
    ],
  },
  heads: {
    details: 'о листах',
    worksLead: 'Настоящие работы нашей мастерской — принты на футболках',
  },
  images: {
    hero: 'dtf-hero',
    heroMobile: 'dtf-hero-mobile',
    alt: 'Рыжий кот держит лист с яркими принтами',
    label: 'кот держит лист DTF-плёнки с принтами',
  },
};
