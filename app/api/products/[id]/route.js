import { NextResponse } from "next/server";
import { sql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  try {
    await ensureTables();
    await sql`DELETE FROM products WHERE id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while deleting the medicine." },
      { status: 503 }
    );
  }
}
