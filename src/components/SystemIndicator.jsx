export function StatusDot({ cls, pulse }) {
  return <span className={`dot ${cls}${pulse ? ' pulse' : ''}`} aria-hidden="true" />;
}

export function StatusPill({ cls, children }) {
  return <span className={'pill ' + cls}><StatusDot cls={cls} />{children}</span>;
}
