import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({ connectionString: 
    "postgres://" + 
    process.env.POSTGRES_USER + 
    ":" + 
    process.env.POSTGRES_PASSWORD + 
    "@postgres:5432/" + 
    process.env.POSTGRES_DB
});

// Database connection event logging
pool.on("connect", () => {
  console.log(`[DB] ${new Date().toISOString()} | Database client connected`);
});

pool.on("error", (err) => {
  console.error(`[DB ERROR] ${new Date().toISOString()} | Unexpected error on idle client: ${err.message}`);
  console.error(`[DB ERROR] Stack: ${err.stack}`);
});