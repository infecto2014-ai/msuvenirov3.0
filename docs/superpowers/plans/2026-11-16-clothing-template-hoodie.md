# Правки футболок, шаблон страницы одежды, худи — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Внести правки владельца, сделать общий шаблон страницы одежды и на нём — страницу худи.
**Architecture:** Цены — `pricing.ts`; калькулятор получает плитки изделий; страница футболок → шаблон `src/components/garment/*` + данные `src/data/garments/*.ts`; худи — вторая страница на шаблоне.
**Tech Stack:** Astro 5.16, Preact, TypeScript, vitest, Playwright.
**Spec:** `docs/superpowers/specs/2026-11-16-clothing-pages-design.md` (+ `2026-11-16-tshirt-page-design.md`)

## Global Constraints
- Все Global Constraints `docs/superpowers/plans/2026-11-16-tshirt-page.md` и `2026-11-15-home-page.md`.
- Главная не меняется, кроме шапки (значок сметы → счётчик на «Заявке») — проверять скриншотами главной до/после.
- Тексты со старого сайта — дословно; неподтверждённое (`todo` в 2.0) — с видимой пометкой «уточняйте у менеджера».
- ui-ux-pro-max перед вёрсткой; скриншоты 1440/1024/768/360, смотреть каждый.

## Review Focus
1. Позиция «Своя футболка» в смете/заявке называется понятно и считает только печать.
2. Старая смета с позициями из прошлой версии калькулятора (4 места, детская до А4) открывается и пересчитывается без ошибок.
3. Счётчик сметы на «Заявке» обновляется при добавлении из калькулятора и скрыт при 0; доступное имя кнопки содержит число.
4. На 360 px пять принтов и плитки изделий не вылезают за экран.
5. Худи: 2 600 ₽ без «от», цвета только белый/чёрный, нет пометки «от 5 шт».

---

### Task 1: Цены и калькулятор
**Files:** `src/data/pricing.ts`, `pricing.test.ts`, `src/components/islands/Calculator.tsx`/`.css`, `src/lib/calc-preset.ts` (+ тест).
**Produces:** у `tshirt-unisex` и `tshirt-kids` `places: 5`, у детской форматы А6–А3; `hoodie`: `blank: tiers([1],[2600])`, без `blankFrom`, `short` без «уточняйте наличие», `colorSet` белый/чёрный без минимума; prop калькулятора `tiles?: { id: string; label: string; product: string; preset?: Record<string,string> }[]` — при наличии показываются вместо списка изделий, группа `blank` скрывается, выбор плитки = продукт + preset (через `applyPreset`).
- [ ] Тесты: 5 принтов (5-й ×0,7), детская А3 считается, худи 2 600 ₽ при 1 и 50 шт, худи `color` = только white/black без `minQty`; `applyPreset` для плитки «своя» даёт `blank: 'own'`. → падают → реализовать → зелёные.
- [ ] Итог калькулятора: белая карточка, рамка `--line`, тень карточки, сумма и «Оформить заявку» синие, остальное `--ink`/`--muted`; телефонная полоса — в том же спокойном стиле.
- [ ] Commit «Калькулятор: плитки изделий, 5 принтов, детская до А3, худи 2600 ₽, спокойный итог».

### Task 2: Шапка — счётчик сметы на «Заявке»
**Files:** `src/components/Header.astro`, `src/scripts/estimate-badge.ts` (+ тест если меняется логика), `MobileBar.astro` при необходимости.
- [ ] Убрать кнопку-значок «Смета»; на кнопке «Заявка» — кружок с числом (`data-estimate-count`), `aria-label` «Заявка, в смете N позиций»/«Заявка»; скрыт при 0. Скриншоты шапки 1440/1024/360 и главной до/после.
- [ ] Commit «Шапка: без значка сметы, счётчик на кнопке «Заявка»».

### Task 3: Шаблон страницы одежды + футболки на нём
**Files:** Create `src/components/garment/{GarmentHero,GarmentPresets,GarmentDetails,GarmentPrices}.astro`, `src/data/garments/types.ts`, `src/data/garments/tshirt.ts` (перенос `src/data/tshirt.ts`), `src/layouts/GarmentPage.astro` (или общий компонент страницы); Modify `src/pages/pechat-na-futbolkah.astro`, `src/components/home/Reviews.astro` (prop `showRatings`, по умолчанию true); Delete `src/components/tshirt/*`, `src/data/tshirt.ts` (тест переезжает).
- [ ] Тип `GarmentPage`: `slug, title, description, h1, accent, crumbs, calc: { category; products; tiles? }, presets, colors?, specs, specsTodo?, sizes?: { adult?, kids?, todo? }, care, printSizes, worksTag, reviewWords, faqSlug, prices: { title, lead, products }, images: { hero, heroMobile, extra? }`.
- [ ] Футболки на шаблоне: плитки унисекс/детская/своя; без пометки «ориентировочные»; без полосы рейтингов; таблица цен — заголовок «Цена печати на футболках», подзаголовок из спецификации. Тесты данных (перенесённые) зелёные; скриншоты страницы футболок до/после — отличаются только правками.
- [ ] Commit «Шаблон страницы одежды; футболки на нём с правками владельца».

### Task 4: Худи
**Files:** Create `src/data/garments/hoodie.ts` (+ тест), `src/pages/pechat-na-hudi.astro`; Modify `src/lib/stubs.ts` (+ тест), `docs/IMAGES.md`, `CLAUDE.md`.
- [ ] Данные худи из `garments.ts` и `services.ts` 2.0 дословно; варианты с фото — настоящие работы с тегом `hudi`, иначе `/img/showcase/hoodie.webp`; цвета белый/чёрный; характеристики/размеры `todo` → видимая пометка «уточняйте у менеджера». Тесты: 4 варианта с ценой из quote, нет «от» у цены худи, работы с тегом `hudi`, вопросы из `services.ts`.
- [ ] Страница по шаблону; убрать из заглушек; JSON-LD как у футболок; скриншоты 1440/1024/768/360 и `--no-js`.
- [ ] `docs/IMAGES.md`: `hoodie-hero`, `hoodie-hero-mobile`; `CLAUDE.md`: раздел «Одежда — шаблон и худи (16.11.2026)» с решениями владельца из спецификации.
- [ ] Commit «Страница худи на шаблоне одежды».
