# Карта адресов старого сайта

Сформировано скриптом `scripts/audit/build-seo-docs.mjs` 12.11.2026 по сборке старого сайта (репозиторий msuvenirov2.0, ветка main, коммит 462bcf0) — вручную не править. Исходные данные: `docs/audit-data/pages.json`.

Основной домен в разметке: `https://msuvenirov.ru`. Адреса без `.html` и без слэша в конце (сервер отдаёт файл `<адрес>.html`). Тестовая копия `infecto2014-ai.github.io/msuvenirov2.0/` — те же страницы с префиксом `/msuvenirov2.0`, закрыта от индексации.

Всего HTML-страниц в сборке: **40**. В sitemap.xml: **33**. Открыты для индексации (нет noindex, canonical на себя): **34**.

## 1. Все страницы

| Адрес | Тип | Заголовок H1 | В sitemap | Индексация | Canonical | Входящих ссылок (страниц) | Исходный файл |
|---|---|---|---|---|---|---|---|
| `/` | Главная | Печать на одежде и сувенирах в Калининграде | да | открыта | `/` | 37 | `src/pages/index.astro` |
| `/404` | Страница ошибки 404 | Эта страница не напечаталась | нет | закрыта (noindex, follow) | `/404` | 0 | `src/pages/404.astro` |
| `/admin` | Панель владельца (чат) | — | нет | закрыта (noindex, nofollow) | — | 0 | `src/pages/admin.astro` |
| `/breloki` | Услуга / изделие | Брелоки на заказ в Калининграде | да | открыта | `/breloki` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/card` | Электронная визитка (служебная) | — | нет | закрыта (noindex, follow) | `/card` | 0 | `src/pages/card.astro` |
| `/dtf-pechat` | Услуга / изделие | DTF и сублимация без нанесения в Калининграде | да | открыта | `/dtf-pechat` | 36 | `src/pages/dtf-pechat.astro` |
| `/faq` | Вопросы и ответы | Вопросы и ответы | да | открыта | `/faq` | 36 | `src/pages/faq.astro` |
| `/fotopodarki` | Услуга / изделие | Фотоподарки в Калининграде | да | открыта | `/fotopodarki` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/kalendari` | Услуга / изделие | Печать календарей в Калининграде | да | открыта | `/kalendari` | 36 | `src/pages/kalendari.astro` |
| `/kontakty` | Контакты | Контакты | да | открыта | `/kontakty` | 36 | `src/pages/kontakty.astro` |
| `/korporativnym-klientam` | Раздел для компаний (B2B) | Корпоративный мерч и брендирование продукции в Калининграде | да | открыта | `/korporativnym-klientam` | 37 | `src/pages/korporativnym-klientam.astro` |
| `/kp` | Коммерческое предложение (страница для PDF) | Корпоративный мерч и брендирование продукции | нет | закрыта (noindex, follow) | `/kp` | 0 | `src/pages/kp.astro` |
| `/magnity` | Услуга / изделие | Магниты на заказ в Калининграде | да | открыта | `/magnity` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/mug-print` | Старый адрес (дубль кружек) | Печать на кружках в Калининграде | нет | дубль → canonical | `/pechat-na-kruzhkah` | 0 | `src/pages/mug-print.astro` |
| `/nakleyki` | Услуга / изделие | Стикеры на заказ в Калининграде | да | открыта | `/nakleyki` | 36 | `src/pages/nakleyki.astro` |
| `/o-nas` | О мастерской | О Мастерской сувениров | да | открыта | `/o-nas` | 36 | `src/pages/o-nas.astro` |
| `/otzyvy` | Отзывы | Отзывы клиентов | да | открыта | `/otzyvy` | 36 | `src/pages/otzyvy.astro` |
| `/pechat_na_tkani` | Старый адрес (дубль футболок) | Печать на футболках в Калининграде | нет | дубль → canonical | `/pechat-na-futbolkah` | 0 | `src/pages/pechat_na_tkani.astro` |
| `/pechat-na-futbolkah` | Услуга / изделие | Печать на футболках в Калининграде | да | открыта | `/pechat-na-futbolkah` | 36 | `src/pages/pechat-na-futbolkah.astro` |
| `/pechat-na-hudi` | Услуга / изделие | Печать на худи в Калининграде | да | открыта | `/pechat-na-hudi` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/pechat-na-kepkah` | Услуга / изделие | Печать на кепках и бейсболках в Калининграде | да | открыта | `/pechat-na-kepkah` | 36 | `src/pages/pechat-na-kepkah.astro` |
| `/pechat-na-kruzhkah` | Услуга / изделие | Печать на кружках в Калининграде | да | открыта | `/pechat-na-kruzhkah` | 36 | `src/pages/pechat-na-kruzhkah.astro` |
| `/pechat-na-odezhde` | Услуга — хаб одежды | Печать на одежде в Калининграде | да | открыта | `/pechat-na-odezhde` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/pechat-na-shopperah` | Услуга / изделие | Печать на шопперах в Калининграде | да | открыта | `/pechat-na-shopperah` | 36 | `src/pages/pechat-na-shopperah.astro` |
| `/pechat-na-specodezhde` | Услуга / изделие | Печать на спецодежде и униформе в Калининграде | да | открыта | `/pechat-na-specodezhde` | 36 | `src/pages/pechat-na-specodezhde.astro` |
| `/pechat-na-sportivnoy-forme` | Услуга / изделие | Печать на спортивной форме в Калининграде | да | открыта | `/pechat-na-sportivnoy-forme` | 36 | `src/pages/pechat-na-sportivnoy-forme.astro` |
| `/poligrafiya` | Услуга / изделие | Полиграфия в Калининграде | да | открыта | `/poligrafiya` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/portfolio` | Портфолио | Наши работы | да | открыта | `/portfolio` | 37 | `src/pages/portfolio.astro` |
| `/price` | Прайс + калькулятор | Цены и калькулятор | да | открыта | `/price` | 37 | `src/pages/price.astro` |
| `/privacy-policy` | Политика конфиденциальности | Политика конфиденциальности | да | открыта | `/privacy-policy` | 38 | `src/pages/privacy-policy.astro` |
| `/public-offer` | Публичная оферта | Публичная оферта | да | открыта | `/public-offer` | 36 | `src/pages/public-offer.astro` |
| `/shirokoformatnaya-pechat` | Услуга / изделие | Широкоформатная печать в Калининграде | да | открыта | `/shirokoformatnaya-pechat` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/stati` | Список статей | Идеи подарков и советы по печати | да | открыта | `/stati` | 36 | `src/pages/stati/index.astro` |
| `/stati/novogodnie-podarki` | Статья | Что подарить на Новый год: 17 идей подарков с фото и логотипом | да | открыта | `/stati/novogodnie-podarki` | 2 | `src/pages/stati/novogodnie-podarki.astro` |
| `/sublimacionnaya-pechat` | Услуга / изделие | Сублимационная печать в Калининграде | да | открыта | `/sublimacionnaya-pechat` | 36 | `src/pages/sublimacionnaya-pechat.astro` |
| `/trebovaniya-k-maketam` | Требования к макетам | Требования к макетам | да | открыта | `/trebovaniya-k-maketam` | 36 | `src/pages/trebovaniya-k-maketam.astro` |
| `/uslugi` | Список услуг | Услуги мастерской | да | открыта | `/uslugi` | 20 | `src/pages/uslugi.astro` |
| `/vizitki` | Услуга / изделие | Печать визиток в Калининграде | да | открыта | `/vizitki` | 36 | `src/pages/[slug].astro (данные — src/data/services.ts)` |
| `/yandex_6ce0ad5c2373fb26` | Файл подтверждения Яндекс Вебмастера | — | нет | — | — | 0 | `public/yandex_6ce0ad5c2373fb26.html` |
| `/znachki` | Услуга / изделие | Значки на заказ в Калининграде | да | открыта | `/znachki` | 36 | `src/pages/znachki.astro` |

## 2. Страницы вне sitemap

- `/404` — Страница ошибки 404, robots: noindex, follow
- `/admin` — Панель владельца (чат), robots: noindex, nofollow
- `/card` — Электронная визитка (служебная), robots: noindex, follow
- `/kp` — Коммерческое предложение (страница для PDF), robots: noindex, follow
- `/mug-print` — Старый адрес (дубль кружек), canonical → `/pechat-na-kruzhkah`
- `/pechat_na_tkani` — Старый адрес (дубль футболок), canonical → `/pechat-na-futbolkah`
- `/yandex_6ce0ad5c2373fb26` — Файл подтверждения Яндекс Вебмастера

## 3. Адреса из sitemap, которых нет среди страниц

Нет — все адреса sitemap существуют.

## 4. Переадресации и служебные адреса (из `docs/nginx-seo.md` и `robots.txt` старого сайта)

| Откуда | Куда / что | Источник |
|---|---|---|
| `/pechat_na_tkani` | 301 → `/pechat-na-futbolkah` (в сборке лежит и HTML-дубль с canonical на новый адрес) | docs/nginx-seo.md, src/pages/pechat_na_tkani.astro |
| `/mug-print` | 301 → `/pechat-na-kruzhkah` (аналогично) | docs/nginx-seo.md, src/pages/mug-print.astro |
| `/index.html` | 301 → `/` | docs/nginx-seo.md |
| `/<страница>.html` | 301 → `/<страница>` | docs/nginx-seo.md |
| `/<страница>/` | 301 → `/<страница>` | docs/nginx-seo.md |
| неизвестный адрес | код 404 + страница `404.html` | docs/nginx-seo.md |
| `/admin`, `/api/` | закрыты в robots.txt | public/robots.txt |
| `http://`, `www.` | переадресация на `https://msuvenirov.ru` (сказано, что сохранена из текущего конфига сервера; сам конфиг — `deploy/nginx/`) | docs/nginx-seo.md |

