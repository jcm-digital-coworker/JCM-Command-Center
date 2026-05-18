import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = Number(process.env.DEMO_SMOKE_PORT ?? 4174);
const BASE_ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE_PATH = process.env.GITHUB_PAGES === 'true' ? '/JCM-Command-Center/' : '/';
const BASE_URL = `${BASE_ORIGIN}${BASE_PATH}`;
const CI = process.env.CI === 'true';
const RUN_TIMEOUT_MS = Number(process.env.DEMO_SMOKE_TIMEOUT_MS ?? 60_000);

let browser;
let serverLog = '';
let finished = false;

const watchdog = setTimeout(async () => {
  if (finished) return;
  console.error(`FAIL browser demo smoke: timed out after ${RUN_TIMEOUT_MS}ms`);
  if (serverLog.trim()) {
    console.error('\nVite preview log:');
    console.error(serverLog.trim());
  }
  await cleanup(1);
}, RUN_TIMEOUT_MS);

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

server.stdout.on('data', (chunk) => {
  serverLog += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverLog += chunk.toString();
});

try {
  await waitForServer(BASE_URL);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await expectVisibleText(page, 'COMMAND CENTER');
  await expectVisibleText(page, 'PILOT');

  await clickText(page, 'PILOT');
  await expectVisibleText(page, 'RESET DEMO SESSION');
  await clickText(page, 'RESET DEMO SESSION');
  await page.waitForTimeout(250);

  await expectVisibleText(page, 'ACCOUNTABILITY TRIAGE');
  await expectVisibleText(page, 'DEPARTMENT HEALTH');
  await expectVisibleText(page, 'COMMAND');
  await expectVisibleText(page, 'ORDERS');
  await expectVisibleText(page, 'MENU');
  await expectVisibleText(page, 'BACK');

  await clickText(page, 'ORDERS');
  await expectUrlOrText(page, /orders/i, ['ORDERS', 'ORDER']);

  await clickText(page, 'COMMAND');
  await expectVisibleText(page, 'ACCOUNTABILITY TRIAGE');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await expectVisibleText(page, 'COMMAND');
  await expectVisibleText(page, 'ORDERS');

  console.log('PASS browser demo smoke: reset, triage, sticky mission bar, and nav controls are visible and clickable.');
  await cleanup(0);
} catch (error) {
  console.error('FAIL browser demo smoke');
  console.error(error instanceof Error ? error.message : String(error));
  if (serverLog.trim()) {
    console.error('\nVite preview log:');
    console.error(serverLog.trim());
  }
  await cleanup(1);
}

async function cleanup(exitCode) {
  if (finished) return;
  finished = true;
  clearTimeout(watchdog);
  try {
    if (browser) await browser.close();
  } catch {
    // ignore cleanup failure
  }
  try {
    if (!server.killed) server.kill('SIGTERM');
  } catch {
    // ignore cleanup failure
  }
  setTimeout(() => process.exit(exitCode), 250).unref();
}

async function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // keep polling
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

async function expectVisibleText(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout: CI ? 10_000 : 5_000 });
}

async function clickText(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout: CI ? 10_000 : 5_000 });
  await locator.click();
}

async function expectUrlOrText(page, urlPattern, textCandidates) {
  await page.waitForTimeout(250);
  if (urlPattern.test(page.url())) return;
  for (const text of textCandidates) {
    const count = await page.getByText(text, { exact: false }).count();
    if (count > 0) return;
  }
  throw new Error(`Expected URL ${urlPattern} or one of: ${textCandidates.join(', ')}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
