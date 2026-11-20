// Picks the picture for a <Pic>: the owner's file in public/img/v3/<name>.(webp|png|jpg),
// else a fallback from public/, else a labelled placeholder (owner's photos are not ready yet).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXTS = ['png', 'webp', 'jpg'] as const;

export function resolvePic(
  name: string,
  fallback?: string,
  publicDir: string = join(process.cwd(), 'public'),
): { src: string } | { placeholder: true } {
  for (const ext of EXTS) {
    const rel = `/img/v3/${name}.${ext}`;
    if (existsSync(join(publicDir, rel))) return { src: rel };
  }
  if (fallback && fallback.startsWith('/') && existsSync(join(publicDir, fallback))) return { src: fallback };
  return { placeholder: true };
}

/** Pixel size of a WebP or PNG file read from its header; null when the file is missing or not understood.
    Lets a slot follow the real proportions of the owner's picture instead of the planned ones. */
export function imageSize(file: string): { w: number; h: number } | null {
  let b: Buffer;
  try {
    b = readFileSync(file);
  } catch {
    return null;
  }
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR') {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
    }
  }
  return null;
}
