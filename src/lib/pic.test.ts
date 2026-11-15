import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { resolvePic } from './pic';
test('resolvePic: файл владельца → запасной → заглушка', () => {
  const pub = mkdtempSync(join(tmpdir(), 'pic-'));
  mkdirSync(join(pub, 'img/v3'), { recursive: true });
  mkdirSync(join(pub, 'img/products'), { recursive: true });
  writeFileSync(join(pub, 'img/v3/hero.png'), '');
  writeFileSync(join(pub, 'img/products/mugs-640.webp'), '');
  expect(resolvePic('hero', undefined, pub)).toEqual({ src: '/img/v3/hero.png' });
  expect(resolvePic('catalog-mugs', '/img/products/mugs-640.webp', pub)).toEqual({ src: '/img/products/mugs-640.webp' });
  expect(resolvePic('cat-peek', '/img/nope.webp', pub)).toEqual({ placeholder: true });
});
