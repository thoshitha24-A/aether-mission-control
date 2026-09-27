import { LOG_CATS } from '../data/logsData';
import { fmtUTC } from '../utils/format';

export function MissionTimeline({ items, compact, empty }) {
  if (!items.length) return <p className="empty">{empty || 'No events match this filter.'}</p>;
  return (
    <ol className={'timeline' + (compact ? ' compact' : '')}>
      {items.map((it) => (
        <li key={it.id} className={'tl-item cat-' + it.cat}>
          <time className="num" dateTime={new Date(it.t).toISOString()}>{fmtUTC(new Date(it.t))}</time>
          <span className="tl-node" aria-hidden="true" />
          <div className="tl-body">
            <div className="tl-title">{it.title}</div>
            {!compact && it.detail && <p>{it.detail}</p>}
            {!compact && <span className="tl-cat">{LOG_CATS[it.cat].label}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
