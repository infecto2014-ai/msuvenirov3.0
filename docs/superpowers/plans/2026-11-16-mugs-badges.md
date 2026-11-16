# Кружки и значки — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Use the ui-ux-pro-max skill for layout decisions (owner's request).

**Goal:** Страницы `/pechat-na-kruzhkah` и `/znachki` на шаблоне `GarmentPage`.
**Spec:** `docs/superpowers/specs/2026-11-16-mugs-badges-design.md`

## Global Constraints
- Все Global Constraints предыдущих планов одежды; тексты 2.0 дословно; цены из `pricing.ts`; страницы одежды и главная не меняются (скриншоты до/после).

## Review Focus
1. `constructor: false`: нет блока конструктора, вторая кнопка — «Отправить макет» (открывает заявку); у одежды всё как было.
2. Цены готовых вариантов = калькулятор; минимумы значков (10 / 25) и лимиты (300 / 1000).
3. Нет УФ-печати, цветных снаружи кружек, `portfolio-14`.
4. Без JS страницы читаются; на 360 px без прокрутки.

---
### Task 1: Шаблон (`constructor: false`) и кружки
**Files:** `src/data/garments/types.ts`, `src/layouts/GarmentPage.astro`, `src/components/garment/GarmentHero.astro`, `src/data/garments/mugs.ts` (+ тест), `src/pages/pechat-na-kruzhkah.astro`, `src/lib/stubs.ts` (+ тест), `docs/IMAGES.md`.
- [ ] Тесты → реализовать → зелёные; скриншоты; commit «Страница печати на кружках на шаблоне».

### Task 2: Значки
**Files:** `src/data/garments/badges.ts` (+ тест), `src/pages/znachki.astro`, `src/lib/stubs.ts`, `docs/IMAGES.md`, `CLAUDE.md` (раздел «Кружки и значки»).
- [ ] Тесты → реализовать → зелёные; скриншоты; commit «Страница значков на шаблоне».
