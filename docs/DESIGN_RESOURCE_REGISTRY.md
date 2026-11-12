# Каталог дизайнерских ресурсов и библиотек

Первое исследование — 12.11.2026 («Нулевой этап 2»). Документ живой: дополняется перед концепциями, прототипами и production. Правила использования — `COMPONENT_REUSE_POLICY.md`, лицензии и статусы — `RESOURCE_LICENSES.md`, референсы — `DESIGN_REFERENCE_BOARD.md`.

**Ничего из этого каталога пока не установлено.** Выбор делается после утверждения стека и дизайн-концепции v3.

## Статусы проверки
- **Проверено** — лицензия прочитана по первоисточнику (файл LICENSE на GitHub или реестр npm) 12.11.2026.
- **Вторично** — только по результатам поиска; перед использованием открыть страницу лицензии.
- **Не проверено** — по памяти; использовать нельзя до проверки.

Ограничение исследования: сеть среды пускала только к GitHub (raw) и npm, сайты самих сервисов (Unsplash, Pexels, Fontshare, GSAP, галереи и др.) были закрыты. Поэтому всё про фото, иллюстрации, 3D, текстуры и мокапы — «вторично» или «не проверено».

## Решение главного управляющего: что полезнее всего нашему сайту

Текущий стек — Astro 5 + Preact + обычный CSS (без React и Tailwind). Вывод: большие «модные» наборы (shadcn/ui, Magic UI, Aceternity, Motion Primitives, React Bits) написаны под React + Tailwind и на нашем стеке годятся только как **источник приёмов** (переносим идею в свой компонент), а не как готовый код. Менять ради них стек — решение уровня стратегии; принимается на этапе выбора технологии, не сейчас.

**Первая очередь (подходят к текущему стеку, MIT/ISC/OFL, проверено):**

| Задача сайта | Кандидат | Почему |
|---|---|---|
| Анимации появления, прокрутки, микровзаимодействия | **Motion** (vanilla `animate`/`inView`/`scroll`) | Лёгкий, без React, один движок на весь сайт |
| Диалоги, вкладки, аккордеон, меню (доступность) | **Zag.js** (`@zag-js/preact`) | Логика без стилей — вид полностью наш |
| Ленты работ и отзывов | **Embla Carousel** (запасной — Splide) | Лёгкая, без своих стилей |
| Просмотр фото работ на весь экран | **PhotoSwipe** | Жесты, зум, без зависимостей |
| Рукописные обводки и маркеры | **Rough Notation** | Попадает в фирменный приём «пометки от руки» |
| Переходы между страницами | **Astro View Transitions** | Уже есть в Astro, ничего не ставить |
| Подсказки и выпадающие панели | **Floating UI** | Только позиционирование, 3–5 КБ |
| Иконки | **Lucide** или **Phosphor** или **Tabler** — выбрать ОДИН набор | Отдельные SVG, без атрибуции |
| Шрифты | Семейства с кириллицей через **Fontsource** (OFL) | Локально, без CDN; кандидаты в разделе «Шрифты» |
| Полутона, зерно, метки реза | Свой CSS/SVG | Чужие ресурсы для стиля CMYK не нужны |

**Вторая очередь (только если потребует концепция):** GSAP (сложные сценарии прокрутки; лицензия особая, проверить по первоисточнику), Lenis, Atropos / vanilla-tilt (наклон карточек), AutoAnimate (смета), canvas-confetti, Splitting.js, dotLottie/Rive (тяжёлые — только для ключевого эффекта), three.js / model-viewer (3D-кружка — отложенная загрузка).

**Не брать / только с разрешения владельца:** любые Pro-версии (Magic UI Pro, Aceternity Pro, React Bits Pro, Web Awesome Pro, Motion+), шрифты Fontshare (лицензия и кириллица не подтверждены), наборы с обязательной атрибуцией или copyleft без необходимости, мокапы с неясной лицензией.

**Правило «одного»:** один анимационный движок, один набор иконок, одна карусель, одна основа для диалогов.

---

# ЧАСТЬ 1. Компоненты, анимации, интерфейс


Обозначения: «Первоисточник» = текст файла LICENSE с raw.githubusercontent.com, прочитан 12.11.2026. «(а)» = Astro + Preact + обычный CSS; «(б)» = Astro + React + Tailwind. Это не юридическая консультация.
Сайты shadcn, magicui, aceternity, uiverse, gsap.com, lottiefiles в этой среде недоступны (сеть закрыта), поэтому всё, что про платные тарифы и сайтовые условия, помечено «не проверено» либо «вторично (поиск)».

## 1. Компоненты (копируются в проект)

