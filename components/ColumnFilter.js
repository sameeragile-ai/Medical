"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Filter, Search } from "lucide-react";

// Excel-style column filter: a funnel icon that opens a dropdown with a
// search box and a checkbox list of the column's distinct values.
// `selected` is `null` when no filter is applied (everything shown/checked),
// or an array of the currently-checked values.
//
// The dropdown is rendered in a portal (not inline in the table cell) so it
// can't get clipped by the table's scroll container or painted underneath
// neighboring sticky/opaque header cells.
export default function ColumnFilter({ values, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [pos, setPos] = useState(null);
  const [pending, setPending] = useState(selected === null ? values : selected);
  const boxRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (open) setPending(selected === null ? values : selected);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (
        boxRef.current && !boxRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || !boxRef.current) return;
    const place = () => {
      const r = boxRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const isActive = selected !== null;
  const isChecked = (v) => pending.includes(v);

  const toggle = (v) => {
    setPending((base) =>
      base.includes(v) ? base.filter((x) => x !== v) : [...base, v],
    );
  };

  const selectAll = () => setPending(values);
  const clearAll = () => setPending([]);

  const apply = () => {
    onChange(pending.length === values.length ? null : pending);
    setOpen(false);
  };

  const shown = values.filter((v) =>
    v.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <span
      style={{ position: "relative", display: "inline-block", marginLeft: 6 }}
      ref={boxRef}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter column"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          background: isActive ? "var(--primary)" : "transparent",
          color: isActive ? "#fff" : "var(--muted-2)",
        }}
      >
        <Filter size={11} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 1000,
            width: 210,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 14px 32px -10px rgba(16,27,34,0.3)",
            padding: 10,
            textTransform: "none",
            letterSpacing: 0,
            fontWeight: 400,
          }}
        >
          <div style={{ position: "relative", marginBottom: 8 }}>
            <Search
              size={12}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted-2)",
              }}
            />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search values…"
              style={{
                width: "100%",
                fontSize: 12,
                padding: "6px 8px 6px 26px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--surface-alt)",
                color: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <button
              type="button"
              onClick={selectAll}
              style={{
                fontSize: 11,
                color: "var(--primary-dark)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={{
                fontSize: 11,
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Clear All
            </button>
          </div>

          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {shown.length === 0 && (
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  padding: "4px 2px",
                }}
              >
                No values.
              </div>
            )}
            {shown.map((v) => (
              <label
                key={v}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  padding: "3px 2px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked(v)}
                  onChange={() => toggle(v)}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v || "(blank)"}
                </span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={apply}
            style={{
              marginTop: 8,
              width: "100%",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              background: "var(--primary)",
              border: "none",
              borderRadius: 6,
              padding: "6px 0",
              cursor: "pointer",
            }}
          >
            Apply
          </button>
        </div>,
        document.body,
      )}
    </span>
  );
}
