# Unitdle 🧪

**Name the unit. Five clues.**

[Play Unitdle](https://davidgamero.github.io/unitdle/)

A compact beaker-lab guessing game with **120 units** across SI, imperial,
US customary, CGS, historical, apothecaries, astronomy, atomic physics, time,
and digital information.
Each unit has a small, locally bundled illustrated icon.

The expanded shelf includes slug, slinch, poundal, troy ounce, furlong, poise,
barn, Egyptian royal cubit, Réaumur, and smoot. Rankine remains included.

## Play

**Field → milestone → measures → relation → first letter.**

Wrong guesses and skips use one of five turns. Type a name, alias, or symbol;
choose a suggestion or press Enter. Arrow keys select another match.
Symbols are case-sensitive: `s` is second, `S` is siemens.

- Daily puzzles reset at **00:00 UTC**; practice is unlimited.
- Progress saves in this browser. Clipboard-denied browsers get copyable text.
- Shares use 🟨 wrong · ⬜ skipped · 🟩 solved, with no answer spoilers.
- The book button opens the unit shelf, with system filters and source links.

Dates identify the **stated milestone**, not a universal “invention year.” Some
ancient units have no single start year. US and imperial liquid units are separate
answers. Conversions use the named variant; rounded values are marked `≈`.
Words from the answer are hidden in text clues. See [SOURCES.md](SOURCES.md).

## Develop

Node.js 22.12+ and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

React, TypeScript, Vite, and Lucide. System fonts, bundled Twemoji SVG icons, and
original beaker artwork; no runtime font/image services, backend, or API keys.

- `src/catalog.ts` and `src/extended-units.ts`: curated units, variants, icon assignments, and sources.
- `public/icons/`: Twemoji artwork and license; refresh with `npx tsx scripts/fetch-icons.ts`.
- `src/game.ts`: rules, aliases, saves, clues, sharing, and UTC scheduling.
- `src/daily-pool.json`: original frozen 70-unit schedule.
- `src/daily-schedule-v2.json`: expanded 120-unit cycle, active November 24, 2026 UTC.
- `src/App.tsx`: single-column board, reference, help, and search.
- `AGENTS.md`: project conventions.

The expanded catalog is available immediately in practice and the shelf. Daily
puzzles use the expanded cycle from **November 24, 2026, 00:00 UTC**; prior dates
retain their original answers. Never reorder a released pool. Future expansions
must introduce a new schedule with a future activation date.

## GitHub Pages

Pushes to `main` run unit tests, build, and desktop/mobile/WebKit browser checks,
then publish `dist/`. Enable **Settings → Pages → Source → GitHub Actions**.
Pull requests run checks without deploying. Tests serve the build under
`/unitdle/` to verify project-site paths.

Original app code: MIT. Factual references are credited in `SOURCES.md`.
