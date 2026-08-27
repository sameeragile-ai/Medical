"use client";

import { ArrowUp, ArrowDown, ArrowUpDown, CheckCircle2 } from "lucide-react";

export function Badge({ tone = "neutral", children }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <div className="field-label">
      {children}
      {required && <span className="req">*</span>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center" style={{ padding: "44px 20px" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "var(--primary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        <Icon size={22} color="var(--primary)" />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{sub}</div>
    </div>
  );
}

export function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field;
  return (
    <span
      className="th-sort"
      onClick={() => onSort(field)}
      style={{ color: active ? "var(--primary-dark)" : undefined }}
    >
      {label}
      {active ? (
        sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
      ) : (
        <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
      )}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <div className="stat-card fade-in" style={{ padding: "16px 18px", animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div
          className="grad-icon"
          style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon size={16} color="#fff" strokeWidth={2.2} />
        </div>
        {sub}
      </div>
      <div className="font-display" style={{ fontSize: 23, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} className="toast fade-in">
          <CheckCircle2 size={16} color="#5EEAD4" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
