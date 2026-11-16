// Screenshots of the home page (or of another page: pass its address, e.g. /pechat-na-futbolkah) at 1440 / 1024 / 768 / 360 px for a visual check.
// Usage: npm run build && node scripts/shots.mjs <folder> [/page-address] [--no-js]
// Starts `astro preview`, saves <page>-<width>.png (whole page) into <folder>, prints console errors
// and, if the page scrolls sideways, the element that sticks out. Exit code 1 on any problem.
// Playwright is taken from the environment (it is not a project dependency).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith('--'));
const pagePath = args.find((a) => a.startsWith('/')) ?? '/'; // page to shoot, e.g. /pechat-na-futbolkah
const slug = pagePath === '/' ? 'home' : pagePath.slice(1);
if (!outDir) {
  console.error('Укажите папку для снимков: node scripts/shots.mjs <папка> [/адрес-страницы] [--no-js]');
  process.exit(1);
}
const noJs = args.includes('--no-js');
const WIDTHS = [1440, 1024, 768, 360];
const PORT = 4329;
const BASE = `http://localhost:${PORT}`;
mkdirSync(resolve(outDir), { recursive: true });

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
});
const stopServer = () => {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* already stopped */
  }
};

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(BASE + '/');
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('astro preview не запустился (нет dist/? сначала npm run build)');
}

let problems = 0;
try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: !noJs });
    const page = await ctx.newPage();
    const errors = [];
    // Yandex Metrika is an outside script and may be unreachable here — answer it with an empty script
    await page.route(/mc\.yandex\.ru/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    page.on('console', (m) => m.type() === 'error' && errors.push(`${m.text()} ${m.location().url ?? ''}`.trim()));
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push(`не загрузилось: ${r.url()}`));
    await page.goto(BASE + pagePath, { waitUntil: 'networkidle' });
    // lazy pictures: scroll through the page so every one of them loads before the shot
    // (with the mouse wheel: in a page without JavaScript timers inside evaluate() never fire)
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(40);
    }
    await page.mouse.wheel(0, -height - 1000);
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      if (de.scrollWidth <= de.clientWidth) return null;
      const limit = de.clientWidth;
      const out = [];
      for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width && r.right > limit + 0.5) {
          const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
          out.push(`${name} (правый край ${Math.round(r.right)} px)`);
          if (out.length >= 5) break;
        }
      }
      return { scrollWidth: de.scrollWidth, clientWidth: limit, offenders: out };
    });

    const file = join(resolve(outDir), `${slug}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${width} px → ${file}`);
    if (overflow) {
      problems++;
      console.log(`  горизонтальная прокрутка: ${overflow.scrollWidth} > ${overflow.clientWidth}`);
      overflow.offenders.forEach((o) => console.log('  выступает: ' + o));
    }
    if (errors.length) {
      problems++;
      errors.forEach((e) => console.log('  ошибка консоли: ' + e));
    }
    await ctx.close();
  }
  await browser.close();
} catch (e) {
  console.error(e);
  problems++;
} finally {
  stopServer();
}
console.log(problems ? `Найдено проблем: ${problems}` : 'Ошибок консоли и горизонтальной прокрутки нет');
process.exit(problems ? 1 : 0);
