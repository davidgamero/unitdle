import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const bridgeHtml = readFileSync(new URL('../../public/daily-progress.html', import.meta.url), 'utf8');

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-23T12:00:00Z') });
  await page.goto('./');
});

test('daily bridge returns a spoiler-free result, with a first-party retry when storage is partitioned', async ({ page }, info) => {
  await page.context().route('https://davidgamero.github.io/unitdle/daily-progress.html', route => route.fulfill({ contentType: 'text/html', body: bridgeHtml }));
  await page.route('https://games.bingusindustries.com/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Hub</title>' }));
  await page.goto('https://davidgamero.github.io/unitdle/daily-progress.html');
  await page.evaluate(() => localStorage.setItem(`unitdle:v1:${new Date().toISOString().slice(0, 10)}`, JSON.stringify({ target: 'pascal', turns: [null, 'newton', 'pascal'] })));
  await page.goto('https://games.bingusindustries.com/');
  const result = await page.evaluate(() => new Promise<unknown>(resolve => {
    const frame = document.createElement('iframe');
    const nonce = 'request-id-123456789';
    window.addEventListener('message', event => {
      if (event.origin !== 'https://davidgamero.github.io' || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'bongus-daily-ready') frame.contentWindow?.postMessage({ type: 'bongus-daily-request', nonce }, event.origin);
      if (event.data?.type === 'bongus-daily-result' && event.data.nonce === nonce) resolve(event.data);
    });
    frame.src = 'https://davidgamero.github.io/unitdle/daily-progress.html';
    document.body.append(frame);
  }));
  expect(result).toMatchObject(info.project.name === 'safari' ? { game: 'unitdle', status: 'unknown', attempts: 0 } : { game: 'unitdle', status: 'won', attempts: 3 });
  expect(JSON.stringify(result)).not.toContain('pascal');
  expect(JSON.stringify(result)).not.toContain('newton');
  await page.evaluate(() => {
    const verify = document.createElement('button');
    verify.textContent = 'Verify progress';
    verify.onclick = () => {
      const popup = window.open('about:blank', 'daily-progress-check', 'width=420,height=240');
      if (!popup) throw new Error('Popup blocked');
      const nonce = 'popup-request-123456789';
      window.addEventListener('message', event => {
        if (event.origin !== 'https://davidgamero.github.io' || event.source !== popup) return;
        if (event.data?.type === 'bongus-daily-ready') popup.postMessage({ type: 'bongus-daily-request', nonce }, event.origin);
        if (event.data?.type === 'bongus-daily-result' && event.data.nonce === nonce) (window as Window & { verifiedProgress?: unknown }).verifiedProgress = event.data;
      });
      popup.location.href = 'https://davidgamero.github.io/unitdle/daily-progress.html';
    };
    document.body.append(verify);
  });
  await page.getByRole('button', { name: 'Verify progress' }).click();
  const verified = await page.waitForFunction(() => (window as Window & { verifiedProgress?: unknown }).verifiedProgress);
  expect(await verified.jsonValue()).toMatchObject({ game: 'unitdle', status: 'won', attempts: 3 });
});

test('guess, reveal a dated clue, win, and restore under a Pages subpath', async ({ page }) => {
  const input = page.getByRole('combobox');
  await expect(page.locator('.clue')).toHaveCount(5);
  await expect(page.locator('.clue.locked')).toHaveCount(4);
  await expect(page.getByText('1971 · SI name adopted')).not.toBeVisible();
  await input.fill('Newton');
  await page.getByRole('option', { name: 'Newton N', exact: true }).click();
  await expect(page.locator('.past-guess')).toContainText('Newton');
  await expect(page.locator('.past-guess .unit-icon')).toBeVisible();
  await expect.poll(() => page.locator('.past-guess .unit-icon').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.getByText('1971 · SI name adopted')).toBeVisible();
  await page.reload();
  await expect(page.getByText('4 tries left')).toBeVisible();
  await input.fill('Pa');
  await input.press('Enter');
  await expect(page.getByRole('heading', { name: 'Pascal Pa' })).toBeVisible();
  await expect(page.getByText('2/5', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pascal Pa' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Source', exact: true })).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', './favicon.svg');
});

