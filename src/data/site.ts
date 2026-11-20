// Business facts (NAP), contacts and navigation — one place for the whole site.

export const site = {
  name: 'Мастерская сувениров',
  url: 'https://msuvenirov.ru',
  phone: '+7 (952) 114-23-50',
  phoneHref: 'tel:+79521142350',
  email: 'msuvenirov39@yandex.ru',
  address: {
    city: 'Калининград',
    street: 'ул. Генерала Челнокова, 9',
    place: 'ТЦ «Экватор», 2 этаж',
    region: 'Калининградская область',
    lat: 54.737514,
    lng: 20.487384,
  },
  hours: 'Ежедневно 10:00–20:00',
  hoursSchema: 'Mo-Su 10:00-20:00',
  founded: 2019,
  legal: {
    name: 'ИП Леднева Анна Сергеевна',
    ogrnip: '320392600008196',
    inn: '392301771670',
  },
  social: {
    telegram: 'https://t.me/msuvenirov39zakaz',
    max: 'https://max.ru/u/f9LHodD0cOLo7HDSJw672fSH82yru_atZ9KDVODSf_2mghJHg1xe7H2qOC8',
    vk: 'https://vk.com/msuvenirov39',
  },
  /** онлайн-конструктор принтов */
  constructorUrl: 'https://infecto2014-ai.github.io/konstruktor/',
  yandexMapsOrg: 'https://yandex.ru/maps/org/105530576058',
  twoGis: 'https://2gis.ru/kaliningrad/firm/70000001042531447/tab/reviews',
  avito: 'https://www.avito.ru/brands/i75765968/all/predlozheniya_uslug',
  /**
   * Ratings on review platforms — update by hand (checked by the owner 01.11.2026).
   * Shown as text with links; NOT put into AggregateRating markup (self-published ratings are not allowed there).
   */
  ratings: [
    { platform: 'Авито', rating: 5.0, count: 84, unit: 'отзыва', href: 'https://www.avito.ru/brands/i75765968/all/predlozheniya_uslug' },
    { platform: 'Яндекс Карты', rating: 4.9, count: 22, unit: 'оценки', href: 'https://yandex.ru/maps/org/105530576058/reviews/' },
    { platform: '2ГИС', rating: 4.6, count: 31, unit: 'оценка', href: 'https://2gis.ru/kaliningrad/firm/70000001042531447/tab/reviews' },
  ],
  metrikaId: 108361089,
} as const;

export interface NavLink {
  href: string;
  label: string;
  /** for pages that have no services.ts entry (own .astro page): card picture and price on /uslugi */
  image?: string;
  calc?: { category: string; product: string };
  /** nested pages shown as a collapsible list under this link in the menu (owner, 06.11.2026: «Печать на одежде») */
  children?: NavLink[];
}

/** a group's links with the nested ones listed right after their parent (footer, /uslugi, active-page checks) */
export const flatLinks = (links: NavLink[]): NavLink[] => links.flatMap((l) => [l, ...(l.children ?? [])]);

/** Service landing pages grouped for the menu and footer. Must match src/data/services.ts slugs. */
export const serviceNav: { group: string; links: NavLink[] }[] = [
  {
    group: 'Одежда',
    links: [
      {
        href: '/pechat-na-odezhde',
        label: 'Печать на одежде',
        children: [
          { href: '/pechat-na-futbolkah', label: 'Футболки' },
          { href: '/pechat-na-hudi', label: 'Худи' },
          { href: '/pechat-na-shopperah', label: 'Шопперы' },
          { href: '/pechat-na-kepkah', label: 'Бейсболки' },
          { href: '/pechat-na-specodezhde', label: 'Спецодежда', image: '/portfolio/corporate-polo.webp', calc: { category: 'textile', product: 'own-item' } },
          { href: '/pechat-na-sportivnoy-forme', label: 'Спортивная форма', image: '/portfolio/sport-jersey.webp', calc: { category: 'textile', product: 'own-item' } },
        ],
      },
      { href: '/sublimacionnaya-pechat', label: 'Сублимационная печать', image: '/portfolio/sublimation-anime.webp', calc: { category: 'textile', product: 'sub-print' } },
      { href: '/dtf-pechat', label: 'DTF и сублимация без нанесения', image: '/img/showcase/tshirt.webp', calc: { category: 'transfers', product: 'sub-sheet' } },
    ],
  },
  {
    group: 'Подарки и сувениры',
    links: [
      { href: '/pechat-na-kruzhkah', label: 'Печать на кружках' },
      { href: '/znachki', label: 'Значки' },
      { href: '/breloki', label: 'Брелоки' },
      { href: '/magnity', label: 'Магниты' },
      { href: '/nakleyki', label: 'Стикеры' },
      { href: '/fotopodarki', label: 'Фотоподарки' },
    ],
  },
  {
    group: 'Полиграфия',
    links: [
      { href: '/vizitki', label: 'Визитки' },
      { href: '/poligrafiya', label: 'Листовки и блокноты' },
      { href: '/kalendari', label: 'Календари' },
      { href: '/shirokoformatnaya-pechat', label: 'Широкоформатная печать' },
    ],
  },
];

export const mainNav: NavLink[] = [
  { href: site.constructorUrl, label: 'Конструктор' },
  { href: '/price', label: 'Цены' },
  { href: '/korporativnym-klientam', label: 'Для бизнеса' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/o-nas', label: 'О нас' },
];

export const infoNav: NavLink[] = [
  { href: '/stati', label: 'Статьи' },
  { href: '/trebovaniya-k-maketam', label: 'Требования к макетам' },
  { href: '/faq', label: 'Вопросы и ответы' },
  { href: '/otzyvy', label: 'Отзывы' },
  { href: '/public-offer', label: 'Публичная оферта' },
  { href: '/privacy-policy', label: 'Политика конфиденциальности' },
];
