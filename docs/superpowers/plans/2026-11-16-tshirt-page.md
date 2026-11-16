# Страница футболок и общий калькулятор — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Новые правила цен одежды, общий калькулятор 3.0 и страница `/pechat-na-futbolkah` в стиле главной.

**Architecture:** Правила — в `src/data/pricing.ts` (единственный источник цен). Калькулятор — Preact-остров, логика переносится из `/home/user/msuvenirov2.0/src/components/islands/Calculator.tsx`, вид пишется заново на токенах 3.0. Страница — Astro-компоненты в `src/components/tshirt/`, контент — `src/data/tshirt.ts`.

**Tech Stack:** Astro 5.16, Preact 10, TypeScript, vitest, Playwright для проверки.

**Spec:** `docs/superpowers/specs/2026-11-16-tshirt-page-design.md`

## Global Constraints
- Все ограничения Global Constraints из `docs/superpowers/plans/2026-11-15-home-page.md`; движение — только как разрешено `docs/superpowers/specs/2026-11-16-home-motion-design.md` (токены `--ease-out`, `--ease-drawer`, reduced-motion — только прозрачность).
- Цены — только из `pricing.ts`; руками в тексты не писать.
- Оформление 2.0 не переносить (никаких `tee/`, `tshirt/` компонентов 2.0, CMYK, «Ink», полароидов); переносится только логика и тексты.
- `/home/user/msuvenirov2.0` — только чтение.
- Перед вёрсткой каждой задачи: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<тема>" --domain ux` (и `--stack astro`/`--domain style` по нужде) из корня проекта; спецификация важнее.
- Скриншоты для самопроверки — 1440, 1024, 768, 360 px, смотреть каждый.
- Готово, когда `npm test`, `npm run build`, `npm run check:links` зелёные.

## Review Focus
1. Цветная футболка + 1 шт по ссылке `?calc=` или из готового варианта: количество становится 5, цена считается (не «ошибка») — Task 2, тест `applyPreset`.
2. Смена «наша → своя футболка» при выбранном цветном: минимум 5 больше не действует (своя — без цвета) — Task 1, тест `minQty`.
3. Количество 50+ (GARMENT_MAX): калькулятор показывает «индивидуально», смета не ломается — Task 2, проверка в браузере.
4. Без JavaScript: таблица цен и подробности о футболке видны, вместо калькулятора — подсказка и кнопка заявки — Task 4, `scripts/shots.mjs --no-js`.
5. Смета со старыми позициями (другой формат `calc`) не ломает калькулятор и окно заявки — Task 2, тест.

---

### Task 1: Новые правила цен одежды

**Files:** Modify `src/data/pricing.ts`, `src/data/pricing.test.ts`, `src/lib/estimate.ts`; Test `src/lib/estimate.test.ts`.

**Interfaces:**
- Produces: `export const GARMENT_COLORS: Choice[]` — 11 цветов в порядке спецификации, `id` латиницей (`white, black, yellow, green, brown, red, orange, pink, gray, blue, lilac`), `label` по-русски, `swatch` — hex из спецификации, у цветных `hint: 'от 5 шт'`; `export const COLOR_MIN = 5`; `extraPrintFactor = [1, 0.7, 0.7]`. У товаров одежды с цветом — `minQty(sel)`: 5, если выбран цвет кроме белого/чёрного и не «своя вещь», иначе 1.

- [ ] **Step 1:** Тесты в `pricing.test.ts`: (а) футболка унисекс, белая, А4 + А4: второй принт ×0,7; А4 + А5 + А6: второй и третий — ×0,7 (самый дорогой — полная цена); (б) `minQty` унисекс: белый → 1, чёрный → 1, `red` → 5, `red` + `blank: own` → 1; детская — то же без own; (в) бейсболка: белая/чёрная → 1, `red` → 5; (г) в группе `color` футболок 11 вариантов и нет `other`; (д) шоппер по-прежнему имеет «другой цвет — от 20 шт». В `estimate.test.ts`: `stepQty`/`setEstimateQty` для цветной футболки не опускают тираж ниже 5.
- [ ] **Step 2:** `npm test` → новые тесты падают.
- [ ] **Step 3:** `pricing.ts`: колонка `colorSet` для футболок и бейсболки переходит на список цветов с минимумом (у бейсболки — её 7 цветов, белый/чёрный без минимума, остальные `hint: 'от 5 шт'`); `garment()` выставляет `minQty` вместо ошибки «под заказ»; `extraPrintFactor` и текст заметки о нескольких принтах — «самый дорогой — по полной цене, каждый следующий −30%». `estimate.ts`: `setEstimateQty` и шаг количества в смете учитывают `p.minQty?.(sel)`.
- [ ] **Step 4:** `npm test` → всё зелёное (старые тесты, завязанные на −50 % и «от 10 шт», обновить под новые правила).
- [ ] **Step 5:** Commit «Одежда: цветные от 5 шт, каждый следующий принт −30%».

