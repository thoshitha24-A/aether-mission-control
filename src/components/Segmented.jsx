export function Segmented({ options, value, onChange, label, size }) {
  return (
    <div className={'seg' + (size ? ' seg-' + size : '')} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}
