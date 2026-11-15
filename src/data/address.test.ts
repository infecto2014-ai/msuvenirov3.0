import { readFileSync, readdirSync } from 'node:fs';
import { expect, test } from 'vitest';
import { site } from './site';

test('адрес — Челнокова, 9', () => {
  expect(site.address.street).toBe('ул. Генерала Челнокова, 9');
  expect(site.address.place).toBe('ТЦ «Экватор», 2 этаж');
  expect(site.constructorUrl).toBe('https://infecto2014-ai.github.io/konstruktor/');
});

test('в данных нет старого номера дома', () => {
  for (const f of readdirSync('src/data').filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts'))) {
    expect(readFileSync(`src/data/${f}`, 'utf8'), f).not.toMatch(/Челнокова,?\s*11/);
  }
});
