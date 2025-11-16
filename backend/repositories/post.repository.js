import { pool } from "../db/pool.js";
import { Post } from "../models/post.model.js";
import { TagRepository } from "./tag.repository.js";

const tagRepository = new TagRepository();

export class PostRepository {
  async create(postData) {
    try {
      const { image_path, title, body, user_id, rating, location } = postData;
      console.log(`[DB] ${new Date().toISOString()} | Creating post: "${title}" by user ${user_id}`);
      const res = await pool.query(
        `INSERT INTO posts (image_path, title, body, user_id, rating, location)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [image_path, title, body, user_id, rating, location]
      );
      const post = new Post(res.rows[0]);
      console.log(`[DB] ${new Date().toISOString()} | Post created successfully: id ${post.id}`);
      
      // Handle tags if provided
      if (postData.tags && Array.isArray(postData.tags) && postData.tags.length > 0) {
        try {
          await this.attachTagsToPost(post.id, postData.tags);
          // Reload tags for the post
          const tags = await tagRepository.getTagsForPost(post.id);
          post.tags = tags.map(t => t.name);
        } catch (tagError) {
          // If tag operations fail (e.g., table doesn't exist), just set empty tags
          console.warn(`[DB WARNING] ${new Date().toISOString()} | Tag operations failed, setting empty tags: ${tagError.message}`);
          post.tags = [];
        }
      } else {
        post.tags = [];
      }
      
      return post;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to create post: ${error.message}`);
      throw error;
    }
  }

  async attachTagsToPost(postId, tagNames) {
    try {
      for (const tagName of tagNames) {
        if (tagName && typeof tagName === 'string') {
          const tag = await tagRepository.findOrCreate(tagName.trim());
          await tagRepository.linkTagToPost(postId, tag.id);
        }
      }
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to attach tags to post: ${error.message}`);
      // If tags table doesn't exist, log warning but don't fail the post creation
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.warn(`[DB WARNING] ${new Date().toISOString()} | Tags table may not exist. Skipping tag attachment.`);
        return; // Don't throw, just skip tag attachment
      }
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
      const posts = await Promise.all(res.rows.map(async (row) => {
        const post = new Post(row);
        // Add username to the post object for API responses
        post.username = row.username;
        // Load tags for the post
        try {
          const tags = await tagRepository.getTagsForPost(post.id);
          post.tags = tags.map(t => t.name);
        } catch (tagError) {
          // If tags table doesn't exist, just set empty tags
          console.warn(`[DB WARNING] ${new Date().toISOString()} | Could not load tags for post ${post.id}: ${tagError.message}`);
          post.tags = [];
        }
        return post;
      }));
      return posts;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all posts: ${error.message}`);
      throw error;
    }
  }

  async findByLocation(location) {
    try {
      console.log(`[DB] ${new Date().toISOString()} | Finding posts by location: ${location}`);
      const res = await pool.query(`
        SELECT p.*, u.username
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.location = $1
        ORDER BY p.created_at DESC
      `, [location]);
      console.log(`[DB] ${new Date().toISOString()} | Found ${res.rows.length} posts for location: ${location}`);
      const posts = await Promise.all(res.rows.map(async (row) => {
        const post = new Post(row);
        // Add username to the post object for API responses
        post.username = row.username;
        // Load tags for the post
        try {
          const tags = await tagRepository.getTagsForPost(post.id);
          post.tags = tags.map(t => t.name);
        } catch (tagError) {
          // If tags table doesn't exist, just set empty tags
          console.warn(`[DB WARNING] ${new Date().toISOString()} | Could not load tags for post ${post.id}: ${tagError.message}`);
          post.tags = [];
        }
        return post;
      }));
      return posts;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find posts by location: ${error.message}`);
      throw error;
    }
  }

  async search(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const res = await pool.query(`
        SELECT p.*, u.username,
         CASE 
           WHEN LOWER(p.title) = LOWER($1) THEN 1
           WHEN LOWER(p.title) LIKE LOWER($2) THEN 2
           WHEN LOWER(p.body) LIKE LOWER($2) THEN 3
           WHEN LOWER(p.location) LIKE LOWER($2) THEN 4
           ELSE 5
         END as relevance
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE LOWER(p.title) LIKE LOWER($2)
           OR LOWER(p.body) LIKE LOWER($2)
           OR LOWER(p.location) LIKE LOWER($2)
        ORDER BY relevance ASC, p.created_at DESC
        LIMIT 20
      `, [searchTerm, searchPattern]);
      
      const posts = await Promise.all(res.rows.map(async (row) => {
        const post = new Post(row);
        post.username = row.username;
        // Load tags for the post
        try {
          const tags = await tagRepository.getTagsForPost(post.id);
          post.tags = tags.map(t => t.name);
        } catch (tagError) {
          // If tags table doesn't exist, just set empty tags
          console.warn(`[DB WARNING] ${new Date().toISOString()} | Could not load tags for post ${post.id}: ${tagError.message}`);
          post.tags = [];
        }
        return post;
      }));
      
      return posts;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to search posts: ${error.message}`);
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
