# MSUVENIROV 3.0 — памятка для Claude

Новая версия дизайна сайта msuvenirov.ru — мастерская печати «Мастерская сувениров» (Калининград, ТЦ «Экватор»). Владелец общается по-русски; отвечать по-русски, просто и без жаргона.

## Начало с чистого листа (владелец, 15.11.2026)
- 15.11.2026 владелец попросил удалить из репозитория всё прежнее (аудит, концепции, правила моделей, агенты, скилы) и начать новую версию дизайна заново. Прежнее содержимое лежит в ветке `backup/before-clean-15-11` — это только архив: правила оттуда больше не действуют, пока владелец не вернёт их сам.
- Действующий сайт — репозиторий `infecto2014-ai/msuvenirov2.0` (тестовая копия https://infecto2014-ai.github.io/msuvenirov2.0/). Там цены, тексты, фото, логотип и решения владельца (его `CLAUDE.md`).
- Стек, структура и стиль новой версии ещё не выбраны — решает владелец.

## Superpowers — работает ВСЕГДА (владелец, 15.11.2026)
- Установлен в проект: скилы `.claude/skills/` (из github.com/obra/superpowers, лицензия MIT, версия 7.0.2, коммит 22f0b46), лицензия — `.claude/skills/SUPERPOWERS-LICENSE`.
- Включается сам: хук `SessionStart` в `.claude/settings.json` запускает `.claude/hooks/superpowers-session-start`, и в начале каждого сеанса (а также после очистки и сжатия разговора) Claude получает правила `using-superpowers`. Отдельной просьбы владельца для скилов superpowers не нужно.
- Порядок работы: `brainstorming` (сначала вопросы и согласованное описание задачи) → `writing-plans` (план по шагам) → `subagent-driven-development` или `executing-plans` (выполнение, помощники + проверка) → `test-driven-development`, `requesting-code-review`, `verification-before-completion` → `finishing-a-development-branch`. Ошибки — `systematic-debugging`.
- Особенности установки:
  - Скилы лежат в проекте, а не как плагин, поэтому называются без приставки: `brainstorming`, а не `superpowers:brainstorming`. Где в текстах скилов написано `superpowers:<имя>` — вызывать `<имя>`.
  - Описания задач сохраняются в `docs/superpowers/specs/`, планы — в `docs/superpowers/plans/`; служебная папка `.superpowers/` — в `.gitignore`.
  - Отправка статистики авторам отключена (`SUPERPOWERS_DISABLE_TELEMETRY` в `.claude/settings.json`).
  - Скилл `using-git-worktrees` в облачном сеансе не нужен: работать в ветке, которую задаёт сеанс.
  - Слова владельца и эта памятка важнее правил скилов. С владельцем — простым языком, вопросы по одному и по делу.
  - Обновление: скачать свежий `obra/superpowers`, заменить папки скилов и файл хука, поправить версию здесь.
  - Если скилы ведут себя странно — скилл `diagnosing-superpowers`.

## UI UX Pro Max (владелец, 15.11.2026)
- `.claude/skills/ui-ux-pro-max/` (github.com/nextlevelbuilder/ui-ux-pro-max-skill, MIT, коммит d643997). Применять при любой работе над дизайном и вёрсткой — без отдельной просьбы.
- Поиск из корня проекта: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<запрос>" --design-system` или `--domain <ux|style|color|typography|landing>`, `--stack <стек>`.
- Порядок: сначала процесс superpowers (`brainstorming`), затем ui-ux-pro-max для самого дизайна.

## Общие правила
- Ничего не выдумывать о бизнесе: факты — из действующего сайта и слов владельца.
- Логотип — только настоящий логотип владельца (в `msuvenirov2.0`: `src/assets/logo.svg`, `docs/logo-png/`).
- Ничего не публиковать на рабочий сервер без явного согласия владельца.
