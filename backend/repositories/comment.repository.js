import { pool } from "../db/pool.js";
import { Comment } from "../models/comment.model.js";

export class CommentRepository {
  async create(commentData) {
    const { user_id, post_id, message } = commentData;
    const res = await pool.query(
      `INSERT INTO comments (user_id, post_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, post_id, message]
    );
    return new Comment(res.rows[0]);
  }

  async findAll() {
    const res = await pool.query(`SELECT * FROM comments`);
    return res.rows.map(row => new Comment(row));
  }

  async delete(user_id, post_id) {
    await pool.query(`DELETE FROM comments WHERE user_id=$1 AND post_id=$2`, [user_id, post_id]);
  }
}
