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
  await button(page, 'PILOT').click();
  await visible(page, 'RESET DEMO SESSION');
  await button(page, 'RESET DEMO SESSION').click();
  await page.waitForTimeout(300);

  const closeButton = page.getByRole('button', { name: /^X$/ }).first();
  if (await closeButton.count()) {
    await closeButton.click();
    await page.waitForTimeout(300);
  }

  await visible(page, 'ACCOUNTABILITY TRIAGE');
  await visible(page, 'ROLE TRIAGE BUCKETS');
  await visible(page, 'Management first-read');
  await visible(page, 'Plant Bottlenecks');
  await visible(page, 'Decision Needed');
  await visible(page, 'DEPARTMENT HEALTH');
  await button(page, 'COMMAND').waitFor({ state: 'visible', timeout });
  await button(page, 'ORDERS').waitFor({ state: 'visible', timeout });
  await button(page, 'MENU').waitFor({ state: 'visible', timeout });
  await button(page, 'BACK').waitFor({ state: 'visible', timeout });

  await button(page, 'PILOT').click();
  await selectRole(page, 'Production');
  await closePilot(page);
  await visible(page, 'Operator first-read');
  await visible(page, 'Do Now');
  await visible(page, 'Ask Lead');

  await button(page, 'PILOT').click();
  await selectRole(page, 'Management');
  await closePilot(page);
  await visible(page, 'Management first-read');

  await button(page, 'ORDERS').click();
  await page.waitForTimeout(300);
  await visible(page, 'ORDER');

  await button(page, 'COMMAND').click();
  await visible(page, 'ACCOUNTABILITY TRIAGE');
  await visible(page, 'ROLE TRIAGE BUCKETS');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await button(page, 'COMMAND').waitFor({ state: 'visible', timeout });
  await button(page, 'ORDERS').waitFor({ state: 'visible', timeout });

  console.log('PASS browser demo smoke: reset, role buckets, triage, sticky mission bar, and navigation controls work in Chromium.');
  await close(0);
} catch (error) {
  console.error('FAIL browser demo smoke');
  console.error(error instanceof Error ? error.message : String(error));
  await printBodySnippet(error?.page);
  await close(1);
}

function button(page, name) {
  return page.getByRole('button', { name: new RegExp(`^${escapeRegex(name)}$`, 'i') }).first();
}

async function visible(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
}

async function selectRole(page, roleName) {
  const roleSelect = page.getByLabel('ROLE').first();
  await roleSelect.waitFor({ state: 'visible', timeout });
  await roleSelect.selectOption(roleName);
  await page.waitForTimeout(300);
}

async function closePilot(page) {
  const closeButton = page.getByRole('button', { name: /^X$/ }).first();
  await closeButton.waitFor({ state: 'visible', timeout });
  await closeButton.click();
  await page.waitForTimeout(300);
}

async function printBodySnippet(page) {
  try {
    if (!page) return;
    const text = await page.locator('body').innerText({ timeout: 1000 });
    console.error(`\nVisible body text snippet:\n${text.slice(0, 1200)}`);
  } catch {
    // ignore diagnostic failure
  }
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
