import { useMemo } from 'react';
import { uid } from '../utils/format';

export function Panel({ title, aside, className = '', instrument, children, bodyClass = '', id, as: Tag = 'section', labelledBy }) {
  const hid = useMemo(() => uid('ph'), []);
  return (
    <Tag className={`panel${instrument ? ' instrument' : ''} ${className}`} aria-labelledby={title ? hid : labelledBy} id={id}>
      {(title || aside) && (
        <div className="panel-head">
          {title && <h2 className="label" id={hid}>{title}</h2>}
          {aside && <div className="panel-aside">{aside}</div>}
        </div>
      )}
      <div className={'panel-body ' + bodyClass}>{children}</div>
    </Tag>
  );
}
