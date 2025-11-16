import { TagRepository } from "../repositories/tag.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { PostRepository } from "../repositories/post.repository.js";

const tagRepository = new TagRepository();
const userRepository = new UserRepository();
const postRepository = new PostRepository();

export const searchService = {
  async searchAll(searchTerm) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Searching for: "${searchTerm}"`);
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        return {
          tags: [],
          users: [],
          posts: []
        };
      }

      const trimmedSearchTerm = searchTerm.trim();
      
      // Search all three entities in parallel
      const [tags, users, posts] = await Promise.all([
        tagRepository.search(trimmedSearchTerm),
        userRepository.search(trimmedSearchTerm),
        postRepository.search(trimmedSearchTerm)
      ]);

      console.log(`[SERVICE] ${new Date().toISOString()} | Search results - Tags: ${tags.length}, Users: ${users.length}, Posts: ${posts.length}`);

      return {
        tags,
        users,
        posts
      };
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to search: ${error.message}`);
      throw error;
    }
  }
};

