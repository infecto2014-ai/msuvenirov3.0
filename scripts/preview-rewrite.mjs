// Prepares dist/ for the test preview on GitHub Pages (https://<user>.github.io/<repo>/):
// adds the repo prefix to internal links and hides the copy from search engines.
// Usage: node scripts/preview-rewrite.mjs /msuvenirov2.0
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base.startsWith('/')) throw new Error('Pass the base path, e.g. /msuvenirov2.0');
const dist = 'dist';

// Top-level names in dist: page slugs (price.html -> price) and folders/files (_astro, img, ...)
const names = readdirSync(dist).map((n) => n.replace(/\.html$/, ''));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const alt = names.map(esc).sort((a, b) => b.length - a.length).join('|');
// a quote / ( / = / &quot; followed by "/name" where name ends at a delimiter
const pathRe = new RegExp(`((?:["'(=\`]|&quot;))/(${alt})(?=[/"'?#)&\`\\s]|$)`, 'g');
// links to the home page: "/" , "/#anchor", "/?q"
const homeRe = /((?:href|action)=")\/(?=["#?])/g;
// srcset lists several URLs separated by ", " — every entry needs the prefix, not only the first
const srcsetRe = /(srcset=")([^"]*)"/g;
const srcsetEntryRe = /(^|,\s*)\/(?!\/)/g;

const files = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (['.html', '.js', '.css', '.webmanifest', '.xml'].includes(extname(p))) files.push(p);
  }
})(dist);

let changed = 0;
for (const f of files) {
  let s = readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(srcsetRe, (_, a, list) => `${a}${list.replace(srcsetEntryRe, (_m, sep) => `${sep}${base}/`)}"`);
  s = s.replace(pathRe, `$1${base}/$2`).replace(homeRe, `$1${base}/`);
  if (f.endsWith('.html')) {
    s = s.replace(/<meta name="robots"[^>]*>/g, '');
    s = s.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">');
  }
  if (s !== before) { writeFileSync(f, s); changed++; }
}
writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(dist, '.nojekyll'), '');
console.log(`preview: rewrote ${changed} of ${files.length} files with base ${base}`);
