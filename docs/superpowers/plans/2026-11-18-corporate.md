# Страница для компаний — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Здесь выбран узкий субагент для данных, основная модель для интерфейса и независимый финальный обзор.

**Goal:** Реализовать /korporativnym-klientam в дизайне 3.0.
**Architecture:** Статическая Astro-страница, типизированные данные, общий первый экран и окно заявки; без новых зависимостей.
**Tech Stack:** Astro 5, Preact для существующей заявки, npm.
**Spec:** docs/superpowers/specs/2026-11-18-corporate-design.md

## Global Constraints
Контакты из site.ts, цены/минимумы из pricing.ts. Реальные фото и логотипы. Нет client-3/portfolio-14, неподтверждённых бизнес-условий, калькулятора, новых цен, доставки и обещаний срочного тиража. Не отправлять формы. Публикация в main разрешена владельцем ранее.

## Review Focus
- Низкая ширина: нет горизонтальной прокрутки, кот выше кнопок.
- Нет JS: полные тексты доступны в details.
- Старые адреса/цветовые минимумы не переносятся.
- Кейсы и логотипы подтверждены источниками и файлами.
- Запрос КП открывает существующее окно с комментарием без отправки.

## Task 1: данные (субагент)
**Files:** src/data/corporate.ts, src/data/corporate.types.ts.
**Consumes:** .superpowers/corporate-v2-source.ts, .superpowers/corporate-v2-types.ts, site.ts, pricing.ts, portfolio.ts.
**Produces:** export corporate: CorporatePage, исходная форма данных 2.0 (directions/audiences/process/terms/cases/seo/faq/todo).
- [ ] Перенести типы и данные, исправить адрес/цветовые минимумы и отсутствующие ссылки/фото.
- [ ] Проверить существование локальных ресурсов и типы. Не менять другие файлы.
- [ ] Отчёт .superpowers/sdd/corporate/task-1-report.md: изменения, проверка, найденные противоречия.

## Task 2: интерфейс и новый кот (основная модель)
**Files:** src/pages/korporativnym-klientam.astro, src/components/corporate/*, public/img/v3/corporate-hero*.webp, src/lib/stubs.*.
- [ ] Подключить UX Pro Max и сохранить текущие токены оформления.
- [ ] Создать кота с корпоративным набором по имеющимся референсам, установить WebP для двух экранов.
- [ ] Собрать блоки по Spec; сохранить реальные кейсы и CTA запроса КП.
- [ ] Зарегистрировать страницу и обновить тест заглушек.

## Task 3: проверка и публикация
- [ ] Основная модель проверяет данные субагента, отдельный обзор проверяет результат страницы по diff.
- [ ] npm test; npm run build; npm run check:links.
- [ ] Браузерные сценарии из Review Focus, осмотр снимков.
- [ ] Обновить CLAUDE.md, IMAGES.md, RECOVERY.md и промпты.
- [ ] После успешных проверок отправить только эту работу в main и дождаться успешной публикации GitHub Pages.

