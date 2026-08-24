import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

function genInvoice(seq) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `INV-${ymd}-${String(seq).padStart(4, "0")}`;
}

export async function GET() {
  try {
    await ensureTables();
    const rows = await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while loading inquiries." },
      { status: 503 }
    );
  }
}

export async function POST(req) {
  try {
    await ensureTables();
    const body = await req.json();

    if (!body.customerName || !String(body.customerName).trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    if (!body.productId) {
      return NextResponse.json({ error: "Please select a product." }, { status: 400 });
    }
    if (!body.contactPrimary || !String(body.contactPrimary).trim()) {
      return NextResponse.json({ error: "Primary contact number is required." }, { status: 400 });
    }

    const countRes = await sql`SELECT COUNT(*)::int AS c FROM inquiries`;
    const invoice = genInvoice((countRes[0]?.c || 0) + 1);
    const id = randomUUID();
    const date = new Date().toISOString().slice(0, 10);

    await sql`
      INSERT INTO inquiries (
        id, invoice, date, customer_name, patient_status, product_id, product_name,
        address, prescriber, dr_code, contact_primary, contact_alt1, contact_alt2,
        sales_rep, qty, value, dosage_months, image_data
      ) VALUES (
        ${id}, ${invoice}, ${date}, ${String(body.customerName).trim()}, ${body.patientStatus || "New"},
        ${body.productId}, ${body.productName || null},
        ${body.address || null}, ${body.prescriber || null}, ${body.drCode || null},
        ${String(body.contactPrimary).trim()}, ${body.contactAlt1 || null}, ${body.contactAlt2 || null},
        ${body.salesRep || null}, ${Number(body.qty) || 0}, ${Number(body.value) || 0},
        ${Number(body.dosageMonths) || 0}, ${body.imageData || null}
      )
    `;

    const rows = await sql`SELECT * FROM inquiries WHERE id = ${id}`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while saving the inquiry." },
      { status: 503 }
    );
  }
}
