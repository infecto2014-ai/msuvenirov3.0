# Реестр лицензий и условий использования

Ведётся с 12.11.2026. Правила — `COMPONENT_REUSE_POLICY.md`. Подробные таблицы с лицензией, ссылкой на первоисточник и статусом по каждому ресурсу — в `DESIGN_RESOURCE_REGISTRY.md` (столбцы «Лицензия», «Коммерч.», «Атрибуция», «Статус проверки»). Это справка, не юридическая консультация.

## 1. Использовано в проекте

Сюда попадает каждый сторонний ресурс **до** добавления в проект.

| Название | Источник | Компонент / файл | Лицензия | Коммерч. | Атрибуция | Дата проверки | Изменения |
|---|---|---|---|---|---|---|---|
| Astro | github.com/withastro/astro | фреймворк (npm `astro`) | MIT | да | нет (сохранять текст лицензии в пакете) | 12.11.2026 (npm) | — |
| Preact, @astrojs/preact | github.com/preactjs/preact | острова (npm) | MIT | да | нет | 12.11.2026 (npm) | — |
| Rubik Variable | fontsource.org / Google Fonts | `@fontsource-variable/rubik` | OFL-1.1 | да | нет; нельзя продавать шрифт отдельно | 12.11.2026 (npm) | — |
| JetBrains Mono Variable | fontsource.org | `@fontsource-variable/jetbrains-mono` | OFL-1.1 | да | нет | 12.11.2026 (npm) | — |
| Caveat | fontsource.org | `@fontsource/caveat` (главная) | OFL-1.1 | да | нет | 12.11.2026 (npm) | — |
| Cormorant Garamond | fontsource.org | `@fontsource/cormorant-garamond` (главная) | OFL-1.1 | да | нет | 12.11.2026 (npm) | — |
| Скилл ui-ux-pro-max | github.com/nextlevelbuilder/ui-ux-pro-max-skill | `.claude/skills/ui-ux-pro-max/` | MIT | да | сохранён текст лицензии | 06.11.2026 (CLAUDE.md) | — |
| Скилл Hallmark | github.com/Nutlope/hallmark | `.claude/skills/hallmark/` | MIT | да | сохранён текст лицензии | 09.11.2026 (CLAUDE.md) | — |

### Скилы (установлены 12.11.2026 в `.claude/skills/`)

Лицензии прочитаны по файлам LICENSE в репозиториях 12.11.2026; тексты лицензий лежат в папке каждого скила.

| Скил | Источник (коммит, дата) | Что взято | Лицензия | Коммерч. | Атрибуция | Изменения |
|---|---|---|---|---|---|---|
| frontend-design | github.com/anthropics/skills, `skills/frontend-design` (2c5958e, 06.11.2026) | SKILL.md, LICENSE.txt | Apache-2.0 | да | сохранить текст лицензии | нет |
| impeccable 4.8.2 | github.com/pbakaus/impeccable, `.claude/skills/impeccable` (b4bff16, 11.11.2026) | скил целиком (инструкции, справочные файлы, скрипты), LICENSE, NOTICE.md | Apache-2.0 (часть справочных файлов — по мотивам MIT-проекта ehmo/platform-design-skills, см. NOTICE.md) | да | сохранить LICENSE и NOTICE | нет. Хуки не установлены; служебную программу-движок скил скачивает сам при запуске — не скачивалась |
| ui-ux-pro-max 2.15.0 | github.com/nextlevelbuilder/ui-ux-pro-max-skill, `.claude/skills/ui-ux-pro-max` (6ae86f6, 10.11.2026) | только основной скил; 6 соседних (banner-design, brand, design, design-system, slides, ui-styling) не взяты | MIT | да | сохранить текст лицензии | нет |
| web-design-guidelines 1.0.0 | github.com/vercel-labs/agent-skills (1a2c79d, 27.10.2026) + правила из github.com/vercel-labs/web-interface-guidelines (434b7f9) | SKILL.md, снимок правил `guidelines-snapshot.md`, LICENSE | MIT | да | сохранить текст лицензии | в SKILL.md добавлено указание брать правила из локального снимка, а не из сети |
| seo | github.com/affaan-m/everything-claude-code, `skills/seo` (d2ef268, 06.11.2026) | один файл SKILL.md + LICENSE; остальной набор (агенты, хуки, десятки скилов) не взят | MIT | да | сохранить текст лицензии | нет |
| ux-writing | github.com/content-designer/ux-writing-skill (98cacde, 26.05.2026) | SKILL.md, references, templates, examples, LICENSE; видео и архив не взяты | MIT | да | сохранить текст лицензии | нет |

Рассмотрено и не установлено: N1arko/redaktura-skills (редактура на русском) — лицензия не определена; скил Hallmark из старого репозитория — в список владельца не входил, по назначению пересекается с impeccable.

