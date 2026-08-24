export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (isoOrDate) => {
  if (!isoOrDate) return "—";
  const iso = typeof isoOrDate === "string" ? isoOrDate.slice(0, 10) : todayISO();
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString("en-PK")}`;
