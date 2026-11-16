// «Печать на спортивной форме» (/pechat-na-sportivnoy-forme) on the clothing template: print on the team's own kit
// (product 'own-item'), our sublimation T-shirt (tshirt-sub) or our cotton T-shirt (tshirt-unisex). Texts are taken
// verbatim from msuvenirov 2.0 (src/data/sportPage.ts), changed only where the owner's answers of 16.11.2026 differ:
// up to 5 prints on the team's kit, every next −30% (was «второй принт дешевле»); we source the kit like workwear
// (from 10 pcs, depends on stock in Kaliningrad, 1–2 days if in stock, the kit's price is named after the choice —
// the conditions are the workwear ones of 2.0, to be shown to the owner); surname + number on the back is ONE print;
// different surnames and numbers cost no extra. No size scheme (the kit varies). No delivery, no rush surcharge,
// no embroidery, no screen printing. Prices are never written here — a variant's price is quoted by pricing.ts
// (presetPrice); the numbers in the questions are computed from pricing.ts, as 2.0 did.
import { defaultSelection, extraPrintFactor, findProduct, rub, type Selection } from '../pricing';
import type { Faq } from '../types';
import type { GarmentPage, GarmentPreset } from './types';

/** the calm product photo is not there yet: a labelled slot in public/img/v3 */
const SPORT_PRODUCT = { name: 'sport-product', label: 'sport-product — футбольная футболка', alt: 'Спортивная форма с номером и фамилией' };

const own = findProduct('textile', 'own-item')!;
const sub = findProduct('textile', 'tshirt-sub')!;
const extraOff = Math.round((1 - extraPrintFactor[1]) * 100);
const quoteOf = (qty: number, options: Selection['options']) => {
  const b = defaultSelection(own);
  return own.quote({ ...b, qty, options: { ...b.options, ...options } });
};

const presets: GarmentPreset[] = [
  {
    title: 'Фамилия и номер на спину',
    note: 'на вашу форму — разные фамилии и номера по списку',
    product: 'own-item',
    qty: 15,
    options: { print1: 'a4', print2: 'none', print3: 'none' },
    img: '/portfolio/sport-jersey.webp',
  },
  {
    title: 'Номер, фамилия и эмблема',
    note: 'спина + эмблема клуба на груди',
    product: 'own-item',
    qty: 15,
    options: { print1: 'a4', print2: 'a6', print3: 'none' },
    pic: SPORT_PRODUCT,
  },
  {
    title: 'Футболки для команды — сублимация',
    note: 'светлая синтетика, номер на спине и эмблема спереди',
    product: 'tshirt-sub',
    qty: 12,
    options: { print1: 'a4', print2: 'a6' },
    pic: SPORT_PRODUCT,
  },
  {
    title: 'Хлопковые футболки на турнир',
    note: 'наши футболки + номер на спине и логотип спереди',
    product: 'tshirt-unisex',
    qty: 20,
    options: { color: 'black', print1: 'a4', print2: 'a6' },
    pic: SPORT_PRODUCT,
  },
  {
    title: 'Номер на шорты',
    note: 'небольшой номер на штанину — к комплекту',
    product: 'own-item',
    qty: 15,
    options: { print1: 'a6', print2: 'none', print3: 'none' },
    pic: SPORT_PRODUCT,
  },
];

const care = [
  'Первую стирку — не раньше чем через сутки после печати.',
  'Стирайте навыворот при 30–40 °C, без отбеливателя.',
  'Гладьте с изнанки, утюгом по номеру не проводите.',
  'Не сушите в барабанной сушилке и на батарее.',
];

