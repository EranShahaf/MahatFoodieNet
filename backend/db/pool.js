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