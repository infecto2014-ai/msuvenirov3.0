// Аудит: обход собранного старого сайта (dist) в браузере. Только чтение.
// Запуск: node crawl-site.mjs <папка dist> <куда сохранить pages.json> [папка для скриншотов]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const [dist, outFile, shotDir] = process.argv.slice(2);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const resolve = (p) => {
  p = decodeURIComponent(p.split('?')[0].split('#')[0]);
  const base = join(dist, p).replace(/\/$/, '');
  let f = base;
  if (existsSync(f) && statSync(f).isDirectory()) f = existsSync(join(f, 'index.html')) ? join(f, 'index.html') : base + '.html';
  if (!existsSync(f) && existsSync(base + '.html')) f = base + '.html';
  return existsSync(f) && statSync(f).isFile() ? f : null;
};
const server = createServer((req, res) => {
  const f = resolve(req.url);
  if (!f) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' }); res.end(readFileSync(f));
}).listen(4399);

const files = [];
const walk = (d, rel = '') => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { if (!['_astro', 'img', 'images', 'fonts', 'assets'].includes(n)) walk(p, rel + n + '/'); } else if (n.endsWith('.html')) files.push(rel + n); } };
walk(dist);
const toUrl = (f) => '/' + f.replace(/index\.html$/, '').replace(/\.html$/, '');

const browser = await chromium.launch();
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
if (shotDir) mkdirSync(shotDir, { recursive: true });
const pages = [];
for (const f of files.sort()) {
  const url = toUrl(f);
  const page = await desk.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto('http://localhost:4399' + url, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => {
    const m = (s) => document.querySelector(s)?.getAttribute('content') ?? null;
    const txt = (e) => e.textContent.replace(/\s+/g, ' ').trim();
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => { try { const j = JSON.parse(s.textContent); const arr = j['@graph'] ?? (Array.isArray(j) ? j : [j]); return arr.map((x) => x['@type']).flat(); } catch { return ['(ошибка разбора)']; } });
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const main = document.querySelector('main') ?? document.body;
    const imgs = [...document.querySelectorAll('img')];
    return {
      title: document.title, description: m('meta[name="description"]'), robots: m('meta[name="robots"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null, lang: document.documentElement.lang,
      ogTitle: m('meta[property="og:title"]'), ogDescription: m('meta[property="og:description"]'), ogImage: m('meta[property="og:image"]'), ogType: m('meta[property="og:type"]'),
      h1: [...document.querySelectorAll('h1')].map(txt), h2: [...main.querySelectorAll('h2')].map(txt), h3count: main.querySelectorAll('h3').length,
      jsonld: ld, breadcrumbs: [...document.querySelectorAll('nav[aria-label*="рошк"] a, .crumbs a, .breadcrumbs a')].map(txt),
      internal: [...new Set(links.filter((h) => h.startsWith('/') && !h.startsWith('//')))], external: [...new Set(links.filter((h) => /^https?:/.test(h)))],
      special: [...new Set(links.filter((h) => /^(tel:|mailto:|tg:|#)/.test(h)).map((h) => h.split('?')[0]))].slice(0, 30),
      images: imgs.length, imagesNoAlt: imgs.filter((i) => !i.hasAttribute('alt')).length, imagesEmptyAlt: imgs.filter((i) => i.getAttribute('alt') === '').length,
      words: txt(main).split(' ').length, mainChars: txt(main).length,
      islands: [...new Set([...document.querySelectorAll('astro-island')].map((i) => (i.getAttribute('component-url') || '').split('/').pop().split('.')[0]))],
      forms: document.querySelectorAll('form').length, inputs: [...document.querySelectorAll('main input, main select, main textarea')].length,
      orderButtons: document.querySelectorAll('[data-order]').length, chatButtons: document.querySelectorAll('[data-chat]').length,
      tables: main.querySelectorAll('table').length, details: main.querySelectorAll('details').length, videos: document.querySelectorAll('video, iframe').length,
      sections: [...main.querySelectorAll(':scope > section, :scope > div > section, :scope > *')].slice(0, 40).map((s) => (s.id ? '#' + s.id + ' ' : '') + (s.className && typeof s.className === 'string' ? '.' + s.className.split(' ').slice(0, 2).join('.') : s.tagName.toLowerCase())).filter(Boolean),
    };
  });
  await page.close();
  const mp = await mob.newPage();
  await mp.goto('http://localhost:4399' + url, { waitUntil: 'load' });
  await mp.waitForTimeout(400);
  const m = await mp.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, height: document.documentElement.scrollHeight,
    mobileBar: !!document.querySelector('.mobile-bar, .mbar, [class*="MobileBar"], [class*="mobilebar"]'), viewport: document.querySelector('meta[name="viewport"]')?.content ?? null }));
  if (shotDir) await mp.screenshot({ path: join(shotDir, (url === '/' ? 'index' : url.slice(1).replace(/\//g, '_')) + '-390.png'), fullPage: false });
  await mp.close();
  pages.push({ file: f, url, ...d, mobile: { ...m, overflowX: m.scrollW > m.innerW + 1 }, jsErrors: errors });
  process.stderr.write('.');
}
await browser.close(); server.close();
// проверка внутренних ссылок
const known = new Set(pages.map((p) => p.url.replace(/\/$/, '') || '/'));
for (const p of pages) p.brokenInternal = p.internal.filter((h) => { const clean = h.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'; return !known.has(clean) && !resolve(clean); });
const inbound = {}; for (const p of pages) for (const h of p.internal) { const c = h.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'; (inbound[c] ??= new Set()).add(p.url); }
for (const p of pages) p.inboundCount = (inbound[p.url.replace(/\/$/, '') || '/'] ?? new Set()).size;
writeFileSync(outFile, JSON.stringify(pages, null, 1));
console.error('\nстраниц:', pages.length);
