const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cloudnotes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
  });

  try {
    await pool.connect();
    console.log('Connected to database');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../../migrations/001_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();