"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, X, Pencil, Trash2, Printer, Download } from "lucide-react";
import { Badge, EmptyState, SortHeader } from "./ui";
import ColumnFilter from "./ColumnFilter";
import ActionsMenu from "./ActionsMenu";
import { fmtDate, fmtMoney } from "@/lib/format";
import {
  printInquiryInvoice,
  printInquiriesInvoices,
  downloadInquiryInvoicePdf,
} from "@/lib/invoiceActions";

const PAGE_SIZE = 8;

const FIELD_MAP = {
  date: "date",
  customerName: "customer_name",
  value: "value",
};

function productsLabel(r) {
  if (Array.isArray(r.items) && r.items.length) {
    return r.items.map((it) => `${it.productName} ×${it.qty}`).join("\n");
  }
  return r.product_name || "";
}

function ProductsCell({ r }) {
  const items = Array.isArray(r.items) && r.items.length
    ? r.items
    : r.product_name
    ? [{ productId: "single", productName: r.product_name, qty: r.qty }]
    : [];
  if (items.length === 0) return "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
      {items.map((it, idx) => (
        <div key={it.productId || idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 auto" }}>{it.productName}</span>
          <span
            className="font-mono"
            style={{
              flex: "0 0 auto", fontSize: 11, fontWeight: 700, color: "var(--primary-dark)",
              background: "var(--primary-light)", borderRadius: 5, padding: "1px 6px",
            }}
          >
            ×{it.qty}
          </span>
        </div>
      ))}
    </div>
  );
}

function contactsLabel(r) {
  return [r.contact_primary, r.contact_alt1, r.contact_alt2].filter(Boolean).join("\n");
}

const COL_GETTERS = {
  customer_name: (r) => r.customer_name || "",
  care_of: (r) => r.care_of || "",
  patient_status: (r) => r.patient_status || "",
  printed: (r) => (r.printed ? "Printed" : "Pending"),
  product_name: (r) => productsLabel(r),
  address: (r) => r.address || "",
  prescriber: (r) => r.prescriber || "",
  contact: (r) => contactsLabel(r),
  sales_rep: (r) => r.sales_rep || "",
  dr_code: (r) => r.dr_code || "",
  brick_territory: (r) => r.brick_territory || "",
  qty: (r) => String(r.qty ?? ""),
  value: (r) => String(r.value ?? ""),
  invoice: (r) => r.invoice || "",
  date: (r) => fmtDate(r.date),
  image_data: (r) => (r.image_data ? "Has image" : "No image"),
  remarks: (r) => r.remarks || "",
};

const COL_KEYS = Object.keys(COL_GETTERS);
const BLANK_COL_FILTERS = Object.fromEntries(COL_KEYS.map((k) => [k, null]));

function Th({ colKey, children, style, values, selected, onChange }) {
  return (
    <th style={style}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {children}
        <ColumnFilter values={values} selected={selected} onChange={onChange} />
      </span>
    </th>
  );
}

