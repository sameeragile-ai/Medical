"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus, AlertTriangle, Upload, FileText, Calendar, MapPin, Stethoscope, Phone, Loader2, Search, Minus } from "lucide-react";
import { FieldLabel } from "./ui";
import { fmtDate, fmtMoney, todayISO } from "@/lib/format";
import { focusNextOnEnter } from "@/lib/focusNav";
import {
  sanitizeName,
  sanitizePhone,
  sanitizeCode,
  validateName,
  validatePhone,
} from "@/lib/validate";

const blankForm = () => ({
  customerName: "",
  careOf: "",
  patientStatus: "New",
  address: "",
  prescriber: "",
  drCode: "",
  contactPrimary: "",
  contactAlt1: "",
  contactAlt2: "",
  salesRep: "",
  remarks: "",
  imageData: null,
});

function FieldError({ msg }) {
  if (!msg) return null;
  return <div style={{ color: "var(--danger)", fontSize: 11.5, marginTop: 4 }}>{msg}</div>;
}

function itemsFromEditing(editing, products) {
  if (Array.isArray(editing?.items) && editing.items.length) {
    return editing.items.map((it) => ({
      productId: it.productId,
      productName: it.productName,
      qty: Number(it.qty) || 0,
      price: Number(it.price) || 0,
      amount: Number(it.amount) || 0,
    }));
  }
  if (editing?.product_id) {
    const prod = products.find((p) => p.id === editing.product_id);
    const price = prod ? Number(prod.price) : Number(editing.value || 0) / (Number(editing.qty) || 1);
    const qty = Number(editing.qty) || 1;
    return [{ productId: editing.product_id, productName: editing.product_name || (prod && prod.name) || "", qty, price, amount: qty * price }];
  }
  return [];
}

// Searchable product picker: type to filter, click to add as a chip.
function ProductPicker({ products, items, onAdd }) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const addedIds = new Set(items.map((i) => i.productId));
  const matches = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return products
      .filter((p) => !addedIds.has(p.id))
      .filter((p) => !needle || p.name.toLowerCase().includes(needle) || (p.brand || "").toLowerCase().includes(needle))
      .slice(0, 8);
  }, [products, term, items]);

  return (
    <div style={{ position: "relative" }} ref={boxRef}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
        <input
          className="input"
          style={{ paddingLeft: 30 }}
          placeholder="Search medicines to add…"
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) {
              e.preventDefault();
              onAdd(matches[0]);
              setTerm("");
            }
          }}
        />
      </div>
      {open && matches.length > 0 && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 5,
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "0 10px 24px -8px rgba(16,27,34,0.25)", maxHeight: 220, overflowY: "auto",
          }}
        >
          {matches.map((p) => (
            <div
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); onAdd(p); setTerm(""); }}
              style={{ padding: "9px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}
              className="dropdown-row"
            >
              <span style={{ fontWeight: 600 }}>{p.name}{p.brand ? ` · ${p.brand}` : ""}</span>
              <span className="font-mono" style={{ color: "var(--muted)" }}>{fmtMoney(p.price)}</span>
            </div>
          ))}
        </div>
      )}
      {open && term && matches.length === 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 5, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "var(--muted)" }}>
          No matching medicine.
        </div>
      )}
    </div>
  );
}

// One selected product shown as a chip with an editable quantity and computed amount.
function ProductChip({ item, onQtyChange, onRemove }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
        border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-alt)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</div>
        <div className="font-mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>{fmtMoney(item.price)} each</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => onQtyChange(Math.max(1, item.qty - 1))}><Minus size={12} /></button>
        <input
          type="number"
          min="1"
          value={item.qty}
          onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value) || 1))}
          style={{ width: 44, textAlign: "center", padding: "4px 2px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)", color: "inherit", fontSize: 12.5 }}
        />
        <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => onQtyChange(item.qty + 1)}><Plus size={12} /></button>
      </div>
      <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 70, textAlign: "right" }}>{fmtMoney(item.amount)}</div>
      <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} onClick={onRemove}><X size={13} /></button>
    </div>
  );
}