### Task 2: Общий калькулятор 3.0

**Files:** Create `src/components/islands/Calculator.tsx`, `src/components/islands/Calculator.css`, `src/components/islands/productIcons.tsx` (+ `.css`, перенос из 2.0), `src/lib/calc-preset.ts`, `src/lib/calc-preset.test.ts`.

**Interfaces:**
- Consumes: Task 1 (`GARMENT_COLORS`, `minQty`), `categories`, `findProduct`, `defaultSelection` из `pricing.ts`; `addToEstimate`, `openOrder`, `getOrderFiles`, `setOrderFiles` из `estimate.ts`.
- Produces:
  - `Calculator` props: `{ category: string; product?: string; products?: string[]; lockProduct?: boolean; hideCategories?: boolean; title?: string }` (как в 2.0).
  - `export const CALC_APPLY_EVENT = 'calc:apply'` и `export function applyPreset(p: Product, preset: { options?: Record<string, string>; qty?: number }): Selection` в `src/lib/calc-preset.ts` — накладывает опции на `defaultSelection(p)`, отбрасывает неизвестные группы/значения, поднимает `qty` до `max(preset.qty ?? 1, p.minQty?.(sel) ?? 1)` и ограничивает `p.qty.max`.
  - Калькулятор слушает `window` событие `CALC_APPLY_EVENT` с `detail: { product: string; options: Record<string,string>; qty: number }`, применяет `applyPreset` и прокручивает к себе (`id="calc"`); читает `?calc=category:product` как в 2.0.

- [ ] **Step 1:** Тест `calc-preset.test.ts`: футболка унисекс + `{ options: { color: 'red', print1: 'a4' }, qty: 1 }` → `qty === 5`, `options.color === 'red'`; неизвестная группа `foo` игнорируется; `qty: 999` → `p.qty.max`; пустой preset = `defaultSelection`.
- [ ] **Step 2:** `npm test` → падает; реализовать `calc-preset.ts`; → зелёное.
- [ ] **Step 3:** Перенести логику `Calculator.tsx` 2.0 (выбор категории/изделия, группы опций, `addable` принты, размеры, количество с отметками скидок и подсказкой «Ещё N шт — дешевле», итог, разбивка, заметки/ошибки, «В смету», «Оформить заявку», прикрепление файлов, `?calc=`). Правило «подъём количества по подсказке `от N шт`» заменить на `p.minQty`. Вид — заново на токенах 3.0 в стиле главной: белая карточка radius 32, группы как сегменты-«таблетки», цвета — круги 36 px без подписей (название — `title`/`aria-label`, выбранный — синее кольцо), у цветных — маленькая пометка «от 5 шт» под рядом кругов; форматы А6–А3 — мини-листы в масштабе; итог — синяя панель справа на ПК, липкая полоса внизу на телефоне (над нижней полосой телефона). Плитки изделий — значки `productIcons`.
- [ ] **Step 4:** Временная проверка: подключить `<Calculator client:visible category="textile" />` во временную страницу `src/pages/_calc-check.astro` (не в меню, `noindex`), проверить в Playwright: выбор красного при 1 шт → 5 шт и цена; 2-й и 3-й принт −30 % в разбивке; «В смету» → счётчик в шапке +1; событие `calc:apply` заполняет калькулятор; 51 шт → «индивидуально». Скриншоты 1440/360. Удалить временную страницу перед коммитом.
- [ ] **Step 5:** `npm test && npm run build && npm run check:links`; Commit «Калькулятор 3.0: общий, новый вид, готовые варианты заполняют его».

### Task 3: Страница футболок — первый экран, калькулятор, готовые варианты, конструктор, подробности

**Files:** Create `src/data/tshirt.ts` (+ `tshirt.test.ts`), `src/pages/pechat-na-futbolkah.astro`, `src/components/tshirt/{TeeHero,TeePresets,TeeDetails}.astro`; Modify `src/lib/stubs.ts` (+ тест: `pechat-na-futbolkah` больше не заглушка), `src/components/home/ConstructorBanner.astro` (только если нужен проп для переиспользования).

**Interfaces:**
- Consumes: `Calculator`, `CALC_APPLY_EVENT` (Task 2); `GARMENT_COLORS`, `findProduct`, `categoryFrom` (Task 1); `Hero`-подобная разметка главной, `Pic`, `Button`, `SectionHead`, `Icon`.
- Produces в `src/data/tshirt.ts`: `teePresets: { title: string; note: string; product: 'tshirt-unisex'; qty: number; options: Record<string,string>; img: string }[]` — 4 варианта из `garments.ts` 2.0 дословно (у «Для команды» `color: 'blue'`, `qty: 20`); `teeSpecs`, `teeCare`, `adultSizes` (из `garments.ts` 2.0), `kidsSizes` (таблица спецификации, 12 строк), `printSizes` (А6 10×15, А5 15×21, А4 21×28, А3 28×38 см); `presetPrice(preset): { unit: number; total: number }` — из `findProduct('textile', preset.product).quote(applyPreset(...))`.

