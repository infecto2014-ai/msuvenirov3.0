import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { imageSize, resolvePic } from './pic';
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

test('imageSize: размеры настоящих webp и png владельца, null для непонятного файла', () => {
  const pub = join(process.cwd(), 'public');
  expect(imageSize(join(pub, 'img/v3/constructor-tee.webp'))).toEqual({ w: 715, h: 890 });
  expect(imageSize(join(pub, 'img/v3/hero-mobile.webp'))).toEqual({ w: 1200, h: 1200 });
  expect(imageSize(join(pub, 'img/v3/hero.webp'))).toEqual({ w: 1642, h: 958 });
  const dir = mkdtempSync(join(tmpdir(), 'pic-'));
  // minimal PNG header: signature + IHDR with 40×30
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
  png.write('IHDR', 12, 'ascii');
  png.writeUInt32BE(40, 16);
  png.writeUInt32BE(30, 20);
  writeFileSync(join(dir, 'a.png'), png);
  expect(imageSize(join(dir, 'a.png'))).toEqual({ w: 40, h: 30 });
  writeFileSync(join(dir, 'b.webp'), 'not an image');
  expect(imageSize(join(dir, 'b.webp'))).toBeNull();
  expect(imageSize(join(dir, 'missing.webp'))).toBeNull();
});
