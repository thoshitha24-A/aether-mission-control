import { useCallback, useEffect, useState } from 'react';
import { NAV } from '../data/navigation';

export function readRoute() {
  const h = (window.location.hash || '').replace(/^#\/?/, '');
  return NAV.some((n) => n.id === h) ? h : 'overview';
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const f = () => setRoute(readRoute());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const navigate = useCallback((id) => {
    if (window.location.hash !== '#/' + id) window.location.hash = '#/' + id;
    setRoute(id);
  }, []);
  return [route, navigate];
}
