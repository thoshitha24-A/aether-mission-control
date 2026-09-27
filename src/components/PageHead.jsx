export function PageHead({ title, desc, children }) {
  return (
    <header className="phead">
      <div className="phead-main">
        <h1 tabIndex={-1}>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {children && <div className="phead-aside">{children}</div>}
    </header>
  );
}
