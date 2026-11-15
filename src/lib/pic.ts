// Picks the picture for a <Pic>: the owner's file in public/img/v3/<name>.(webp|png|jpg),
// else a fallback from public/, else a labelled placeholder (owner's photos are not ready yet).
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const EXTS = ['webp', 'png', 'jpg'] as const;

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
