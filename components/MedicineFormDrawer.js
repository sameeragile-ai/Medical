"use client";

import { useEffect, useState } from "react";
import { X, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { FieldLabel } from "./ui";

const BLANK = { name: "", quantity: "", brand: "", price: "", dosage: "" };

export default function MedicineFormDrawer({ open, onClose, onSave, editing }) {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(editing);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name || "",
              brand: editing.brand || "",
              quantity: editing.quantity ?? "",
              price: editing.price ?? "",
              dosage: editing.dosage ?? "",
            }
          : BLANK
      );
      setError("");
      setSaving(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Medicine name is required.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await onSave({
      name: form.name.trim(),
      brand: form.brand.trim(),
      quantity: form.quantity === "" ? 0 : Number(form.quantity),
      price: form.price === "" ? 0 : Number(form.price),
      dosage: form.dosage === "" ? 0 : Number(form.dosage),
    });
    setSaving(false);
    if (!ok) setError("Something went wrong saving this medicine. Please try again.");
  };

  return (
    <>
      <div className="overlay fade-in" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? "Edit medicine" : "Add medicine"}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{isEdit ? `Update ${editing.name}` : "Add a new item to your inventory"}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Medicine name</FieldLabel>
            <input className="input" placeholder="e.g. Panadol Extra" value={form.name} onChange={set("name")} autoFocus />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel>Brand</FieldLabel>
              <input className="input" placeholder="e.g. GSK" value={form.brand} onChange={set("brand")} />
            </div>
            <div>
              <FieldLabel>Quantity</FieldLabel>
              <input className="input" type="number" min="0" placeholder="0" value={form.quantity} onChange={set("quantity")} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <FieldLabel>Price (Rs.)</FieldLabel>
              <input className="input" type="number" min="0" placeholder="0" value={form.price} onChange={set("price")} />
            </div>
            <div>
              <FieldLabel>Dosage (mg)</FieldLabel>
              <input className="input" type="number" min="0" placeholder="0" value={form.dosage} onChange={set("dosage")} />
            </div>
          </div>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--danger)", fontSize: 12.5, marginTop: 14 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid var(--border-soft)", display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={submit} disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {isEdit ? "Save changes" : "Save medicine"}
          </button>
        </div>
      </div>
    </>
  );
}