Фактические ответы рабочего сервера msuvenirov.ru в этом аудите НЕ проверялись (сайт из среды недоступен; рабочий сайт сейчас публикуется из другого, старого репозитория).

## 5. Параметры адреса и якоря

- `?calc=<категория>:<изделие>` — открывает калькулятор с нужным изделием (пример в коде: `/dtf-pechat?calc=transfers:sub-sheet`); в robots.txt параметр `calc` перечислен в `Clean-param` для Яндекса вместе с utm-метками.
- Якоря, встречающиеся в ссылках: `#calc`.

## 6. Файлы, доступные по прямым адресам

- `/robots.txt` — 0 КБ
- `/sitemap.xml` — 2 КБ
- `/llms.txt` — 3 КБ
- `/kp-msuvenirov.pdf` — 4195 КБ
- `/og-image.jpg` — 57 КБ
- `/site.webmanifest` — 0 КБ
- `/admin.webmanifest` — 1 КБ
- `/sw.js` — 1 КБ
- `/admin-sw.js` — 2 КБ
- `/favicon.ico` — 7 КБ
- `/favicon.svg` — 4 КБ
- `/favicon-192.png` — 9 КБ
- `/favicon-512.png` — 29 КБ

## 7. Внешние ссылки (уникальные по сайту)

- https://2gis.ru/kaliningrad/firm/70000001042531447/tab/reviews — на 17 стр.
- https://max.ru/u/f9LHodD0cOLo7HDSJw672fSH82yru_atZ9KDVODSf_2mghJHg1xe7H2qOC8 — на 37 стр.
- https://t.me/msuvenirov39zakaz — на 37 стр.
- https://vk.com/msuvenirov39 — на 37 стр.
- https://www.avito.ru/brands/i75765968/all/predlozheniya_uslug — на 17 стр.
- https://yandex.ru/maps/org/105530576058 — на 4 стр.
- https://yandex.ru/maps/org/105530576058/reviews/ — на 17 стр.
