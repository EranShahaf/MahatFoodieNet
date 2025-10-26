import { pool } from "../db/pool.js";
import { User } from "../models/user.model.js";

export class UserRepository {
  async create(username, password_hash, roles) {
    const res = await pool.query(
      `INSERT INTO users (username, password_hash, roles)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, password_hash, roles]
    );
    return new User(res.rows[0]);
  }

  async findByUsername(username) {
    const res = await pool.query(`SELECT * FROM users WHERE username=$1`, [username]);
    return res.rows.length ? new User(res.rows[0]) : null;
  }

  async findAll() {
    const res = await pool.query(`SELECT * FROM users`);
    return res.rows.map(row => new User(row));
  }

  async delete(id) {
    await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  }
}
