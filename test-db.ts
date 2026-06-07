import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("Connecting...");
  try {
     const res = await sql`SELECT 1 as val`;
     console.log("Success", res);
  } catch(e) {
     console.error(e);
  }
}
test();
