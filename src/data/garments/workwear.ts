// «Печать на спецодежде и униформе» (/pechat-na-specodezhde) on the clothing template: print on the customer's own
// workwear (product 'own-item') or we source it. Texts are taken verbatim from msuvenirov 2.0 (src/data/workwearPage.ts),
// changed only where the owner's rules of 16.11.2026 differ: up to 5 prints (was 3), every next print −30%
// («второй принт дешевле» → «каждый следующий принт на N% дешевле»). Facts of 06.11.2026: we print on jackets, fleece,
// vests (signal ones too), overalls, aprons, polo — gowns are not listed; the back up to А3; we source workwear from 10 pcs,
// 1–2 days if in stock in Kaliningrad. No delivery, no rush surcharge, no screen printing, no embroidery offered.
// No size scheme (workwear varies); no colours/specs sections (2.0 had none). Prices are never written here — a variant's
// price is quoted by pricing.ts (presetPrice); the numbers in the questions are computed from pricing.ts, as 2.0 did.
import { defaultSelection, extraPrintFactor, findProduct, rub, type Selection } from '../pricing';
import type { Faq } from '../types';
import type { GarmentPage, GarmentPreset } from './types';

/** the calm product photo is not there yet: a labelled slot in public/img/v3 */
const WORKWEAR_PRODUCT = { name: 'workwear-product', label: 'workwear-product — рабочая куртка', alt: 'Рабочая куртка с логотипом' };

const own = findProduct('textile', 'own-item')!;
const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);
const quoteOf = (qty: number, options: Selection['options']) => {
  const b = defaultSelection(own);
  return own.quote({ ...b, qty, options: { ...b.options, ...options } });
};

const presets: GarmentPreset[] = [
  {
    title: 'Логотип на грудь',
    note: 'на ваши куртки или жилеты — бригада, склад, сервис',
    product: 'own-item',
    qty: 10,
    options: { print1: 'a6', print2: 'none', print3: 'none' },
    pic: WORKWEAR_PRODUCT,
  },
  {
    title: 'Логотип и название на спине',
    note: 'грудь А6 + спина А3 — видно издалека',
    product: 'own-item',
    qty: 20,
    options: { print1: 'a3', print2: 'a6', print3: 'none' },
    pic: WORKWEAR_PRODUCT,
  },
  {
    title: 'Сигнальные жилеты с логотипом',
    note: 'надпись А4 на спине — стройка, дорожные работы, охрана',
    product: 'own-item',
    qty: 30,
    options: { print1: 'a4', print2: 'none', print3: 'none' },
    pic: WORKWEAR_PRODUCT,
  },
  {
    title: 'Фартуки для кафе',
    note: 'логотип А5 на грудке — зал, кухня, бар, пекарня',
    product: 'own-item',
    qty: 10,
    options: { print1: 'a5', print2: 'none', print3: 'none' },
    pic: WORKWEAR_PRODUCT,
  },
  {
    title: 'Поло для персонала',
    note: 'логотип на груди — продавцы, администраторы, официанты',
    product: 'own-item',
    qty: 20,
    options: { print1: 'a6', print2: 'none', print3: 'none' },
    img: '/portfolio/corporate-polo.webp',
  },
];

const care = [
  'Первую стирку — не раньше чем через сутки после печати.',
  'Стирайте навыворот при 30–40 °C, без отбеливателя.',
  'Гладьте с изнанки, утюгом по принту не проводите.',
  'Не сушите в барабанной сушилке и на батарее.',
];

