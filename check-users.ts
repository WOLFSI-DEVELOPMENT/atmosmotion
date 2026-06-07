import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`SELECT * FROM users`;
  console.log("USERS:", users);
}
check();
