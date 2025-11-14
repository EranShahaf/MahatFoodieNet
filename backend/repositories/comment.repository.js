import { pool } from "../db/pool.js";
import { Comment } from "../models/comment.model.js";

export class CommentRepository {
  async create(commentData) {
    try {
      const { user_id, post_id, message } = commentData;
      console.log(`[DB] ${new Date().toISOString()} | Creating comment by user ${user_id} on post ${post_id}`);
      const res = await pool.query(
        `INSERT INTO comments (user_id, post_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [user_id, post_id, message]
      );
      console.log(`[DB] ${new Date().toISOString()} | Comment created successfully: id ${res.rows[0].id}`);
      return new Comment(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to create comment: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const res = await pool.query(`SELECT * FROM comments`);
      console.log(`[DB] ${new Date().toISOString()} | Found ${res.rows.length} comments`);
      return res.rows.map(row => new Comment(row));
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all comments: ${error.message}`);
      throw error;
    }
  }

  async delete(user_id, post_id) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Deleting comment by user ${user_id} on post ${post_id}`);
      const res = await pool.query(`DELETE FROM comments WHERE user_id=$1 AND post_id=$2`, [user_id, post_id]);
      console.log(`[DB] ${new Date().toISOString()} | Comment deleted (rows affected: ${res.rowCount})`);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to delete comment: ${error.message}`);
      throw error;
    }
  }
}
