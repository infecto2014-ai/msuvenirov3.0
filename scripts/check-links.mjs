// Checks the built site: every internal href="/…" leads to a page in dist/, every src/srcset file exists,
// and the old address «Челнокова, 11» is gone. Exit code 1 on any problem. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) {
  console.error('Нет папки dist/ — сначала npm run build');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const clean = (url) => {
  let path = url.replace(/[?#].*$/, '');
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep as is */
  }
  return path;
};
const isLocal = (url) => url.startsWith('/') && !url.startsWith('//');
const pageExists = (path) => {
  const p = path.replace(/\/+$/, '');
  if (p === '') return existsSync(join(DIST, 'index.html'));
  return (
    existsSync(join(DIST, `${p}.html`)) ||
    (existsSync(join(DIST, p)) && statSync(join(DIST, p)).isFile()) ||
    existsSync(join(DIST, p, 'index.html'))
  );
};
const fileExists = (path) => existsSync(join(DIST, path)) && statSync(join(DIST, path)).isFile();

const problems = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const where = relative(DIST, file);
  if (html.includes('Челнокова, 11')) problems.push(`${where}: старый адрес «Челнокова, 11»`);

  for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
    const url = m[1];
    if (!isLocal(url)) continue;
    const path = clean(url);
    if (!pageExists(path)) problems.push(`${where}: битая ссылка ${url}`);
  }
  for (const m of html.matchAll(/\ssrc="([^"]*)"/g)) {
    const url = m[1];
    if (!isLocal(url)) continue;
    if (!fileExists(clean(url))) problems.push(`${where}: нет файла ${url}`);
  }
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url || !isLocal(url)) continue;
      if (!fileExists(clean(url))) problems.push(`${where}: нет файла ${url} (srcset)`);
    }
  }
}

if (problems.length) {
  console.error(`Найдено проблем: ${problems.length}`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`Проверено страниц: ${htmlFiles.length}. Битых ссылок и файлов нет.`);
