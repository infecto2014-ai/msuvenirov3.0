# Спецодежда и спортивная форма — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Страницы `/pechat-na-specodezhde` и `/pechat-na-sportivnoy-forme` на шаблоне одежды.
**Architecture:** Файлы данных `src/data/garments/{workwear,sport}.ts`, страницы из двух строк; в шаблоне — необязательные `faq` и `works` у `GarmentPage`; `own-item` — до 5 принтов.
**Spec:** `docs/superpowers/specs/2026-11-16-workwear-sport-design.md`

## Global Constraints
- Все Global Constraints планов `2026-11-16-shoppers-caps.md`, `2026-11-16-clothing-template-hoodie.md`, `2026-11-16-tshirt-page.md`, `2026-11-15-home-page.md`.
- Тексты 2.0 (`/home/user/msuvenirov2.0/src/data/workwearPage.ts`, `sportPage.ts` — только чтение) дословно, с поправками только по ответам владельца в описании; ничего не выдумывать.
- Футболки, худи, шопперы, бейсболки и главная визуально не меняются — скриншоты до/после.
- Цены в тексты руками не писать — из `pricing.ts`.

## Review Focus
1. `own-item`: 5 принтов, 5-й ×0,7; старые позиции сметы с `own-item` (3 принта) открываются и пересчитываются.
2. «Своя спецодежда» / «Своя форма» в смете называются по плитке и считают только печать.
3. Вопросы страниц — из поля `faq`, разметка FAQPage строится из них; на других страницах вопросы по-прежнему из `services.ts`.
4. Тексты: фамилия+номер — один принт; без доплаты за разные фамилии; условия подбора формы как у спецодежды; нет «до 3 принтов», «второй и третий», «халат», вышивки как предложения.
5. Без JS обе страницы читаются.

---
### Task 1: Шаблон (`faq`, `works`), `own-item` до 5 принтов, спецодежда
**Files:** `src/data/pricing.ts` (+ тест), `src/data/garments/types.ts`, `select.ts` (+ тест), `src/data/garments/workwear.ts` (+ тест), `src/pages/pechat-na-specodezhde.astro`, `src/lib/stubs.ts` (+ тест), `docs/IMAGES.md`.
- [ ] Тесты → падают → реализовать → зелёные; скриншоты 1440/1024/768/360, `--no-js`; другие страницы одежды и главная до/после.
- [ ] Commit «Страница спецодежды на шаблоне одежды; своя вещь — до 5 принтов».

### Task 2: Спортивная форма
**Files:** `src/data/garments/sport.ts` (+ тест), `src/pages/pechat-na-sportivnoy-forme.astro`, `src/lib/stubs.ts`, `docs/IMAGES.md`, `CLAUDE.md` (раздел «Спецодежда и спортивная форма» с ответами владельца).
- [ ] Тесты → падают → реализовать → зелёные; скриншоты; остальные страницы не изменились.
- [ ] Commit «Страница спортивной формы на шаблоне одежды».
