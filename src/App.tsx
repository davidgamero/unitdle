import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CircleHelp, Copy, ExternalLink, LockKeyhole, Minus, X } from 'lucide-react';
import { units, type Unit } from './catalog';
import { iconFile } from './icons';
import { byId, clues, dailyUnit, exactUnit, MAX_TURNS, play, practiceUnit, puzzleNumber, restore, searchUnits, shareText, status, utcDate, type Mode, type Round } from './game';

function Beaker({ level = 2 }: { level?: number }) {
  const y = 47 - Math.min(5, level) * 5;
  return <svg className="beaker" viewBox="0 0 48 56" fill="none" aria-hidden="true">
    <path d={`M10 ${y} Q23 ${y - 5} 38 ${y} V45 Q38 49 34 49 H14 Q10 49 10 45Z`} fill="currentColor" opacity=".24" />
    <path d="M6 6h36M10 6v40a5 5 0 0 0 5 5h18a5 5 0 0 0 5-5V6M31 17h7m-7 10h7m-7 10h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="40" r="2" fill="currentColor" opacity=".6" />
    <circle cx="23" cy="33" r="1.5" fill="currentColor" opacity=".4" />
  </svg>;
}

function UnitName({ unit, symbol = false }: { unit: Unit; symbol?: boolean }) {
  return <><img className="unit-icon" src={`${import.meta.env.BASE_URL}icons/${iconFile(unit.icon)}`} alt="" draggable="false" /><span className="unit-name">{unit.name}</span>{symbol && <span className="unit-symbol">{unit.symbol}</span>}</>;
}

