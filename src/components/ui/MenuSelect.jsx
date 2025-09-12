// src/components/ui/MenuSelect.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Notion-style dropdown with purple selection dot.
 * Now auto-sets the menu width to match the trigger button width
 * so each dropdown's menu equals its own initial field width.
 */
export default function MenuSelect({
  value,
  onChange,
  items = [],
  className = "",
  labelFormatter,
  menuMatchTrigger = true, // keep true to match trigger width
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const [menuW, setMenuW] = useState(null);

  const current = items.find(i => i.value === value) || items[0];
  const label = labelFormatter
    ? labelFormatter(current)
    : (current?.label ?? String(current?.value ?? ""));

  // Close on outside click / focus
  useEffect(() => {
    function onDoc(e) {
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

  // Match menu width to trigger width (per-instance)
  useEffect(() => {
    if (!menuMatchTrigger) return;

    const measure = () => {
      if (!btnRef.current) return;
      const w = btnRef.current.offsetWidth || null;
      if (w && w !== menuW) setMenuW(w);
    };

    measure();

    // Keep in sync on resize and container changes
    let ro = null;
    if (window.ResizeObserver && btnRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(btnRef.current);
    }
    window.addEventListener("resize", measure);

    return () => {
      if (ro && btnRef.current) ro.unobserve(btnRef.current);
      window.removeEventListener("resize", measure);
    };
  }, [menuMatchTrigger, menuW]);

  const menuStyle = menuMatchTrigger && menuW
    ? { width: menuW, minWidth: menuW }
    : undefined;

  return (
    <div className={`ms ${className}`} ref={rootRef}>
      <button
        type="button"
        className="ms-btn"
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate">{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#cbd3ea" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="ms-menu" role="listbox" tabIndex={-1} style={menuStyle}>
          {items.map(it => {
            const active = it.value === value;
            return (
              <button
                key={String(it.value)}
                role="option"
                aria-selected={active}
                className={`ms-item ${active ? "is-active" : ""}`}
                onClick={() => { onChange?.(it.value); setOpen(false); }}
              >
                <span className="ms-dot" />
                <span className="truncate">{it.label}</span>
                {it.right && <span className="ms-right">{it.right}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
