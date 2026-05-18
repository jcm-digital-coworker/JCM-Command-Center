import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const port = Number(process.env.DEMO_SMOKE_PORT ?? 4174);
const prefix = '/JCM-Command-Center/';
const baseUrl = `http://127.0.0.1:${port}${prefix}`;
const timeout = 10_000;

let browser;
const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    let pathname = requestUrl.pathname;
    if (!pathname.startsWith(prefix)) {
      res.writeHead(302, { Location: prefix });
      res.end();
      return;
    }

    pathname = pathname.slice(prefix.length);
    if (!pathname || pathname.endsWith('/')) pathname = 'index.html';

    const safePath = normalize(pathname).replace(/^\.\.(\/|\\|$)/, '');
    const filePath = join(process.cwd(), 'dist', safePath);
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(body);
  } catch {
    const index = await readFile(join(process.cwd(), 'dist', 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  }
});

try {
  await listen(server, port);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  await visible(page, 'JCM');
  await visible(page, 'PILOT');
  await click(page, 'PILOT');
  await visible(page, 'RESET DEMO SESSION');
  await click(page, 'RESET DEMO SESSION');
  await page.waitForTimeout(250);
  await click(page, 'PILOT');
  await page.waitForTimeout(250);

  await visible(page, 'ACCOUNTABILITY TRIAGE');
  await visible(page, 'DEPARTMENT HEALTH');
  await visible(page, 'COMMAND');
  await visible(page, 'ORDERS');
  await visible(page, 'MENU');
  await visible(page, 'BACK');

  await click(page, 'ORDERS');
  await page.waitForTimeout(250);
  await visible(page, 'ORDER');

  await click(page, 'COMMAND');
  await visible(page, 'ACCOUNTABILITY TRIAGE');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await visible(page, 'COMMAND');
  await visible(page, 'ORDERS');

  console.log('PASS browser demo smoke: reset, triage, sticky mission bar, and navigation controls work in Chromium.');
  await close(0);
} catch (error) {
  console.error('FAIL browser demo smoke');
  console.error(error instanceof Error ? error.message : String(error));
  await close(1);
}

async function visible(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
}

async function click(page, text) {
  const target = page.getByText(text, { exact: false }).first();
  await target.waitFor({ state: 'visible', timeout });
  await target.click();
}

function listen(httpServer, listenPort) {
  return new Promise((resolve) => httpServer.listen(listenPort, '127.0.0.1', resolve));
}

async function close(code) {
  try { if (browser) await browser.close(); } catch {}
  server.close(() => process.exit(code));
}

function contentType(filePath) {
  const extension = extname(filePath);
  if (extension === '.html') return 'text/html';
  if (extension === '.js') return 'text/javascript';
  if (extension === '.css') return 'text/css';
  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.json') return 'application/json';
  return 'application/octet-stream';
}
