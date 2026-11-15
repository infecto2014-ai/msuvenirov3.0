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

test('imageSize: PNG; null для непонятного и отсутствующего файла', () => {
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

// synthetic WebP headers: RIFF....WEBP + one chunk, padded to 30 bytes
const webp = (kind: string, fill: (b: Buffer) => void) => {
  const b = Buffer.alloc(30);
  b.write('RIFF', 0, 'ascii');
  b.writeUInt32LE(22, 4);
  b.write('WEBP', 8, 'ascii');
  b.write(kind, 12, 'ascii');
  fill(b);
  return b;
};

test('imageSize: WebP с заголовками VP8X, VP8 и VP8L', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pic-'));
  // VP8X (extended, e.g. with transparency): width-1 and height-1 as 24-bit numbers at 24 and 27
  writeFileSync(join(dir, 'x.webp'), webp('VP8X', (b) => { b.writeUIntLE(1254 - 1, 24, 3); b.writeUIntLE(1254 - 1, 27, 3); }));
  expect(imageSize(join(dir, 'x.webp'))).toEqual({ w: 1254, h: 1254 });
  // VP8 (lossy): start code 9d 01 2a at 23, 14-bit width and height at 26 and 28
  writeFileSync(join(dir, 'l.webp'), webp('VP8 ', (b) => { b.set([0x9d, 0x01, 0x2a], 23); b.writeUInt16LE(2400, 26); b.writeUInt16LE(1400, 28); }));
  expect(imageSize(join(dir, 'l.webp'))).toEqual({ w: 2400, h: 1400 });
  // VP8L (lossless): signature 0x2f at 20, then width-1 (14 bits) and height-1 (14 bits)
  writeFileSync(join(dir, 'n.webp'), webp('VP8L', (b) => { b[20] = 0x2f; b.writeUInt32LE((1400 - 1) | ((1000 - 1) << 14), 21); }));
  expect(imageSize(join(dir, 'n.webp'))).toEqual({ w: 1400, h: 1000 });
});

