"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pill, Users, Package, LogOut } from "lucide-react";

export default function NavBar({ active }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: active }),
    });
    router.push(active === "admin" ? "/admin/login" : "/inquiry/login");
    router.refresh();
  };

  return (
    <header style={{ padding: "22px 24px 0", maxWidth: 1180, margin: "0 auto" }}>
      <div className="fade-in flex items-center justify-between" style={{ flexWrap: "wrap", gap: 14 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="grad-icon"
            style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}
          >
            <Pill size={20} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display grad-text" style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.1 }}>MedTrack</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>Inventory &amp; prescription sales</div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 10 }}>
          <nav className="flex items-center" style={{ gap: 6, background: "var(--surface)", border: "1px solid var(--border-soft)", padding: 4, borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
            <Link href="/admin" className={`nav-link ${active === "admin" ? "active" : ""}`}>
              <Package size={15} /> Medicine Inventory
            </Link>
            <Link href="/inquiry" className={`nav-link ${active === "inquiry" ? "active" : ""}`}>
              <Users size={15} /> Patient Inquiries
            </Link>
          </nav>
          <button className="icon-btn" onClick={logout} title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
