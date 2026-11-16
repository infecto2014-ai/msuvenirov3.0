# Шопперы и бейсболки — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Страницы `/pechat-na-shopperah` и `/pechat-na-kepkah` на шаблоне одежды.
**Architecture:** Файлы данных `src/data/garments/{shopper,cap}.ts`, страницы из двух строк, при необходимости — общий раздел-карточки в шаблоне и контуры в `shapes.ts`.
**Spec:** `docs/superpowers/specs/2026-11-16-shoppers-caps-design.md`

## Global Constraints
- Все Global Constraints планов `2026-11-16-clothing-template-hoodie.md`, `2026-11-16-tshirt-page.md`, `2026-11-15-home-page.md`.
- Тексты 2.0 дословно, но с поправкой на правила владельца 16.11.2026 (цвета, минимумы, число принтов); ничего не выдумывать.
- Футболки, худи и главная не меняются визуально — скриншоты до/после.

## Review Focus
1. «Свой шоппер» считает только печать и в смете называется «Свой шоппер».
2. Сублимационный шоппер ниже 10 шт — подсказка, без цены.
3. Бейсболка 101+ — «индивидуально».
4. Готовый вариант с цветной бейсболкой/шоппером поднимает количество до 10.
5. Без JS обе страницы читаются (таблицы цен, «Подробнее»).

---
### Task 1: Шопперы
**Files:** `src/data/pricing.ts` (+ тест: own у шоппера), `src/data/garments/shopper.ts` (+ тест), `src/pages/pechat-na-shopperah.astro`, `src/lib/stubs.ts` (+ тест), шаблон (`types.ts`, `GarmentDetails.astro`) — раздел-карточки при необходимости, `shapes.ts` — контур шоппера; `docs/IMAGES.md`.
- [ ] Тесты → падают → реализовать → зелёные; скриншоты 1440/1024/768/360, `--no-js`; футболки/худи/главная до/после.
- [ ] Commit «Страница шопперов на шаблоне одежды».

### Task 2: Бейсболки
**Files:** `src/data/garments/cap.ts` (+ тест), `src/pages/pechat-na-kepkah.astro`, `src/lib/stubs.ts`, `shapes.ts` — контур бейсболки (или без схемы), `docs/IMAGES.md`, `CLAUDE.md` (раздел одежды: шопперы и бейсболки).
- [ ] Тесты → падают → реализовать → зелёные; скриншоты; футболки/худи/шопперы/главная не изменились.
- [ ] Commit «Страница бейсболок на шаблоне одежды».
