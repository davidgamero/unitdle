import { units, type Unit } from './catalog';
import dailyPool from './daily-pool.json';

export const MAX_TURNS = 5;
export const EPOCH = Date.UTC(2026, 10, 23);
export const DAY = 86_400_000;
export type Mode = 'daily' | 'practice';
export type Round = { target: string; turns: (string | null)[] };
export const byId = new Map(units.map(unit => [unit.id, unit]));
export const utcDate = (date = new Date()) => date.toISOString().slice(0, 10);
export const puzzleNumber = (date: string) => Math.floor((Date.parse(date) - EPOCH) / DAY) + 1;
export const normalize = (text: string) => text.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]/gu, '');

export function dailyUnit(date: string): Unit {
  const day = puzzleNumber(date) - 1;
  const index = ((day % dailyPool.length) + dailyPool.length) % dailyPool.length;
  // Frozen shuffled cycle. Never reorder the pool after launch.
  return byId.get(dailyPool[index])!;
}

export function practiceUnit(previous?: string): Unit {
  const pool = units.filter(unit => unit.id !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function status(round: Round): 'playing' | 'won' | 'lost' {
  if (round.turns.includes(round.target)) return 'won';
  return round.turns.length >= MAX_TURNS ? 'lost' : 'playing';
}

export function play(round: Round, guess: string | null): Round {
  if (status(round) !== 'playing') return round;
  if (guess !== null && (!byId.has(guess) || round.turns.includes(guess))) return round;
  return { ...round, turns: [...round.turns, guess] };
}

export function restore(raw: string | null, target?: string): Round | null {
  try {
    const data = JSON.parse(raw ?? 'null');
    if (!data || !byId.has(data.target) || (target && data.target !== target) || !Array.isArray(data.turns) || data.turns.length > MAX_TURNS) return null;
    let round: Round = { target: data.target, turns: [] };
    for (const guess of data.turns) {
      if (guess !== null && typeof guess !== 'string') return null;
      const next = play(round, guess);
      if (next === round) return null;
      round = next;
    }
    return round;
  } catch { return null; }
}

export function searchUnits(query: string, excluded: (string | null)[] = []): Unit[] {
  const text = normalize(query);
  return units.filter(unit => !excluded.includes(unit.id)).map(unit => {
    const names = [unit.name, ...unit.aliases].map(normalize);
    // SI symbols are case-sensitive: s is second, S is siemens.
    const score = query.trim() === unit.symbol ? 0 : names.includes(text) ? 1 : names.some(name => name.startsWith(text)) ? 2 : names.some(name => name.includes(text)) ? 3 : Infinity;
    return { unit, score };
  }).filter(match => Number.isFinite(match.score)).sort((a, b) => a.score - b.score || a.unit.name.localeCompare(b.unit.name)).map(match => match.unit);
}

export function exactUnit(query: string): Unit | undefined {
  const symbol = units.find(unit => unit.symbol === query.trim());
  return symbol ?? units.find(unit => [unit.name, ...unit.aliases].some(name => normalize(name) === normalize(query)));
}

function hideName(unit: Unit, value: string): string {
  const words = new Set([unit.name, ...unit.aliases].flatMap(name => name.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []));
  return value.replace(/[\p{L}\p{N}]+/gu, word => words.has(word.toLowerCase()) ? '[hidden]' : word);
}

export function clues(unit: Unit) {
  return [
    { label: 'Field', value: unit.field },
    { label: 'Milestone', value: unit.year ? `${unit.year} · ${unit.milestone}` : unit.milestone },
    { label: 'Measures', value: hideName(unit, unit.measures) },
    { label: 'Relation', value: hideName(unit, unit.relation) },
    { label: 'First letter', value: unit.name.replace(/^Degree /, '')[0] },
  ];
}

export function shareText(round: Round, mode: Mode, day: string, url: string): string {
  const score = status(round) === 'won' ? round.turns.length : 'X';
  return `Unitdle ${mode === 'daily' ? `#${puzzleNumber(day)}` : 'Practice'} · ${score}/5\n${round.turns.map(turn => turn === round.target ? '🟩' : turn === null ? '⬜' : '🟨').join('')}\n${url}`;
}
