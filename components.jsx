/* global React */
const { useState, useEffect, useRef } = React;

// ─── Icons (minimal hand-curated set) ─────────────
const Ic = {
  check: (p) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (p) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  arrow: (p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M3 7h8m-3.5-3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back: (p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M11 7H3m3.5-3.5L3 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (p) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  doc:  (p) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M3.5 2h6l3 3v9H3.5V2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2v3h3" stroke="currentColor" strokeWidth="1.3"/></svg>,
  upload:(p) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...p}><path d="M9 12V3m0 0L5.5 6.5M9 3l3.5 3.5M3.5 12v2.5h11V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield:(p) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 1.5 2 3v3.5C2 9 4 11.5 7 12.5c3-1 5-3.5 5-6V3L7 1.5z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  trash: (p) => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" {...p}><path d="M2.5 3.5h8M5 5.5v4M8 5.5v4M3.5 3.5l.5 7h5l.5-7M5 3.5V2h3v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:  (p) => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" {...p}><path d="m2 11 1.5-.4 6.6-6.6L8.4 2.3 1.8 8.9 1.4 10.5 2 11z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  info:  (p) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...p}><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 5.5v3M6 4v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  spark: (p) => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" {...p}><path d="M6.5 1v3M6.5 9v3M1 6.5h3M9 6.5h3M3 3l2 2M8 8l2 2M10 3 8 5M3 10l2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

// ─── Form primitives ──────────────────────────────
function Field({ label, hint, error, required, children }) {
  return (
    <div className="field">
      {label && <label>{label}{required && <span className="req">*</span>}</label>}
      {children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

function Input({ value, onChange, mono, ...rest }) {
  return <input className={"input" + (mono ? " input--mono" : "")} value={value || ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function Select({ value, onChange, options, placeholder, ...rest }) {
  return (
    <select className="select" value={value || ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, ...rest }) {
  return <textarea className="textarea" value={value || ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function Chip({ on, onClick, children }) {
  return (
    <button type="button" className={"chip" + (on ? " on" : "")} onClick={onClick}>
      <span className="glyph">{on && <Ic.check />}</span>
      {children}
    </button>
  );
}

function ChipGrid({ value = [], onChange, options }) {
  const toggle = (o) => {
    if (value.includes(o)) onChange(value.filter((v) => v !== o));
    else onChange([...value, o]);
  };
  return (
    <div className="chip-grid">
      {options.map((o) => <Chip key={o} on={value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>)}
    </div>
  );
}

function RadioPills({ value, onChange, options }) {
  return (
    <div className="radio-row">
      {options.map((o) => (
        <button type="button" key={o} className={"radio-pill" + (value === o ? " on" : "")} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function Check({ on, onClick, label, desc }) {
  return (
    <div className={"check" + (on ? " on" : "")} onClick={onClick}>
      <div className="box"><Ic.check /></div>
      <div>
        <div className="label">{label}</div>
        {desc && <div className="desc">{desc}</div>}
      </div>
    </div>
  );
}

function Badge({ kind = "mute", children }) {
  return <span className={"badge badge--" + kind}><span className="b-dot"></span>{children}</span>;
}

function FileUpload({ filed, fileName, fileSize, label, sub, onUpload, onClear }) {
  if (filed) {
    return (
      <div className="upload upload--filed" onClick={onClear}>
        <div className="ic"><Ic.check /></div>
        <div className="text" style={{ flex: 1 }}>
          <strong>{fileName}</strong>
          <span>{fileSize} · click to replace</span>
        </div>
        <button className="btn btn--icon" onClick={(e) => { e.stopPropagation(); onClear(); }}><Ic.x /></button>
      </div>
    );
  }
  return (
    <div className="upload" onClick={onUpload}>
      <div className="ic"><Ic.upload /></div>
      <div className="text">
        <strong>{label}</strong>
        <span>{sub}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    complete: { kind: "ok", label: "Verified" },
    progress: { kind: "brand", label: "In progress" },
    notstarted: { kind: "mute", label: "Not started" },
    review: { kind: "warn", label: "Review needed" },
  };
  const m = map[status] || map.notstarted;
  return <Badge kind={m.kind}>{m.label}</Badge>;
}

function AccountMenu({ email, onSignOut }) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        {(email || '?')[0].toUpperCase()}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-2)', boxShadow: '0 4px 16px rgba(0,0,0,.10)',
          minWidth: 180, zIndex: 100, overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 2 }}>Signed in as</div>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
          </div>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            style={{
              display: 'flex', alignItems: 'center', width: '100%',
              padding: '10px 14px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)', textAlign: 'left',
              transition: 'background 100ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// expose
Object.assign(window, { Ic, Field, Input, Select, Textarea, Chip, ChipGrid, RadioPills, Check, Badge, FileUpload, StatusBadge, AccountMenu });
