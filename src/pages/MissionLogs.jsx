import { useState } from 'react';
import { Icon } from '../components/Icon';
import { MissionTimeline } from '../components/MissionTimeline';
import { PageHead } from '../components/PageHead';
import { Panel } from '../components/Panel';
import { Segmented } from '../components/Segmented';
import { useMission } from '../context/MissionContext';
import { LOG_CATS } from '../data/logsData';

export function MissionLogs() {
  const { logs, addLog } = useMission();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [note, setNote] = useState('');
  const counts = logs.reduce((o, l) => ((o[l.cat] = (o[l.cat] || 0) + 1), o), {});
  const items = logs.filter((l) => (filter === 'all' || l.cat === filter) && (!q || (l.title + ' ' + l.detail).toLowerCase().includes(q.toLowerCase())));
  const opts = [{ id: 'all', label: `All ${logs.length}` }, ...Object.entries(LOG_CATS).map(([k, c]) => ({ id: k, label: `${c.label} ${counts[k] || 0}` }))];
  const addNote = (e) => {
    e.preventDefault();
    const v = note.trim();
    if (!v) return;
    addLog('system', 'Operator note', v);
    setNote('');
  };
  return (
    <div className="page">
      <PageHead title="Mission logs" desc="Chronological record of events, newest first. Times are UTC." />
      <div className="log-tools">
        <div className="seg-scroll"><Segmented options={opts} value={filter} onChange={setFilter} label="Filter by category" /></div>
        <div className="search-box">
          <Icon name="search" size={15} />
          <label htmlFor="logq" className="sr">Search logs</label>
          <input id="logq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" autoComplete="off" />
        </div>
      </div>
      <div className="g">
        <Panel title={`${items.length} ${items.length === 1 ? 'event' : 'events'}`} className="s8">
          <MissionTimeline items={items} empty={q ? `No events match \u201c${q}\u201d. Try a shorter search or another category.` : undefined} />
        </Panel>
        <div className="s4 stack">
          <Panel title="Add operator note">
            <form onSubmit={addNote} className="note-form">
              <label htmlFor="note" className="sr">Note</label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value.slice(0, 240))} placeholder="Record an observation for the flight log" />
              <button type="submit" className="btn primary wide" disabled={!note.trim()}><Icon name="note" size={15} />Add to log</button>
            </form>
          </Panel>
          <Panel title="By category">
            <ul className="cat-bars">
              {Object.entries(LOG_CATS).map(([k, c]) => (
                <li key={k}>
                  <button type="button" className="cat-row" onClick={() => setFilter(k)} aria-pressed={filter === k}>
                    <span className={'cat-sw cat-' + k} aria-hidden="true" />{c.label}
                    <span className="bar"><i style={{ width: ((counts[k] || 0) / Math.max(1, logs.length)) * 100 + '%' }} className={'cat-' + k} /></span>
                    <span className="num">{counts[k] || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