| Название | Ссылка | Для чего сайту печати | Плюсы | Ограничения | Лицензия (первоисточник) | Коммерч. | Атрибуция | Совместимость (а)/(б) | Вес/зависимости | Статус проверки |
|---|---|---|---|---|---|---|---|---|---|---|
| shadcn/ui | ui.shadcn.com, github.com/shadcn-ui/ui | Диалоги, вкладки, аккордеон, формы заявки | Код копируется в проект, MIT | Привязан к React + Tailwind + Radix (+ cva, clsx) | MIT, © 2023 shadcn: https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md | Да | Не требуется (при распространении исходников — сохранить текст MIT) | (а) Плохо: нужны React/Tailwind, через preact/compat возможно, но не проверено; (б) Отлично | Radix, Tailwind, tailwind-merge | Лицензия репо проверена 12.11.2026; есть ли платные блоки у shadcn — не проверено |
| Magic UI | magicui.design, github.com/magicuidesign/magicui | Эффекты: бегущие строки, сетки, блики, счётчики | Красивые готовые эффекты, код копируется | Pro-версия (блоки и шаблоны) платная: на главной magicui.design «Introducing Magic UI Pro - 50+ blocks and templates»; условия Pro на pro.magicui.design прочитать не удалось (хост закрыт сетью) | Репо: MIT, © Magic UI: https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md (README подтверждает MIT) | Да (бесплатная часть) | Не требуется | (а) Плохо (React + motion + Tailwind); (б) Хорошо | React, motion, Tailwind | Бесплатная часть: проверено по первоисточнику 12.11.2026 (LICENSE.md репо; magicui.design: «150+ free and open-source animated components and effects»). Pro: НЕ ПРОВЕРЕНО (pro.magicui.design недоступен), без разрешения владельца не использовать |
| Aceternity UI | ui.aceternity.com | Эффектные hero, карточки с 3D/подсветкой | Много эффектных блоков | Платный Pro («1-Year License», $169, обычная цена $249, единоразово; 200+ блоков, 15+ шаблонов; страница pricing, 12.11.2026). Бесплатный план: 100+ компонентов. Копирование/перепродажа как конкурирующей библиотеки запрещены. Лицензия в репозитории не найдена | Проверено 12.11.2026: https://ui.aceternity.com/pricing, FAQ: «You can use Aceternity UI components in unlimited personal and commercial client projects. The only restriction is that you cannot resell or redistribute the components themselves as a competing template or component library.» Текст «Aceternity License»: https://ui.aceternity.com/licence — «You can create unlimited end products for yourself or your clients.»; «You cannot sell, resell, or distribute the Item or derivative works on any marketplace». Отдельного файла лицензии для бесплатной части нет, действует FAQ и страница licence (Некоторые Items могут содержать чужие компоненты со своей лицензией) | Да (бесплатные компоненты и купленные Pro — для клиентских и коммерческих проектов) | Не требуется (на странице лицензии не найдено) | (а) Плохо; (б) Хорошо | React, motion, Tailwind | Проверено по первоисточнику 12.11.2026 (бесплатная часть — по FAQ и /licence; Pro — платный, только с разрешения владельца) |
| Motion Primitives | motion-primitives.com, github.com/ibelick/motion-primitives | Текстовые эффекты, раскрывающиеся блоки, галереи | MIT, чистый код копирования | Бета; нужен motion + Tailwind | MIT, © 2024 ibelick: https://raw.githubusercontent.com/ibelick/motion-primitives/main/LICENCE.md (файл называется LICENCE.md) | Да | Не требуется | (а) Средне: портировать на Preact + motion; (б) Отлично | motion, Tailwind, React | Проверено 12.11.2026 |
| React Bits | reactbits.dev, github.com/DavidHDev/react-bits | Фоны, текстовые анимации, курсорные эффекты | Огромная коллекция, 4 варианта: JS/TS × CSS/Tailwind, т.е. можно без Tailwind | Лицензия НЕ чистая MIT: «MIT + Commons Clause» — нельзя продавать/раздавать сами компоненты (набором, портом). Есть раздел React Bits Pro (компоненты, маркетинговые блоки, App UI, шаблоны Next.js, Agent Kit; reactbits.dev/pro; цена на прочитанной странице не указана) | MIT + Commons Clause v1.0, © 2026 David Haz: https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md. Использование «в приложении, сайте, продукте», в т.ч. коммерческом — разрешено | Да, внутри своего сайта | Не требуется (текст лицензии при копировании сохранять) | (а) Средне: React-код + CSS-вариант, нужен preact/compat; (б) Отлично | React, часто gsap/three/ogl/motion (на компонент) | Проверено по первоисточнику 12.11.2026: reactbits.dev/get-started/introduction — «Free for personal and commercial work under the MIT + Commons Clause license. Use the components in any app, website or product, but do not sell, sublicense or redistribute the components themselves.» Pro: условия и цена не прочитаны (страницы цен нет, /pro/pricing — 404), Pro не использовать без разрешения владельца |

## 2. Анимации и микровзаимодействия

