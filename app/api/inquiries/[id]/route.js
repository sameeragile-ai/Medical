import { NextResponse } from "next/server";
import { sql, ensureTables } from "@/lib/db";
import { normalizeItems, itemsTotals } from "@/lib/inquiryItems";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    await ensureTables();
    const body = await req.json();

    if (body.printed) {
      await sql`UPDATE inquiries SET printed = true WHERE id = ${params.id}`;
    }

    const rows = await sql`SELECT * FROM inquiries WHERE id = ${params.id}`;
    if (!rows[0]) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while updating the inquiry." },
      { status: 503 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await ensureTables();

    const existing = await sql`SELECT printed FROM inquiries WHERE id = ${params.id}`;
    if (!existing[0]) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    if (existing[0].printed) {
      return NextResponse.json({ error: "This invoice has already been printed and can no longer be edited." }, { status: 400 });
    }

    const body = await req.json();

    if (!body.customerName || !String(body.customerName).trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    const items = normalizeItems(body.items);
    if (items.length === 0) {
      return NextResponse.json({ error: "Please add at least one product." }, { status: 400 });
    }
    if (!body.contactPrimary || !String(body.contactPrimary).trim()) {
      return NextResponse.json({ error: "Primary contact number is required." }, { status: 400 });
    }

    const { qty, value, productName, productId } = itemsTotals(items);

    await sql`
      UPDATE inquiries SET
        customer_name = ${String(body.customerName).trim()},
        care_of = ${body.careOf || null},
        patient_status = ${body.patientStatus || "New"},
        product_id = ${productId},
        product_name = ${productName || null},
        address = ${body.address || null},
        prescriber = ${body.prescriber || null},
        dr_code = ${body.drCode || null},
        contact_primary = ${String(body.contactPrimary).trim()},
        contact_alt1 = ${body.contactAlt1 || null},
        contact_alt2 = ${body.contactAlt2 || null},
        sales_rep = ${body.salesRep || null},
        qty = ${qty},
        value = ${value},
        items = ${JSON.stringify(items)}::jsonb,
        remarks = ${body.remarks || null},
        image_data = ${body.imageData || null}
      WHERE id = ${params.id}
    `;

    const rows = await sql`SELECT * FROM inquiries WHERE id = ${params.id}`;
    if (!rows[0]) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while updating the inquiry." },
      { status: 503 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await ensureTables();

    const existing = await sql`SELECT printed FROM inquiries WHERE id = ${params.id}`;
    if (existing[0]?.printed) {
      return NextResponse.json({ error: "This invoice has already been printed and can no longer be deleted." }, { status: 400 });
    }

    await sql`DELETE FROM inquiries WHERE id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Database connection failed while deleting the inquiry." },
      { status: 503 }
    );
  }
}
