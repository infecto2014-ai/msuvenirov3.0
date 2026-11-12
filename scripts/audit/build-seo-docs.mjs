// Аудит: pages.json + sitemap.xml старого сайта -> docs/URL_MAP.md и docs/SEO_BASELINE.md. Только чтение старого сайта.
// Запуск: node scripts/audit/build-seo-docs.mjs /home/user/msuvenirov2.0
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
const old = process.argv[2];
const pages = JSON.parse(readFileSync('docs/audit-data/pages.json', 'utf8'));
const sitemap = [...readFileSync(`${old}/dist/sitemap.xml`, 'utf8').matchAll(/<loc>([^<]+)/g)].map((m) => m[1].replace('https://msuvenirov.ru', '') || '/');
const inMap = new Set(sitemap);
const esc = (s) => String(s ?? '—').replace(/\|/g, '\\|');
const src = (u) => { if (u === '/') return 'src/pages/index.astro'; const f = `src/pages${u}.astro`; if (existsSync(`${old}/${f}`)) return f; if (existsSync(`${old}/src/pages${u}/index.astro`)) return `src/pages${u}/index.astro`; if (u.startsWith('/yandex_')) return 'public/' + u.slice(1) + '.html'; return 'src/pages/[slug].astro (данные — src/data/services.ts)'; };
const TYPE = { '/': 'Главная', '/price': 'Прайс + калькулятор', '/uslugi': 'Список услуг', '/portfolio': 'Портфолио', '/otzyvy': 'Отзывы', '/kontakty': 'Контакты', '/o-nas': 'О мастерской', '/faq': 'Вопросы и ответы', '/trebovaniya-k-maketam': 'Требования к макетам', '/public-offer': 'Публичная оферта', '/privacy-policy': 'Политика конфиденциальности', '/stati': 'Список статей', '/stati/novogodnie-podarki': 'Статья', '/korporativnym-klientam': 'Раздел для компаний (B2B)', '/kp': 'Коммерческое предложение (страница для PDF)', '/card': 'Электронная визитка (служебная)', '/admin': 'Панель владельца (чат)', '/404': 'Страница ошибки 404', '/mug-print': 'Старый адрес (дубль кружек)', '/pechat_na_tkani': 'Старый адрес (дубль футболок)', '/pechat-na-odezhde': 'Услуга — хаб одежды' };
const type = (p) => TYPE[p.url] ?? (p.url.startsWith('/yandex_') ? 'Файл подтверждения Яндекс Вебмастера' : 'Услуга / изделие');
const canonPath = (p) => p.canonical ? p.canonical.replace('https://msuvenirov.ru', '') || '/' : null;
const indexable = (p) => !/noindex/.test(p.robots ?? '') && (!canonPath(p) || canonPath(p) === p.url);
const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));
const date = '12.11.2026';

