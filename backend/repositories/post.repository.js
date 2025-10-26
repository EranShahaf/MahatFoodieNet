import { pool } from "../db/pool.js";
import { Post } from "../models/post.model.js";

export class PostRepository {
  async create(postData) {
    const { image_path, title, body, tags, user_id, rating, location } = postData;
    const res = await pool.query(
      `INSERT INTO posts (image_path, title, body, tags, user_id, rating, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [image_path, title, body, tags, user_id, rating, location]
    );
    return new Post(res.rows[0]);
  }

  async findAll() {
    const res = await pool.query(`SELECT * FROM posts`);
    return res.rows.map(row => new Post(row));
  }

  async delete(id) {
    await pool.query(`DELETE FROM posts WHERE id=$1`, [id]);
  }
}
