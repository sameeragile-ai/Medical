"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Package, X, Pencil } from "lucide-react";
import { Badge, EmptyState, SortHeader } from "./ui";
import { fmtMoney } from "@/lib/format";

const PAGE_SIZE = 8;

export default function MedicineTable({ products, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState({ field: "name", dir: "asc" });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const brands = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))],
    [products]
  );

  const filtered = useMemo(() => {
    let rows = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(q.toLowerCase())
    );
    if (brand !== "all") rows = rows.filter((p) => p.brand === brand);
    if (stock === "low") rows = rows.filter((p) => p.quantity < 10);
    if (stock === "in") rows = rows.filter((p) => p.quantity >= 10);
    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.field], bv = b[sort.field];
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
    });
    return rows;
  }, [products, q, brand, stock, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [q, brand, stock]);

  const onSort = (field) =>
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));

  const rows = filtered.slice(0, visible);

  return (
    <div className="card fade-in" style={{ overflow: "hidden" }}>
      <div style={{ padding: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
          <input className="input" style={{ paddingLeft: 34, paddingRight: q ? 34 : 13 }} placeholder="Search medicine or brand…" value={q} onChange={(e) => setQ(e.target.value)} />
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
        <select className="select" style={{ width: "auto" }} value={brand} onChange={(e) => setBrand(e.target.value)}>
          {brands.map((b) => (
            <option key={b} value={b}>{b === "all" ? "All brands" : b}</option>
          ))}
        </select>
        <select className="select" style={{ width: "auto" }} value={stock} onChange={(e) => setStock(e.target.value)}>
          <option value="all">All stock</option>
          <option value="low">Low stock (&lt;10)</option>
          <option value="in">In stock</option>
        </select>
        <Badge tone="neutral">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</Badge>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Package} title="No medicines found" sub="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortHeader label="Medicine" field="name" sort={sort} onSort={onSort} />
                <th>Brand</th>
                <SortHeader label="Quantity" field="quantity" sort={sort} onSort={onSort} />
                <SortHeader label="Price" field="price" sort={sort} onSort={onSort} />
                <th>Dosage</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td style={{ color: "var(--muted)" }}>{p.brand || "—"}</td>
                  <td>
                    <Badge tone={p.quantity < 10 ? "danger" : p.quantity < 30 ? "warning" : "success"}>
                      {p.quantity} units
                    </Badge>
                  </td>
                  <td className="font-mono">{fmtMoney(p.price)}</td>
                  <td>{p.dosage ? `${p.dosage} mg` : "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button className="icon-btn" onClick={() => onEdit(p)} title="Edit medicine"><Pencil size={14} /></button>
                      <button className="icon-btn" onClick={() => onDelete(p.id)} title="Remove"><Trash2 size={14} /></button>
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
