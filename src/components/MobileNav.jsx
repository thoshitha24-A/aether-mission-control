import { Icon } from './Icon';
import { NAV } from '../data/navigation';
import { useDialog } from '../hooks/useDialog';

export function BottomNav({ route, navigate, onMore, moreOpen }) {
  const primary = NAV.slice(0, 4);
  const inMore = !primary.some((n) => n.id === route);
  return (
    <nav className="bottomnav" aria-label="Primary">
      {primary.map((n) => (
        <a key={n.id} href={'#/' + n.id} className={route === n.id ? 'active' : ''} aria-current={route === n.id ? 'page' : undefined}
          onClick={(e) => { e.preventDefault(); navigate(n.id); }}>
          <Icon name={n.icon} size={20} /><span>{n.label}</span>
        </a>
      ))}
      <button type="button" className={inMore ? 'active' : ''} onClick={onMore} aria-expanded={moreOpen} aria-haspopup="dialog">
        <Icon name="more" size={20} /><span>More</span>
      </button>
    </nav>
  );
}

export function MoreSheet({ open, onClose, route, navigate, onPalette, onAlerts, unread }) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="More sections" ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" aria-hidden="true" />
        <ul>
          {NAV.slice(4).map((n) => (
            <li key={n.id}>
              <a href={'#/' + n.id} className={route === n.id ? 'active' : ''} aria-current={route === n.id ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); navigate(n.id); onClose(); }}><Icon name={n.icon} />{n.label}</a>
            </li>
          ))}
          <li><button type="button" onClick={() => { onClose(); onAlerts(); }}><Icon name="bell" />Alerts{unread > 0 && <span className="badge num">{unread}</span>}</button></li>
          <li><button type="button" onClick={() => { onClose(); onPalette(); }}><Icon name="search" />Search AETHER</button></li>
        </ul>
      </div>
    </div>
  );
}
