import { pool } from "../db/pool.js";
import { Like } from "../models/like.model.js";

export class LikeRepository {
  async create(likeData) {
    const { user_id, post_id } = likeData;
    const res = await pool.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, post_id]
    );
    return new Like(res.rows[0]);
  }

  async findAll() {
    const res = await pool.query(`SELECT * FROM likes`);
    return res.rows.map(row => new Like(row));
  }

  async delete(user_id, post_id) {
    await pool.query(`DELETE FROM likes WHERE user_id=$1 AND post_id=$2`, [user_id, post_id]);
  }
}
