# Сублимационная печать и DTF без нанесения — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Страницы `/sublimacionnaya-pechat` и `/dtf-pechat` на шаблоне одежды.
**Architecture:** Файлы данных `src/data/garments/{sublimation,transfers}.ts`, страницы из двух строк; в шаблоне — пустые `presets` (блок скрыт) и `href` у карточек `extra`.
**Spec:** `docs/superpowers/specs/2026-11-16-sublimation-dtf-design.md`

## Global Constraints
- Все Global Constraints `2026-11-16-workwear-sport.md` и предыдущих планов одежды.
- Тексты 2.0 (`/home/user/msuvenirov2.0/src/data/sublimationPage.ts`, `transfersPage.ts` — только чтение) дословно; цены — только из `pricing.ts`.
- Остальные страницы одежды и главная визуально не меняются — скриншоты до/после.

## Review Focus
1. Сублимация: нигде не обещана скидка на второй принт; максимум А3; футболка и шоппер — от 10 шт.
2. DTF-калькулятор (категория `transfers`): лист А4 = половина А3; 51+ листов — «индивидуально»; позиция сметы называется понятно.
3. Пустые `presets` не оставляют пустой блок; ссылки в карточках существуют (`check:links`).
4. Без JS обе страницы читаются.

---
### Task 1: Шаблон (пустые варианты, ссылки в карточках) и сублимационная печать
**Files:** `src/data/garments/types.ts`, `src/layouts/GarmentPage.astro`, `src/components/garment/GarmentDetails.astro` (или где рисуются карточки), `src/data/garments/sublimation.ts` (+ тест), `src/pages/sublimacionnaya-pechat.astro`, `src/lib/stubs.ts` (+ тест), `docs/IMAGES.md`.
- [ ] Тесты → падают → реализовать → зелёные; скриншоты 1440/1024/768/360, `--no-js`; другие страницы одежды до/после.
- [ ] Commit «Страница сублимационной печати на шаблоне одежды».

### Task 2: DTF и сублимация без нанесения
**Files:** `src/data/garments/transfers.ts` (+ тест), `src/pages/dtf-pechat.astro`, `src/lib/stubs.ts`, `docs/IMAGES.md`, `CLAUDE.md` (раздел «Сублимация и DTF без нанесения»).
- [ ] Тесты → падают → реализовать → зелёные; скриншоты.
- [ ] Commit «Страница DTF и сублимации без нанесения на шаблоне одежды».
