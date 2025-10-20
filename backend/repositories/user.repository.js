// repositories/user.repository.js
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: 
    "postgres://" + 
    process.env.POSTGRES_USER + 
    ":" + 
    process.env.POSTGRES_PASSWORD + 
    "@postgres:5432/" + 
    process.env.POSTGRES_DB
});

export const userRepository = {
  async findByUsername(username) {
    const result = await pool.query(
      "SELECT id, username, password_hash, roles FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] || null;
  },

  async createUser(username, passwordHash, roles = ["user"]) {
    const result = await pool.query(
      "INSERT INTO users (username, password_hash, roles) VALUES ($1, $2, $3) RETURNING id, username, roles",
      [username, passwordHash, roles]
    );
    return result.rows[0];
  },

  async deleteUser(id) {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return { success: true };
  },

  async findAll() {
    const result = await pool.query("SELECT id, username, roles FROM users");
    return result.rows;
  },
};
