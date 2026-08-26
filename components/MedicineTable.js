"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Package, X, Pencil } from "lucide-react";
import { Badge, EmptyState, SortHeader } from "./ui";
import ColumnFilter from "./ColumnFilter";
import { fmtMoney } from "@/lib/format";

const PAGE_SIZE = 8;

const COL_GETTERS = {
  name: (p) => p.name || "",
  brand: (p) => p.brand || "",
  quantity: (p) => String(p.quantity ?? ""),
  price: (p) => String(p.price ?? ""),
  dosage: (p) => String(p.dosage ?? ""),
};

const COL_KEYS = Object.keys(COL_GETTERS);
const BLANK_COL_FILTERS = Object.fromEntries(COL_KEYS.map((k) => [k, null]));

export default function MedicineTable({ products, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [stock, setStock] = useState("all");
  const [colFilters, setColFilters] = useState(BLANK_COL_FILTERS);
  const [sort, setSort] = useState({ field: "name", dir: "asc" });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const brands = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))],
    [products]
  );

  const colValues = useMemo(() => {
    const out = {};
    COL_KEYS.forEach((key) => {
      out[key] = Array.from(new Set(products.map((p) => COL_GETTERS[key](p)))).sort((a, b) => a.localeCompare(b));
    });
    return out;
  }, [products]);

  const setColFilter = (key) => (next) => setColFilters((f) => ({ ...f, [key]: next }));
  const clearColFilters = () => setColFilters(BLANK_COL_FILTERS);
  const anyColFilter = Object.values(colFilters).some((v) => v !== null);

  const filtered = useMemo(() => {
    let rows = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(q.toLowerCase())
    );
    if (brand !== "all") rows = rows.filter((p) => p.brand === brand);
    if (stock === "low") rows = rows.filter((p) => p.quantity < 10);
    if (stock === "in") rows = rows.filter((p) => p.quantity >= 10);

    Object.entries(colFilters).forEach(([key, allowed]) => {
      if (allowed === null) return;
      rows = rows.filter((p) => allowed.includes(COL_GETTERS[key](p)));
    });

    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.field], bv = b[sort.field];
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
    });
    return rows;
  }, [products, q, brand, stock, colFilters, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [q, brand, stock, colFilters]);

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
        {anyColFilter && (
          <button type="button" className="btn btn-soft" style={{ padding: "6px 10px", fontSize: 12 }} onClick={clearColFilters}>
            Clear column filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Package} title="No medicines found" sub="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Medicine" field="name" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.name} selected={colFilters.name} onChange={setColFilter("name")} /></span></th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}>Brand<ColumnFilter values={colValues.brand} selected={colFilters.brand} onChange={setColFilter("brand")} /></span></th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Quantity" field="quantity" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.quantity} selected={colFilters.quantity} onChange={setColFilter("quantity")} /></span></th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Price" field="price" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.price} selected={colFilters.price} onChange={setColFilter("price")} /></span></th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}>Dosage<ColumnFilter values={colValues.dosage} selected={colFilters.dosage} onChange={setColFilter("dosage")} /></span></th>
                <th className="col-sticky-actions" style={{ textAlign: "right" }}>Actions</th>
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
                  <td className="col-sticky-actions" style={{ textAlign: "right" }}>
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
