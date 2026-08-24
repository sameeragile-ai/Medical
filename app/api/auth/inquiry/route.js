import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { password } = await req.json();
  const expected = process.env.REP_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "REP_PASSWORD is not set on the server yet. Add it in your environment variables." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("mt_rep", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
