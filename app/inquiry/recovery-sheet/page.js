"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { fmtDate, fmtMoney, todayISO } from "@/lib/format";

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export default function RecoverySheetPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());

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

  const setRangeToday = () => {
    setFrom(todayISO());
    setTo(todayISO());
  };
  const setRangeWeek = () => {
    setFrom(startOfWeekISO());
    setTo(todayISO());
  };

  const recovered = useMemo(
    () =>
      inquiries.filter((i) => {
        if (!i.received_at) return false;
        const d = String(i.received_at).slice(0, 10);
        return d >= from && d <= to;
      }),
    [inquiries, from, to]
  );

  const totals = recovered.reduce(
    (acc, i) => {
      const v = Number(i.value || 0);
      acc.total += v;
      if (i.received_cash) acc.cash += v;
      if (i.received_online) acc.online += v;
      if (i.received_cheque) acc.cheque += v;
      return acc;
    },
    { total: 0, cash: 0, online: 0, cheque: 0 }
  );

  const methodLabel = (i) => {
    const m = [];
    if (i.received_cash) m.push("Cash");
    if (i.received_online) m.push("Online");
    if (i.received_cheque) m.push("Cheque");
    return m.join(", ") || "—";
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <NavBar active="recovery-sheet" />

      <div style={{ maxWidth: 1180, margin: "26px auto 16px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Daily recovery sheet</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Amount recovered from orders, filtered by the date it was marked received.
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-soft" onClick={setRangeToday}>Today</button>
          <button className="btn btn-soft" onClick={setRangeWeek}>This week</button>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span style={{ color: "var(--muted)", fontSize: 13 }}>to</span>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto 18px", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div className="card" style={statCard}>
          <div style={statLabel}>Total recovered</div>
          <div style={statValue}>{fmtMoney(totals.total)}</div>
        </div>
        <div className="card" style={statCard}>
          <div style={statLabel}>Cash</div>
          <div style={statValue}>{fmtMoney(totals.cash)}</div>
        </div>
        <div className="card" style={statCard}>
          <div style={statLabel}>Online</div>
          <div style={statValue}>{fmtMoney(totals.online)}</div>
        </div>
        <div className="card" style={statCard}>
          <div style={statLabel}>Cheque</div>
          <div style={statValue}>{fmtMoney(totals.cheque)}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {loading ? (
          <div className="card" style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} className="animate-spin" color="var(--primary)" />
          </div>
        ) : !recovered.length ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            <Wallet size={22} style={{ marginBottom: 8 }} />
            <div>No recoveries recorded in this date range.</div>
          </div>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                  <th style={th}>Received</th>
                  <th style={th}>Invoice</th>
                  <th style={th}>Customer</th>
                  <th style={th}>Method</th>
                  <th style={{ ...th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recovered.map((inq) => (
                  <tr key={inq.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                    <td style={td}>{fmtDate(inq.received_at)}</td>
                    <td style={td}>{inq.invoice}</td>
                    <td style={td}>{inq.customer_name}</td>
                    <td style={td}>{methodLabel(inq)}</td>
                    <td style={{ ...td, textAlign: "right" }}>{fmtMoney(inq.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={td} colSpan={4}><b>Total</b></td>
                  <td style={{ ...td, textAlign: "right" }}><b>{fmtMoney(totals.total)}</b></td>
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
const statCard = { padding: "14px 16px" };
const statLabel = { fontSize: 12, color: "var(--muted)", fontWeight: 600 };
const statValue = { fontSize: 18, fontWeight: 700, marginTop: 4 };