Изображения текущего сайта (не сторонние ресурсы, но учитываются по правилу о трёх видах фото):
- реальные фото работ и мастерской — `public/img/portfolio*` и др., от владельца;
- сгенерированные визуализации — первый экран (`hero-kaliningrad-*`), «Изделия и цены» (`public/img/products/*`, Gemini через AITUNNEL) — это демонстрационные изображения, не портфолио; в v3 при показе рядом с реальными работами обозначать честно;
- стоковых фото на сайте нет.

Для v3 записи появятся здесь по мере выбора библиотек.

## 2. Сводка по найденным ресурсам (12.11.2026)

**Бесплатно в коммерции без атрибуции (ПРОВЕРЕНО):**
шрифты на OFL (все из раздела 1; лицензию хранить в пакете), Lucide (ISC), Phosphor, Tabler, Heroicons (MIT), Material Symbols (Apache-2.0, уведомление при распространении), Simple Icons (CC0, но товарные знаки), astro-icon (MIT), три-js/model-viewer/OGL/css-doodle/geopattern (код), Iconify-наборы MIT/ISC/Apache/CC0. Проверено по первоисточнику 12.11.2026 (страницы лицензий на самих сайтах): unDraw (https://undraw.co/license: «You do not need to ask permission from or provide credit», коммерчески можно; запрещены наборы/перепродажа и обучение ИИ), Poly Haven (https://polyhaven.com/license: CC0, «You can use our assets for any purpose, including commercial work»), GSAP (см. ниже). Фото Unsplash, Pexels, Pixabay остаются по вторичным данным: их страницы лицензий закрыты проверкой «вы не робот» (см. ниже).

**Требуют атрибуции (ПРОВЕРЕНО по npm):**
Iconify: twemoji, streamline, solar, Font Awesome 6 (fa6-solid), pepicons-pop (CC BY 4.0), game-icons (CC BY 3.0). По памяти (НЕ ПРОВЕРЕНО): Storyset/Freepik, Icons8, Blush (free), Hero Patterns (CC BY), Transparent Textures.

**С ограничениями / не использовать без разрешения:**
- Логотипы брендов из Simple Icons и фото с чужими брендами: товарные знаки (Fonbet на сайте запрещён решением владельца).
- openmoji (CC BY-SA, copyleft).
- Remix Icon: нельзя как логотип/знак, нельзя перепродавать как набор.
- Fontshare (ITF Free Font License v2.0, проверено 12.11.2026 по https://www.fontshare.com/licenses/itf-ffl): коммерция и самохостинг для своего сайта разрешены («You may self-host the Font Software on your own servers… including through standard webfont technologies such as CSS @font-face»), атрибуция не нужна. Нельзя: изменять файлы («This includes modifying or replacing glyphs, subsetting, format conversion»), передавать файлы третьим лицам (дизайнерам, подрядчикам), открывать шрифт пользователям в конструкторах и редакторах («available as a selectable font for third-party users»). Кириллица НЕ ПРОВЕРЕНА (каталог идёт с закрытого сетью api.fontshare.com) — до проверки не использовать.
- SVG Repo, Sketchfab, Poly Pizza, мокапы: лицензия у каждого файла своя; «personal use only» возможен.
- Пакет `halftone` в npm без лицензии.

---
## Фото как принт на товарах: что разрешено
**Статус на 12.11.2026: первоисточники НЕ ПРОЧИТАНЫ.** unsplash.com/license и /terms отвечают 401 и показывают проверку Anubis («Checking your browser before accessing unsplash.com»); pexels.com/license, pexels.com/terms-of-service, pixabay.com/service/license-summary/ и pixabay.com/service/terms/ отдают страницу Cloudflare «Just a moment…». Обходить проверку не стали. Ниже — прежние ВТОРИЧНЫЕ данные (не цитаты со страниц лицензий), использовать как предупреждение, не как разрешение.
- Pixabay (ВТОРИЧНО, цитаты из ToS через поиск): merchandise разрешён только при изменении или вставке в новый дизайн; продажа в исходном виде («as a print, wallpaper, poster or on merchandise») запрещена, «filter, changing colors, resizing or cropping» изменением не считается; бренды, логотипы и товарные знаки на фото для товаров использовать нельзя.
- Pexels (ВТОРИЧНО): нельзя продавать «as-is»; фото с узнаваемыми товарными знаками нельзя использовать для товаров; прямая фраза про merch не подтверждена.
- Unsplash (ВТОРИЧНО): коммерция без атрибуции разрешена, но продавать контент «on its own» нельзя, нужны существенные изменения; сторонний сайт утверждает, что бесплатная лицензия не для мерча (мнение, не первоисточник). Unsplash+ (платный) заявляет более широкие права, текст не проверен.
**Практический вывод:** чужое стоковое фото без изменений на футболку или кружку на продажу не печатать. Печатать можно только материалы клиента, свои фото и CC0 (Poly Haven, пре-2019 Pixabay CC0, Open Peeps и т.п., после проверки). Исключение, проверенное по первоисточнику 12.11.2026: Poly Haven (CC0, https://polyhaven.com/license — «You can use our assets for any purpose, including commercial work… even in a product you sell»; это 3D, текстуры и HDRI, не фотографии людей). Для мерча из стока брать платные лицензии с явным правом на «physical products / merchandise» (например, Unsplash+; текст лицензии сначала прочитать), с model/property release. При сомнении писать в поддержку сервиса и сохранить ответ.

---

### Компоненты и анимации
- **MIT / ISC, коммерчески можно, атрибуция не нужна (проверено по LICENSE):** shadcn/ui, Magic UI (бесплатная часть), Motion Primitives, Motion, Lenis, AutoAnimate, Anime.js, Swup, Astro, Embla, Swiper, Splide, PhotoSwipe, GLightbox, lottie-web, dotLottie-плеер, Rive runtime, Atropos, vanilla-tilt, tsParticles, canvas-confetti (ISC), Floating UI, Rough Notation, Open Props, Splitting.js, Typed.js, Zag.js, Ark UI, Web Awesome (бесплатная часть), AstroWind, ScrewFast, Tabler, Lucide (ISC), Phosphor; Lit — BSD-3. Требование одно: сохранять текст лицензии/уведомление при копировании кода.
- **С особыми условиями:** React Bits — «MIT + Commons Clause» (проверено 12.11.2026 на reactbits.dev: «Free for personal and commercial work… do not sell, sublicense or redistribute the components themselves»); GSAP — бесплатная вся, включая SplitText и MorphSVG, но не MIT (Standard «No Charge», проверено 12.11.2026 по https://gsap.com/community/standard-license/): «at no charge in commercial or non-commercial apps, web sites… as long as end users are not charged a fee of any kind to use your product or gain access to any part of it»; запрещены «Competitive Products» (no-code конструкторы анимаций, конкурирующие с Webflow) и удаление брендинга GSAP; правообладатель Webflow вправе менять лицензию. Для обычного сайта мастерской подходит; платить за доступ к самому сайту пользователи не будут (толкование: заказ товара — не плата за доступ, при сомнении уточнить у gsap.com).
- **Платное — только с разрешения владельца:** Magic UI Pro, Aceternity UI Pro ($169, проверено), React Bits Pro (раздел есть, цена не прочитана), Web Awesome Pro, Motion+, редактор Rive, премиум LottieFiles, Unsplash+.
- **Aceternity UI (проверено 12.11.2026, https://ui.aceternity.com/pricing и /licence):** бесплатно 100+ компонентов; Pro — «1-Year License» $169 (обычная цена $249); «You can use Aceternity UI components in unlimited personal and commercial client projects. The only restriction is that you cannot resell or redistribute the components themselves as a competing template or component library.» Отдельного файла лицензии для бесплатной части нет. Magic UI: бесплатная часть MIT (репо, главная «150+ free and open-source»); условия Pro (pro.magicui.design) прочитать не удалось.
- **Лицензия не подтверждена — не использовать до проверки:** Animista, сайт uiverse.io (зеркало на GitHub — MIT), отдельные анимации LottieFiles (у каждой своя лицензия).

## 3. Что осталось проверить по первоисточнику

Прочитано по первоисточнику 12.11.2026 и убрано из списка: unDraw, Poly Haven, GSAP Standard License, Aceternity UI (бесплатная часть, цены и лицензия Pro), React Bits (лицензия), Fontshare (текст ITF FFL), Google Fonts (через README репозитория google/fonts).

Осталось не проверено:
- фото: лицензии Unsplash, Pexels, Pixabay (в т.ч. пункт о печати на товарах) и Unsplash+: их сайты закрыты проверкой «вы не робот» (Anubis, Cloudflare), обход не делали. Нужен человек в обычном браузере или иной доступ;
- шрифты: наличие кириллицы у Fontshare (каталог на api.fontshare.com закрыт сетью); страница fonts.google.com/faq пустая без скриптов;
- иллюстрации (кроме unDraw): Open Doodles, Open Peeps, Humaaans, Storyset, Blush, DrawKit, ManyPixels, SVG Repo, Icons8;
- 3D (кроме Poly Haven): Poly Pizza, Sketchfab, Spline, 3dicons, Kenney;
- текстуры и фоны: Hero Patterns, Pattern Monster, Haikei, SVG Backgrounds, Transparent Textures, fffuel, getwaves, BGJar;
- мокапы изделий: все источники;
- компоненты: условия Magic UI Pro (pro.magicui.design закрыт), React Bits Pro (цена и условия), Web Awesome Pro, Motion+.

До проверки эти ресурсы имеют статус «не использовать».
