import Link from "next/link";
import { Pill, Package, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
        <div className="fade-in text-center" style={{ marginBottom: 48 }}>
          <div
            className="grad-icon"
            style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "var(--shadow-md)" }}
          >
            <Pill size={28} color="#fff" strokeWidth={2.2} />
          </div>
          <h1 className="font-display grad-text" style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>MedTrack</h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>Choose how you'd like to work today.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <Link href="/admin" className="card fade-in" style={{ padding: 28, display: "block", textDecoration: "none", color: "inherit", animationDelay: "80ms" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Package size={22} color="var(--primary)" />
            </div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Medicine Inventory</div>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18, lineHeight: 1.5 }}>
              For admins. Add and manage stock — name, brand, quantity, price and dosage.
            </p>
            <span className="btn btn-soft">Open admin console <ArrowRight size={14} /></span>
          </Link>

          <Link href="/inquiry" className="card fade-in" style={{ padding: 28, display: "block", textDecoration: "none", color: "inherit", animationDelay: "160ms" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Users size={22} color="var(--accent)" />
            </div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Patient Inquiries</div>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18, lineHeight: 1.5 }}>
              For sales reps. Log a prescription sale against the current stock list.
            </p>
            <span className="btn btn-soft">Open inquiry desk <ArrowRight size={14} /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
