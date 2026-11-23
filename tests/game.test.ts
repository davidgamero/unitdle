import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { units } from '../src/catalog';
import { iconFile } from '../src/icons';
import pool from '../src/daily-pool.json';
import expandedSchedule from '../src/daily-schedule-v2.json';
import { byId, clues, dailyUnit, DAY, EPOCH, exactUnit, play, practiceUnit, puzzleNumber, restore, searchUnits, shareText, status, utcDate, type Round } from '../src/game';

test('catalog covers diverse systems, distinct variants, dated milestones, and icons', () => {
  assert.equal(units.length, 120);
  assert.equal(new Set(units.map(unit => unit.id)).size, units.length);
  assert.equal(new Set(units.map(unit => unit.symbol)).size, units.length);
  for (const system of ['SI', 'Imperial', 'US customary', 'CGS', 'Astronomy', 'Digital', 'Atomic']) assert.ok(units.some(unit => unit.system === system));
  for (const unit of units) {
    assert.ok(unit.icon && unit.symbol && unit.source.startsWith('https://') && unit.milestone);
    assert.ok(existsSync(`public/icons/${iconFile(unit.icon)}`), unit.id);
    assert.ok(unit.year === null || (unit.year >= 1000 && unit.year <= 2026));
    assert.equal(clues(unit).length, 5);
    assert.ok(clues(unit).every(clue => clue.value));
    assert.equal(clues(unit)[4].value.length, 1);
  }
  assert.notEqual(byId.get('us-gallon')!.relation, byId.get('imperial-gallon')!.relation);
  assert.notEqual(byId.get('us-fluid-ounce')!.relation, byId.get('imperial-fluid-ounce')!.relation);
});

test('versioned UTC schedule preserves past answers and covers the expanded pool', () => {
  assert.equal(new Set(pool).size, pool.length);
  assert.equal(pool.length, 70);
  assert.ok(pool.every(id => byId.has(id)));
  assert.equal(dailyUnit('2026-11-23').id, 'pascal');
  for (let day = -pool.length; day <= 0; day++) {
    assert.equal(dailyUnit(utcDate(new Date(EPOCH + day * DAY))).id, pool[((day % pool.length) + pool.length) % pool.length]);
  }
  const activation = Date.parse(expandedSchedule.startsOn);
  assert.equal(new Set(expandedSchedule.pool).size, units.length);
  assert.ok(expandedSchedule.pool.every(id => byId.has(id)));
  assert.equal(dailyUnit(utcDate(new Date(activation - 1))).id, 'pascal');
  assert.equal(dailyUnit(utcDate(new Date(activation))).id, 'slug');
  const cycle = Array.from({ length: units.length }, (_, index) => dailyUnit(utcDate(new Date(activation + index * DAY))).id);
  assert.equal(new Set(cycle).size, units.length);
  assert.equal(dailyUnit(utcDate(new Date(activation + units.length * DAY))).id, cycle[0]);
  assert.equal(utcDate(new Date('2026-11-22T20:00:00-04:00')), '2026-11-23');
  assert.equal(puzzleNumber('2026-11-24'), 2);
  assert.ok(dailyUnit('2026-01-01'));
  assert.notEqual(practiceUnit('pascal').id, 'pascal');
});

test('aliases work while case-sensitive SI symbols and regional variants stay distinct', () => {
  assert.equal(exactUnit('meter')?.id, 'metre');
  assert.equal(exactUnit('°C')?.id, 'celsius');
  assert.equal(exactUnit('Ω')?.id, 'ohm');
  assert.equal(exactUnit('s')?.id, 'second');
  assert.equal(exactUnit('S')?.id, 'siemens');
  assert.equal(exactUnit('h')?.id, 'hour');
  assert.equal(exactUnit('H')?.id, 'henry');
  assert.equal(exactUnit('Pa')?.id, 'pascal');
  assert.equal(exactUnit('gallon'), undefined);
  assert.equal(exactUnit('uk gallon')?.id, 'imperial-gallon');
  assert.equal(exactUnit('american gallon')?.id, 'us-gallon');
  assert.equal(searchUnits('S')[0].id, 'siemens');
  assert.deepEqual(new Set(searchUnits('gal').map(unit => unit.id)), new Set(['gal', 'us-gallon', 'imperial-gallon']));
  assert.ok(searchUnits('', ['pascal']).every(unit => unit.id !== 'pascal'));
  assert.deepEqual(searchUnits('not-a-unit'), []);
});