- [ ] **Step 1:** `tshirt.test.ts`: 4 варианта; у каждого `presetPrice` > 0 и равна quote калькулятора; «Для команды» — 20 шт синие; `kidsSizes` 12 строк, первая `['98','40','31','11']`, последняя `['164','62','46','17']`; ни одна строка данных не содержит «Челнокова, 11».
- [ ] **Step 2:** `npm test` → падает; написать `tshirt.ts`; → зелёное.
- [ ] **Step 3:** `TeeHero` (как Hero главной: крошки, h1 «Печать на футболках в Калининграде» + акцент «от 1 штуки», строка «Сельма, ТЦ «Экватор», 2 этаж», «от N ₽» из `categoryFrom`/товара, кнопки «Рассчитать стоимость» `#calc` и «Создать свой дизайн», `Pic name="tee-hero"`/`tee-hero-mobile`); секция калькулятора `id="calc"` с `<Calculator client:visible category="textile" products={['tshirt-unisex','tshirt-kids']} hideCategories />` и `<noscript>`-подсказкой с кнопкой заявки; `TeePresets` — 4 карточки (настоящее фото, название, пояснение, цена «N ₽ за M шт», кнопки «Настроить в калькуляторе» → `CALC_APPLY_EVENT` и «Заказать» `data-order="<название варианта>"`); `ConstructorBanner` главной; `TeeDetails` — «Подробнее о футболке», `<details>` по разделам спецификации (Цвета с кругами и пометками, Ткань и характеристики, Размеры принтов со схемой рамок на футболке кодом, Размерный ряд взрослый и детский с `Pic name="tee-cat-measure"`, Уход).
- [ ] **Step 4:** Фото вариантов проверить глазами (`Read`); не футболка → заменить на настоящую работу с тегом `futbolki` из `portfolio.ts`.
- [ ] **Step 5:** Скриншоты 1440/1024/768/360; `npm test && npm run build && npm run check:links`; Commit «Футболки: первый экран, калькулятор, готовые варианты, конструктор, подробности».

### Task 4: Страница футболок — работы, отзывы, вопросы, таблица цен, разметка

**Files:** Create `src/components/tshirt/TeePrices.astro`; Modify `src/pages/pechat-na-futbolkah.astro`, `src/data/tshirt.ts` (+ тест), `src/components/home/{Works,Reviews,Faq}.astro` (только пропсы для переиспользования: список работ / отзывов / вопросов, заголовок), `docs/IMAGES.md`, `CLAUDE.md`.

**Interfaces:**
- Consumes: Task 3 страница; `portfolio`, `reviews`, `services` (запись `/pechat-na-futbolkah`: `faq`), `breadcrumbs`, `faqPage`, `service` из `schema.ts`; `findProduct('textile','tshirt-unisex'|'tshirt-kids').table`.
- Produces в `tshirt.ts`: `teeWorks` (работы с тегом `futbolki`, без `portfolio-14`), `teeReviews` (отзывы со словом «футболк», если < 3 — добрать из `homeReviews`), `teeFaq` (из `services.ts`).

- [ ] **Step 1:** Тесты в `tshirt.test.ts`: `teeWorks` не пуст, все с тегом `futbolki`, нет `portfolio-14`; `teeReviews.length >= 3`; `teeFaq` не пуст и совпадает с `services.ts`.
- [ ] **Step 2:** `npm test` → падает; реализовать; → зелёное.
- [ ] **Step 3:** На страницу: «Наши работы» (лента главной с `teeWorks`, без кота-выглядывающего или с ним — как в компоненте), «Отзывы» (`teeReviews`), «Вопросы» (`teeFaq` + FAQPage), `TeePrices` — открытая таблица в самом низу: таблицы `table` взрослой и детской футболки из `pricing.ts`, строки «Цветные футболки — от 5 шт» и «Каждый следующий принт −30%», ссылка «Все цены» (`/price`). JSON-LD: `breadcrumbs`, `service` (lowPrice из `fromPrice`), `faqPage`; `title` «Печать на футболках в Калининграде — от 1 штуки | Мастерская сувениров», `description` по спецификации без цен руками.
- [ ] **Step 4:** Проверка: `node scripts/shots.mjs` и `--no-js` для страницы (дописать в скрипт параметр адреса, если его нет); без JS видны таблица цен и подробности; клавиатура: калькулятор, варианты, `<details>`; `npm test && npm run build && npm run check:links`.
- [ ] **Step 5:** `docs/IMAGES.md` — три новые картинки (`tee-hero`, `tee-hero-mobile`, `tee-cat-measure`); `CLAUDE.md` — раздел «Футболки (16.11.2026)»: новые правила цен, калькулятор (файлы, событие `calc:apply`), страница и её блоки. Commit «Футболки: работы, отзывы, вопросы, таблица цен, разметка».