/** the questions of 2.0 (buildWorkwearFaq), prices from pricing.ts */
const a6 = rub(quoteOf(1, { print1: 'a6' }).unit);
const a3 = rub(quoteOf(1, { print1: 'a3' }).unit);
const faq: Faq[] = [
  {
    q: 'На какой спецодежде вы печатаете?',
    a: 'На куртках и ветровках, флисе, жилетах, в том числе сигнальных, комбинезонах и полукомбинезонах, фартуках, поло и футболках. Печатаем на большинстве тканей спецодежды; если сомневаетесь — привезите изделие, посмотрим и подскажем.',
  },
  {
    q: 'Сколько стоит нанести логотип на спецодежду?',
    // 2.0: «второй принт на том же изделии стоит на N% дешевле» — now up to 5 prints, every next −N% (owner, 16.11.2026)
    a: `Если одежда ваша — вы платите только за печать: логотип формата А6 на груди — ${a6} за штуку при заказе одной вещи, надпись А3 на спину — ${a3}. С ростом количества цена за принт снижается. На одной вещи можно сделать до 5 принтов, каждый до А3: каждый следующий принт стоит на ${extraOff}% дешевле. Точная сумма — в калькуляторе на этой странице.`,
  },
  {
    q: 'Можно напечатать на спине больше А3?',
    a: 'Обычно на спине печатаем до формата А3 — 28 × 38 см. Если макет позволяет, можно сделать и больше — в несколько прогонов. Пришлите макет, подскажем.',
  },
  {
    q: 'Подберёте спецодежду, если у нас её нет?',
    a: 'Да, подберём и закажем от 10 штук. Срок зависит от наличия в Калининграде: если нужная одежда есть, делаем всё за 1–2 дня. Цену одежды назовём после подбора.',
  },
  {
    q: 'Можно разные имена или должности на каждой вещи?',
    a: 'Да. Пришлите список — нанесём имена, должности или номера на каждое изделие отдельно.',
  },
  {
    q: 'Как стирать спецодежду с печатью?',
    a: 'Первую стирку — не раньше чем через сутки. Стирайте навыворот при 30–40 °C, без отбеливателя, гладьте с изнанки и не сушите в барабанной сушилке.',
  },
  {
    q: 'Работаете с организациями?',
    a: `Да. Заключаем договор, выставляем счёт без НДС, оплату можно внести и после выполнения. Закрывающие документы — акт, накладная или УПД. Перед партией делаем образец. В калькуляторе — до ${own.qty.max} штук, большие партии считаем индивидуально.`,
  },
];

