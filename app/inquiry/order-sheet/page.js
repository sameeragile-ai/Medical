"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, Truck, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { fmtDate, fmtMoney, todayISO } from "@/lib/format";
import { printOrderSheet } from "@/lib/invoiceActions";

export default function OrderSheetPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/inquiries");
        const data = await res.json();
        setInquiries(Array.isArray(data) ? data : []);
      } catch {
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dayInquiries = useMemo(
    () => inquiries.filter((i) => (i.date || "").slice(0, 10) === date),
    [inquiries, date]
  );

  const totalValue = dayInquiries.reduce((s, i) => s + Number(i.value || 0), 0);
  const recoveredValue = dayInquiries
    .filter((i) => i.received_cash || i.received_online || i.received_cheque)
    .reduce((s, i) => s + Number(i.value || 0), 0);

  const toggleReceived = async (inq, field, dbField, checked) => {
    setInquiries((prev) => prev.map((i) => (i.id === inq.id ? { ...i, [dbField]: checked } : i)));
    try {
      const res = await fetch(`/api/inquiries/${inq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: checked }),
      });
      const updated = await res.json();
      if (res.ok) {
        setInquiries((prev) => prev.map((i) => (i.id === inq.id ? updated : i)));
      }
    } catch {
      setInquiries((prev) => prev.map((i) => (i.id === inq.id ? { ...i, [dbField]: !checked } : i)));
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <NavBar active="order-sheet" />

      <div style={{ maxWidth: 1180, margin: "26px auto 16px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Rider order sheet</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Pick a date, review the day&apos;s orders, and print the handover sheet for the rider.
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 10 }}>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn btn-primary"
            disabled={!dayInquiries.length}
            onClick={() => printOrderSheet(fmtDate(date), dayInquiries)}
          >
            <Printer size={15} /> Print order sheet
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {loading ? (
          <div className="card" style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} className="animate-spin" color="var(--primary)" />
          </div>
        ) : !dayInquiries.length ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            <Truck size={22} style={{ marginBottom: 8 }} />
            <div>No inquiries recorded for {fmtDate(date)}.</div>
          </div>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                  <th style={th}>Invoice</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Address</th>
                  <th style={th}>Contact</th>
                  <th style={th}>Items</th>
                  <th style={{ ...th, textAlign: "right" }}>Qty</th>
                  <th style={{ ...th, textAlign: "right" }}>Amount</th>
                  <th style={{ ...th, textAlign: "center" }}>Cash</th>
                  <th style={{ ...th, textAlign: "center" }}>Online</th>
                  <th style={{ ...th, textAlign: "center" }}>Cheque</th>
                </tr>
              </thead>
              <tbody>
                {dayInquiries.map((inq) => {
                  const items = Array.isArray(inq.items) && inq.items.length
                    ? inq.items.map((it) => `${it.productName} x${it.qty}`).join(", ")
                    : inq.product_name || "—";
                  return (
                    <tr key={inq.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={td}>{inq.invoice}</td>
                      <td style={td}>{inq.customer_name}</td>
                      <td style={td}>{inq.address || "—"}</td>
                      <td style={td}>{inq.contact_primary || "—"}</td>
                      <td style={td}>{items}</td>
                      <td style={{ ...td, textAlign: "right" }}>{inq.qty}</td>
                      <td style={{ ...td, textAlign: "right" }}>{fmtMoney(inq.value)}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={!!inq.received_cash}
                          onChange={(e) => toggleReceived(inq, "receivedCash", "received_cash", e.target.checked)}
                        />
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={!!inq.received_online}
                          onChange={(e) => toggleReceived(inq, "receivedOnline", "received_online", e.target.checked)}
                        />
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={!!inq.received_cheque}
                          onChange={(e) => toggleReceived(inq, "receivedCheque", "received_cheque", e.target.checked)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={td} colSpan={6}><b>Total</b></td>
                  <td style={{ ...td, textAlign: "right" }}><b>{fmtMoney(totalValue)}</b></td>
                  <td style={td} colSpan={3}></td>
                </tr>
                <tr>
                  <td style={td} colSpan={6}><b>Recovered</b></td>
                  <td style={{ ...td, textAlign: "right", color: "var(--primary)" }}><b>{fmtMoney(recoveredValue)}</b></td>
                  <td style={td} colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: "10px 12px", fontSize: 12.5, color: "var(--muted)", fontWeight: 600 };
const td = { padding: "10px 12px", fontSize: 13 };