export default function InquiryFormDrawer({ open, onClose, onSave, products, editing }) {
  const [form, setForm] = useState(blankForm());
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const fileRef = useRef(null);
  const drawerRef = useRef(null);
  const today = todayISO();
  const isEdit = Boolean(editing);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              customerName: editing.customer_name || "",
              careOf: editing.care_of || "",
              patientStatus: editing.patient_status || "New",
              address: editing.address || "",
              prescriber: editing.prescriber || "",
              drCode: editing.dr_code || "",
              contactPrimary: editing.contact_primary || "",
              contactAlt1: editing.contact_alt1 || "",
              contactAlt2: editing.contact_alt2 || "",
              salesRep: editing.sales_rep || "",
              remarks: editing.remarks || "",
              imageData: editing.image_data || null,
            }
          : blankForm()
      );
      setItems(itemsFromEditing(editing, products));
      setError("");
      setFieldErrors({});
      setImgPreview(editing ? editing.image_data || null : null);
      setSaving(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const setSanitized = (k, sanitize) => (e) => {
    const value = sanitize(e.target.value);
    setForm((f) => ({ ...f, [k]: value }));
    setFieldErrors((fe) => ({ ...fe, [k]: "" }));
  };

  const FIELD_VALIDATORS = {
    customerName: () => validateName(form.customerName, "Customer name", true),
    careOf: () => validateName(form.careOf, "Care of / patient representative name", false),
    prescriber: () => validateName(form.prescriber, "Prescriber name", false),
    salesRep: () => validateName(form.salesRep, "Sales representative", false),
    drCode: () => (form.drCode && !/^[A-Za-z0-9\-\s]*$/.test(form.drCode) ? "Dr. code can only contain letters, numbers and dashes." : ""),
    contactPrimary: () => validatePhone(form.contactPrimary, "Primary contact number", true),
    contactAlt1: () => validatePhone(form.contactAlt1, "Alternate contact 1", false),
    contactAlt2: () => validatePhone(form.contactAlt2, "Alternate contact 2", false),
  };

  const validateAll = () => {
    const errs = {};
    Object.keys(FIELD_VALIDATORS).forEach((k) => {
      const msg = FIELD_VALIDATORS[k]();
      if (msg) errs[k] = msg;
    });
    if (items.length === 0) errs.items = "Please add at least one product.";
    setFieldErrors(errs);
    return errs;
  };

  const validateOne = (k) => () => {
    const validator = FIELD_VALIDATORS[k];
    if (!validator) return;
    setFieldErrors((fe) => ({ ...fe, [k]: validator() }));
  };

  const addItem = (product) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      const price = Number(product.price) || 0;
      return [...prev, { productId: product.id, productName: product.name, qty: 1, price, amount: price }];
    });
    setFieldErrors((fe) => ({ ...fe, items: "" }));
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const setItemQty = (productId, qty) =>
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty, amount: qty * i.price } : i)));

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const totalValue = items.reduce((sum, i) => sum + i.amount, 0);

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgPreview(reader.result);
      setForm((f) => ({ ...f, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    const errs = validateAll();
    const firstError = Object.values(errs)[0];
    if (firstError) return setError(firstError);
    setSaving(true);
    setError("");
    const ok = await onSave({
      ...form,
      items,
      qty: totalQty,
      value: totalValue,
    });
    setSaving(false);
    if (!ok) setError("Something went wrong recording this inquiry. Please try again.");
  };

  const onEnter = (e) => focusNextOnEnter(e, drawerRef, submit);

  return (
    <>
      <div className="overlay fade-in" onClick={onClose} />
      <div className="drawer" style={{ maxWidth: 540 }} ref={drawerRef}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? "Edit patient inquiry" : "New patient inquiry"}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{isEdit ? `Update ${editing.invoice}` : "Log a prescription-based sale"}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <span className="label-tag"><FileText size={13} /> Invoice auto-assigned on save</span>
            <span className="label-tag"><Calendar size={13} /> {fmtDate(today)}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Customer name</FieldLabel>
            <input
              className="input"
              placeholder="Full name"
              value={form.customerName}
              onChange={setSanitized("customerName", sanitizeName)}
              onBlur={validateOne("customerName")}
              onKeyDown={onEnter}
              autoFocus
            />
            <FieldError msg={fieldErrors.customerName} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Care of / patient representative name</FieldLabel>
            <input
              className="input"
              placeholder="Representative or caretaker name"
              value={form.careOf}
              onChange={setSanitized("careOf", sanitizeName)}
              onBlur={validateOne("careOf")}
              onKeyDown={onEnter}
            />
            <FieldError msg={fieldErrors.careOf} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Patient status</FieldLabel>
            <select className="select" value={form.patientStatus} onChange={set("patientStatus")} onKeyDown={onEnter}>
              <option value="New">New patient</option>
              <option value="Old">Old patient</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Products</FieldLabel>
            {products.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No medicines in stock yet.</div>
            ) : (
              <ProductPicker products={products} items={items} onAdd={addItem} />
            )}
            <FieldError msg={fieldErrors.items} />

            {items.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {items.map((item) => (
                  <ProductChip
                    key={item.productId}
                    item={item}
                    onQtyChange={(qty) => setItemQty(item.productId, qty)}
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>
                  <span>Total qty: {totalQty}</span>
                  <span className="font-mono">{fmtMoney(totalValue)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel><MapPin size={12} style={{ display: "inline", marginRight: 2 }} />Complete address</FieldLabel>
            <textarea className="textarea" placeholder="House / street / area / city" value={form.address} onChange={set("address")} onKeyDown={onEnter} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel><Stethoscope size={12} style={{ display: "inline", marginRight: 2 }} />Prescriber (Dr. name)</FieldLabel>
              <input
                className="input"
                placeholder="Dr. Full Name"
                value={form.prescriber}
                onChange={setSanitized("prescriber", sanitizeName)}
                onBlur={validateOne("prescriber")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.prescriber} />
            </div>
            <div>
              <FieldLabel>Dr. code</FieldLabel>
              <input
                className="input"
                placeholder="DR-0000"
                value={form.drCode}
                onChange={setSanitized("drCode", sanitizeCode)}
                onBlur={validateOne("drCode")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.drCode} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required><Phone size={12} style={{ display: "inline", marginRight: 2 }} />Contact numbers</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <input
                  className="input"
                  placeholder="Primary contact"
                  value={form.contactPrimary}
                  onChange={setSanitized("contactPrimary", sanitizePhone)}
                  onBlur={validateOne("contactPrimary")}
                  onKeyDown={onEnter}
                  inputMode="tel"
                />
                <FieldError msg={fieldErrors.contactPrimary} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <input
                    className="input"
                    placeholder="Alternate 1 (optional)"
                    value={form.contactAlt1}
                    onChange={setSanitized("contactAlt1", sanitizePhone)}
                    onBlur={validateOne("contactAlt1")}
                    onKeyDown={onEnter}
                    inputMode="tel"
                  />
                  <FieldError msg={fieldErrors.contactAlt1} />
                </div>
                <div>
                  <input
                    className="input"
                    placeholder="Alternate 2 (optional)"
                    value={form.contactAlt2}
                    onChange={setSanitized("contactAlt2", sanitizePhone)}
                    onBlur={validateOne("contactAlt2")}
                    onKeyDown={onEnter}
                    inputMode="tel"
                  />
                  <FieldError msg={fieldErrors.contactAlt2} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Sales representative</FieldLabel>
            <input
              className="input"
              placeholder="Representative name"
              value={form.salesRep}
              onChange={setSanitized("salesRep", sanitizeName)}
              onBlur={validateOne("salesRep")}
              onKeyDown={onEnter}
            />
            <FieldError msg={fieldErrors.salesRep} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Remarks / comments</FieldLabel>
            <textarea className="textarea" placeholder="Any additional notes" value={form.remarks} onChange={set("remarks")} onKeyDown={onEnter} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <FieldLabel>Prescription image</FieldLabel>
            {imgPreview ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={imgPreview} alt="Prescription preview" style={{ maxHeight: 150, borderRadius: 10, border: "1px solid var(--border)" }} />
                <button
                  className="icon-btn"
                  style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, background: "#fff" }}
                  onClick={() => { setImgPreview(null); setForm((f) => ({ ...f, imageData: null })); if (fileRef.current) fileRef.current.value = ""; }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="dropzone" onClick={() => fileRef.current && fileRef.current.click()}>
                <Upload size={20} color="var(--primary)" style={{ margin: "0 auto 6px" }} />
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Click to upload prescription</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>PNG or JPG</div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--danger)", fontSize: 12.5, marginTop: 12 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid var(--border-soft)", display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={submit} disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {isEdit ? "Save changes" : "Record inquiry"}
          </button>
        </div>
      </div>
    </>
  );
}
