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
          const uploaded = await getMinioFilePath(`user-${user.id}`, image);
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

  async getPostsByLocation(location) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Getting posts by location: ${location}`);
      const posts = await postRepository.findByLocation(location);
      console.log(`[SERVICE] ${new Date().toISOString()} | Retrieved ${posts.length} posts for location: ${location}`);
      return posts;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to get posts by location: ${error.message}`);
      throw error;
    }
  },
  
  async getPostById(id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Getting post by id: ${id}`);
      const post = await postRepository.findById(id);
      if (!post) throw new Error("Post not found");
      
      const likes = await (new (await import("../repositories/like.repository.js")).LikeRepository()).findByPostId(id);
      const comments = await (new (await import("../repositories/comment.repository.js")).CommentRepository()).findByPostId(id);
      
      return {
        ...post,
        likes_details: likes,
        comments_details: comments
      };
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to get post by id ${id}: ${error.message}`);
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
