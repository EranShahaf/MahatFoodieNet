// import { pool } from "../db/connection.js";
// import { minioClient } from "./minio.service.js";
// import { v4 as uuidv4 } from "uuid";

// const REGION = process.env.MINIO_REGION || "us-east-1";

// export const postService = {
//   async uploadPostImage(userId, file) {
//     const bucketName = `user-${userId}`;
//     const objectName = `posts/${uuidv4()}-${file.originalname}`;

//     // ensure bucket exists
//     const exists = await minioClient.bucketExists(bucketName);
//     if (!exists) {
//       await minioClient.makeBucket(bucketName, REGION);
//     }

//     // upload the image
//     await minioClient.putObject(bucketName, objectName, file.buffer, {
//       "Content-Type": file.mimetype,
//     });

//     // return path or URL to store in DB
//     return `${bucketName}/${objectName}`;
//   },

//   async createPost(postData) {
//     const { image_path, title, body, tags, rating, location, user_id } = postData;
//     const result = await pool.query(
//       `INSERT INTO posts (image_path, title, body, tags, rating, location, user_id)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING *`,
//       [image_path, title, body, tags, rating, location, user_id]
//     );
//     return result.rows[0];
//   },

//   async listPosts() {
//     const result = await pool.query(
//       `SELECT p.*, u.username
//        FROM posts p
//        JOIN users u ON p.user_id = u.id
//        ORDER BY p.created_at DESC`
//     );
//     return result.rows;
//   },

//   async deletePost(postId, user) {
//     const isAdmin = user.roles.includes("admin");
//     const result = await pool.query("SELECT user_id FROM posts WHERE id=$1", [postId]);
//     if (!result.rowCount) throw new Error("Post not found");
//     const post = result.rows[0];
//     if (!isAdmin && post.user_id !== user.id) throw new Error("Forbidden");

//     await pool.query("DELETE FROM posts WHERE id=$1", [postId]);
//   },
// };



import { PostRepository } from "../repositories/post.repository.js";
import { createPresignedUploadUrl, getMinioFilePath } from "./minio.service.js";
import { UserRepository } from "../repositories/user.repository.js";

const postRepository = new PostRepository();
const userRepository = new UserRepository();

export const postService = {
  async createPost({ image, title, body, tags, user_id, rating, location }) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Creating post: "${title}" by user ${user_id}`);
      const user = await userRepository.findById(user_id);
      if (!user) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Post creation failed: User not found - ${user_id}`);
        throw new Error("User not found");
      }

      let image_path = null;
      if (image) {
        console.log(`[SERVICE] ${new Date().toISOString()} | Processing image for post: "${title}"`);
        // Check if image is already a full URL (from initFullFlow or other direct uploads)
        if (image.startsWith('http://') || image.startsWith('https://')) {
          // Already a full URL, use it directly
          image_path = image;
          console.log(`[SERVICE] ${new Date().toISOString()} | Image is already a full URL: ${image_path}`);
        } else {
          // Assume image is an object name/path, generate the full URL
          const uploaded = await getMinioFilePath(user.username, image);
          image_path = uploaded;
          console.log(`[SERVICE] ${new Date().toISOString()} | Image path generated: ${image_path}`);
        }
      }

      const post = await postRepository.create({
        image_path,
        title,
        body,
        tags,
        user_id,
        rating,
        location,
      });
      console.log(`[SERVICE] ${new Date().toISOString()} | Post created successfully: id ${post.id}`);
      return post;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to create post: ${error.message}`);
      throw error;
    }
  },

  async listPosts() {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Listing all posts`);
      const posts = await postRepository.findAll();
      console.log(`[SERVICE] ${new Date().toISOString()} | Retrieved ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to list posts: ${error.message}`);
      throw error;
    }
  },

  async deletePost(id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Deleting post: ${id}`);
      await postRepository.delete(id);
      console.log(`[SERVICE] ${new Date().toISOString()} | Post deleted successfully: ${id}`);
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to delete post ${id}: ${error.message}`);
      throw error;
    }
  },
};