export default function InquiryTable({ inquiries, onEdit, onDelete, onPrinted }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [colFilters, setColFilters] = useState(BLANK_COL_FILTERS);
  const [sort, setSort] = useState({ field: "date", dir: "desc" });
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(() => new Set());

  const colValues = useMemo(() => {
    const out = {};
    COL_KEYS.forEach((key) => {
      out[key] = Array.from(new Set(inquiries.map((r) => COL_GETTERS[key](r)))).sort((a, b) => a.localeCompare(b));
    });
    return out;
  }, [inquiries]);

  const setColFilter = (key) => (next) => setColFilters((f) => ({ ...f, [key]: next }));
  const clearColFilters = () => setColFilters(BLANK_COL_FILTERS);
  const anyColFilter = Object.values(colFilters).some((v) => v !== null);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    let rows = inquiries.filter(
      (r) =>
        (r.customer_name || "").toLowerCase().includes(needle) ||
        productsLabel(r).toLowerCase().includes(needle) ||
        (r.invoice || "").toLowerCase().includes(needle) ||
        (r.contact_primary || "").toLowerCase().includes(needle) ||
        (r.contact_alt1 || "").toLowerCase().includes(needle) ||
        (r.contact_alt2 || "").toLowerCase().includes(needle)
    );
    if (status !== "all") rows = rows.filter((r) => r.patient_status === status);

    Object.entries(colFilters).forEach(([key, allowed]) => {
      if (allowed === null) return;
      rows = rows.filter((r) => allowed.includes(COL_GETTERS[key](r)));
    });

    const field = FIELD_MAP[sort.field] || sort.field;
    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[field], bv = b[field];
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
    });
    return rows;
  }, [inquiries, q, status, colFilters, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [q, status, colFilters]);

  const onSort = (field) =>
    setSort((s) => ({ field, dir: s.field === field && s.dir === "asc" ? "desc" : "asc" }));

  const rows = filtered.slice(0, visible);

  useEffect(() => {
    const visibleIds = new Set(rows.map((r) => r.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((prev) => {
      if (allSelected) return new Set();
      return new Set(rows.map((r) => r.id));
    });

  const selectedRows = rows.filter((r) => selected.has(r.id));

  const bulkPrint = () => {
    if (!selectedRows.length) return;
    printInquiriesInvoices(selectedRows);
    onPrinted?.(selectedRows.map((r) => r.id));
  };

  const printRow = (r) => {
    printInquiryInvoice(r);
    onPrinted?.([r.id]);
  };

  return (
    <div className="card fade-in" style={{ overflow: "hidden" }}>
      <div style={{ padding: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
          <input className="input" style={{ paddingLeft: 34, paddingRight: q ? 34 : 13 }} placeholder="Search customer, product, invoice, contact…" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <option value="all">All patient types</option>
          <option value="New">New patient</option>
          <option value="Old">Old patient</option>
        </select>
        <Badge tone="neutral">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</Badge>
        {anyColFilter && (
          <button type="button" className="btn btn-soft" style={{ padding: "6px 10px", fontSize: 12 }} onClick={clearColFilters}>
            Clear column filters
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div style={{ padding: "10px 18px", display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-2, rgba(0,0,0,0.02))" }}>
          <Badge tone="accent">{selected.size} selected</Badge>
          <button type="button" className="btn btn-soft" style={{ padding: "6px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={bulkPrint}>
            <Printer size={14} /> Bulk print
          </button>
          <button type="button" className="btn btn-soft" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No inquiries found" sub="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
                </th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Customer" field="customerName" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.customer_name} selected={colFilters.customer_name} onChange={setColFilter("customer_name")} /></span></th>
                <Th colKey="care_of" values={colValues.care_of} selected={colFilters.care_of} onChange={setColFilter("care_of")}>Care of</Th>
                <Th colKey="patient_status" values={colValues.patient_status} selected={colFilters.patient_status} onChange={setColFilter("patient_status")}>Patient type</Th>
                <Th colKey="printed" values={colValues.printed} selected={colFilters.printed} onChange={setColFilter("printed")}>Status</Th>
                <Th colKey="product_name" values={colValues.product_name} selected={colFilters.product_name} onChange={setColFilter("product_name")}>Product</Th>
                <Th colKey="address" values={colValues.address} selected={colFilters.address} onChange={setColFilter("address")}>Address</Th>
                <Th colKey="prescriber" values={colValues.prescriber} selected={colFilters.prescriber} onChange={setColFilter("prescriber")}>Prescriber</Th>
                <Th colKey="contact" values={colValues.contact} selected={colFilters.contact} onChange={setColFilter("contact")}>Contact</Th>
                <Th colKey="sales_rep" values={colValues.sales_rep} selected={colFilters.sales_rep} onChange={setColFilter("sales_rep")}>Sales rep</Th>
                <Th colKey="dr_code" values={colValues.dr_code} selected={colFilters.dr_code} onChange={setColFilter("dr_code")}>Dr. code</Th>
                <Th colKey="brick_territory" values={colValues.brick_territory} selected={colFilters.brick_territory} onChange={setColFilter("brick_territory")}>Brick (territory)</Th>
                <Th colKey="qty" values={colValues.qty} selected={colFilters.qty} onChange={setColFilter("qty")}>Qty</Th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Value" field="value" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.value} selected={colFilters.value} onChange={setColFilter("value")} /></span></th>
                <Th colKey="invoice" values={colValues.invoice} selected={colFilters.invoice} onChange={setColFilter("invoice")}>Invoice</Th>
                <th><span style={{ display: "inline-flex", alignItems: "center" }}><SortHeader label="Date" field="date" sort={sort} onSort={onSort} /><ColumnFilter values={colValues.date} selected={colFilters.date} onChange={setColFilter("date")} /></span></th>
                <Th colKey="image_data" values={colValues.image_data} selected={colFilters.image_data} onChange={setColFilter("image_data")}>Image</Th>
                <Th colKey="remarks" values={colValues.remarks} selected={colFilters.remarks} onChange={setColFilter("remarks")}>Remarks</Th>
                <th className="col-sticky-actions" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} aria-label={`Select ${r.customer_name}`} />
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.customer_name}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.care_of || "—"}</td>
                  <td>
                    <Badge tone={r.patient_status === "New" ? "accent" : "success"}>{r.patient_status}</Badge>
                  </td>
                  <td>
                    <Badge tone={r.printed ? "neutral" : "accent"}>{r.printed ? "Printed" : "Pending"}</Badge>
                  </td>
                  <td><ProductsCell r={r} /></td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal" }}>{r.address || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.prescriber || "—"}</td>
                  <td style={{ whiteSpace: "pre-line" }}>{contactsLabel(r) || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.sales_rep || "—"}</td>
                  <td className="font-mono" style={{ whiteSpace: "nowrap" }}>{r.dr_code || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.brick_territory || "—"}</td>
                  <td className="font-mono">{r.qty}</td>
                  <td className="font-mono">{fmtMoney(r.value)}</td>
                  <td className="font-mono" style={{ color: "var(--primary-dark)", fontWeight: 600, whiteSpace: "nowrap" }}>{r.invoice}</td>
                  <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(r.date)}</td>
                  <td>
                    {r.image_data ? (
                      <img src={r.image_data} alt="Prescription" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                    ) : "—"}
                  </td>
                  <td style={{ maxWidth: 200, whiteSpace: "normal", color: "var(--muted)" }}>{r.remarks || "—"}</td>
                  <td className="col-sticky-actions" style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button className="icon-btn" onClick={() => printRow(r)} title="Print invoice"><Printer size={14} /></button>
                      <ActionsMenu
                        items={[
                          { label: "Download PDF", icon: Download, onClick: () => downloadInquiryInvoicePdf(r) },
                          null,
                          {
                            label: "Edit inquiry", icon: Pencil, onClick: () => onEdit(r),
                            disabled: r.printed, disabledReason: "Printed invoices can't be edited",
                          },
                          {
                            label: "Delete inquiry", icon: Trash2, onClick: () => onDelete(r), danger: true,
                            disabled: r.printed, disabledReason: "Printed invoices can't be deleted",
                          },
                        ]}
                      />
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