export const workwear: GarmentPage = {
  slug: '/pechat-na-specodezhde',
  title: 'Печать на спецодежде в Калининграде — логотип на униформу | Мастерская сувениров',
  description:
    'Нанесение логотипа на спецодежду и униформу в Калининграде: куртки, жилеты, сигнальные жилеты, комбинезоны, фартуки, поло. На вашей одежде или подберём от 10 шт. Счёт без НДС.',
  h1: 'Печать на спецодежде и униформе в Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-specodezhde', label: 'Спецодежда' },
  ],
  serviceName: 'Печать на спецодежде',
  hero: { priceLabel: 'Печать на спецодежде' },
  calc: {
    category: 'textile',
    // spec 2026-11-16-workwear-sport: only the print on the customer's own item (own-item has no «наша / своя» group)
    tiles: [{ id: 'own', label: 'Своя спецодежда', product: 'own-item', own: true }],
    lead: 'Выберите размер принтов и количество — цена за штуку и за тираж посчитается сразу. Если одежду нужно подобрать, посчитаем её отдельно.',
  },
  presets,
  care,
  extra: [
    {
      id: 'kinds',
      title: 'На чём печатаем',
      icon: 'shirt',
      sub: 'Куртки, жилеты, комбинезоны, фартуки и поло — на большинстве тканей спецодежды',
      cards: [
        { title: 'Куртки и ветровки', text: 'Рабочие и утеплённые куртки, ветровки, софтшелл, флис — логотип на груди, название на спине.' },
        { title: 'Жилеты', text: 'Рабочие и утеплённые жилеты для склада, сервиса, выездных бригад.' },
        { title: 'Сигнальные жилеты', text: 'Оранжевые и лимонные жилеты со световозвращающими полосами — надпись на спине и логотип на груди.' },
        { title: 'Комбинезоны и полукомбинезоны', text: 'Рабочие комбинезоны для производства, автосервиса, строительства.' },
        { title: 'Фартуки', text: 'Фартуки для кафе, баров, пекарен, магазинов и мастерских.' },
        { title: 'Поло и футболки', text: 'Форма для зала, торговли и администраторов — логотип на груди, надпись на спине.' },
      ],
    },
    {
      id: 'places',
      title: 'Где печатаем',
      icon: 'scan',
      sub: 'На груди, на спине и на рукаве — до 5 принтов на одной вещи, каждый до А3',
      cards: [
        {
          title: 'На груди',
          tag: 'логотип',
          rows: [{ label: 'Размер', value: 'обычно А6 (10 × 15 см) или меньше' }],
          text: 'Логотип компании или эмблема — самое частое место.',
        },
        {
          title: 'На спине',
          tag: 'крупно',
          rows: [{ label: 'Размер', value: 'до А3 (28 × 38 см); больше — в несколько прогонов, если позволяет макет' }],
          text: 'Название компании, сайт, телефон или «ОХРАНА», «СЕРВИС» — видно издалека.',
        },
        {
          title: 'На рукаве',
          tag: 'дополнительно',
          rows: [{ label: 'Размер', value: 'небольшой, обычно А6 и меньше' }],
          text: 'Маленький логотип, флаг, должность или номер.',
        },
      ],
    },
    {
      id: 'ways',
      title: 'Своя спецодежда или подберём',
      icon: 'building',
      sub: 'Печатаем на вашей одежде или подбираем и заказываем под задачу',
      cards: [
        {
          title: 'Печатаем на вашей спецодежде',
          tag: 'ваша одежда',
          text: 'Привозите куртки, жилеты или комбинезоны — платите только за печать, по прайсу. Печатаем на большинстве тканей спецодежды; если сомневаетесь в ткани — посмотрим и подскажем.',
          points: ['Только печать — цена в калькуляторе', `Каждый следующий принт — на ${extraOff}% дешевле`, 'Можно разные надписи и имена'],
        },
        {
          title: 'Подберём и закажем спецодежду',
          tag: 'под ключ',
          text: 'Нет одежды — подберём модели и цвета под вашу задачу и закажем от 10 штук. Срок зависит от наличия в Калининграде: если нужная одежда есть, делаем всё за 1–2 дня.',
          points: ['От 10 штук', 'Если есть в наличии — 1–2 дня', 'Цену одежды назовём после подбора'],
        },
      ],
    },
    {
      id: 'layout',
      title: 'Какой макет подойдёт',
      icon: 'file-text',
      sub: 'Логотип, надпись или список имён — подготовим и покажем, как ляжет на изделие',
      cards: [
        {
          title: 'Что прислать',
          points: [
            'Логотип лучше в векторе: AI, CDR или PDF с кривыми.',
            'Подойдёт и картинка PNG хорошего качества — проверим и подготовим.',
            'Для надписи на спину пришлите текст — подберём шрифт под фирменный стиль.',
            'Имена, должности и номера на каждом изделии — пришлите списком.',
          ],
        },
      ],
    },
  ],
  worksTag: 'korporativ',
  // spec 2026-11-16-workwear-sport: the tag gives other works — three real ones are named
  works: ['/portfolio/corporate-polo.webp', '/portfolio/portfolio-20.webp', '/portfolio/branded-caps.webp'],
  reviewWords: ['спецодежд', 'униформ', 'форм'],
  faqSlug: '/pechat-na-specodezhde',
  faq,
  prices: {
    title: 'Цена печати',
    accent: 'на спецодежде',
    lead: 'Цена указана за одну вещь вашей спецодежды — только печать. Чем больше тираж, тем дешевле каждый принт.',
    products: [{ id: 'own-item', title: 'Печать на вашей спецодежде' }],
    rules: [
      { icon: 'layers', text: `До 5 принтов на одной вещи, каждый до А3. Каждый следующий принт — −${extraOff}%.` },
      { icon: 'building', text: 'Больше 50 шт — индивидуально.' },
    ],
  },
  heads: {
    // the spec says «о печати на спецодежде», but the accent is one unbreakable piece and overflows a 360px screen
    details: 'о спецодежде',
    worksLead: 'Настоящая униформа и фирменная одежда наших клиентов',
  },
  images: {
    hero: 'workwear-hero',
    heroMobile: 'workwear-hero-mobile',
    alt: 'Рыжий кот в рабочей куртке и сигнальном жилете',
    label: 'кот в спецодежде',
  },
};