// ---------- URL_MAP
let U = [`# Карта адресов старого сайта`, '',
`Сформировано скриптом \`scripts/audit/build-seo-docs.mjs\` ${date} по сборке старого сайта (репозиторий msuvenirov2.0, ветка main, коммит 462bcf0) — вручную не править. Исходные данные: \`docs/audit-data/pages.json\`.`, '',
`Основной домен в разметке: \`https://msuvenirov.ru\`. Адреса без \`.html\` и без слэша в конце (сервер отдаёт файл \`<адрес>.html\`). Тестовая копия \`infecto2014-ai.github.io/msuvenirov2.0/\` — те же страницы с префиксом \`/msuvenirov2.0\`, закрыта от индексации.`, '',
`Всего HTML-страниц в сборке: **${pages.length}**. В sitemap.xml: **${sitemap.length}**. Открыты для индексации (нет noindex, canonical на себя): **${pages.filter(indexable).length}**.`, '',
'## 1. Все страницы', '',
'| Адрес | Тип | Заголовок H1 | В sitemap | Индексация | Canonical | Входящих ссылок (страниц) | Исходный файл |', '|---|---|---|---|---|---|---|---|'];
for (const p of sorted) U.push(`| \`${p.url}\` | ${type(p)} | ${esc(p.h1[0])} | ${inMap.has(p.url) ? 'да' : 'нет'} | ${/noindex/.test(p.robots ?? '') ? 'закрыта (' + p.robots + ')' : canonPath(p) && canonPath(p) !== p.url ? 'дубль → canonical' : p.title ? 'открыта' : '—'} | ${canonPath(p) ? '`' + canonPath(p) + '`' : '—'} | ${p.inboundCount} | \`${src(p.url)}\` |`);
U.push('', '## 2. Страницы вне sitemap', '');
for (const p of sorted.filter((p) => !inMap.has(p.url))) U.push(`- \`${p.url}\` — ${type(p)}${p.robots ? ', robots: ' + p.robots : ''}${canonPath(p) && canonPath(p) !== p.url ? ', canonical → `' + canonPath(p) + '`' : ''}`);
U.push('', '## 3. Адреса из sitemap, которых нет среди страниц', '', sitemap.filter((u) => !pages.some((p) => p.url === u)).map((u) => '- `' + u + '`').join('\n') || 'Нет — все адреса sitemap существуют.');
U.push('', '## 4. Переадресации и служебные адреса (из `docs/nginx-seo.md` и `robots.txt` старого сайта)', '',
'| Откуда | Куда / что | Источник |', '|---|---|---|',
'| `/pechat_na_tkani` | 301 → `/pechat-na-futbolkah` (в сборке лежит и HTML-дубль с canonical на новый адрес) | docs/nginx-seo.md, src/pages/pechat_na_tkani.astro |',
'| `/mug-print` | 301 → `/pechat-na-kruzhkah` (аналогично) | docs/nginx-seo.md, src/pages/mug-print.astro |',
'| `/index.html` | 301 → `/` | docs/nginx-seo.md |', '| `/<страница>.html` | 301 → `/<страница>` | docs/nginx-seo.md |', '| `/<страница>/` | 301 → `/<страница>` | docs/nginx-seo.md |',
'| неизвестный адрес | код 404 + страница `404.html` | docs/nginx-seo.md |', '| `/admin`, `/api/` | закрыты в robots.txt | public/robots.txt |',
'| `http://`, `www.` | переадресация на `https://msuvenirov.ru` (сказано, что сохранена из текущего конфига сервера; сам конфиг — `deploy/nginx/`) | docs/nginx-seo.md |', '',
'Фактические ответы рабочего сервера msuvenirov.ru в этом аудите НЕ проверялись (сайт из среды недоступен; рабочий сайт сейчас публикуется из другого, старого репозитория).', '',
'## 5. Параметры адреса и якоря', '',
'- `?calc=<категория>:<изделие>` — открывает калькулятор с нужным изделием (пример в коде: `/dtf-pechat?calc=transfers:sub-sheet`); в robots.txt параметр `calc` перечислен в `Clean-param` для Яндекса вместе с utm-метками.',
`- Якоря, встречающиеся в ссылках: ${[...new Set(pages.flatMap((p) => p.internal.filter((h) => h.includes('#')).map((h) => h.slice(h.indexOf('#')))))].sort().map((a) => '`' + a + '`').join(', ') || '—'}.`, '',
'## 6. Файлы, доступные по прямым адресам', '');
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'kp-msuvenirov.pdf', 'og-image.jpg', 'site.webmanifest', 'admin.webmanifest', 'sw.js', 'admin-sw.js', 'favicon.ico', 'favicon.svg', 'favicon-192.png', 'favicon-512.png'])
  U.push(`- \`/${f}\` — ${existsSync(`${old}/dist/${f}`) ? Math.round(statSync(`${old}/dist/${f}`).size / 1024) + ' КБ' : 'нет в сборке'}`);
U.push('', '## 7. Внешние ссылки (уникальные по сайту)', '');
const ext = {}; for (const p of pages) for (const e of p.external) (ext[e.split('?')[0]] ??= []).push(p.url);
for (const [e, where] of Object.entries(ext).sort()) U.push(`- ${e} — на ${where.length} стр.`);
writeFileSync('docs/URL_MAP.md', U.join('\n') + '\n');

