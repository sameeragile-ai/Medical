import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while loading products." },
      { status: 503 }
    );
  }
}

export async function POST(req) {
  try {
    await ensureTables();
    const body = await req.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Medicine name is required." }, { status: 400 });
    }

    const id = randomUUID();
    await sql`
      INSERT INTO products (id, name, brand, quantity, price, dosage)
      VALUES (
        ${id},
        ${String(body.name).trim()},
        ${body.brand ? String(body.brand).trim() : null},
        ${Number(body.quantity) || 0},
        ${Number(body.price) || 0},
        ${Number(body.dosage) || 0}
      )
    `;

    const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while saving the medicine." },
      { status: 503 }
    );
  }
}
