import { useEffect, useRef } from 'react';

export function useDialog(open, onClose) {
  const ref = useRef(null);
  const prev = useRef(null);
  useEffect(() => {
    if (!open) return;
    prev.current = document.activeElement;
    const t = setTimeout(() => {
      const el = ref.current && (ref.current.querySelector('[data-autofocus]') || ref.current.querySelector('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'));
      el && el.focus();
    }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab' && ref.current) {
        const f = [...ref.current.querySelectorAll('button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      prev.current && prev.current.focus && prev.current.focus();
    };
  }, [open]);
  return ref;
}
