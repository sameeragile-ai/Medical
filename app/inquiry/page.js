"use client";

import { useEffect, useState } from "react";
import { Plus, Users, TrendingUp, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { StatCard, ToastStack } from "@/components/ui";
import InquiryTable from "@/components/InquiryTable";
import InquiryFormDrawer from "@/components/InquiryFormDrawer";
import InquiryDetailModal from "@/components/InquiryDetailModal";
import { todayISO } from "@/lib/format";

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [toasts, setToasts] = useState([]);

  const pushToast = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [iRes, pRes] = await Promise.all([fetch("/api/inquiries"), fetch("/api/products")]);
      const [iData, pData] = await Promise.all([iRes.json(), pRes.json()]);
      setInquiries(Array.isArray(iData) ? iData : []);
      setProducts(Array.isArray(pData) ? pData : []);
    } catch {
      pushToast("Couldn't load data. Check your database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addInquiry = async (payload) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const created = await res.json();
      setInquiries((prev) => [created, ...prev]);
      setDrawerOpen(false);
      pushToast(`Inquiry recorded — ${created.invoice}`);
      return true;
    } catch {
      return false;
    }
  };

  const updateInquiry = async (payload) => {
    try {
      const res = await fetch(`/api/inquiries/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const updated = await res.json();
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditing(null);
      pushToast(`Inquiry updated — ${updated.invoice}`);
      return true;
    } catch {
      return false;
    }
  };

  const deleteInquiry = async (inquiry) => {
    if (!window.confirm(`Delete inquiry ${inquiry.invoice}? This cannot be undone.`)) return;
    setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id));
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      pushToast(`Inquiry deleted — ${inquiry.invoice}`);
    } catch {
      pushToast("Couldn't delete — please refresh and try again.");
      load();
    }
  };

  const todayCount = inquiries.filter((i) => (i.date || "").slice(0, 10) === todayISO()).length;

  return (
    <div style={{ paddingBottom: 60 }}>
      <ToastStack toasts={toasts} />
      <NavBar active="inquiry" />

      <div style={{ maxWidth: 1180, margin: "20px auto 0", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={Users} label="Total inquiries" value={loading ? "…" : inquiries.length} delay={40} />
        <StatCard icon={TrendingUp} label="Inquiries today" value={loading ? "…" : todayCount} delay={100} />
      </div>

      <div style={{ maxWidth: 1180, margin: "26px auto 16px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Patient inquiries</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Inquiry desk — log prescription-based sales</div>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}>
          <Plus size={15} /> New inquiry
        </button>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {loading ? (
          <div className="card" style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} className="animate-spin" color="var(--primary)" />
          </div>
        ) : (
          <InquiryTable inquiries={inquiries} onView={setViewing} onEdit={setEditing} onDelete={deleteInquiry} />
        )}
      </div>

      <InquiryFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={addInquiry} products={products} />
      <InquiryFormDrawer open={Boolean(editing)} onClose={() => setEditing(null)} onSave={updateInquiry} products={products} editing={editing} />
      <InquiryDetailModal inquiry={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