test('imperial mechanics, historical variants, and overlapping symbols stay distinct', () => {
  assert.equal(exactUnit('rankine')?.id, 'rankine');
  assert.equal(units.filter(unit => unit.id === 'rankine').length, 1);
  assert.equal(exactUnit('slugs')?.id, 'slug');
  assert.equal(exactUnit('blob')?.id, 'slinch');
  assert.equal(exactUnit('lbf')?.id, 'pound-force');
  assert.equal(exactUnit('pdl')?.id, 'poundal');
  assert.equal(byId.get('slug')!.measures, 'Mass');
  assert.equal(byId.get('poundal')!.measures, 'Force');
  assert.equal(byId.get('pound-force')!.measures, 'Force');
  assert.match(byId.get('slinch')!.relation, /12 slugs/);
  assert.equal(exactUnit('oz')?.id, 'ounce');
  assert.equal(exactUnit('oz t')?.id, 'troy-ounce');
  assert.equal(exactUnit('rad')?.id, 'radian');
  assert.equal(exactUnit('rd')?.id, 'radiation-rad');
  assert.equal(exactUnit('D')?.id, 'debye');
  assert.equal(exactUnit('darcy')?.id, 'darcy');
  assert.equal(exactUnit('°R')?.id, 'rankine');
  assert.equal(exactUnit('R')?.id, 'roentgen');
  assert.equal(exactUnit('reaumur')?.id, 'reaumur');
  assert.equal(exactUnit('angstrom')?.id, 'angstrom');
  assert.equal(exactUnit('cubit')?.id, 'egyptian-cubit');
  assert.equal(byId.get('egyptian-cubit')!.year, null);
  assert.match(byId.get('egyptian-cubit')!.relation, /≈/);
  assert.notEqual(byId.get('us-bushel')!.relation, byId.get('imperial-bushel')!.relation);
  const saved = { target: 'rankine', turns: ['kelvin', null] };
  assert.deepEqual(restore(JSON.stringify(saved), 'rankine'), saved);
});

test('wrong guesses and skips advance once; a correct fifth turn wins', () => {
  let round: Round = { target: 'pascal', turns: [] };
  round = play(round, 'newton');
  assert.equal(play(round, 'newton'), round);
  assert.equal(play(round, 'invalid'), round);
  for (let i = 0; i < 3; i++) round = play(round, null);
  assert.equal(status(round), 'playing');
  round = play(round, 'pascal');
  assert.equal(status(round), 'won');
  assert.equal(round.turns.length, 5);
  assert.equal(play(round, null), round);
  let loss: Round = { target: 'pascal', turns: [] };
  for (let i = 0; i < 5; i++) loss = play(loss, null);
  assert.equal(status(loss), 'lost');
  assert.equal(play(loss, 'pascal'), loss);
});

test('restored games reject corrupt, stale, duplicate, or post-win turns', () => {
  const round: Round = { target: 'pascal', turns: ['newton', null, 'pascal'] };
  assert.deepEqual(restore(JSON.stringify(round), 'pascal'), round);
  assert.equal(restore(JSON.stringify(round), 'watt'), null);
  for (const raw of ['bad json', 'null', JSON.stringify({ target: 'unknown', turns: [] }), JSON.stringify({ target: 'pascal', turns: ['pascal', null] }), JSON.stringify({ target: 'pascal', turns: ['newton', 'newton'] }), JSON.stringify({ target: 'pascal', turns: [4] }), JSON.stringify({ target: 'pascal', turns: Array(6).fill(null) })]) assert.equal(restore(raw), null);
});

test('clues conceal names, state actual milestones, and end in one letter', () => {
  assert.deepEqual(clues(byId.get('pascal')!).map(clue => clue.label), ['Field', 'Milestone', 'Measures', 'Relation', 'First letter']);
  assert.equal(clues(byId.get('pascal')!)[1].value, '1971 · SI name adopted');
  assert.equal(clues(byId.get('celsius')!)[2].value, '[hidden] temperature');
  assert.equal(clues(byId.get('celsius')!)[4].value, 'C');
  assert.ok(!clues(byId.get('day')!)[1].value.includes('null'));
  assert.match(clues(byId.get('day')!)[1].value, /no single start year/);
});

test('shares include used turns and the Pages URL without the answer', () => {
  const text = shareText({ target: 'pascal', turns: ['newton', null, 'pascal'] }, 'daily', '2026-11-23', 'https://davidgamero.github.io/unitdle/');
  assert.equal(text, 'Unitdle #1 · 3/5\n🟨⬜🟩\nhttps://davidgamero.github.io/unitdle/');
  assert.ok(!text.toLowerCase().includes('pascal'));
  assert.match(shareText({ target: 'pascal', turns: Array(5).fill(null) }, 'practice', '2026-11-23', 'https://example.com'), /Practice · X\/5/);
});
