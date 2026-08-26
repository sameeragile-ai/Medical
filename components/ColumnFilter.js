"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, Search } from "lucide-react";

// Excel-style column filter: a funnel icon that opens a dropdown with a
// search box and a checkbox list of the column's distinct values.
// `selected` is `null` when no filter is applied (everything shown/checked),
// or an array of the currently-checked values.
export default function ColumnFilter({ values, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const isActive = selected !== null;
  const isChecked = (v) => selected === null || selected.includes(v);

  const toggle = (v) => {
    const base = selected === null ? values : selected;
    const next = base.includes(v) ? base.filter((x) => x !== v) : [...base, v];
    onChange(next.length === values.length ? null : next);
  };

  const selectAll = () => onChange(null);
  const clearAll = () => onChange([]);

  const shown = values.filter((v) => v.toLowerCase().includes(term.toLowerCase()));

  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 6 }} ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter column"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 20, border: "none", borderRadius: 4, cursor: "pointer",
          background: isActive ? "var(--primary)" : "transparent",
          color: isActive ? "#fff" : "var(--muted-2)",
        }}
      >
        <Filter size={11} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 10, width: 210,
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "0 14px 32px -10px rgba(16,27,34,0.3)", padding: 10,
            textTransform: "none", letterSpacing: 0, fontWeight: 400,
          }}
        >
          <div style={{ position: "relative", marginBottom: 8 }}>
            <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search values…"
              style={{ width: "100%", fontSize: 12, padding: "6px 8px 6px 26px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface-alt)", color: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <button type="button" onClick={selectAll} style={{ fontSize: 11, color: "var(--primary-dark)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Select all</button>
            <button type="button" onClick={clearAll} style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear</button>
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            {shown.length === 0 && (
              <div style={{ fontSize: 11.5, color: "var(--muted)", padding: "4px 2px" }}>No values.</div>
            )}
            {shown.map((v) => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, padding: "3px 2px", cursor: "pointer" }}>
                <input type="checkbox" checked={isChecked(v)} onChange={() => toggle(v)} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v || "(blank)"}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}
