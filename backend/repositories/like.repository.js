import { pool } from "../db/pool.js";
import { Like } from "../models/like.model.js";

export class LikeRepository {
  async create(likeData) {
    try {
      const { user_id, post_id } = likeData;
      console.log(`[DB] ${new Date().toISOString()} | Creating like by user ${user_id} on post ${post_id}`);
      const res = await pool.query(
        `INSERT INTO likes (user_id, post_id)
         VALUES ($1, $2)
         RETURNING *`,
        [user_id, post_id]
      );
      console.log(`[DB] ${new Date().toISOString()} | Like created successfully: id ${res.rows[0].id}`);
      return new Like(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to create like: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const res = await pool.query(`SELECT * FROM likes`);
      console.log(`[DB] ${new Date().toISOString()} | Found ${res.rows.length} likes`);
      return res.rows.map(row => new Like(row));
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all likes: ${error.message}`);
      throw error;
    }
  }

  async delete(user_id, post_id) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Deleting like by user ${user_id} on post ${post_id}`);
      const res = await pool.query(`DELETE FROM likes WHERE user_id=$1 AND post_id=$2`, [user_id, post_id]);
      console.log(`[DB] ${new Date().toISOString()} | Like deleted (rows affected: ${res.rowCount})`);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to delete like: ${error.message}`);
      throw error;
    }
  }
}
