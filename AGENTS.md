# Unitdle

- React + TypeScript + Vite. Use Node.js 22.12+ and npm. Static GitHub Pages app,
  with relative asset URLs (`base: './'`) so `/unitdle/` hosting works.
- Compact, single-column beaker-lab theme: pale paper, mint glass, green liquid
  accents, measuring marks, readable system type. No promotional eyebrows or hero
  copy. Keep labels, clues, controls, and explanations brief.
- Five turns: field → dated milestone → measures → relation → first letter.
  Wrong guesses and skips each consume a turn. Exact answers win, even on turn 5.
- SI, imperial, US customary, CGS, astronomy, atomic, digital, and other units
  share the catalog. Label regional and historical variants precisely. A pound
  is mass; pound-force is force. US liquid measures differ from imperial ones.
- Dates name a documented adoption, redefinition, or historical milestone—not
  necessarily invention. Use `null` plus an honest explanation for undated origins.
  Keep sources in the catalog and `SOURCES.md`; distinguish exact from approximate
  conversions, and specify which definition is used when units have variants.
- Bundled unit icons are decorative and appear beside readable names in search,
  submitted guesses, the reference shelf, and results. They are not answer clues.
  Keep Twemoji attribution and license; use local SVGs rather than device emoji fonts.
- Keep game rules in `src/game.ts`, facts in `src/catalog.ts`. SI symbols are
  case-sensitive (`s` vs `S`, `h` vs `H`); names and aliases are case-insensitive.
  Match exact whole answer words in text clues and hide them with `[hidden]`.
- Preserve stable IDs, validated browser saves, and the frozen daily pool. Never
  reorder `src/daily-pool.json` after launch; add future schedules explicitly.
  Daily puzzles reset at 00:00 UTC. Practice saves are independent of daily saves.
- Suggestions support immediate tap/Enter, arrows, and Escape. Keep names visible,
  preserve focus when dialogs close, and allow large text and narrow layouts to
  reflow. Respect reduced motion and distinguish outcomes by symbols and color.
- Before releases: `npm test`, `npm run build`, and `npm run test:e2e`. Browser
  tests cover Chromium desktop/mobile and WebKit, including the Pages subpath.
- GitHub Actions tests the committed snapshot before publishing. Inspect staged
  files before pushing. Ignore builds, dependencies, test output, and `.private/`.
  Never commit credentials. Verify public HTML, assets, and gameplay after release.