| Название | Ссылка | Для чего сайту печати | Плюсы | Ограничения | Лицензия (первоисточник) | Коммерч. | Атрибуция | Совместимость (а)/(б) | Вес/зависимости | Статус проверки |
|---|---|---|---|---|---|---|---|---|---|---|
| Motion (бывш. Framer Motion) / Motion vanilla (`motion`, `animate()`) | motion.dev, github.com/motiondivision/motion | Появление блоков, скролл-эффекты, пружины, жесты | Есть vanilla-ядро без React (small `animate` ~2–3 КБ), React-API тоже | Часть «Motion+» (премиум-примеры, Cursor и т.п.) платная — не проверено | MIT, © 2024 Motion B.V.: https://raw.githubusercontent.com/motiondivision/motion/main/LICENSE.md | Да | Нет | (а) Да (vanilla `motion`, работает с любыми островами); (б) Да | motion без зависимостей; vanilla ~несколько КБ, полный — больше | Проверено 12.11.2026 |
| GSAP (+ ScrollTrigger, SplitText и др.) | gsap.com | Сложные сценарии прокрутки, таймлайны, текст по буквам | Лучший по возможностям, фреймворк-независим, все бывшие платные плагины бесплатны | Лицензия НЕ MIT: Standard «No Charge» GSAP License. Бесплатно в коммерческих сайтах, «as long as end users are not charged a fee of any kind to use your product or gain access to any part of it»; если пользователи платят за доступ/использование — нужна платная подписка Business. Запрещено делать «Competitive Products» (визуальные no-code конструкторы анимаций, конкурирующие с Webflow) и убирать уведомления/брендинг из кода GSAP | Проверено 12.11.2026: https://gsap.com/community/standard-license/ — «You may use the code at no charge in commercial or non-commercial apps, web sites, games, components, and other software as long as end users are not charged a fee…»; FAQ: «All of GSAP including the plugins that were formerly "members-only" like SplitText and MorphSVG can be used in commercial projects at no charge.» Правообладатель Webflow, лицензию он вправе менять (старые версии остаются под прежними условиями) | Да, для обычного сайта (пользователи сайта не платят за доступ к самому сайту; заказ товаров — не плата за доступ, но это наше толкование, при сомнении писать gsap.com) | Не требуется (но нельзя удалять уведомления и брендинг из кода GSAP) | (а) Да; (б) Да | gsap core ~25–30 КБ min+gz, плагины отдельно | Проверено по первоисточнику 12.11.2026 |
| Lenis | github.com/darkroomengineering/lenis | Плавный скролл | Лёгкий, framework-agnostic | Плавный скролл портит доступность/нативное ощущение, нужен fallback при reduced-motion | MIT, © 2024 darkroom.engineering: https://raw.githubusercontent.com/darkroomengineering/lenis/main/LICENSE | Да | Нет | (а) Да; (б) Да | ~3 КБ gz (оценочно) | Проверено 12.11.2026 |
| AutoAnimate | auto-animate.formkit.com | Плавное появление/удаление элементов списка, корзина-смета | Одна строка, ~2 КБ, любые фреймворки | Только базовые переходы | MIT, © 2022 FormKit: https://raw.githubusercontent.com/formkit/auto-animate/master/LICENSE | Да | Нет | (а) Да (есть Preact-хук не гарантирован, vanilla — да); (б) Да | ~2 КБ | Проверено 12.11.2026 |
| Anime.js v4 | animejs.com | Анимации SVG, текст, таймлайны, scroll | Модульный (tree-shaking), vanilla | — | MIT, © 2025 Julian Garnier (+ package.json "license": "MIT"): https://raw.githubusercontent.com/juliangarnier/anime/master/LICENSE.md | Да | Нет | (а) Да; (б) Да | Модульный, ядро ~10 КБ (оценочно) | Проверено 12.11.2026 |
| Swup | swup.js.org | Плавные переходы между страницами | Плагины, не требует фреймворка | Для Astro есть интеграция @swup/astro; альтернатива — Astro View Transitions | MIT, © 2017 Georgy Marchuk: https://raw.githubusercontent.com/swup/swup/main/LICENSE | Да | Нет | (а) Да; (б) Да | ~6 КБ | Проверено 12.11.2026 |
| Astro View Transitions (`<ClientRouter />`) | docs.astro.build | Переходы между страницами «из коробки» | Часть Astro, ничего не ставить | Нужно учитывать повторную инициализацию скриптов | MIT (Astro, © Fred K. Schott): https://raw.githubusercontent.com/withastro/astro/main/LICENSE | Да | Нет | (а) Да; (б) Да | Встроено | Проверено 12.11.2026 |
| Embla Carousel | embla-carousel.com | Карусели работ и отзывов | Лёгкий, без стилей, обёртки для React/Preact | Минималистичный: стрелки/точки делать самому | MIT, © David Jerleke: https://raw.githubusercontent.com/davidjerleke/embla-carousel/master/LICENSE | Да | Нет | (а) Да (vanilla + пакет для Preact не проверен, vanilla достаточно); (б) Да | ~6–8 КБ | Проверено 12.11.2026 |
| Swiper | swiperjs.com | Слайдеры, галереи | Богатые эффекты, web-component версия | Тяжелее; стили CSS | MIT, © 2019 Vladimir Kharlampidi: https://raw.githubusercontent.com/nolimits4web/swiper/master/LICENSE (никаких особых условий, платных тарифов у библиотеки нет) | Да | Нет | (а) Да (Swiper Element); (б) Да | ~30+ КБ | Проверено 12.11.2026 |
| Splide | splidejs.com | Слайдеры/ленты без зависимостей | Чистый vanilla, a11y | — | MIT, © 2022 Naotoshi Fujita: https://raw.githubusercontent.com/Splidejs/splide/master/LICENSE | Да | Нет | (а) Да; (б) Да | ~12 КБ | Проверено 12.11.2026 |
| PhotoSwipe v5 | photoswipe.com | Просмотр фото работ в полный экран | Жесты, зум, vanilla | — | MIT, © Dmitry Semenov: https://raw.githubusercontent.com/dimsemenov/PhotoSwipe/master/LICENSE | Да | Нет | (а) Да; (б) Да | ~20 КБ | Проверено 12.11.2026 |
| GLightbox | github.com/biati-digital/glightbox | Простой лайтбокс для галереи | Видео/галерея, vanilla | Менее живой проект | MIT, © 2018 Biati Digital: https://raw.githubusercontent.com/biati-digital/glightbox/master/LICENSE.md | Да | Нет | (а) Да; (б) Да | ~12 КБ | Проверено 12.11.2026 |
| Lottie (lottie-web, Airbnb) | github.com/airbnb/lottie-web | Проигрывание JSON-анимаций | Стандарт | Тяжёлый (~80 КБ+) — лучше dotLottie | MIT, © Bodymovin: https://raw.githubusercontent.com/airbnb/lottie-web/master/LICENSE.md | Да | Нет | (а) Да; (б) Да | ~80 КБ | Проверено 12.11.2026 |
| dotLottie web (LottieFiles) | github.com/LottieFiles/dotlottie-web | Лёгкий плеер Lottie на WASM | Меньше размер, есть web-component | — | MIT, © 2023 LottieFiles: https://raw.githubusercontent.com/LottieFiles/dotlottie-web/main/LICENSE | Да (плеер) | Нет | (а) Да; (б) Да | WASM ~ 200 КБ (оценочно) | Плеер проверен 12.11.2026 |
| Бесплатные анимации LottieFiles | lottiefiles.com | Иконки/иллюстрации-анимации | Много бесплатных | У каждой анимации своя лицензия (Lottie Simple License, CC и др.) — проверять на странице анимации | Вторично (help.lottiefiles.com): Lottie Simple License — коммерческое использование разрешено, атрибуция желательна, не обязательна; одна страница «Commercial Use Policies» противоречива — уточнять | Да по Simple License (вторично) | Желательна, не обязательна | (а) Да; (б) Да | JSON, мало | НЕ ПРОВЕРЕНО по первоисточнику (сайт закрыт) |
| Rive (runtime) | rive.app, github.com/rive-app/rive-wasm | Интерактивные анимации-маскоты | Состояния, интерактив | Редактор Rive — платные тарифы; тяжёлый WASM | Runtime: MIT, © 2020–2021 Rive: https://raw.githubusercontent.com/rive-app/rive-wasm/master/LICENSE (условия редактора/файлов не проверены) | Runtime — да | Нет | (а) Да; (б) Да | ~150+ КБ WASM | Runtime проверен; тарифы редактора не проверены |
| Atropos | github.com/nolimits4web/atropos | 3D-наклон карточек товаров (параллакс) | Красиво, vanilla/web | Мобильные — гироскоп не везде | MIT, © 2021 Vladimir Kharlampidi: https://raw.githubusercontent.com/nolimits4web/atropos/master/LICENSE | Да | Нет | (а) Да; (б) Да | ~5 КБ | Проверено 12.11.2026 |
| vanilla-tilt.js | github.com/micku7zu/vanilla-tilt.js | Простой наклон карточек | ~3 КБ | Менее эффектен | MIT, © 2017 Șandor Sergiu: https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/LICENSE | Да | Нет | (а) Да; (б) Да | ~3 КБ | Проверено 12.11.2026 |
| tsParticles | github.com/tsparticles/tsparticles | Снег/конфетти/частицы (Новый год) | Модульный, много пресетов | Легко сделать тяжёлым; у нас снег уже на CSS | MIT, © 2020 Matteo Bruni: https://raw.githubusercontent.com/tsparticles/tsparticles/main/LICENSE | Да | Нет | (а) Да; (б) Да | зависит от модулей (30+ КБ) | Проверено 12.11.2026 |
| canvas-confetti | github.com/catdad/canvas-confetti | Конфетти после отправки заявки | ~4 КБ, одна функция | — | ISC, © 2020 Kiril Vatev: https://raw.githubusercontent.com/catdad/canvas-confetti/master/LICENSE | Да | Сохранить уведомление об авторстве при распространении исходников | (а) Да; (б) Да | ~4 КБ | Проверено 12.11.2026 |
| Floating UI | floating-ui.com | Подсказки, поповеры, выпадающие меню | Позиционирование без привязки к фреймворку | Только позиционирование | MIT: https://raw.githubusercontent.com/floating-ui/floating-ui/master/LICENSE | Да | Нет | (а) Да (@floating-ui/dom); (б) Да | ~3–5 КБ | Проверено 12.11.2026 |
| Rough Notation | roughnotation.com | Рукописные подчёркивания, обводки, маркеры — в духе «ручной» мастерской | ~4 КБ, vanilla | — | MIT, © 2020 Preet Shihn: https://raw.githubusercontent.com/rough-stuff/rough-notation/master/LICENSE | Да | Нет | (а) Да; (б) Да | ~4 КБ | Проверено 12.11.2026 |
| Open Props | open-props.style | CSS-переменные (тени, easing, градиенты) | Чистый CSS, без JS | — | MIT, © 2021 Adam Argyle: https://raw.githubusercontent.com/argyleink/open-props/main/LICENSE | Да | Нет | (а) Да, идеально; (б) Да | CSS-файл, можно брать частями | Проверено 12.11.2026 |
| Animista | animista.net | Генератор CSS-keyframes | Копируешь нужное | Лицензия сайта не проверена (сайт закрыт) | Не проверено | Не проверено | Не проверено | (а) Да; (б) Да | CSS | НЕ ПРОВЕРЕНО |
| Uiverse.io (элементы) | uiverse.io, github.com/uiverse-io/galaxy | Кнопки, загрузчики, карточки на чистом CSS | 3000+ элементов, чистый CSS/HTML | Качество разное; нужна адаптация к дизайн-системе CMYK 2.0 | Зеркало uiverse-io/galaxy: MIT, © 2023 Uiverse.io: https://raw.githubusercontent.com/uiverse-io/galaxy/main/LICENSE ; README: «MIT, атрибуция не обязательна, но приветствуется». Условия самого сайта uiverse.io не проверены | Да (по MIT) | Не обязательна, желательна | (а) Да; (б) Да | CSS | Репо проверено 12.11.2026; сайт — не проверен |

