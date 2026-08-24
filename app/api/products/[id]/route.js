import { NextResponse } from "next/server";
import { sql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try {
    await ensureTables();
    const body = await req.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Medicine name is required." }, { status: 400 });
    }

    await sql`
      UPDATE products SET
        name = ${String(body.name).trim()},
        brand = ${body.brand ? String(body.brand).trim() : null},
        quantity = ${Number(body.quantity) || 0},
        price = ${Number(body.price) || 0},
        dosage = ${Number(body.dosage) || 0}
      WHERE id = ${params.id}
    `;

    const rows = await sql`SELECT * FROM products WHERE id = ${params.id}`;
    if (!rows[0]) return NextResponse.json({ error: "Medicine not found." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while updating the medicine." },
      { status: 503 }
    );
  }
}

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