test('fifth clue is a first letter and practice is independent', async ({ page }) => {
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Skip for next clue' }).click();
  await expect(page.locator('.first-letter')).toHaveText('P');
  await expect(page.getByText('1 try left')).toBeVisible();
  await page.getByRole('button', { name: 'Skip and reveal answer' }).click();
  await expect(page.getByRole('heading', { name: 'Pascal Pa' })).toBeVisible();
  await expect(page.getByText('X/5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await expect(page.getByText('5 tries left')).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Skip for next clue' }).click();
  await page.getByRole('button', { name: 'Skip and reveal answer' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('5 tries left')).toBeVisible();
  await page.getByRole('button', { name: 'Daily', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pascal Pa' })).toBeVisible();
});

test('shelf shows icons, filters systems, and help restores focus', async ({ page }) => {
  const help = page.getByRole('button', { name: 'How to play' });
  await help.click();
  await expect(page.getByRole('dialog')).toContainText('Dates mark the stated milestone');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(help).toBeFocused();
  await page.getByRole('button', { name: 'Unit shelf' }).click();
  await page.getByRole('textbox', { name: 'Find a unit' }).fill('gallon');
  await expect(page.locator('.reference-list>a')).toHaveCount(2);
  await expect(page.locator('.reference-list .unit-icon')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Unit system' }).selectOption('Imperial');
  await expect(page.locator('.reference-list>a')).toHaveCount(1);
  await expect(page.locator('.reference-list>a')).toContainText('Imperial gallon');
  await page.getByRole('button', { name: 'Close dialog' }).click();
});

test('search validation, symbols, and keyboard navigation work without spending invalid turns', async ({ page }) => {
  const input = page.getByRole('combobox');
  await input.fill('not-a-unit');
  await page.getByRole('button', { name: 'Submit guess' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a listed unit.');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('5 tries left')).toBeVisible();
  await input.fill('S');
  await expect(page.getByRole('option').first().locator('.unit-name')).toHaveText('Siemens');
  await input.fill('s');
  await expect(page.getByRole('option').first().locator('.unit-name')).toHaveText('Second');
  await input.fill('');
  for (let i = 0; i < 12; i++) await input.press('ArrowDown');
  const chosen = await page.locator('[role="option"][aria-selected="true"] .unit-name').innerText();
  const scrollTop = await page.getByRole('listbox').evaluate(element => element.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);
  await input.press('Enter');
  await expect(page.locator('.past-guess')).toContainText(chosen);
  await expect(page.getByRole('listbox')).not.toBeVisible();
});

test('UTC rollover starts a fresh daily but preserves the prior save', async ({ page }) => {
  await page.getByRole('button', { name: 'Skip for next clue' }).click();
  await page.clock.fastForward(12 * 60 * 60 * 1000);
  await expect(page.getByText('#002')).toBeVisible();
  await expect(page.getByText('5 tries left')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('unitdle:v1:2026-11-23')!).turns)).toEqual([null]);
  await page.getByRole('combobox').fill('slug');
  await page.getByRole('combobox').press('Enter');
  await expect(page.getByRole('heading', { name: 'Slug slug' })).toBeVisible();
});

test('new units have working icons, sources, and distinct historical variants', async ({ page }) => {
  await page.getByRole('button', { name: 'Unit shelf', exact: true }).click();
  const search = page.getByRole('textbox', { name: 'Find a unit' });
  await search.fill('slug');
  const slug = page.locator('.reference-list>a').filter({ has: page.getByText('Slug', { exact: true }) });
  await expect(slug).toContainText('Mass · Imperial / US');
  await expect(slug).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Slug_(unit)');
  await expect.poll(() => slug.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await search.fill('rankine');
  await expect(page.locator('.reference-list>a')).toHaveCount(1);
  await expect(page.locator('.reference-list>a')).toContainText('Degree Rankine');
  await search.fill('');
  await page.getByRole('combobox', { name: 'Unit system' }).selectOption('Historical');
  await expect(page.locator('.reference-list')).toContainText('Egyptian royal cubit');
  await expect(page.locator('.reference-list')).toContainText('Degree Réaumur');
});

test('storage and clipboard failures have usable fallbacks', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Unavailable'); };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Denied')) } });
  });
  await page.reload();
  await expect(page.getByText('Progress won’t save in this browser.')).toBeVisible();
  await page.getByRole('combobox').fill('pascal');
  await page.getByRole('combobox').press('Enter');
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Copy result' })).toHaveValue(/Unitdle #1 · 1\/5\n🟩\nhttp:\/\/127\.0\.0\.1:4187\/unitdle\//);
});

test('single-column board and controls fit narrow screens', async ({ page }) => {
  for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(size);
    const rows = await page.locator('.board>li').evaluateAll(elements => elements.map(element => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    }));
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].left).toBe(rows[0].left);
      expect(rows[i].right).toBe(rows[0].right);
      expect(rows[i].top).toBeGreaterThan(rows[i - 1].bottom);
    }
    const button = await page.getByRole('button', { name: 'Submit guess' }).boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(size.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('clues and controls reflow with enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: 'html { font-size: 200%; } * { letter-spacing: .04em !important; }' });
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Skip for next clue' }).click();
  await expect(page.getByText('1 N/m²', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('combobox').fill('pascal');
  await page.getByRole('combobox').press('Enter');
  await expect(page.getByRole('heading', { name: 'Pascal Pa' })).toBeVisible();
});
