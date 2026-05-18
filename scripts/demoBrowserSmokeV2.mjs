import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const port = Number(process.env.DEMO_SMOKE_PORT ?? 4174);
const usePagesPath = process.argv.includes('--pages');
const path = usePagesPath ? '/JCM-Command-Center/' : '/';
const url = `http://127.0.0.1:${port}${path}`;
const timeout = 10_000;

let browser;
let log = '';
const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

server.stdout.on('data', (chunk) => { log += chunk.toString(); });
server.stderr.on('data', (chunk) => { log += chunk.toString(); });

try {
  await waitForUrl(url, 30_000);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url, { waitUntil: 'networkidle' });

  await visible(page, 'JCM');
  await visible(page, 'PILOT');
  await click(page, 'PILOT');
  await visible(page, 'RESET DEMO SESSION');
  await click(page, 'RESET DEMO SESSION');
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
  if (log.trim()) console.error(`\nVite preview log:\n${log.trim()}`);
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

async function waitForUrl(targetUrl, maxMs) {
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${targetUrl}`);
}

async function close(code) {
  try { if (browser) await browser.close(); } catch {}
  try { server.kill('SIGTERM'); } catch {}
  setTimeout(() => process.exit(code), 250).unref();
}
