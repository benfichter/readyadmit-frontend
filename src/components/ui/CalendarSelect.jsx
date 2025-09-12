import { useEffect, useMemo, useRef, useState } from "react";

function pad(n){ return n < 10 ? `0${n}` : `${n}`; }
function parseYMD(s){
  if (!s) return null;
  const [y,m,d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m-1, d);
}
function toYMD(d){
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function isSameDay(a,b){
  return a && b &&
    a.getFullYear()===b.getFullYear() &&
    a.getMonth()===b.getMonth() &&
    a.getDate()===b.getDate();
}
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function weeksFor(d){
  const first = startOfMonth(d);
  const last  = endOfMonth(d);
  const lead  = first.getDay();
  const days  = last.getDate();
  const cells = [];
  for (let i=0;i<lead;i++) cells.push(null);
  for (let i=1;i<=days;i++) cells.push(new Date(d.getFullYear(), d.getMonth(), i));
  while (cells.length % 7) cells.push(null);
  const rows = [];
  for (let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i+7));
  return rows;
}
function formatLabel(d){
  if (!d) return "Select date";
  const mo = d.toLocaleString('default', { month: 'short' });
  return `${mo} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function CalendarSelect({
  value,                 // 'YYYY-MM-DD' or ''
  onChange,              // (dateStr) => void
  className = "",
  menuMatchTrigger = true
}){
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef  = useRef(null);
  const [menuW, setMenuW] = useState(null);

  const selectedDate = useMemo(() => parseYMD(value), [value]);
  const [view, setView] = useState(() => selectedDate || new Date());

  // keep view in sync if selected month changes externally
  useEffect(() => {
    if (selectedDate) setView(selectedDate);
  }, [value]); // eslint-disable-line

  // outside click closes
  useEffect(() => {
    function onDoc(e){
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("focusin", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("focusin", onDoc);
    };
  }, []);

  // width match
  useEffect(() => {
    if (!menuMatchTrigger) return;
    const measure = () => {
      if (!btnRef.current) return;
      const w = btnRef.current.offsetWidth || null;
      if (w && w !== menuW) setMenuW(w);
    };
    measure();
    let ro = null;
    if (window.ResizeObserver && btnRef.current){
      ro = new ResizeObserver(measure);
      ro.observe(btnRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      if (ro && btnRef.current) ro.unobserve(btnRef.current);
      window.removeEventListener("resize", measure);
    };
  }, [menuMatchTrigger, menuW]);

  const rows = useMemo(() => weeksFor(view), [view]);

  const menuStyle = menuMatchTrigger && menuW ? { width: menuW, minWidth: menuW } : undefined;

  return (
    <div className={`ms ${className}`} ref={rootRef}>
      <button
        type="button"
        className="ms-btn"
        ref={btnRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate">{formatLabel(selectedDate)}</span>
        {/* calendar icon */}
        <svg className="ms-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#cbd3ea" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 7H6v11h14V9zM6 7h14V6H6v1z"/>
        </svg>
      </button>

      {open && (
        <div className="ms-menu cal" role="dialog" tabIndex={-1} style={menuStyle}>
          {/* Header */}
          <div className="cal-head">
            <button
              type="button"
              className="cal-nav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth()-1, 1))}
            >
              ‹
            </button>
            <div className="cal-title">
              {view.toLocaleString('default', { month: 'long' })} {view.getFullYear()}
            </div>
            <button
              type="button"
              className="cal-nav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth()+1, 1))}
            >
              ›
            </button>
          </div>

          {/* DOW */}
          <div className="cal-dow-grid">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="cal-dow">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="cal-grid">
            {rows.flat().map((d, idx) => {
              const isToday = d && isSameDay(d, new Date());
              const isSel   = d && selectedDate && isSameDay(d, selectedDate);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!d}
                  className={[
                    "cal-day",
                    !d ? "is-empty" : "",
                    isToday ? "is-today" : "",
                    isSel ? "is-selected" : "",
                  ].join(" ").trim()}
                  onClick={() => {
                    if (!d) return;
                    onChange?.(toYMD(d));
                    setOpen(false);
                  }}
                >
                  {d ? d.getDate() : ""}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="cal-foot">
            <button
              type="button"
              className="cal-today"
              onClick={() => { const t=new Date(); setView(t); onChange?.(toYMD(t)); setOpen(false); }}
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                className="cal-clear"
                onClick={() => { onChange?.(""); setOpen(false); }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
