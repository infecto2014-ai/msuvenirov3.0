#!/usr/bin/env node
// Проверка конфигурации агентов по docs/MODEL_POLICY.md.
// Запуск: node scripts/check-agents.mjs  (код выхода 1 — есть нарушения)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.claude/agents';
const ALLOWED = ['claude-fable-5-2', 'claude-opus-5-5', 'claude-sonnet-5-5'];
// Инструменты, которые агентам запрещены: создание/вызов других агентов.
const FORBIDDEN_TOOLS = ['Agent', 'Task', 'SendMessage'];

let errors = 0;
const rows = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
  const text = readFileSync(join(DIR, file), 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const fail = (msg) => { errors++; console.error(`ОШИБКА ${file}: ${msg}`); };
  if (!fm) { fail('нет YAML frontmatter'); continue; }
  const get = (k) => (fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.trim();
  const name = get('name'), model = get('model'), tools = get('tools');
  if (!name) fail('нет name');
  if (!model) fail('модель не указана явно');
  else if (!ALLOWED.includes(model)) fail(`модель «${model}» не из списка ${ALLOWED.join(', ')} (алиасы не допускаются)`);
  if (!tools) fail('не задан список tools — агент унаследует все инструменты, включая Agent');
  else for (const t of FORBIDDEN_TOOLS) if (tools.split(/,\s*/).includes(t)) fail(`запрещённый инструмент ${t}`);
  if (!/ЭСКАЛАЦИЯ|главный управляющий/.test(text)) fail('нет правила эскалации');
  rows.push(`${(name ?? file).padEnd(20)} ${model ?? '—'}`);
}
console.log(rows.join('\n'));
console.log(errors ? `\nНарушений: ${errors}` : `\nOK: ${rows.length} агентов, у всех явная модель из политики.`);
process.exit(errors ? 1 : 0);