## 3. Дополнительные находки (framework-agnostic, Astro, иконки)

| Название | Ссылка | Для чего сайту печати | Плюсы | Ограничения | Лицензия (первоисточник) | Коммерч. | Атрибуция | Совместимость (а)/(б) | Вес/зависимости | Статус проверки |
|---|---|---|---|---|---|---|---|---|---|---|
| Web Awesome (бывш. Shoelace) | webawesome.com, github.com/shoelace-style/webawesome | Готовые веб-компоненты (диалог, вкладки, дропдаун) | Веб-компоненты — работают с Preact без обёрток | Есть платный Pro (Web Awesome Pro) — условия не проверены; в ветке main LICENSE = MIT © Shoelace | MIT: https://raw.githubusercontent.com/shoelace-style/webawesome/main/LICENSE ; ветка next: MIT © 2023 Fonticons, Inc. (…/next/LICENSE.md) | Да (бесплатная часть) | Нет | (а) Да; (б) Да | Lit внутри, ~сотни КБ целиком, импорт по компонентам | Репо проверено; Pro не проверено |
| Lit | lit.dev | Свои веб-компоненты | 5 КБ | Нужно писать компоненты | BSD-3-Clause, © Google: https://raw.githubusercontent.com/lit/lit/main/LICENSE | Да | Сохранить уведомление в исходниках | (а) Да; (б) Да | ~5 КБ | Проверено 12.11.2026 |
| Splitting.js | github.com/shshaw/Splitting | Разбивка текста по буквам/словам под CSS-анимацию | Без анимационного движка, ~2 КБ | — | MIT, © 2018 Stephen Shaw: https://raw.githubusercontent.com/shshaw/Splitting/master/LICENSE.md | Да | Нет | (а) Да; (б) Да | ~2 КБ | Проверено 12.11.2026 |
| Typed.js | github.com/mattboldt/typed.js | Эффект печатающегося текста | Простой | — | MIT, © 2018 Matt Boldt: https://raw.githubusercontent.com/mattboldt/typed.js/master/LICENSE.txt | Да | Нет | (а) Да; (б) Да | ~10 КБ | Проверено 12.11.2026 |
| AstroWind (тема Astro + Tailwind) | github.com/onwidget/astrowind | Готовые секции лендинга, блоки | Astro, SEO, MIT | Tailwind обязателен; дизайн свой | MIT, © 2023 onWidget: https://raw.githubusercontent.com/onwidget/astrowind/main/LICENSE.md | Да | Нет | (а) Только как источник идей/разметки; (б) Да | Astro + Tailwind | Проверено 12.11.2026 |
| ScrewFast (Astro + Tailwind) | github.com/mearashadowfax/ScrewFast | Блоки сайта компании | MIT | Tailwind | MIT, © 2024 Emil Gulamov: https://raw.githubusercontent.com/mearashadowfax/ScrewFast/main/LICENSE | Да | Нет | (а) Как идеи; (б) Да | Astro + Tailwind | Проверено 12.11.2026 |
| Tabler Icons | tabler.io/icons | Иконки (5000+) | MIT, SVG | — | MIT, © 2020–2026 Paweł Kuna: https://raw.githubusercontent.com/tabler/tabler-icons/main/LICENSE | Да | Нет | (а) Да; (б) Да | SVG по одному | Проверено 12.11.2026 |
| Lucide | lucide.dev | Иконки | ISC | — | ISC, © 2026 Lucide contributors: https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE | Да | Сохранить уведомление при копировании | (а) Да (SVG/astro-пакет); (б) Да | SVG | Проверено 12.11.2026 |
| Phosphor Icons | phosphoricons.com | Иконки с несколькими стилями (duotone) | MIT | — | MIT, © 2023 Phosphor Icons: https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE | Да | Нет | (а) Да; (б) Да | SVG | Проверено 12.11.2026 |

## 4. Headless-компоненты (a11y-логика без стилей)

