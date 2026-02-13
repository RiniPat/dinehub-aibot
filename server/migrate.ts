import { pool } from "./db";

/**
 * Safe migration that runs on every server start.
 * Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS so it's idempotent.
 * This replaces drizzle-kit push for production deployments.
 */
export async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("[migrate] Running safe schema migrations...");

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        address TEXT,
        contact_number TEXT,
        whatsapp_number TEXT,
        cuisine_type TEXT,
        description TEXT,
        cover_image TEXT,
        table_count INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        is_bestseller BOOLEAN DEFAULT FALSE,
        is_chefs_pick BOOLEAN DEFAULT FALSE,
        is_todays_special BOOLEAN DEFAULT FALSE
      );
    `);

    // Safe ALTER TABLE for new columns (won't fail if they already exist)
    const safeAddColumn = async (table: string, column: string, type: string) => {
      try {
        await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
      } catch (e: any) {
        // Ignore if column already exists
        if (!e.message?.includes("already exists")) {
          console.warn(`[migrate] Warning adding ${table}.${column}:`, e.message);
        }
      }
    };

    // Ensure new columns exist on restaurants
    await safeAddColumn("restaurants", "table_count", "INTEGER DEFAULT 10");
    await safeAddColumn("restaurants", "whatsapp_number", "TEXT");

    // Ensure new columns exist on menu_items
    await safeAddColumn("menu_items", "is_bestseller", "BOOLEAN DEFAULT FALSE");
    await safeAddColumn("menu_items", "is_chefs_pick", "BOOLEAN DEFAULT FALSE");
    await safeAddColumn("menu_items", "is_todays_special", "BOOLEAN DEFAULT FALSE");

    console.log("[migrate] Schema migrations complete.");
  } catch (err) {
    console.error("[migrate] Migration error:", err);
    // Don't crash the server - the app can still work with existing schema
  } finally {
    client.release();
  }
}
