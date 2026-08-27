"use client";

import { X } from "lucide-react";
import { Badge } from "./ui";
import { fmtDate, fmtMoney } from "@/lib/format";

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span className={mono ? "font-mono" : ""} style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

export default function InquiryDetailModal({ inquiry, onClose }) {
  if (!inquiry) return null;

  const contactList = [inquiry.contact_primary, inquiry.contact_alt1, inquiry.contact_alt2].filter(Boolean);
  const items = Array.isArray(inquiry.items) && inquiry.items.length
    ? inquiry.items
    : inquiry.product_name
      ? [{ productId: inquiry.product_id, productName: inquiry.product_name, qty: inquiry.qty, price: inquiry.qty ? inquiry.value / inquiry.qty : 0, amount: inquiry.value }]
      : [];

  return (
    <div className="modal-center" onClick={onClose}>
      <div className="overlay fade-in" />
      <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>{inquiry.customer_name}</div>
            <span className="font-mono" style={{ fontSize: 11.5, color: "var(--primary-dark)" }}>{inquiry.invoice}</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {inquiry.image_data && (
            <img src={inquiry.image_data} alt="Prescription" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 16, border: "1px solid var(--border)" }} />
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Badge tone={inquiry.patient_status === "New" ? "accent" : "success"}>{inquiry.patient_status} patient</Badge>
            <Badge tone="neutral">{fmtDate(inquiry.date)}</Badge>
            <Badge tone={inquiry.printed ? "neutral" : "accent"}>{inquiry.printed ? "Printed" : "Pending"}</Badge>
          </div>
          <Row label="Care of / representative" value={inquiry.care_of} />

          <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border-soft)" }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginBottom: 8 }}>Products</div>
            {items.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>—</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((it, idx) => (
                  <div key={it.productId || idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>{it.productName} <span className="font-mono" style={{ color: "var(--muted)" }}>×{it.qty}</span></span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>{fmtMoney(it.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Row label="Total quantity" value={inquiry.qty} />
          <Row label="Total value" value={fmtMoney(inquiry.value)} />
          <Row label="Prescriber" value={inquiry.prescriber} />
          <Row label="Dr. code" value={inquiry.dr_code} mono />
          <Row label="Brick (territory)" value={inquiry.brick_territory} />
          <Row label="Sales representative" value={inquiry.sales_rep} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border-soft)" }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>Contact number(s)</span>
            <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right", display: "flex", flexDirection: "column", gap: 2 }}>
              {contactList.length === 0 ? "—" : contactList.map((c, i) => <span key={i}>{c}</span>)}
            </span>
          </div>
          <Row label="Address" value={inquiry.address} />
          <Row label="Remarks" value={inquiry.remarks} />
        </div>
      </div>
    </div>
  );
}