| Название | Ссылка | Для чего | Плюсы | Ограничения | Лицензия (первоисточник) | Коммерч. | Атрибуция | Совместимость (а)/(б) | Вес/зависимости | Статус проверки |
|---|---|---|---|---|---|---|---|---|---|---|
| Zag.js | zagjs.com, github.com/chakra-ui/zag | Диалог, вкладки, аккордеон, тултип, слайдер — конечные автоматы | В репо есть адаптеры `frameworks/preact`, `react`, `vanilla`, solid, vue, svelte (проверено наличием package.json) | Нужно писать разметку и стили самому; API требует привыкания | MIT, © 2021 Chakra UI: https://raw.githubusercontent.com/chakra-ui/zag/main/LICENSE | Да | Нет | (а) Лучший выбор (@zag-js/preact); (б) Да (@zag-js/react) | Пакет на компонент, небольшой | Проверено 12.11.2026 |
| Ark UI | ark-ui.com, github.com/chakra-ui/ark | То же на Zag, готовые компоненты | Хорошо документирован | README: React, Solid, Vue, Svelte — Preact не заявлен (через preact/compat не проверялось) | MIT, © 2024 Chakra Systems: https://raw.githubusercontent.com/chakra-ui/ark/main/LICENSE | Да | Нет | (а) Нет напрямую; (б) Да | зависит от Zag | Проверено 12.11.2026 |
| Kobalte | kobalte.dev | Headless для SolidJS | — | Только SolidJS — для нашего стека не подходит | MIT, © 2024 jer3m01: https://raw.githubusercontent.com/kobaltedev/kobalte/main/LICENSE.md | Да | Нет | (а) Нет; (б) Нет | — | Проверено 12.11.2026 |
| Radix UI / React Aria | — | React-headless | — | Только React; не проверялись | Не проверялись | — | — | (а) Нет (compat рискован); (б) Да | — | НЕ ПРОВЕРЕНО |
| Веб-компоненты Web Awesome | см. выше | — | — | — | — | — | — | — | — | — |

## Топ-8 для варианта (а) (Astro + Preact + обычный CSS)

1. Motion (vanilla `animate`, `inView`, `scroll`) — основной аниматор, MIT.
2. Open Props — токены и easing на чистом CSS.
3. Embla Carousel (или Splide) — ленты работ и отзывов.
4. PhotoSwipe — просмотр фото работ.
5. Zag.js (@zag-js/preact) — доступные диалоги/вкладки/аккордеон вместо самописных.
6. Rough Notation — «рукописные» маркеры/обводки в духе мастерской.
7. Astro View Transitions (встроено) либо Swup — переходы между страницами.
8. Atropos / vanilla-tilt (по желанию) и AutoAnimate (смета/список) + Tabler/Lucide/Phosphor иконки.
Запасные: Lenis (плавный скролл, осторожно), canvas-confetti, Splitting.js, GSAP (если нужны сложные сценарии прокрутки).

## Что точно платное или с ограничениями

- React Bits: лицензия «MIT + Commons Clause» (запрет продавать/раздавать сами компоненты, наборами и портами); использовать на своём сайте можно (проверено по reactbits.dev 12.11.2026). React Bits Pro — платный раздел, условия не прочитаны.
- Magic UI Pro (условия на pro.magicui.design не прочитаны — хост закрыт) и Aceternity UI Pro ($169 за 1-Year License, обычная цена $249, проверено 12.11.2026) — платные; бесплатные части: Magic UI — MIT (репо), Aceternity UI — 100+ бесплатных компонентов, коммерчески можно по FAQ и странице /licence (проверено 12.11.2026), отдельного файла лицензии нет.
- GSAP: бесплатно, но лицензия не MIT (Standard «No Charge»): условие — пользователи не платят за доступ к продукту; запрет конкурирующих no-code аниматоров Webflow. Проверено по gsap.com/community/standard-license/ 12.11.2026. Все плагины (SplitText, MorphSVG и др.) тоже бесплатны.
- Web Awesome Pro, Motion+ (премиум-примеры Motion), редактор Rive — платные; условия не проверены.
- LottieFiles: у каждой анимации своя лицензия (Simple License, CC, премиум) — смотреть на странице анимации.
- Uiverse: MIT по зеркалу galaxy, условия сайта не проверены.
- Rive-редактор, Lottie premium, Aceternity/Magic UI Pro: только по покупке; в проект не копировать без лицензии.

## Что не удалось проверить

- Сайты gsap.com, ui.aceternity.com, magicui.design, uiverse.io, motion-primitives.com не открываются (хосты вне сети среды).
- Не прочитано по первоисточнику: условия Pro у Magic UI (pro.magicui.design закрыт сетью) и React Bits Pro, Web Awesome Pro, Motion+, Rive Editor, лицензии сайта uiverse и Animista. Прочитано 12.11.2026: GSAP Standard License, лицензия и цены Aceternity UI, MIT+Commons Clause у React Bits.
- Размеры «вес» в таблицах — оценочные по памяти, не измерены.

---

# ЧАСТЬ 2. Шрифты, иконки, фото, иллюстрации, 3D, текстуры, мокапы

## 1. Шрифты
Все пакеты ниже: `@fontsource/<имя>` (статика) и `@fontsource-variable/<имя>` (variable), поле license в npm = OFL-1.1, в архиве есть файлы `cyrillic-*` (версия 5.3.x, ПРОВЕРЕНО 12.11.2026 по registry.npmjs.org). Лицензия OFL 1.1 допускает коммерцию, самохостинг, встраивание на сайт; нельзя продавать шрифт отдельно, форк нельзя называть исходным именем; атрибуция на сайте не нужна (лицензионный файл идёт в пакете). Подтверждение формулировок OFL: https://raw.githubusercontent.com/google/fonts/main/ofl/onest/OFL.txt (ПРОВЕРЕНО, шапка).

