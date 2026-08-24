"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Users, X, Pencil, Trash2 } from "lucide-react";
import { Badge, EmptyState, SortHeader } from "./ui";
import { fmtDate, fmtMoney } from "@/lib/format";

const PAGE_SIZE = 8;

const FIELD_MAP = {
  date: "date",
  customerName: "customer_name",
  value: "value",
};

export default function InquiryTable({ inquiries, onView, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ field: "date", dir: "desc" });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let rows = inquiries.filter(
      (r) =>
        (r.customer_name || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.product_name || "").toLowerCase().includes(q.toLowerCase()) ||
        (r.invoice || "").toLowerCase().includes(q.toLowerCase())
    );
    if (status !== "all") rows = rows.filter((r) => r.patient_status === status);
    const field = FIELD_MAP[sort.field] || sort.field;
    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[field], bv = b[field];
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
    });
    return rows;
  }, [inquiries, q, status, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [q, status]);

  const onSort = (field) =>
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));

  const rows = filtered.slice(0, visible);

  return (
    <div className="card fade-in" style={{ overflow: "hidden" }}>
      <div style={{ padding: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
          <input className="input" style={{ paddingLeft: 34, paddingRight: q ? 34 : 13 }} placeholder="Search customer, product, invoice…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--muted-2)", padding: 4 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select className="select" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All patients</option>
          <option value="New">New patient</option>
          <option value="Old">Old patient</option>
        </select>
        <Badge tone="neutral">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</Badge>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No inquiries found" sub="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <SortHeader label="Date" field="date" sort={sort} onSort={onSort} />
                <SortHeader label="Customer" field="customerName" sort={sort} onSort={onSort} />
                <th>Status</th>
                <th>Product</th>
                <th>Address</th>
                <th>Prescriber</th>
                <th>Dr. code</th>
                <th>Contact 1</th>
                <th>Contact 2</th>
                <th>Contact 3</th>
                <th>Sales rep</th>
                <th>Qty</th>
                <SortHeader label="Value" field="value" sort={sort} onSort={onSort} />
                <th>Dosage (months)</th>
                <th>Image</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono" style={{ color: "var(--primary-dark)", fontWeight: 600, whiteSpace: "nowrap" }}>{r.invoice}</td>
                  <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(r.date)}</td>
                  <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.customer_name}</td>
                  <td><Badge tone={r.patient_status === "New" ? "accent" : "success"}>{r.patient_status}</Badge></td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.product_name}</td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal" }}>{r.address || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.prescriber || "—"}</td>
                  <td className="font-mono" style={{ whiteSpace: "nowrap" }}>{r.dr_code || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.contact_primary || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.contact_alt1 || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.contact_alt2 || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.sales_rep || "—"}</td>
                  <td className="font-mono">{r.qty}</td>
                  <td className="font-mono">{fmtMoney(r.value)}</td>
                  <td className="font-mono">{r.dosage_months}</td>
                  <td>
                    {r.image_data ? (
                      <img src={r.image_data} alt="Prescription" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                    ) : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button className="icon-btn" onClick={() => onView(r)} title="View details"><Eye size={14} /></button>
                      <button className="icon-btn" onClick={() => onEdit(r)} title="Edit inquiry"><Pencil size={14} /></button>
                      <button className="icon-btn" onClick={() => onDelete(r)} title="Delete inquiry"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visible < filtered.length && (
        <div style={{ padding: 16, display: "flex", justifyContent: "center", borderTop: "1px solid var(--border-soft)" }}>
          <button className="btn btn-soft" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load more ({filtered.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
}
