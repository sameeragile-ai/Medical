import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { role } = await req.json();
  const res = NextResponse.json({ ok: true });
  const cookieName = role === "admin" ? "mt_admin" : "mt_rep";
  res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return res;
}