/** the questions of 2.0 (buildSportFaq), prices from pricing.ts; the owner's answers of 16.11.2026 applied */
const a4 = rub(quoteOf(1, { print1: 'a4' }).unit);
const a6 = rub(quoteOf(1, { print1: 'a6' }).unit);
const faq: Faq[] = [
  {
    q: 'Сколько стоит нанести номер и фамилию на форму?',
    // 2.0: «второй принт на той же вещи — на N% дешевле» — now: surname + number is one print, up to 5 prints, every next −N%
    a: `Если форма ваша — вы платите только за печать: номер с фамилией на спину (формат А4) — это один принт, ${a4} за одну вещь, эмблема на грудь (А6) — ${a6}. С ростом количества цена за принт снижается. На одной вещи можно сделать до 5 принтов, каждый до А3: каждый следующий принт стоит на ${extraOff}% дешевле. Точная сумма — в калькуляторе на этой странице.`,
  },
  {
    q: 'Можно разные фамилии и номера у каждого игрока?',
    a: 'Да. Пришлите список «фамилия — номер — размер» — подготовим макет для каждого игрока и напечатаем всё по списку.',
  },
  {
    q: 'Есть доплата за разные фамилии и номера?',
    a: 'Нет. У каждого игрока может быть своя фамилия и свой номер — цена та же, как если бы на всех был один макет. Фамилия и номер на спине считаются одним принтом.',
  },
  {
    q: 'Можно заказать один комплект или дозаказать для нового игрока?',
    a: 'Да, печатаем от одной вещи — легко дозаказать форму для нового игрока в том же стиле.',
  },
  {
    q: 'На какой форме печатаете?',
    a: 'DTF-печатью — на любой форме: хлопок и синтетика, светлая и тёмная ткань. Сублимацией — только на светлой синтетике. Если сомневаетесь в ткани, привезите вещь — сначала сделаем пробу.',
  },
  {
    q: 'Есть ли у вас своя форма?',
    // 2.0: «можно взять наши футболки…, чаще команды приносят свою» — now we also source the kit (workwear conditions)
    a: `Да, форму можно подобрать и заказать — от 10 штук. Срок зависит от наличия в Калининграде: если нужная форма есть, делаем всё за 1–2 дня. Цену формы назовём после подбора. Ещё можно взять наши хлопковые футболки или футболки для сублимации (от ${sub.qty.min} штук) — цена в калькуляторе сразу учитывает футболку и печать. Если форма у вас уже есть, платите только за печать.`,
  },
  {
    q: 'Делаете форму с рисунком на всё изделие?',
    a: 'Нет. Сублимацией печатаем до формата А3; полностью запечатанную форму не делаем.',
  },
  {
    q: 'Как стирать форму с номерами?',
    a: 'Первую стирку — не раньше чем через сутки. Стирайте навыворот при 30–40 °C, без отбеливателя, гладьте с изнанки и не сушите в барабанной сушилке.',
  },
  {
    q: 'Работаете со школами и организациями?',
    a: 'Да. Договор, счёт без НДС, оплата и после выполнения, закрывающие документы — акт, накладная или УПД.',
  },
];

