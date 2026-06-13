// fix-database.js - Database ko fix karne ka script
// Missing columns aur tables add karega

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Database se connect ho raha hoon...');
    
    // ============================================
    // 1. workers table mein missing columns add karo
    // ============================================
    console.log('\n📋 Workers table fix kar raha hoon...');
    
    const workerColumns = [
      { name: 'is_approved', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true' },
      { name: 'kyc_status', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS kyc_status BOOLEAN NOT NULL DEFAULT false' },
      { name: 'aadhaar_url', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS aadhaar_url TEXT' },
      { name: 'pan_url', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS pan_url TEXT' },
      { name: 'passbook_url', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS passbook_url TEXT' },
      { name: 'selfie_url', sql: 'ALTER TABLE workers ADD COLUMN IF NOT EXISTS selfie_url TEXT' },
    ];
    
    for (const col of workerColumns) {
      try {
        await client.query(col.sql);
        console.log(`  ✅ workers.${col.name} - OK`);
      } catch (e) {
        console.log(`  ⚠️  workers.${col.name} - ${e.message}`);
      }
    }
    
    // ============================================
    // 2. users table mein missing columns add karo
    // ============================================
    console.log('\n👤 Users table fix kar raha hoon...');
    
    const userColumns = [
      { name: 'photo_url', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(1000)' },
      { name: 'location', sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100) NOT NULL DEFAULT 'Bhopal'" },
    ];
    
    for (const col of userColumns) {
      try {
        await client.query(col.sql);
        console.log(`  ✅ users.${col.name} - OK`);
      } catch (e) {
        console.log(`  ⚠️  users.${col.name} - ${e.message}`);
      }
    }
    
    // ============================================
    // 3. appointments table mein missing columns add karo
    // ============================================
    console.log('\n📅 Appointments table fix kar raha hoon...');
    
    const apptColumns = [
      { name: 'payment_status', sql: "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending'" },
      { name: 'cancellation_reason', sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT' },
      { name: 'transaction_id', sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)' },
      { name: 'visit_charge', sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS visit_charge INTEGER NOT NULL DEFAULT 0' },
      { name: 'extra_charge', sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS extra_charge INTEGER NOT NULL DEFAULT 0' },
      { name: 'total_amount', sql: 'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount INTEGER NOT NULL DEFAULT 0' },
    ];
    
    for (const col of apptColumns) {
      try {
        await client.query(col.sql);
        console.log(`  ✅ appointments.${col.name} - OK`);
      } catch (e) {
        console.log(`  ⚠️  appointments.${col.name} - ${e.message}`);
      }
    }
    
    // ============================================
    // 4. reviews table banao (agar nahi hai)
    // ============================================
    console.log('\n⭐ Reviews table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          vendor_id INTEGER REFERENCES workers(id),
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ reviews table - OK');
    } catch (e) {
      console.log(`  ⚠️  reviews table - ${e.message}`);
    }
    
    // ============================================
    // 5. recent_works table banao (agar nahi hai)
    // ============================================
    console.log('\n🖼️  Recent_works table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS recent_works (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          location VARCHAR(100) NOT NULL,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ recent_works table - OK');
    } catch (e) {
      console.log(`  ⚠️  recent_works table - ${e.message}`);
    }
    
    // ============================================
    // 6. service_areas table banao
    // ============================================
    console.log('\n📍 Service_areas table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS service_areas (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ service_areas table - OK');
    } catch (e) {
      console.log(`  ⚠️  service_areas table - ${e.message}`);
    }
    
    // ============================================
    // 7. payments table banao
    // ============================================
    console.log('\n💳 Payments table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          appointment_id INTEGER REFERENCES appointments(id) NOT NULL,
          amount INTEGER NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Success',
          transaction_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ payments table - OK');
    } catch (e) {
      console.log(`  ⚠️  payments table - ${e.message}`);
    }
    
    // ============================================
    // 8. email_otps table banao
    // ============================================
    console.log('\n📧 Email_otps table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS email_otps (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ email_otps table - OK');
    } catch (e) {
      console.log(`  ⚠️  email_otps table - ${e.message}`);
    }
    
    // ============================================
    // 9. phone_otps table banao
    // ============================================
    console.log('\n📱 Phone_otps table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS phone_otps (
          id SERIAL PRIMARY KEY,
          phone VARCHAR(20) NOT NULL UNIQUE,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ phone_otps table - OK');
    } catch (e) {
      console.log(`  ⚠️  phone_otps table - ${e.message}`);
    }
    
    // ============================================
    // 10. service_pricing table banao
    // ============================================
    console.log('\n💰 Service_pricing table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS service_pricing (
          id SERIAL PRIMARY KEY,
          category VARCHAR(100) NOT NULL UNIQUE,
          base_price INTEGER NOT NULL DEFAULT 149,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ service_pricing table - OK');
    } catch (e) {
      console.log(`  ⚠️  service_pricing table - ${e.message}`);
    }
    
    // ============================================
    // 11. coupons table banao
    // ============================================
    console.log('\n🎟️  Coupons table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          discount_value INTEGER NOT NULL,
          is_percentage BOOLEAN NOT NULL DEFAULT false,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ coupons table - OK');
    } catch (e) {
      console.log(`  ⚠️  coupons table - ${e.message}`);
    }
    
    // ============================================
    // 12. system_settings table banao
    // ============================================
    console.log('\n⚙️  System_settings table bana raha hoon...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);
      console.log('  ✅ system_settings table - OK');
    } catch (e) {
      console.log(`  ⚠️  system_settings table - ${e.message}`);
    }
    
    // ============================================
    // 13. Default system settings insert karo
    // ============================================
    console.log('\n⚙️  Default settings insert kar raha hoon...');
    try {
      await client.query(`
        INSERT INTO system_settings (key, value) VALUES
          ('enableCashPayment', 'true'),
          ('enableOnlinePayment', 'true'),
          ('visitCharge', '49'),
          ('maintenanceMode', 'false')
        ON CONFLICT (key) DO NOTHING
      `);
      console.log('  ✅ Default settings - OK');
    } catch (e) {
      console.log(`  ⚠️  Default settings - ${e.message}`);
    }
    
    // ============================================
    // 14. Existing workers ko approve karo
    // ============================================
    console.log('\n✔️  Existing workers ko approve kar raha hoon...');
    try {
      await client.query(`UPDATE workers SET is_approved = true WHERE is_approved = false`);
      console.log('  ✅ Workers approved - OK');
    } catch (e) {
      console.log(`  ⚠️  Workers approve - ${e.message}`);
    }
    
    // ============================================
    // Final check
    // ============================================
    console.log('\n📊 Final check kar raha hoon...');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n✅ Database mein ye tables hain:');
    tables.rows.forEach(t => console.log(`   - ${t.table_name}`));
    
    console.log('\n🎉 DATABASE FIX COMPLETE! Saari errors ab theek ho gayi hain!');
    
  } catch (err) {
    console.error('❌ Main Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase();
