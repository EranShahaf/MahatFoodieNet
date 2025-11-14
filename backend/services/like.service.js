// import { pool } from "../db/connection.js";

// export const likeService = {
//   async addLike({ user_id, post_id }) {
//     const exists = await pool.query(
//       "SELECT * FROM likes WHERE user_id=$1 AND post_id=$2",
//       [user_id, post_id]
//     );
//     if (exists.rowCount > 0) throw new Error("Already liked");

//     const result = await pool.query(
//       `INSERT INTO likes (user_id, post_id)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [user_id, post_id]
//     );
//     return result.rows[0];
//   },

//   async listLikes() {
//     const result = await pool.query(
//       `SELECT l.*, u.username, p.title AS post_title
//        FROM likes l
//        JOIN users u ON l.user_id = u.id
//        JOIN posts p ON l.post_id = p.id`
//     );
//     return result.rows;
//   },

//   async removeLike({ user_id, post_id }) {
//     await pool.query("DELETE FROM likes WHERE user_id=$1 AND post_id=$2", [user_id, post_id]);
//   },
// };

import { LikeRepository } from "../repositories/like.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const likeRepository = new LikeRepository();
const postRepository = new PostRepository();
const userRepository = new UserRepository();

export const likeService = {
  async addLike(user_id, post_id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Adding like by user ${user_id} on post ${post_id}`);
      const user = await userRepository.findById(user_id);
      if (!user) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Like failed: User not found - ${user_id}`);
        throw new Error("User not found");
      }

      const posts = await postRepository.findAll();
      const post = posts.find(p => p.id === Number(post_id));
      if (!post) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Like failed: Post not found - ${post_id}`);
        throw new Error("Post not found");
      }

      const likes = await likeRepository.findAll();
      const existing = likes.find(l => l.user_id === user_id && l.post_id === post_id);
      if (existing) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Like failed: User ${user_id} already liked post ${post_id}`);
        throw new Error("User already liked this post");
      }

      const like = await likeRepository.create({ user_id, post_id });
      console.log(`[SERVICE] ${new Date().toISOString()} | Like added successfully: id ${like.id}`);
      return like;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to add like: ${error.message}`);
      throw error;
    }
  },

  async listLikes() {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Listing all likes`);
      const likes = await likeRepository.findAll();
      console.log(`[SERVICE] ${new Date().toISOString()} | Retrieved ${likes.length} likes`);
      return likes;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to list likes: ${error.message}`);
      throw error;
    }
  },

  async removeLike(user_id, post_id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Removing like by user ${user_id} on post ${post_id}`);
      await likeRepository.delete(user_id, post_id);
      console.log(`[SERVICE] ${new Date().toISOString()} | Like removed successfully`);
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to remove like: ${error.message}`);
      throw error;
    }
  },
};
