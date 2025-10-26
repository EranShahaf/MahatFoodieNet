import { pool } from "../db/connection.js";

export const likeService = {
  async addLike({ user_id, post_id }) {
    const exists = await pool.query(
      "SELECT * FROM likes WHERE user_id=$1 AND post_id=$2",
      [user_id, post_id]
    );
    if (exists.rowCount > 0) throw new Error("Already liked");

    const result = await pool.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, post_id]
    );
    return result.rows[0];
  },

  async listLikes() {
    const result = await pool.query(
      `SELECT l.*, u.username, p.title AS post_title
       FROM likes l
       JOIN users u ON l.user_id = u.id
       JOIN posts p ON l.post_id = p.id`
    );
    return result.rows;
  },

  async removeLike({ user_id, post_id }) {
    await pool.query("DELETE FROM likes WHERE user_id=$1 AND post_id=$2", [user_id, post_id]);
  },
};

import { LikeRepository } from "../repositories/like.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const likeRepository = new LikeRepository();
const postRepository = new PostRepository();
const userRepository = new UserRepository();

export const likeService = {
  async addLike(user_id, post_id) {
    const user = await userRepository.findById(user_id);
    if (!user) throw new Error("User not found");

    const posts = await postRepository.findAll();
    const post = posts.find(p => p.id === Number(post_id));
    if (!post) throw new Error("Post not found");

    const likes = await likeRepository.findAll();
    const existing = likes.find(l => l.user_id === user_id && l.post_id === post_id);
    if (existing) throw new Error("User already liked this post");

    return await likeRepository.create({ user_id, post_id });
  },

  async listLikes() {
    return await likeRepository.findAll();
  },

  async removeLike(user_id, post_id) {
    await likeRepository.delete(user_id, post_id);
  },
};
