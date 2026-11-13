#!/usr/bin/env node
// Проверка конфигурации агентов по docs/MODEL_POLICY.md и docs/AGENT_ROUTING.md.
// Запуск: node scripts/check-agents.mjs  (код выхода 1 — есть нарушения)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.claude/agents';
// Утверждённый состав: агент -> модель. Новый агент без правки этого списка (с разрешения владельца) — нарушение.
const EXPECTED = {
  'project-director': 'claude-fable-5-2',
  'creative-director': 'claude-opus-5-5',
  'ux-architect': 'claude-opus-5-5',
  'seo-specialist': 'claude-opus-5-5',
  'frontend-engineer': 'claude-opus-5-5',
  'project-auditor': 'claude-sonnet-5-5',
  'qa-reviewer': 'claude-sonnet-5-5',
  'frontend-builder': 'claude-sonnet-5-5',
  'content-editor': 'claude-sonnet-5-5',
};
const FORBIDDEN_TOOLS = ['Agent', 'Task', 'SendMessage', 'Skill'];
const REQUIRED_SECTIONS = ['## Зона ответственности', '## Критерии завершения', '## Эскалация', '## Формат отчёта', 'Не создавай и не вызывай других агентов'];

let errors = 0;
const rows = [];
const seen = new Set();
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
  const text = readFileSync(join(DIR, file), 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const fail = (msg) => { errors++; console.error(`ОШИБКА ${file}: ${msg}`); };
  if (!fm) { fail('нет YAML frontmatter'); continue; }
  const get = (k) => (fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.trim();
  const name = get('name'), model = get('model'), tools = get('tools');
  if (!name) { fail('нет name'); continue; }
  if (name + '.md' !== file) fail(`имя файла не совпадает с name «${name}»`);
  seen.add(name);
  if (!(name in EXPECTED)) fail(`агент «${name}» не входит в утверждённый состав`);
  if (!model) fail('модель не указана явно');
  else if (EXPECTED[name] && model !== EXPECTED[name]) fail(`модель «${model}», по политике должна быть «${EXPECTED[name]}»`);
  if (!tools) fail('не задан список tools — агент унаследует все инструменты, включая Agent');
  else for (const t of FORBIDDEN_TOOLS) if (tools.split(/,\s*/).includes(t)) fail(`запрещённый инструмент ${t}`);
  for (const s of REQUIRED_SECTIONS) if (!text.includes(s)) fail(`нет обязательного раздела/правила: «${s}»`);
  rows.push(`${name.padEnd(20)} ${(model ?? '—').padEnd(20)} ${tools ?? '—'}`);
}
for (const n of Object.keys(EXPECTED)) if (!seen.has(n)) { errors++; console.error(`ОШИБКА: нет файла агента «${n}»`); }
console.log(rows.join('\n'));
console.log(errors ? `\nНарушений: ${errors}` : `\nOK: ${rows.length} агентов, состав и модели соответствуют политике.`);
process.exit(errors ? 1 : 0);
