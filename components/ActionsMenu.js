"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

const MENU_WIDTH = 190;

// Compact "..." menu for table rows with many actions. `items` is an array of
// { label, icon, onClick, danger } — pass null to render a divider.
// Renders the panel in a portal at a fixed position so it isn't clipped by
// the table's horizontal scroll container and can flip above the button
// when there isn't enough room below (e.g. the last rows in the table).
export default function ActionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const place = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const menuHeight = items.filter((it) => it !== null).length * 36 + 12;
    const openUp = r.bottom + menuHeight + 8 > window.innerHeight;
    setCoords({
      left: Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8),
      top: openUp ? r.top - menuHeight - 6 : r.bottom + 6,
    });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const close = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const reposition = () => place();
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        title="More actions"
        aria-label="More actions"
      >
        <MoreVertical size={14} />
      </button>
      {open && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed", top: coords.top, left: coords.left, zIndex: 100, width: MENU_WIDTH,
              background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
              boxShadow: "0 14px 32px -10px rgba(16,27,34,0.35)", padding: 6,
            }}
          >
            {items.map((it, i) =>
              it === null ? (
                <div key={i} style={{ height: 1, background: "var(--border-soft)", margin: "4px 2px" }} />
              ) : (
                <button
                  key={it.label}
                  type="button"
                  className="dropdown-row"
                  disabled={it.disabled}
                  title={it.disabledReason && it.disabled ? it.disabledReason : undefined}
                  onClick={() => {
                    if (it.disabled) return;
                    setOpen(false);
                    it.onClick();
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
                    padding: "8px 10px", fontSize: 13, borderRadius: 7, border: "none", background: "transparent",
                    cursor: it.disabled ? "not-allowed" : "pointer",
                    color: it.disabled ? "var(--muted-2)" : it.danger ? "var(--danger)" : "var(--ink)",
                    opacity: it.disabled ? 0.55 : 1,
                  }}
                >
                  <it.icon size={14} />
                  {it.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}
