"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { FieldLabel } from "./ui";
import { focusNextOnEnter } from "@/lib/focusNav";
import {
  sanitizeName,
  validateName,
  validateNumber,
} from "@/lib/validate";

const BLANK = { name: "", quantity: "", brand: "", price: "", dosage: "" };

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: "var(--danger)", fontSize: 11.5, marginTop: 4 }}>
      {msg}
    </div>
  );
}

export default function MedicineFormDrawer({ open, onClose, onSave, editing }) {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(editing);
  const drawerRef = useRef(null);

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
          : BLANK,
      );
      setError("");
      setFieldErrors({});
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
    name: () => validateName(form.name, "Medicine name", true),
    brand: () => validateName(form.brand, "Brand", false),
    quantity: () => validateNumber(form.quantity, "Quantity", { min: 0, required: false }),
    price: () => validateNumber(form.price, "Price", { min: 0, required: false }),
    dosage: () => validateNumber(form.dosage, "Dosage", { min: 0, required: false }),
  };

  const validateOne = (k) => () => {
    setFieldErrors((fe) => ({ ...fe, [k]: FIELD_VALIDATORS[k]() }));
  };

  const submit = async () => {
    const errs = {};
    Object.keys(FIELD_VALIDATORS).forEach((k) => {
      const msg = FIELD_VALIDATORS[k]();
      if (msg) errs[k] = msg;
    });
    setFieldErrors(errs);
    const firstError = Object.values(errs)[0];
    if (firstError) {
      setError(firstError);
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
    if (!ok)
      setError("Something went wrong saving this medicine. Please try again.");
  };

  const onEnter = (e) => focusNextOnEnter(e, drawerRef, submit);

  return (
    <>
      <div className="overlay fade-in" onClick={onClose} />
      <div className="drawer" ref={drawerRef}>
        <div
          style={{
            padding: "22px 24px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="font-display"
              style={{ fontSize: 18, fontWeight: 700 }}
            >
              {isEdit ? "Edit medicine" : "Add medicine"}
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}
            >
              {isEdit
                ? `Update ${editing.name}`
                : "Add a new item to your inventory"}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <FieldLabel required>Medicine name</FieldLabel>
            <input
              className="input"
              placeholder="e.g. Panadol Extra"
              value={form.name}
              onChange={setSanitized("name", sanitizeName)}
              onBlur={validateOne("name")}
              onKeyDown={onEnter}
              autoFocus
            />
            <FieldError msg={fieldErrors.name} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <FieldLabel>Brand</FieldLabel>
              <input
                className="input"
                placeholder="e.g. GSK"
                value={form.brand}
                onChange={setSanitized("brand", sanitizeName)}
                onBlur={validateOne("brand")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.brand} />
            </div>
            <div>
              <FieldLabel>Quantity</FieldLabel>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                onBlur={validateOne("quantity")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.quantity} />
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <FieldLabel>Price (Rs.)</FieldLabel>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={set("price")}
                onBlur={validateOne("price")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.price} />
            </div>
            <div>
              <FieldLabel>Dosage (mg)</FieldLabel>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={form.dosage}
                onChange={set("dosage")}
                onBlur={validateOne("dosage")}
                onKeyDown={onEnter}
              />
              <FieldError msg={fieldErrors.dosage} />
            </div>
          </div>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "var(--danger)",
                fontSize: 12.5,
                marginTop: 14,
              }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        <div
          style={{
            padding: 20,
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={submit}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}{" "}
            {isEdit ? "Save changes" : "Save medicine"}
          </button>
        </div>
      </div>
    </>
  );
}
