# Блокноты и упрощение страниц — план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Проверять каждую независимую задачу перед объединением.

**Goal:** Реализовать страницу блокнотов с единым прайсом и запрошенные визуальные правки.
**Architecture:** Общий GarmentPage, продукт notebook в flyers, неизменные интерфейсы заявки/сметы. Визуальные композиции — PNG.
**Tech Stack:** Astro5, Preact, TypeScript, Vitest, Playwright.
**Spec:** docs/superpowers/specs/2026-11-20-notebooks-and-cleanup-design.md

## Global Constraints
Не выдумывать бизнес-факты; не менять другие цены. Листы внутри чистые, печать внутри только индивидуально. Рабочий сервер не затрагивать.

## Review Focus
Граница10/30; точность195,50 и5865; ранее сохранённый notebook безcover; добавление в смету и восстановление; шапка на промежуточных ширинах.

- [x] Pricing: failing tests → новый вариант обеих обложек/цены/30листов → passing tests.
- [x] Page: данные notebooks + страница + REAL_PAGES + ссылки меню; UXProMax, тексты из подтверждённых условий, без выдуманных работ.
- [x] Visual: кружки без оборудования + PNG блокнотов; удалить CalendarOverview и ненужные изображения, привести text-only отзывы.
- [x] Root review: проверить diff/тесты/сборку/ссылки/браузер, обновить контекст, отправить в main.
