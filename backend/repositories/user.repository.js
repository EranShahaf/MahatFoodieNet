import { pool } from "../db/pool.js";
import { User } from "../models/user.model.js";

export class UserRepository {
  async create(username, password_hash, roles) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Creating user: ${username}`);
      const res = await pool.query(
        `INSERT INTO users (username, password_hash, roles)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [username, password_hash, roles]
      );
      console.log(`[DB] ${new Date().toISOString()} | User created successfully: ${username} (id: ${res.rows[0].id})`);
      return new User(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to create user ${username}: ${error.message}`);
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      const res = await pool.query(`SELECT * FROM users WHERE username=$1`, [username]);
      const found = res.rows.length ? new User(res.rows[0]) : null;
      if (found) {
        console.log(`[DB] ${new Date().toISOString()} | User found by username: ${username}`);
      } else {
        console.log(`[DB] ${new Date().toISOString()} | User not found by username: ${username}`);
      }
      return found;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find user by username ${username}: ${error.message}`);
      throw error;
    }
  }

  async findById(id) {
    try {
      const res = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
      const found = res.rows.length ? new User(res.rows[0]) : null;
      if (found) {
        console.log(`[DB] ${new Date().toISOString()} | User found by id: ${id}`);
      } else {
        console.log(`[DB] ${new Date().toISOString()} | User not found by id: ${id}`);
      }
      return found;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find user by id ${id}: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const res = await pool.query(`SELECT * FROM users`);
      console.log(`[DB] ${new Date().toISOString()} | Found ${res.rows.length} users`);
      return res.rows.map(row => new User(row));
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all users: ${error.message}`);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Deleting user with id: ${id}`);
      const res = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
      console.log(`[DB] ${new Date().toISOString()} | User deleted: ${id} (rows affected: ${res.rowCount})`);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to delete user ${id}: ${error.message}`);
      throw error;
    }
  }
}
