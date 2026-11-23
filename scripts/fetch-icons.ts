import { mkdir, writeFile } from 'node:fs/promises';
import { units } from '../src/catalog';
import { iconFile } from '../src/icons';

// Pin the artwork so refreshing does not silently change existing unit icons.
const revision = 'b6b55fef1e8636b540a6d016a4729ca8cdf2e60b';
const base = `https://raw.githubusercontent.com/jdecked/twemoji/${revision}`;
await mkdir('public/icons', { recursive: true });
const names = [...new Set(units.map(unit => iconFile(unit.icon)))];
let index = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (index < names.length) {
    const name = names[index++];
    const response = await fetch(`${base}/assets/svg/${name}`, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const svg = await response.text();
    if (!svg.includes('<svg')) throw new Error(`Invalid icon: ${name}`);
    await writeFile(`public/icons/${name}`, svg);
  }
}));
const license = await fetch(`${base}/LICENSE-GRAPHICS`, { signal: AbortSignal.timeout(20_000) });
if (!license.ok) throw new Error(`License: HTTP ${license.status}`);
await writeFile('public/icons/LICENSE.txt', await license.text());
console.log(`Bundled ${names.length} Twemoji icons at ${revision}.`);