export const sport: GarmentPage = {
  slug: '/pechat-na-sportivnoy-forme',
  title: 'Печать на спортивной форме в Калининграде — номера и фамилии | Мастерская сувениров',
  description:
    'Номера, фамилии и эмблемы на спортивную форму в Калининграде: футбол, баскетбол, волейбол, хоккей, школьные и корпоративные команды. На вашей форме, на наших футболках или подберём форму. От 1 шт.',
  h1: 'Печать на спортивной форме в Калининграде',
  accent: 'от 1 штуки',
  crumbs: [
    { href: '/', label: 'Главная' },
    { href: '/pechat-na-odezhde', label: 'Печать на одежде' },
    { href: '/pechat-na-sportivnoy-forme', label: 'Спортивная форма' },
  ],
  serviceName: 'Печать на спортивной форме',
  hero: { priceLabel: 'Печать на спортивной форме' },
  calc: {
    category: 'textile',
    // spec 2026-11-16-workwear-sport: the team's own kit (only the print), our sublimation and cotton T-shirts
    tiles: [
      { id: 'own', label: 'Своя форма', product: 'own-item', own: true },
      { id: 'sub', label: 'Футболка для сублимации', product: 'tshirt-sub' },
      { id: 'cotton', label: 'Футболка хлопковая', product: 'tshirt-unisex' },
    ],
    lead: 'Печать на вашей форме или наши футболки с печатью: номер с фамилией на спину, эмблема на грудь, количество — цена пересчитается сразу. Если форму нужно подобрать, посчитаем её отдельно.',
  },
  presets,
  care,
  extra: [
    {
      id: 'places',
      title: 'Что наносим',
      icon: 'scan',
      sub: 'Номер, фамилия, эмблема и номер на шортах — до 5 принтов на одной вещи, каждый до А3',
      cards: [
        {
          title: 'Номер на спине',
          tag: 'главное',
          rows: [{ label: 'Размер', value: 'обычно А4 (21 × 28 см), крупный — до А3 (28 × 38 см)' }],
          text: 'Большой номер, который видно с трибуны и судье.',
        },
        {
          title: 'Фамилия над номером',
          tag: 'по списку',
          rows: [{ label: 'Размер', value: 'полоса над номером' }],
          text: 'У каждого игрока своя фамилия — пришлите список, ничего не перепутаем. Фамилия и номер на спине — это один принт.',
        },
        {
          title: 'Эмблема и номер спереди',
          tag: 'грудь',
          rows: [{ label: 'Размер', value: 'обычно А6 (10 × 15 см) и меньше' }],
          text: 'Эмблема клуба, школы или компании, маленький номер, надпись спонсора.',
        },
        {
          title: 'Номер на шортах',
          tag: 'комплект',
          rows: [{ label: 'Размер', value: 'небольшой, обычно А6 и меньше' }],
          text: 'Номер на штанине — комплект выглядит законченным.',
        },
      ],
    },
    {
      id: 'roster',
      title: 'Список команды',
      icon: 'file-text',
      sub: 'Фамилия, номер и размер для каждого игрока — таблицей или просто сообщением',
      cards: [
        {
          title: 'Пример списка',
          points: ['ИВАНОВ — 10 — L', 'ПЕТРОВ — 23 — M', 'СМИРНОВА — 5 — S', 'КУЗНЕЦОВ — 9 — XL'],
          text: 'Разные фамилии и номера — без доплаты. Подготовим макет на всю команду и напечатаем всё по списку.',
        },
      ],
    },
    {
      id: 'ways',
      title: 'Своя форма или подберём',
      icon: 'building',
      sub: 'Печатаем на вашей форме или подбираем и заказываем под команду',
      cards: [
        {
          title: 'Печатаем на вашей форме',
          tag: 'ваша форма',
          text: 'Привозите форму — платите только за печать, по прайсу. Если сомневаетесь в ткани, сначала сделаем пробу.',
          points: ['Только печать — цена в калькуляторе', `Каждый следующий принт — на ${extraOff}% дешевле`, 'Разные фамилии и номера — без доплаты'],
        },
        {
          title: 'Подберём и закажем форму',
          tag: 'под ключ',
          text: `Нет формы — подберём и закажем от 10 штук. Срок зависит от наличия в Калининграде: если нужная форма есть, делаем всё за 1–2 дня. Можно и наши футболки: хлопковые — с 1 шт, для сублимации — от ${sub.qty.min} шт.`,
          points: ['От 10 штук', 'Если есть в наличии — 1–2 дня', 'Цену формы назовём после подбора'],
        },
      ],
    },
    {
      id: 'tech',
      title: 'DTF или сублимация',
      icon: 'droplets',
      sub: 'DTF — на любой форме, сублимация — только на светлой синтетике',
      cards: [
        {
          title: 'DTF-печать',
          tag: 'на любой форме',
          text: 'Подходит для любой формы: хлопок и синтетика, светлая и тёмная ткань. Номер ложится плотной яркой плёнкой с чёткими краями. Печатаем на вашей форме или на наших футболках.',
          points: ['Любой цвет формы', 'Хлопок и синтетика', 'От одной вещи'],
        },
        {
          title: 'Сублимация',
          tag: 'светлая синтетика',
          text: 'Краска впитывается в волокна — принт не чувствуется на ткани и не трескается. Только для светлой синтетики; печатаем до формата А3, не на всё изделие.',
          points: ['Принт не чувствуется', 'Только светлая синтетика', `Наши футболки — от ${sub.qty.min} шт`],
        },
      ],
    },
  ],
  worksTag: 'sport',
  reviewWords: ['форм', 'команд', 'номер'],
  faqSlug: '/pechat-na-sportivnoy-forme',
  faq,
  prices: {
    title: 'Цена печати',
    accent: 'на форме',
    lead: 'На вашей форме цена указана за одну вещь — только печать; на наших футболках — вместе с футболкой. Чем больше тираж, тем дешевле каждый принт.',
    products: [
      { id: 'own-item', title: 'Печать на вашей форме' },
      { id: 'tshirt-sub', title: 'Футболка для сублимации' },
      { id: 'tshirt-unisex', title: 'Футболка хлопковая' },
    ],
    rules: [
      { icon: 'layers', text: `До 5 принтов на одной вещи, каждый до А3. Каждый следующий принт — −${extraOff}%.` },
      { icon: 'shirt', text: 'Фамилия и номер на спине — один принт. Разные фамилии и номера — без доплаты.' },
      { icon: 'building', text: 'На вашей форме и на хлопковых футболках больше 50 шт — индивидуально.' },
    ],
  },
  heads: {
    // short accent: a longer one is one unbreakable piece and overflows a 360px screen
    details: 'о форме',
    worksLead: 'Настоящая форма и награды наших клиентов',
  },
  images: {
    hero: 'sport-hero',
    heroMobile: 'sport-hero-mobile',
    alt: 'Рыжий кот в футбольной форме с мячом',
    label: 'кот в футбольной форме',
  },
};
