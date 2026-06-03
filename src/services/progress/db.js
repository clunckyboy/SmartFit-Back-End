// db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:12345678@localhost:5432/smartfit',
  // host: process.env.PGHOST,
  // port: process.env.PGPORT,
  // database: process.env.PGDATABASE,
  // user: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export default pool;