# Анимации главной — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить на главную 7 утверждённых анимаций и сделать заголовок первого экрана в 3 строки.
**Architecture:** Только CSS (`transition`, `@starting-style`, `@keyframes`) и один маленький скрипт с IntersectionObserver для кота; правки в существующих компонентах.
**Tech Stack:** Astro 5.16, CSS-токены, Playwright для проверки.
**Spec:** `docs/superpowers/specs/2026-11-16-home-motion-design.md`

## Global Constraints
- Все ограничения Global Constraints из `docs/superpowers/plans/2026-11-15-home-page.md`, кроме строки про движение: теперь разрешены ровно 7 анимаций спецификации.
- Значения длительностей и кривых — дословно из спецификации; новые токены только `--ease-out`, `--ease-drawer`.
- `prefers-reduced-motion: reduce` — только прозрачность.
- Без библиотек.

## Review Focus
1. Окно заявки при быстром открытии-закрытии (двойной клик) не застревает полупрозрачным — проверить в Playwright.
2. Без поддержки `@starting-style` / `::details-content` всё открывается мгновенно и работает.
3. Кот в «Наших работах» не выглядывает повторно при каждой прокрутке туда-обратно.
4. Первый экран не мигает пустым при медленной загрузке (анимация не ждёт JS).
5. Меню «Каталог» и шторка телефона по-прежнему закрываются по Esc и клику вне.

---

### Task 1: Анимации главной
**Files:** Modify `src/styles/tokens.css`, `src/components/islands/OrderDialog.css`, `src/components/Header.astro`, `src/components/home/{Faq,Hero,Works,Catalog}.astro`; Create (если нужен) `src/scripts/works-cat.ts`.
- [ ] Step 1: Токены `--ease-out`, `--ease-drawer`.
- [ ] Step 2: Пункты 1–7 спецификации, каждый со своим блоком `prefers-reduced-motion`.
- [ ] Step 3: Заголовок первого экрана в 3 строки на ПК (колонка шире, кот не перекрыт) — скриншоты 1920/1440/1024.
- [ ] Step 4: Проверка в Playwright: окно заявки (открыть/закрыть, двойной клик), «Каталог», шторка 360, вопрос, кот выглядывает один раз; то же с `reducedMotion: 'reduce'`; `npm test && npm run build && npm run check:links` — зелёные.
- [ ] Step 5: Commit «Главная: аккуратные анимации окон, меню, вопросов, первого экрана и кота».
