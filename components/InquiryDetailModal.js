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

  const contacts = [inquiry.contact_primary, inquiry.contact_alt1, inquiry.contact_alt2].filter(Boolean).join(" · ") || "—";

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
          </div>
          <Row label="Product" value={inquiry.product_name} />
          <Row label="Quantity" value={inquiry.qty} />
          <Row label="Value" value={fmtMoney(inquiry.value)} />
          <Row label="Dosage duration" value={`${inquiry.dosage_months} month(s)`} />
          <Row label="Prescriber" value={inquiry.prescriber} />
          <Row label="Dr. code" value={inquiry.dr_code} mono />
          <Row label="Sales representative" value={inquiry.sales_rep} />
          <Row label="Contact number(s)" value={contacts} />
          <Row label="Address" value={inquiry.address} />
        </div>
      </div>
    </div>
  );
}
