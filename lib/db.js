import { neon } from "@neondatabase/serverless";

// The connection is created lazily (on first real query) rather than at
// import time, so `next build` succeeds even before a database is attached —
// Vercel sets DATABASE_URL / POSTGRES_URL automatically once you add the
// Postgres storage integration.
let _client;

function getClient() {
  if (!_client) {
    const connectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
    if (!connectionString) {
      throw new Error(
        "No database connected. Add a Postgres database (Vercel Storage → Postgres) or set DATABASE_URL locally."
      );
    }
    _client = neon(connectionString);
  }
  return _client;
}

// Tagged-template passthrough: `sql\`SELECT ...\`` works exactly like the
// underlying neon() client, just with the connection resolved lazily.
export function sql(strings, ...values) {
  return getClient()(strings, ...values);
}

let ensured = false;

// Creates tables on first request if they don't exist yet.
// This means there is no manual migration step for the MVP:
// connect a Postgres database (Vercel Postgres, Neon, Supabase, etc.)
// via the DATABASE_URL / POSTGRES_URL env var and the schema sets itself up.
export async function ensureTables() {
  if (ensured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      quantity INTEGER DEFAULT 0,
      price NUMERIC DEFAULT 0,
      dosage NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      invoice TEXT,
      date DATE,
      customer_name TEXT NOT NULL,
      care_of TEXT,
      patient_status TEXT,
      product_id TEXT,
      product_name TEXT,
      address TEXT,
      prescriber TEXT,
      dr_code TEXT,
      contact_primary TEXT,
      contact_alt1 TEXT,
      contact_alt2 TEXT,
      sales_rep TEXT,
      qty INTEGER DEFAULT 0,
      value NUMERIC DEFAULT 0,
      items JSONB DEFAULT '[]'::jsonb,
      remarks TEXT,
      image_data TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS care_of TEXT;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS remarks TEXT;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS printed BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE inquiries DROP COLUMN IF EXISTS dosage_months;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS received_cash BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS received_online BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS received_cheque BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;`;

  ensured = true;
}
