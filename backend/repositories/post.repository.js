import { pool } from "../db/pool.js";
import { Post } from "../models/post.model.js";

export class PostRepository {
  async create(postData) {
    try {
      const { image_path, title, body, tags, user_id, rating, location } = postData;
      console.log(`[DB] ${new Date().toISOString()} | Creating post: "${title}" by user ${user_id}`);
      const res = await pool.query(
        `INSERT INTO posts (image_path, title, body, tags, user_id, rating, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [image_path, title, body, tags, user_id, rating, location]
      );
      console.log(`[DB] ${new Date().toISOString()} | Post created successfully: id ${res.rows[0].id}`);
      return new Post(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to create post: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const res = await pool.query(`
        SELECT p.*, u.username
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `);
      console.log(`[DB] ${new Date().toISOString()} | Found ${res.rows.length} posts`);
      return res.rows.map(row => {
        const post = new Post(row);
        // Add username to the post object for API responses
        post.username = row.username;
        return post;
      });
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all posts: ${error.message}`);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Deleting post with id: ${id}`);
      const res = await pool.query(`DELETE FROM posts WHERE id=$1`, [id]);
      console.log(`[DB] ${new Date().toISOString()} | Post deleted: ${id} (rows affected: ${res.rowCount})`);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to delete post ${id}: ${error.message}`);
      throw error;
    }
  }
}