// ---------- SEO_BASELINE
const idx = sorted.filter(indexable).filter((p) => p.title);
const tl = idx.map((p) => p.title.length), dl = idx.map((p) => (p.description ?? '').length);
const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
const dup = (key) => Object.entries(idx.reduce((m, p) => ((m[p[key]] ??= []).push(p.url), m), {})).filter(([, v]) => v.length > 1);
const ldTypes = {}; for (const p of pages) for (const t of new Set(p.jsonld)) (ldTypes[t] ??= []).push(p.url);
let S = ['# Исходная SEO-структура старого сайта', '',
`Сформировано скриптом \`scripts/audit/build-seo-docs.mjs\` ${date} по сборке старого сайта (msuvenirov2.0, main, 462bcf0) — таблицы вручную не править. Это снимок «как есть», без рекомендаций: SEO-стратегию нового сайта готовит отдельный этап.`, '',
'## Что НЕ проверялось (нет данных)', '',
'- Позиции в поиске, трафик, запросы, данные Яндекс Вебмастера / Метрики / Google Search Console — доступа нет.',
'- Какие страницы реально проиндексированы и ответы рабочего сервера msuvenirov.ru (коды, редиректы, скорость) — сайт из среды недоступен. Важно: по документам старого проекта рабочий сайт сейчас публикуется из другого репозитория (`neon-souvenir-studio`), а аудируемая версия 2.0 — тестовая копия; её адреса в поиске ещё не работали.',
'- Внешние ссылки на сайт, карточки в Яндекс Картах / 2ГИС / Авито — не проверялись.',
'- Скорость загрузки (Core Web Vitals) на реальных устройствах — не измерялась; ниже только вес файлов.',
'- Семантическое ядро: в старом репозитории есть `docs/АУДИТ_И_ПЛАН.md` (аудит прежнего сайта, конкуренты, SEO-план) — в этот документ не переносился, использовать как источник на этапе SEO-стратегии.', '',
'## 1. Общие технические параметры', '',
'| Параметр | Значение |', '|---|---|',
'| Домен в canonical / sitemap / разметке | `https://msuvenirov.ru` (без www) |',
`| Язык страницы (\`<html lang>\`) | ${[...new Set(pages.map((p) => p.lang))].join(', ')} |`,
`| Viewport | \`${pages[2].mobile.viewport}\` |`,
'| Формат адресов | латиница, транслит, дефисы; без `.html`, без слэша в конце; вложенность только у статей (`/stati/<статья>`) |',
'| Рендеринг | статический HTML (Astro), весь текст, цены и таблицы есть в HTML без выполнения скриптов; интерактив — отдельными островами |',
`| Страниц в sitemap.xml | ${sitemap.length}; только \`<loc>\`, без lastmod/priority |`,
'| robots.txt | `Allow: /`, закрыты `/admin` и `/api/`; для Яндекса `Clean-param` (utm-метки, yclid, gclid, fbclid, calc и др.); ссылка на sitemap |',
'| llms.txt | есть (`/llms.txt`): краткое описание мастерской и список разделов для ИИ-поисковиков |',
'| Open Graph | og:type, og:locale ru_RU, og:site_name, og:title, og:description, og:url, og:image на каждой странице; twitter:card summary_large_image |',
'| Иконки / манифест | favicon.ico, favicon.svg, apple-touch-icon, site.webmanifest; theme-color `#fffcf5` |',
'| Подтверждение Яндекс Вебмастера | файл `/yandex_6ce0ad5c2373fb26.html` |',
'| Аналитика | в сборке есть скрипт Яндекс Метрики (`_astro/metrika.*.js`); подробности — `FUNCTIONAL_MAP.md` |',
'| hreflang, AMP, турбо-страницы | в HTML не найдено |',
`| Битые внутренние ссылки | ${pages.reduce((n, p) => n + p.brokenInternal.length, 0)} |`,
`| Горизонтальная прокрутка на 390 px | ${pages.filter((p) => p.mobile.overflowX).length} страниц |`,
`| Ошибки JavaScript при загрузке | ${pages.filter((p) => p.jsErrors.length).length} страниц |`, '',
'## 2. Метаданные по страницам', '',
`Открытых для индексации страниц: ${idx.length}. Title: от ${Math.min(...tl)} до ${Math.max(...tl)} знаков, в среднем ${avg(tl)}. Description: от ${Math.min(...dl)} до ${Math.max(...dl)}, в среднем ${avg(dl)}. H1 на каждой странице: ${idx.every((p) => p.h1.length === 1) ? 'ровно один' : 'есть отклонения — см. таблицу'}.`, '',
`Повторяющиеся title среди открытых страниц: ${dup('title').length ? dup('title').map(([t, v]) => v.join(' = ')).join('; ') : 'нет'}. Повторяющиеся description: ${dup('description').length ? dup('description').map(([t, v]) => v.join(' = ')).join('; ') : 'нет'}.`, '',
'| Адрес | Title (знаков) | Description (знаков) | H1 |', '|---|---|---|---|'];
for (const p of sorted.filter((p) => p.title)) S.push(`| \`${p.url}\`${indexable(p) ? '' : ' ⛔'} | ${esc(p.title)} (${p.title.length}) | ${esc(p.description)} (${(p.description ?? '').length}) | ${esc(p.h1.join(' / '))} |`);
S.push('', '⛔ — страница закрыта от индексации или является дублем с canonical на другой адрес.', '',
'## 3. Структура заголовков H2 по страницам', '');
for (const p of sorted.filter((p) => p.title && p.h2.length)) S.push(`**\`${p.url}\`** (H2: ${p.h2.length}, H3: ${p.h3count}, слов в основном блоке: ${p.words})`, '', ...p.h2.map((h, i) => `${i + 1}. ${h}`), '');
S.push('## 4. Структурированные данные (JSON-LD)', '', '| Тип schema.org | Страниц | Где |', '|---|---|---|');
for (const [t, v] of Object.entries(ldTypes).sort((a, b) => b[1].length - a[1].length)) S.push(`| ${t} | ${v.length} | ${v.length > 12 ? 'почти все страницы' : v.map((u) => '`' + u + '`').join(', ')} |`);
S.push('', 'Содержимое (по странице `/pechat-na-kruzhkah`, типично для страниц услуг):',
'- **LocalBusiness + Store** (`@id …/#business`): название, url, image, logo, телефон, e-mail, priceRange «₽₽», paymentAccepted, валюта RUB, foundingDate 2019, адрес (ул. Генерала Челнокова, 11, стр. 1, ТЦ «Экватор», 2 этаж, Калининград), координаты, часы работы. Рейтинга (AggregateRating) нет — так решил владелец.',
'- **WebSite**: название, язык ru-RU, издатель → business.',
'- **BreadcrumbList**: Главная → Услуги → страница.',
'- **Service**: название, описание, areaServed Калининград, provider → business, offers = AggregateOffer (lowPrice из единого файла цен, offerCount, InStock).',
'- **FAQPage**: вопросы и ответы страницы.', '',
'## 5. Внутренняя перелинковка', '',
`Сквозные ссылки (шапка + подвал) дают каждой основной странице ${Math.max(...pages.map((p) => p.inboundCount))}–34 входящих. Страницы с малым числом входящих ссылок:`, '');
for (const p of sorted.filter((p) => p.title && p.inboundCount < 20)) S.push(`- \`${p.url}\` — ${p.inboundCount} ${canonPath(p) && canonPath(p) !== p.url ? '(дубль старого адреса)' : /noindex/.test(p.robots ?? '') ? '(закрыта от индексации)' : ''}`);
S.push('', '| Адрес | Внутренних ссылок на странице | Внешних | Входящих (страниц) | Хлебные крошки (JSON-LD) |', '|---|---|---|---|---|');
for (const p of sorted.filter((p) => p.title)) S.push(`| \`${p.url}\` | ${p.internal.length} | ${p.external.length} | ${p.inboundCount} | ${p.jsonld.includes('BreadcrumbList') ? 'да' : 'нет'} |`);
S.push('', '## 6. Изображения', '', '| Адрес | Картинок `<img>` | Без атрибута alt | С пустым alt (декоративные) |', '|---|---|---|---|');
for (const p of sorted.filter((p) => p.title)) S.push(`| \`${p.url}\` | ${p.images} | ${p.imagesNoAlt} | ${p.imagesEmptyAlt} |`);
S.push('', `Итого по сайту: картинок ${pages.reduce((n, p) => n + p.images, 0)}, без alt — ${pages.reduce((n, p) => n + p.imagesNoAlt, 0)}, с пустым alt — ${pages.reduce((n, p) => n + p.imagesEmptyAlt, 0)}. Значительная часть графики — встроенные SVG-иллюстрации (в подсчёт \`<img>\` не входят).`, '',
'## 7. Объём текста', '', '| Адрес | Слов в основном блоке | Таблиц | Раскрывающихся блоков | Калькулятор |', '|---|---|---|---|---|');
for (const p of sorted.filter((p) => p.title)) S.push(`| \`${p.url}\` | ${p.words} | ${p.tables} | ${p.details} | ${p.islands.includes('Calculator') ? 'да' : '—'} |`);
writeFileSync('docs/SEO_BASELINE.md', S.join('\n') + '\n');
console.log('ok', U.length, S.length);