| Название | Ссылка | Для чего | Плюсы | Ограничения | Лицензия | Комм. | Атриб. | Изменять | Статус |
|---|---|---|---|---|---|---|---|---|---|
| Onest | npmjs.com/package/@fontsource-variable/onest | основной текст, интерфейс | русский разработчик, нейтральный гротеск, variable | нет | OFL-1.1 | да | нет | да (под другим именем) | ПРОВЕРЕНО (npm, кириллица, variable) |
| Golos Text | @fontsource-variable/golos-text | основной текст | заточен под кириллицу (ParaType), variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Manrope | @fontsource-variable/manrope | заголовки и текст | геометричный, variable | кириллица частично менее выразительная | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Unbounded | @fontsource-variable/unbounded | акцидентный, заголовки | широкий, смелый, variable | только для крупных заголовков | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Inter | @fontsource-variable/inter | интерфейс, числа, цены | много начертаний, variable | нейтральный, «как у всех» | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Geologica | @fontsource-variable/geologica | заголовки и текст | редкий вариативный дизайн, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Rubik | @fontsource-variable/rubik | округлые заголовки | мягкие углы подходят под «скруглённые формы» | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Montserrat | @fontsource-variable/montserrat | заголовки | узнаваемый, variable | заезженный | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Jost | @fontsource-variable/jost | заголовки, геометрия (Futura-подобный) | элегантный, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Raleway | @fontsource-variable/raleway | заголовки | изящный, variable | цифры «старого стиля» по умолчанию | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Wix Madefor Display / Text | @fontsource-variable/wix-madefor-display, ...-text | заголовки / текст | современный, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Ysabeau Office | @fontsource-variable/ysabeau-office | гуманистический гротеск | тёплый, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Comfortaa | @fontsource-variable/comfortaa | округлый акцидентный | игривый, variable | только для коротких надписей | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Oswald | @fontsource-variable/oswald | узкие заголовки | плотный, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| PT Sans / PT Sans Caption | @fontsource/pt-sans, /pt-sans-caption | текст | Paratype, отличная кириллица | только статика (variable нет) | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| PT Serif | @fontsource/pt-serif | антиква для текста | Paratype | только статика | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Playfair Display | @fontsource-variable/playfair-display | антиква-заголовки | контрастная, variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Cormorant Garamond | @fontsource-variable/cormorant-garamond | изящная антиква (сейчас на главной курсивом) | variable | мелкий кегль плохо читается | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Lora | @fontsource-variable/lora | антиква для статей | variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Yeseva One | @fontsource/yeseva-one | акцидентная антиква | выразительная | один вес, нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Russo One / Rubik Mono One | @fontsource/russo-one, /rubik-mono-one | плакатные заголовки | жирные | один вес, нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Caveat | @fontsource-variable/caveat | рукописные пометки (уже на главной) | variable | только короткие надписи | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Marck Script | @fontsource/marck-script | каллиграфия, «подпись» | русский автор | один вес, нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Bad Script | @fontsource/bad-script | «школьный» почерк | нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| Pacifico | @fontsource/pacifico | вывеска-скрипт | кириллица есть в пакете | нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| JetBrains Mono | @fontsource-variable/jetbrains-mono | моноширинный: цены, метки реза | variable | нет | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| IBM Plex Mono | @fontsource/ibm-plex-mono | моноширинный | есть курсив | нет variable | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |
| PT Mono | @fontsource/pt-mono | моноширинный | Paratype | один вес | OFL-1.1 | да | нет | да | ПРОВЕРЕНО |

Не нашёл на Fontsource (ПРОВЕРЕНО, пакета нет): Satoshi, General Sans, Clash Display, Cabinet Grotesk, Switzer, Synonym, Erode, Gambetta, Boska, Supreme, Sentient, Zodiak, Array, E-Ukraine. Это шрифты Fontshare (и E-Ukraine), на Fontsource их нет.

