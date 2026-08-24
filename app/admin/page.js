"use client";

import { useEffect, useState } from "react";
import { Plus, Package, TrendingDown, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { StatCard, ToastStack, Badge } from "@/components/ui";
import MedicineTable from "@/components/MedicineTable";
import MedicineFormDrawer from "@/components/MedicineFormDrawer";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toasts, setToasts] = useState([]);

  const pushToast = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      pushToast("Couldn't load inventory. Check your database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addProduct = async (payload) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushToast(data.error || "Couldn't save this medicine.");
        return false;
      }
      const created = data;
      setProducts((prev) => [created, ...prev]);
      setDrawerOpen(false);
      pushToast(`${created.name} added to inventory`);
      return true;
    } catch (error) {
      pushToast(error?.message || "Couldn't save this medicine.");
      return false;
    }
  };

  const updateProduct = async (payload) => {
    try {
      const res = await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        pushToast(data.error || "Couldn't update this medicine.");
        return false;
      }
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setEditing(null);
      pushToast(`${data.name} updated`);
      return true;
    } catch (error) {
      pushToast(error?.message || "Couldn't update this medicine.");
      return false;
    }
  };

  const removeProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    } catch {
      pushToast("Couldn't delete — please refresh and try again.");
      load();
    }
  };

  const lowStock = products.filter((p) => p.quantity < 10).length;

  return (
    <div style={{ paddingBottom: 60 }}>
      <ToastStack toasts={toasts} />
      <NavBar active="admin" />

      <div style={{ maxWidth: 1180, margin: "20px auto 0", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={Package} label="Medicines in stock" value={loading ? "…" : products.length} delay={40} />
        <StatCard
          icon={TrendingDown}
          label="Low stock alerts"
          value={loading ? "…" : lowStock}
          sub={!loading && lowStock > 0 && <Badge tone="danger">Attention</Badge>}
          delay={100}
        />
      </div>

      <div style={{ maxWidth: 1180, margin: "26px auto 16px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Medicine inventory</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Admin console — add and manage stock</div>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}>
          <Plus size={15} /> Add medicine
        </button>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {loading ? (
          <div className="card" style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} className="animate-spin" color="var(--primary)" />
          </div>
        ) : (
          <MedicineTable products={products} onEdit={setEditing} onDelete={removeProduct} />
        )}
      </div>

      <MedicineFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={addProduct} />
      <MedicineFormDrawer open={Boolean(editing)} onClose={() => setEditing(null)} onSave={updateProduct} editing={editing} />
    </div>
  );
}
