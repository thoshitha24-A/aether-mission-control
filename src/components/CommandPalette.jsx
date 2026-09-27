import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useDialog } from '../hooks/useDialog';

export function CommandPalette({ open, onClose, commands }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const ref = useDialog(open, onClose);
  useEffect(() => { if (open) { setQ(''); setIdx(0); } }, [open]);
  const items = commands.filter((c) => (c.label + ' ' + (c.keywords || '')).toLowerCase().includes(q.trim().toLowerCase()));
  useEffect(() => { setIdx(0); }, [q]);
  if (!open) return null;
  const run = (c) => { onClose(); setTimeout(c.run, 0); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => (items.length ? (i + 1) % items.length : 0)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => (items.length ? (i - 1 + items.length) % items.length : 0)); }
    if (e.key === 'Enter' && items[idx]) { e.preventDefault(); run(items[idx]); }
  };
  return (
    <div className="scrim palette-scrim" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="pal-input">
          <Icon name="search" size={17} />
          <input data-autofocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search AETHER"
            role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant={items[idx] ? 'pal-' + items[idx].id : undefined} aria-label="Search commands" />
          <kbd>Esc</kbd>
        </div>
        <ul id="pal-list" role="listbox" className="pal-list" aria-label="Commands">
          {items.map((c, i) => (
            <li key={c.id} id={'pal-' + c.id} role="option" aria-selected={i === idx} className={i === idx ? 'on' : ''}
              onMouseEnter={() => setIdx(i)} onClick={() => run(c)}>
              <Icon name={c.icon} size={16} /><span className="pal-label">{c.label}</span><span className="pal-group">{c.group}</span>
            </li>
          ))}
          {!items.length && <li className="empty">No commands match &ldquo;{q}&rdquo;. Try &ldquo;orbit&rdquo; or &ldquo;alerts&rdquo;.</li>}
        </ul>
        <div className="pal-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> to move</span><span><kbd>Enter</kbd> to run</span></div>
      </div>
    </div>
  );
}
