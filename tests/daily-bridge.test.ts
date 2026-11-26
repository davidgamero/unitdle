import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../public/daily-progress.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('Daily bridge missing');

function bridge(round: unknown, blocked = false, pathname = '/unitdle/daily-progress.html', storageAccess = true, popup = false) {
  const sent: { data: Record<string, unknown>; origin: string }[] = [];
  const target = { postMessage: (data: Record<string, unknown>, origin: string) => sent.push({ data, origin }) };
  const callbacks: Record<string, (event: Record<string, unknown>) => void | Promise<void>> = {};
  let closed = false;
  const window = { parent: target, opener: popup ? target : null, close: () => { closed = true; }, addEventListener: (type: string, handler: (event: Record<string, unknown>) => void | Promise<void>) => { callbacks[type] = handler; } };
  const storage = { getItem: (key: string) => { if (blocked) throw new Error('Unavailable'); assert.equal(key, 'unitdle:v1:2026-11-26'); return round === null ? null : JSON.stringify(round); } };
  runInNewContext(script!, { window, document: { hasStorageAccess: async () => storageAccess }, location: { hostname: 'davidgamero.github.io', pathname }, Date: class extends Date { constructor() { super('2026-11-26T12:00:00Z'); } }, localStorage: storage });
  return { sent, target, get closed() { return closed; }, request: (origin = 'https://games.bingusindustries.com', source: object = target, nonce = 'request-id-123456789') => callbacks.message?.({ origin, source, data: { type: 'bongus-daily-request', nonce } }) };
}

test('shares only daily status and turn count, not the unit or guesses', async () => {
  const b = bridge({ target: 'pascal', turns: [null, 'newton', 'pascal'] });
  assert.equal(b.sent[0].data.type, 'bongus-daily-ready');
  assert.equal(b.sent[0].origin, 'https://games.bingusindustries.com');
  await b.request('https://evil.example'); await b.request(undefined, {}); await b.request(undefined, undefined, 'short');
  assert.equal(b.sent.length, 1);
  await b.request();
  assert.equal(b.sent[1].data.status, 'won');
  assert.equal(b.sent[1].data.attempts, 3);
  assert.equal(b.sent[1].data.game, 'unitdle');
  assert.equal(b.sent[1].data.date, '2026-11-26');
  assert.equal(JSON.stringify(b.sent).includes('pascal'), false);
  assert.equal(JSON.stringify(b.sent).includes('newton'), false);
});

test('new, in-progress, lost, invalid, and blocked saves do not claim a false win', async () => {
  for (const [round, status, attempts] of [
    [null, 'new', 0], [{ target: 'pascal', turns: [null, 'newton'] }, 'in-progress', 2],
    [{ target: 'pascal', turns: [null, null, null, null, null] }, 'lost', 5],
    [{ target: 'pascal', turns: ['pascal', null] }, 'unknown', 0],
    [{ target: 'pascal', turns: ['invalid guess'] }, 'unknown', 0],
  ] as const) {
    const b = bridge(round); await b.request();
    assert.equal(b.sent[1].data.status, status);
    assert.equal(b.sent[1].data.attempts, attempts);
  }
  const blocked = bridge(null, true); await blocked.request();
  assert.equal(blocked.sent[1].data.status, 'unknown');
  const partitioned = bridge(null, false, undefined, false); await partitioned.request();
  assert.equal(partitioned.sent[1].data.status, 'unknown');
  const popup = bridge({ target: 'pascal', turns: ['pascal'] }, false, undefined, false, true); await popup.request();
  assert.equal(popup.sent[1].data.status, 'won');
  assert.equal(popup.closed, true);
  assert.equal(bridge(null, false, '/another-project/daily-progress.html').sent.length, 0);
});