function readSaved(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function Reference() {
  const [query, setQuery] = useState('');
  const [system, setSystem] = useState('All systems');
  const results = searchUnits(query).filter(unit => system === 'All systems' || unit.system === system);
  return <>
    <div className="reference-filters">
      <input aria-label="Find a unit" placeholder="Find a unit…" value={query} onChange={event => setQuery(event.target.value)} />
      <select aria-label="Unit system" value={system} onChange={event => setSystem(event.target.value)}><option>All systems</option>{[...new Set(units.map(unit => unit.system))].sort().map(name => <option key={name}>{name}</option>)}</select>
    </div>
    <p className="reference-count" role="status">{results.length} units</p>
    <div className="reference-list">{results.map(unit => <a key={unit.id} href={unit.source} target="_blank" rel="noreferrer">
      <span className="reference-name"><UnitName unit={unit} symbol /></span>
      <span className="reference-detail">{unit.measures} · {unit.system}<ExternalLink size={12} /></span>
    </a>)}{results.length === 0 && <p>No matches.</p>}</div>
  </>;
}

function Modal({ kind, close }: { kind: 'help' | 'reference'; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="dialog-heading"><h2 id="dialog-title">{kind === 'help' ? 'How to play' : 'Unit shelf'}</h2><button className="icon-button" onClick={close} aria-label="Close dialog"><X size={21} /></button></div>
    {kind === 'help' ? <>
      <p>Name the unit in five tries.</p>
      <ol className="help-list"><li>Read a clue.</li><li>Pick a unit. Wrong or skipped? Next clue.</li><li>Solve it with as few clues as possible.</li></ol>
      <p className="help-note">Dates mark the stated milestone, not necessarily invention. Answer words are hidden in text clues.</p>
      <p className="help-note">SI, imperial, US customary, and more. Symbols are case-sensitive. Daily resets at 00:00 UTC; practice is unlimited.</p>
      <p className="credits"><a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">Twemoji</a> by Twitter and contributors · <a href={`${import.meta.env.BASE_URL}icons/LICENSE.txt`} target="_blank" rel="noreferrer">CC BY 4.0</a></p>
      <button className="primary wide" onClick={close}>Let’s try <ArrowRight size={17} /></button>
    </> : <Reference />}
  </dialog>;
}

function GuessInput({ round, onTurn }: { round: Round; onTurn: (guess: string | null) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');
  const [listHeight, setListHeight] = useState(200);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const matches = searchUnits(query, round.turns);
  const remaining = MAX_TURNS - round.turns.length;
  const activeId = matches[active]?.id;

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const resize = () => setListHeight(Math.max(88, Math.min(200, (viewport?.height ?? window.innerHeight) * .35)));
    resize();
    viewport?.addEventListener('resize', resize);
    return () => viewport?.removeEventListener('resize', resize);
  }, [open]);

  useEffect(() => {
    if (!open || !activeId || !list.current) return;
    const option = document.getElementById(`unit-${activeId}`)!;
    const parent = list.current;
    if (option.offsetTop < parent.scrollTop) parent.scrollTop = option.offsetTop;
    if (option.offsetTop + option.offsetHeight > parent.scrollTop + parent.clientHeight) parent.scrollTop = option.offsetTop + option.offsetHeight - parent.clientHeight;
  }, [activeId, open]);

  function submit(id?: string) {
    const unit = id ? byId.get(id) : exactUnit(query);
    if (!unit) { setError('Choose a listed unit.'); setOpen(true); input.current?.focus(); return; }
    if (round.turns.includes(unit.id)) { setError('Already tried.'); return; }
    onTurn(unit.id);
    setQuery(''); setError(''); setOpen(false); setActive(0);
  }

  return <form className="guess-form" onSubmit={event => { event.preventDefault(); submit(); }}>
    <label className="sr-only" htmlFor="unit-guess">Unit name or symbol</label>
    <div className="input-row">
      <div className="search-field" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
        <input id="unit-guess" ref={input} value={query} placeholder="Unit name or symbol…" autoComplete="off" autoCorrect="off" spellCheck={false} role="combobox" aria-expanded={open && matches.length > 0} aria-controls={open && matches.length > 0 ? 'unit-options' : undefined} aria-autocomplete="list" aria-activedescendant={open && activeId ? `unit-${activeId}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? 'guess-error' : undefined}
          onFocus={() => { setOpen(true); setActive(0); }}
          onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); setError(''); }}
          onKeyDown={event => {
            if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive(index => open ? Math.max(0, Math.min(index + 1, matches.length - 1)) : 0); }
            if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
            if (event.key === 'Enter' && open && activeId) { event.preventDefault(); submit(activeId); }
          }} />
      </div>
      <button className="primary guess-button" type="submit" aria-label="Submit guess"><ArrowRight size={22} /></button>
    </div>
    {open && (matches.length > 0 ? <ul ref={list} id="unit-options" className="suggestions" role="listbox" aria-label="Units" style={{ maxHeight: listHeight }}>
      {matches.map((unit, index) => <li key={unit.id} id={`unit-${unit.id}`} role="option" aria-selected={index === active} onMouseDown={event => event.preventDefault()} onClick={() => submit(unit.id)}><UnitName unit={unit} symbol /></li>)}
    </ul> : <p className="no-matches" role="status">No matches.</p>)}
    {error && <p className="error" id="guess-error" role="alert">{error}</p>}
    <div className="turn-controls"><span>{remaining} {remaining === 1 ? 'try' : 'tries'} left</span><button className="skip" type="button" aria-label={remaining === 1 ? 'Skip and reveal answer' : 'Skip for next clue'} onClick={() => { onTurn(null); setQuery(''); setError(''); setOpen(false); setActive(0); }}>{remaining === 1 ? 'Reveal' : 'Skip'}<ArrowRight size={14} /></button></div>
  </form>;
}

function Puzzle({ mode, day }: { mode: Mode; day: string }) {
  const key = `unitdle:v1:${mode === 'daily' ? day : 'practice'}`;
  const [round, setRound] = useState<Round>(() => restore(readSaved(key), mode === 'daily' ? dailyUnit(day).id : undefined) ?? {
    target: mode === 'daily' ? dailyUnit(day).id : practiceUnit().id, turns: [],
  });
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const [manualShare, setManualShare] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const state = status(round);
  const done = state !== 'playing';
  const unit = byId.get(round.target)!;
  const visible = Math.min(round.turns.length + (done ? 0 : 1), MAX_TURNS);

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(round)); setSaved(true); } catch { setSaved(false); }
  }, [round, key]);
  useEffect(() => { if (done) resultRef.current?.focus({ preventScroll: true }); }, [done]);

  function next() {
    setRound({ target: practiceUnit(round.target).id, turns: [] });
    setCopied(false); setManualShare('');
  }

  async function share() {
    const text = shareText(round, mode, day, new URL(import.meta.env.BASE_URL, location.href).href);
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setManualShare(text); }
  }

  return <section className="puzzle" aria-label="Unit puzzle">
    <div className="board-caption"><span>{done ? state === 'won' ? 'Identified' : 'Revealed' : 'Clues'}</span><span className="ruler" aria-hidden="true" /><span>{done ? `${state === 'won' ? round.turns.length : 'X'}/5` : `${visible}/5`}</span></div>
    <ol className="board" aria-label="Clues" aria-live="polite" aria-relevant="additions text">
      {clues(unit).map((clue, index) => {
        const unlocked = index < visible;
        const current = !done && index === visible - 1;
        const tried = index < round.turns.length;
        const guess = tried && round.turns[index] ? byId.get(round.turns[index]!) : null;
        const correct = guess?.id === unit.id;
        return <li key={clue.label} className={`clue ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''} ${correct ? 'correct' : ''}`}>
          <span className="clue-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="clue-content"><span className="clue-label">{clue.label}</span>
            {unlocked && <p className={index === 4 ? 'first-letter' : ''}>{clue.value}</p>}
            {tried && <div className={`past-guess ${correct ? 'correct' : ''}`}>
              {correct ? <Check size={15} aria-label="Correct" /> : guess ? <X size={15} aria-label="Incorrect" /> : <Minus size={15} aria-hidden="true" />}
              {guess ? <UnitName unit={guess} /> : <span>Skipped</span>}
            </div>}
          </div>
          {!unlocked && <LockKeyhole size={14} className="lock" aria-label="Locked" />}
          {current && <span className="active-dot" aria-hidden="true" />}
        </li>;
      })}
    </ol>
    {done ? <div className={`result ${state}`} ref={resultRef} tabIndex={-1} aria-label="Result">
      <img className="result-icon" src={`${import.meta.env.BASE_URL}icons/${iconFile(unit.icon)}`} alt="" /><h2>{unit.name}<span>{unit.symbol}</span></h2>
      <p>{unit.measures} · {unit.system}</p>
      <div className="result-actions"><button className="primary" onClick={share}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Share'}</button>{mode === 'practice' && <button className="secondary" onClick={next}>Next<ArrowRight size={17} /></button>}<a href={unit.source} target="_blank" rel="noreferrer">Source<ExternalLink size={14} /></a></div>
      {manualShare && <label className="manual-share">Copy result<textarea readOnly value={manualShare} onFocus={event => event.target.select()} /></label>}
      {mode === 'daily' && <p className="next-daily">Next daily at 00:00 UTC.</p>}
    </div> : <GuessInput round={round} onTurn={guess => setRound(current => play(current, guess))} />}
    {!saved && <p className="error" role="status">Progress won’t save in this browser.</p>}
  </section>;
}

export default function App() {
  const [day, setDay] = useState(utcDate);
  const [mode, setMode] = useState<Mode>('daily');
  const [dialog, setDialog] = useState<'help' | 'reference' | null>(null);
  useEffect(() => {
    const update = () => setDay(utcDate());
    const interval = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', update); };
  }, []);

  return <div className="app-shell">
    <a href="#game" className="skip-link">Skip to game</a>
    <header className="site-header"><a className="brand" href={import.meta.env.BASE_URL}><Beaker /><h1>unitdle<span>.</span></h1></a><div className="header-actions"><button className="icon-button" aria-label="Unit shelf" onClick={() => setDialog('reference')}><BookOpen size={20} /></button><button className="icon-button" aria-label="How to play" onClick={() => setDialog('help')}><CircleHelp size={21} /></button></div></header>
    <main id="game" tabIndex={-1}>
      <div className="game-intro"><p>Name the unit. Five clues.</p><span className="puzzle-id">{mode === 'daily' ? `#${String(puzzleNumber(day)).padStart(3, '0')}` : '∞'}</span></div>
      <div className="mode-tabs" aria-label="Game mode"><button aria-pressed={mode === 'daily'} onClick={() => setMode('daily')}>Daily</button><button aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}>Practice</button></div>
      <Puzzle key={mode === 'daily' ? `daily:${day}` : 'practice'} mode={mode} day={day} />
    </main>
    <footer><span className="footer-bubbles" aria-hidden="true">◦ ○ ◦</span>{units.length} units. One mystery.</footer>
    {dialog && <Modal kind={dialog} close={() => setDialog(null)} />}
  </div>;
}
