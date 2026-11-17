import { site } from './site';
import { portfolio } from './portfolio';
import type { Faq } from './types';
import type { IconName } from '@/components/ui/Icon.astro';

// Business facts adapted from msuvenirov2.0/src/data/pages.ts (aboutPage).
// The old page contains an outdated street address; use site.ts for all contacts.
export const aboutFacts = [
  { value: String(site.founded), label: 'год открытия мастерской' },
  { value: '10+ лет', label: 'опыта команды в печати' },
  { value: 'От 1 шт', label: 'большинство изделий' },
];

export const aboutExamples = [
  { photo: '/portfolio/portfolio-25.webp', title: 'Для близких', text: 'Фото, любимая фраза или семейная шутка — подарок становится личным.', href: '/pechat-na-kruzhkah', link: 'Кружки с печатью', width: 378, height: 374 },
  { photo: '/portfolio/portfolio-20.webp', title: 'Для команды', text: 'Футболки с логотипом, мерч для события и сувениры для коллег.', href: '/pechat-na-futbolkah', link: 'Футболки с печатью', width: 378, height: 217 },
  { photo: '/portfolio/portfolio-7.webp', title: 'Для себя', text: 'Любимый город, рисунок или настроение — на вещи, которую хочется носить.', href: '/pechat-na-shopperah', link: 'Шопперы с печатью', width: 378, height: 468 },
].map(e => ({ ...e, work: portfolio.find(p => p.src === e.photo)! }));

export const aboutJourney = [
  { title: 'Приносите идею', text: 'Фотография, логотип, набросок или просто пожелание. Расскажите, для кого и к какой дате нужен заказ.' },
  { title: 'Выбираем основу', text: 'Подскажем изделие и технологию, обсудим тираж и стоимость. Можно принести свою вещь.' },
  { title: 'Согласуем макет', text: 'Покажем, как будет выглядеть печать. Подготовим или доработаем макет, учтём ваши пожелания.' },
  { title: 'Печатаем и выдаём', text: 'Изготавливаем заказ и проверяем результат. Готовые вещи можно забрать в нашей мастерской.' },
];

export const aboutValues: { icon: IconName; title: string; text: string }[] = [
  { icon: 'factory', title: 'Печатаем сами', text: 'Своя мастерская и своё оборудование. Здесь принимаем заказы, показываем образцы, печатаем и выдаём готовое.' },
  { icon: 'pencil', title: 'Помогаем с макетом', text: 'В большинстве случаев подготовка или доработка бесплатна. Сложные дизайнерские работы оцениваем заранее.' },
  { icon: 'clock', title: 'Срочно — без наценки', text: 'Если макет готов и есть свободная мощность, часто выполняем заказ в тот же день. Доплаты за срочность нет.' },
  { icon: 'shield-check', title: 'Отвечаем за результат', text: 'Подберём подходящую технологию и расскажем об особенностях. Брак по нашей вине переделаем бесплатно.' },
];

export const aboutTechnologies = [
  { title: 'DTF-печать', text: 'Футболки, худи, шопперы и кепки — ткани разных цветов и состава.', href: '/dtf-pechat' },
  { title: 'Сублимация', text: 'Кружки, фотоподарки и светлая синтетика, в том числе спортивная форма.', href: '/sublimacionnaya-pechat' },
  { title: 'УФ-печать', text: 'Твёрдые поверхности: пластик, акрил, цветные кружки.', href: '/pechat-na-kruzhkah' },
  { title: 'Шелкография', text: 'Для больших тиражей одежды и мерча.', href: '/pechat-na-odezhde' },
  { title: 'Цифровая полиграфия', text: 'Визитки, листовки, флаеры, блокноты и календари.', href: '/poligrafiya' },
  { title: 'Широкоформатная печать', text: 'Баннеры, самоклеящаяся и перфорированная плёнка, таблички на ПВХ.', href: '/shirokoformatnaya-pechat' },
];

export const aboutFaq: Faq[] = [
  { q: 'Сколько лет вы работаете?', a: `Мастерская работает с ${site.founded} года. Опыт команды в печати — более 10 лет.` },
  { q: 'Можно прийти и посмотреть образцы?', a: `Да, приходите: ${site.address.city}, ${site.address.street}, ${site.address.place}. Работаем ${site.hours.toLowerCase()}. Покажем образцы изделий и печати, поможем выбрать технологию.` },
  { q: 'Вы работаете с организациями?', a: 'Да. Выставляем счёт без НДС, предоставляем закрывающие документы, закрепляем менеджера и готовим коммерческое предложение по запросу.' },
  { q: 'Кто работает в мастерской — ИП или ООО?', a: `Мастерская работает как ${site.legal.name}.` },
];