Заметки:
- **Fontsource** (https://raw.githubusercontent.com/fontsource/fontsource/main/README.md, ПРОВЕРЕНО): монорепозиторий самохостируемых open-source шрифтов в виде npm-пакетов. Код под MIT. Шрифты: «Most of the fonts ... use the SIL Open Font License», часть Apache 2, Ubuntu — своя. Лицензия каждого шрифта лежит в README пакета.
- **Google Fonts**: почти всё OFL, часть Apache 2 и Ubuntu Font License (https://raw.githubusercontent.com/google/fonts/main/ofl/onest/OFL.txt — ПРОВЕРЕНО для Onest). Сам fonts.google.com из среды недоступен. В РФ использовать только самохостинг (Fontsource), не `fonts.googleapis.com`. Проверено 12.11.2026: страница fonts.google.com/faq пустая (рендерится скриптами), поэтому прочитан README репозитория google/fonts (https://raw.githubusercontent.com/google/fonts/main/README.md): «Since all the fonts available here are licensed with permission to redistribute, subject to the license terms, you can self-host using a variety of third-party projects.»; «Most of the fonts in the collection use the SIL Open Font License, v1.1.»; «It is important to always read the license for every font that you use.» Статус: самохостинг и коммерция подтверждены по первичному репозиторию Google; страница FAQ на сайте не прочитана.
- **Fontshare (ITF Free Font License)**: текст лицензии ПРОВЕРЕН по первоисточнику 12.11.2026: https://www.fontshare.com/licenses/itf-ffl (ITF Free Font License v2.0, 17 Aug 2026; страница также описывает «Open Source» шрифты на SIL OFL). Разрешено: «license to access, download, install, store and use the Font Software for personal or commercial purposes, free of charge»; «You may self-host the Font Software on your own servers or infrastructure for use on your own websites and applications, including through standard webfont technologies such as CSS @font-face»; атрибуция не нужна («You may, but are not required to, identify or credit Indian Type Foundry or Fontshare»); печать и макеты — «in any media, including Print, Websites…»; передавать макеты типографии можно, но саму шрифтовую программу нет («they must obtain their own copy directly from Fontshare»). Запрещено: «You may not modify, edit, adapt… This includes… subsetting, format conversion, or altering font names» (то есть нельзя самим резать на подмножества и конвертировать файлы, брать готовые WOFF2 с Fontshare как есть), перераспространять и давать файлы дизайнерам/подрядчикам, открывать шрифт сторонним пользователям (конструкторы, редакторы шаблонов): «make the Font Software available as a selectable font for third-party users». Для нашего сайта значимо: шрифт в вёрстке своего сайта — можно; шрифт в нашем конструкторе макетов для клиентов — нельзя. КИРИЛЛИЦА НЕ ПРОВЕРЕНА: каталог Fontshare загружается с api.fontshare.com, хост закрыт сетью, страницы шрифтов (Satoshi, General Sans и др.) пустые; проверить 6–8 семейств не удалось. Раз Fontsource их не содержит и кириллица не подтверждена, для проекта не рекомендую; до проверки на самом сайте — «не использовать».
- Involve и TT-шрифты: НЕ ПРОВЕРЕНО. Involve, насколько помню, не в Google Fonts; из TT (TypeType) бесплатны лишь отдельные гарнитуры под своей лицензией, проверять каждую. Лучше брать из списка выше.
- Для печати на товарах: OFL разрешает использовать шрифт в макетах и на печатной продукции (вывод текста не считается распространением шрифта). Формулировку см. в OFL.txt.

---
## 2. Иконки
Проверено по LICENSE на GitHub и по npm 12.11.2026.

| Название | Ссылка | Для чего | Плюсы | Ограничения | Лицензия | Комм. | Атриб. | Изменять | Статус |
|---|---|---|---|---|---|---|---|---|---|
| Lucide | https://github.com/lucide-icons/lucide ; npm `@lucide/astro`, `lucide-static` | основные иконки UI | единый стиль, пакет под Astro | нет | ISC, https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE | да | сохранить уведомление только при распространении исходников | да | ПРОВЕРЕНО |
| Phosphor | https://github.com/phosphor-icons/core | иконки, 6 начертаний (в т.ч. duotone) | много стилей | нет | MIT, https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE | да | уведомление при распространении кода | да | ПРОВЕРЕНО |
| Tabler Icons | https://github.com/tabler/tabler-icons | 5000+ контурных | обширный | нет | MIT, .../tabler/tabler-icons/main/LICENSE | да | как у MIT | да | ПРОВЕРЕНО |
| Heroicons | https://github.com/tailwindlabs/heroicons | базовый UI | компактный | мало иконок (~300) | MIT, .../tailwindlabs/heroicons/master/LICENSE | да | как у MIT | да | ПРОВЕРЕНО |
| Remix Icon | https://github.com/Remix-Design/RemixIcon | UI, соцсети | много | НОВАЯ лицензия «Remix Icon License v1.0, Jan 2026» на GitHub: запрещены перепродажа как набора, конкурирующий набор, использование иконки как логотипа/товарного знака; «Attribution ... appreciated but not required». Но npm `remixicon` 4.9.1 и `@iconify-json/ri` помечены Apache-2.0, т.е. смена лицензии зависит от версии | Remix Icon License v1.0, .../Remix-Design/RemixIcon/master/License | да (в сайтах, физических товарах как декор) | нет | да, но не как логотип | ПРОВЕРЕНО |
| Material Symbols / Icons | https://github.com/google/material-design-icons | UI | огромный набор | вес | Apache-2.0, .../google/material-design-icons/master/LICENSE | да | сохранить NOTICE при распространении | да | ПРОВЕРЕНО |
| Simple Icons | https://github.com/simple-icons/simple-icons ; npm `simple-icons` | логотипы брендов (соцсети) | CC0 | сами логотипы = ТОВАРНЫЕ ЗНАКИ; в DISCLAIMER.md просят «seek the correct permissions»; отдельные иконки могут иметь свои лицензии | CC0 1.0 на набор, https://raw.githubusercontent.com/simple-icons/simple-icons/develop/LICENSE.md ; https://raw.githubusercontent.com/simple-icons/simple-icons/develop/DISCLAIMER.md | набор да; бренды только для ссылки на сам бренд | нет | да | ПРОВЕРЕНО |
| astro-icon | https://github.com/natemoo-re/astro-icon (npm `astro-icon` 1.2.0) | компонент-обёртка для Astro, подтягивает иконки из Iconify | инлайн SVG, без CDN если брать `@iconify-json/*` | это только код | MIT, .../natemoo-re/astro-icon/main/LICENSE | да | нет | да | ПРОВЕРЕНО |
| Iconify (`@iconify-json/*`) | https://github.com/iconify/icon-sets | единый доступ к 200+ наборам | можно ставить локально, без api.iconify.design | у каждого набора своя лицензия, см. ниже | по набору, https://raw.githubusercontent.com/iconify/icon-sets/master/collections.md | зависит | зависит | зависит | ПРОВЕРЕНО |

Лицензии наборов Iconify (поле license у npm-пакетов `@iconify-json/*`, ПРОВЕРЕНО):
- Без атрибуции: lucide ISC; ph, tabler, heroicons, bi, iconoir, svg-spinners, fluent, fluent-emoji MIT; material-symbols, mdi, noto, carbon, mingcute, uil Apache-2.0 (уведомление при распространении); simple-icons и logos CC0.
- ТРЕБУЮТ атрибуции: twemoji, streamline, streamline-emojis, solar, fa6-solid, pepicons-pop — CC BY 4.0; game-icons — CC BY 3.0.
- Copyleft: openmoji — CC BY-SA 4.0 (производные нужно выпускать под той же лицензией, для сайта неудобно).
- Для сайта проще всего: Lucide (+ Phosphor для «дуэтонов»). Атрибуции ни для того ни для другого не нужно.

---
## 3. Фото
Первоисточники (unsplash.com, pexels.com, pixabay.com) 12.11.2026 НЕ УДАЛОСЬ ПРОЧИТАТЬ: Unsplash отвечает 401 и показывает проверку Anubis («Checking your browser before accessing unsplash.com»), Pexels и Pixabay — страницу Cloudflare «Just a moment…». Обход проверки не делали. Данные ниже ВТОРИЧНЫЕ (поиск, цитаты со страниц ToS), нужна проверка человеком на страницах лицензий.

| Название | Ссылка | Лицензия | Комм. | Атриб. | Изменять | Ключевые запреты | Статус |
|---|---|---|---|---|---|---|---|
| Unsplash | https://unsplash.com/license | Unsplash License (не CC0) | да (по пересказам: «commercial or non-commercial purposes, without permission or attribution») | не обязательна | да | нельзя продавать копии «as-is» и собирать фото в конкурирующий сервис; люди/бренды/товарные знаки/недвижимость на фото — разрешений (model/property release) нет, ответственность на вас | ВТОРИЧНО |
| Unsplash+ | https://unsplash.com/plus/license | платный, отдельная лицензия с release-ами | да, шире | нет | да | подписка; на страницах Unsplash+ заявлены model/property release | НЕ ПРОВЕРЕНО (знаю лишь заголовок страницы из поиска) |
| Pexels | https://www.pexels.com/license/ ; https://www.pexels.com/terms-of-service | Pexels License | да | не обязательна | да | нельзя продавать/распространять «as-is»; нельзя выставлять на других стоках; узнаваемые люди — не использовать порочаще; товарные знаки и логотипы на фото — нельзя для товаров (цитата из ToS в пересказе поиска, оборвана) | ВТОРИЧНО |
| Pixabay | https://pixabay.com/service/license-summary/ | Pixabay Content License (с 09.01.2019; до этой даты — CC0) | да | не обязательна | да | в ToS: нельзя продавать «on a Standalone basis ... as a print, wallpaper, poster or on merchandise»; «using the Content in its original form or solely using a filter, changing colors, resizing or cropping remains Standalone use»; контент с узнаваемыми товарными знаками, логотипами, брендами нельзя использовать коммерчески для товаров и услуг, в том числе печатать на мерче | ВТОРИЧНО (цитаты из ToS из результатов поиска) |

Для нашего сайта (фото на страницах, баннерах, не на товарах): все три разрешают коммерческое использование без атрибуции. Исключение: фото с узнаваемыми людьми для рекламы товаров лучше брать с model release (в бесплатных лицензиях его нет, отвечать за это будете сами), и без чужих брендов в кадре.

---
## 4. Иллюстрации
| Название | Ссылка | Лицензия | Комм. | Атриб. | Изменять | Особые условия | Статус |
|---|---|---|---|---|---|---|---|
| unDraw | https://undraw.co/license | собственная лицензия unDraw (© Katerina Limpitsouni, не open-source в строгом смысле) | да: «You can use them for noncommercial and commercial purposes» | не нужна: «You do not need to ask permission from or provide credit to the creator or unDraw» | да: «download, copy, modify, distribute, perform, and use» | Запрещено: собирать из них конкурирующий сервис, «distribute the assets in packs or otherwise», автоматизированно скрейпить; «explicitly prohibits the use of unDraw assets… for training, fine-tuning, or developing artificial intelligence, machine learning models»; логотипы брендов на страницах — чужие товарные знаки. Правило большого пальца: если иллюстрации «в центре» вашего продукта (продажа, встраивание в приложение), «you probably should not proceed» | Проверено по первоисточнику 12.11.2026 |
| Open Doodles | https://www.opendoodles.com | CC0 (по памяти) | да | нет | да | — | НЕ ПРОВЕРЕНО (GitHub-репозиторий не найден по угаданному адресу) |
| Open Peeps | https://www.openpeeps.com | CC0 (по памяти) | да | нет | да | — | НЕ ПРОВЕРЕНО |
| Humaaans | https://www.humaaans.com | CC0/«free for commercial» (по памяти) | да | нет | да | — | НЕ ПРОВЕРЕНО |
| Storyset / Freepik | https://storyset.com | Freepik license | да | ОБЯЗАТЕЛЬНА на бесплатном плане (по памяти, для Freepik стабильно) | да | премиум без атрибуции | НЕ ПРОВЕРЕНО |
| Blush | https://blush.design | бесплатно ограниченный набор, атрибуция (по памяти) | да | да на free | да | — | НЕ ПРОВЕРЕНО |
| DrawKit | https://drawkit.com | часть бесплатных (по памяти) | да | нет | да | — | НЕ ПРОВЕРЕНО |
| ManyPixels | https://www.manypixels.co/gallery | бесплатная галерея (по памяти) | да | нет | да | — | НЕ ПРОВЕРЕНО |
| SVG Repo | https://www.svgrepo.com | у каждого файла своя (CC0, MIT, CC BY, Apache и др.) | зависит | зависит | зависит | проверять лицензию каждого файла | НЕ ПРОВЕРЕНО |
| Icons8 | https://icons8.com/license | ссылка на Icons8 обязательна на бесплатном плане (по памяти) | да | да | да | — | НЕ ПРОВЕРЕНО |

---
## 5. 3D
| Название | Ссылка | Лицензия | Статус |
|---|---|---|---|
| three.js (код) | https://github.com/mrdoob/three.js | MIT, https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE | ПРОВЕРЕНО |
| model-viewer (код) | https://github.com/google/model-viewer ; npm `@google/model-viewer` | Apache-2.0, https://raw.githubusercontent.com/google/model-viewer/master/LICENSE | ПРОВЕРЕНО |
| OGL (лёгкий WebGL-код) | npm `ogl` 1.0.11 | Unlicense | ПРОВЕРЕНО (npm) |
| GSAP (анимация, код) | npm `gsap` 3.15.1 | собственная «Standard no charge license», https://gsap.com/community/standard-license/ (бесплатно в коммерческих проектах, если пользователи не платят за доступ к продукту; запрет no-code аниматоров, конкурирующих с Webflow) | Проверено по первоисточнику 12.11.2026 (подробнее — строка GSAP в части 1) |
| Poly Haven | https://polyhaven.com/license | CC0: «Our assets are all licensed as CC0, which is effectively Public Domain»; «You can use our assets for any purpose, including commercial work. You do not need to give credit or attribution»; можно перераспространять, в т.ч. «in a product you sell». Оговорка: сам сайт (дизайн, тексты) под обычным Terms of Service, «All content on this website, excluding the CC0 assets themselves, is protected by intellectual property laws» | Проверено по первоисточнику 12.11.2026 |
| Poly Pizza | https://poly.pizza | у каждой модели CC0 или CC BY (по памяти) | НЕ ПРОВЕРЕНО |
| Sketchfab | https://sketchfab.com | только модели CC0, CC BY (атрибуция), избегать NC/ND/SA (по памяти) | НЕ ПРОВЕРЕНО |
| Spline | https://spline.design | бесплатный план: публикация доступна, но нужен «Made in Spline» и ограничения на объём (по памяти) | НЕ ПРОВЕРЕНО |
| 3dicons.co | https://3dicons.co | CC0-подобная, бесплатно коммерция (по памяти) | НЕ ПРОВЕРЕНО |
| Kenney | https://kenney.nl | CC0 (по памяти) | НЕ ПРОВЕРЕНО |

---
## 6. Текстуры, паттерны, фоны
Все сайты из списка НЕ ПРОВЕРЕНЫ (недоступны). Подробно что известно:
- Hero Patterns, Pattern Monster, Haikei, SVG Backgrounds, Transparent Textures, fffuel, Subtle Patterns/Toptal, getwaves.io, BGJar: условия по памяти («бесплатно, часто с оговоркой атрибуции для Transparent Textures и Subtle Patterns, Hero Patterns — CC BY 4.0»). Всё НЕ ПРОВЕРЕНО, смотреть на каждом сайте.
- css-doodle (генерация узоров на CSS, код): MIT, https://raw.githubusercontent.com/css-doodle/css-doodle/main/LICENSE — ПРОВЕРЕНО.
- geopattern (генератор SVG-узоров, код): MIT, https://raw.githubusercontent.com/btmills/geopattern/master/LICENSE — ПРОВЕРЕНО.
- OGL (Unlicense) — для шейдер-фонов, ПРОВЕРЕНО.
- Для стиля CMYK не нужны чужие ресурсы: растровые точки (halftone) и зерно делаются самостоятельно на CSS (radial-gradient, SVG feTurbulence, mix-blend-mode) и canvas — без лицензионных рисков. Пакет `halftone` в npm без указания лицензии — не брать.

---
## 7. Мокапы изделий
Всё НЕ ПРОВЕРЕНО (сайты недоступны), данные по памяти и общему знанию:
- Mockup World, Unblast, Pixeden, Freepik, Mr.Mockup, ls.graphics: бесплатные PSD с лицензиями вида «личное и коммерческое использование в проектах клиентов; нельзя перепродавать сам мокап»; у Freepik нужна атрибуция на free-плане. Конкретно у каждой раздачи может быть «personal use only» — смотреть на странице.
- Placeit, Smartmockups, Canva, Mockuuups: бесплатно ограничено (водяные знаки, регистрация, лицензия на экспорт часто с оговорками).
- Риск: «free for personal use only» встречается; для сайта-витрины брать только мокапы с явной коммерческой лицензией, либо делать свои фото изделий.

---
