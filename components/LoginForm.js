"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pill, Lock, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";

export default function LoginForm({ role, endpoint, title, subtitle, accentColor, fallbackPath }) {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      const next = params.get("next") || fallbackPath;
      router.replace(next);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={submit} className="card fade-in" style={{ width: "100%", maxWidth: 380, padding: 32 }}>
        <div
          className="grad-icon"
          style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}
        >
          <Pill size={24} color="#fff" strokeWidth={2.2} />
        </div>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>{subtitle}</p>

        <div className="field-label">Password</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--danger)", fontSize: 12.5, marginBottom: 14 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading || !password}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
        </button>
      </form>
    </div>
  );
}
