// import { pool } from "../db/connection.js";

// export const commentService = {
//   async createComment({ user_id, post_id, message }) {
//     const result = await pool.query(
//       `INSERT INTO comments (user_id, post_id, message)
//        VALUES ($1, $2, $3)
//        RETURNING *`,
//       [user_id, post_id, message]
//     );
//     return result.rows[0];
//   },

//   async listComments() {
//     const result = await pool.query(
//       `SELECT c.*, u.username, p.title AS post_title
//        FROM comments c
//        JOIN users u ON c.user_id = u.id
//        JOIN posts p ON c.post_id = p.id
//        ORDER BY c.created_at DESC`
//     );
//     return result.rows;
//   },

//   async deleteComment(id, user) {
//     const res = await pool.query("SELECT user_id FROM comments WHERE id=$1", [id]);
//     if (res.rowCount === 0) throw new Error("Comment not found");

//     const comment = res.rows[0];
//     const isAdmin = user.roles.includes("admin");
//     if (!isAdmin && comment.user_id !== user.id) throw new Error("Forbidden");

//     await pool.query("DELETE FROM comments WHERE id=$1", [id]);
//   },
// };

import { CommentRepository } from "../repositories/comment.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const commentRepository = new CommentRepository();
const postRepository = new PostRepository();
const userRepository = new UserRepository();

export const commentService = {
  async createComment(user_id, post_id, message) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Creating comment by user ${user_id} on post ${post_id}`);
      const user = await userRepository.findById(user_id);
      if (!user) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Comment creation failed: User not found - ${user_id}`);
        throw new Error("User not found");
      }

      const posts = await postRepository.findAll();
      const post = posts.find(p => p.id === Number(post_id));
      if (!post) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Comment creation failed: Post not found - ${post_id}`);
        throw new Error("Post not found");
      }

      if (!message?.trim()) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Comment creation failed: Empty message`);
        throw new Error("Message cannot be empty");
      }

      const comment = await commentRepository.create({ user_id, post_id, message });
      console.log(`[SERVICE] ${new Date().toISOString()} | Comment created successfully: id ${comment.id}`);
      return comment;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to create comment: ${error.message}`);
      throw error;
    }
  },

  async listComments() {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Listing all comments`);
      const comments = await commentRepository.findAll();
      console.log(`[SERVICE] ${new Date().toISOString()} | Retrieved ${comments.length} comments`);
      return comments;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to list comments: ${error.message}`);
      throw error;
    }
  },

  async deleteComment(user_id, post_id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Deleting comment by user ${user_id} on post ${post_id}`);
      await commentRepository.delete(user_id, post_id);
      console.log(`[SERVICE] ${new Date().toISOString()} | Comment deleted successfully`);
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to delete comment: ${error.message}`);
      throw error;
    }
  },
};
