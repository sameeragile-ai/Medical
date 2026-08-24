"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, AlertTriangle, Upload, FileText, Calendar, MapPin, Stethoscope, Phone, Loader2 } from "lucide-react";
import { FieldLabel } from "./ui";
import { fmtDate, todayISO } from "@/lib/format";

const blankForm = () => ({
  customerName: "",
  patientStatus: "New",
  productId: "",
  productName: "",
  address: "",
  prescriber: "",
  drCode: "",
  contactPrimary: "",
  contactAlt1: "",
  contactAlt2: "",
  salesRep: "",
  qty: 1,
  value: 0,
  dosageMonths: 1,
  imageData: null,
});

export default function InquiryFormDrawer({ open, onClose, onSave, products }) {
  const [form, setForm] = useState(blankForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const fileRef = useRef(null);
  const today = todayISO();

  useEffect(() => {
    if (open) {
      setForm(blankForm());
      setError("");
      setImgPreview(null);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onProductChange = (e) => {
    const pid = e.target.value;
    const prod = products.find((p) => p.id === pid);
    setForm((f) => ({
      ...f,
      productId: pid,
      productName: prod ? prod.name : "",
      value: prod ? Number(prod.price) * Number(f.qty || 1) : f.value,
    }));
  };

  const onQtyChange = (e) => {
    const qty = e.target.value;
    const prod = products.find((p) => p.id === form.productId);
    setForm((f) => ({ ...f, qty, value: prod ? Number(prod.price) * Number(qty || 0) : f.value }));
  };

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
    if (!form.customerName.trim()) return setError("Customer name is required.");
    if (!form.productId) return setError("Please select a product.");
    if (!form.contactPrimary.trim()) return setError("Primary contact number is required.");
    setSaving(true);
    setError("");
    const ok = await onSave({
      ...form,
      qty: Number(form.qty || 0),
      value: Number(form.value || 0),
      dosageMonths: Number(form.dosageMonths || 0),
    });
    setSaving(false);
    if (!ok) setError("Something went wrong recording this inquiry. Please try again.");
  };

  return (
    <>
      <div className="overlay fade-in" onClick={onClose} />
      <div className="drawer" style={{ maxWidth: 540 }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>New patient inquiry</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Log a prescription-based sale</div>
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
            <input className="input" placeholder="Full name" value={form.customerName} onChange={set("customerName")} autoFocus />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel required>Patient status</FieldLabel>
              <select className="select" value={form.patientStatus} onChange={set("patientStatus")}>
                <option value="New">New patient</option>
                <option value="Old">Old patient</option>
              </select>
            </div>
            <div>
              <FieldLabel required>Product</FieldLabel>
              {products.length === 0 ? (
                <select className="select" disabled><option>No medicines in stock yet</option></select>
              ) : (
                <select className="select" value={form.productId} onChange={onProductChange}>
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{Number(p.dosage) ? ` (${Number(p.dosage)}mg)` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel><MapPin size={12} style={{ display: "inline", marginRight: 2 }} />Complete address</FieldLabel>
            <textarea className="textarea" placeholder="House / street / area / city" value={form.address} onChange={set("address")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel><Stethoscope size={12} style={{ display: "inline", marginRight: 2 }} />Prescriber (Dr. name)</FieldLabel>
              <input className="input" placeholder="Dr. Full Name" value={form.prescriber} onChange={set("prescriber")} />
            </div>
            <div>
              <FieldLabel>Dr. code</FieldLabel>
              <input className="input" placeholder="DR-0000" value={form.drCode} onChange={set("drCode")} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel required><Phone size={12} style={{ display: "inline", marginRight: 2 }} />Contact numbers</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input className="input" placeholder="Primary contact" value={form.contactPrimary} onChange={set("contactPrimary")} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input className="input" placeholder="Alternate 1 (optional)" value={form.contactAlt1} onChange={set("contactAlt1")} />
                <input className="input" placeholder="Alternate 2 (optional)" value={form.contactAlt2} onChange={set("contactAlt2")} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel>Sales representative</FieldLabel>
            <input className="input" placeholder="Representative name" value={form.salesRep} onChange={set("salesRep")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel>Product qty</FieldLabel>
              <input className="input" type="number" min="0" value={form.qty} onChange={onQtyChange} />
            </div>
            <div>
              <FieldLabel>Value (Rs.)</FieldLabel>
              <input className="input" type="number" min="0" value={form.value} onChange={set("value")} />
            </div>
            <div>
              <FieldLabel>Dosage (months)</FieldLabel>
              <input className="input" type="number" min="0" value={form.dosageMonths} onChange={set("dosageMonths")} />
            </div>
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
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Record inquiry
          </button>
        </div>
      </div>
    </>
  );
}
