import { pool } from "../db/pool.js";
import { Tag } from "../models/tag.model.js";

export class TagRepository {
  async findOrCreate(name) {
    try {
      // First, try to find existing tag
      const findRes = await pool.query(
        `SELECT * FROM tags WHERE LOWER(name) = LOWER($1)`,
        [name]
      );

      if (findRes.rows.length > 0) {
        return new Tag(findRes.rows[0]);
      }

      // If not found, create it
      const createRes = await pool.query(
        `INSERT INTO tags (name) VALUES ($1) RETURNING *`,
        [name]
      );
      return new Tag(createRes.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find or create tag: ${error.message}`);
      throw error;
    }
  }

  async findById(id) {
    try {
      const res = await pool.query(`SELECT * FROM tags WHERE id = $1`, [id]);
      if (res.rows.length === 0) return null;
      return new Tag(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find tag by id: ${error.message}`);
      throw error;
    }
  }

  async findByName(name) {
    try {
      const res = await pool.query(
        `SELECT * FROM tags WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
      if (res.rows.length === 0) return null;
      return new Tag(res.rows[0]);
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find tag by name: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const res = await pool.query(`SELECT * FROM tags ORDER BY name ASC`);
      return res.rows.map(row => new Tag(row));
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to find all tags: ${error.message}`);
      throw error;
    }
  }

  async linkTagToPost(postId, tagId) {
    try {
      await pool.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postId, tagId]
      );
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to link tag to post: ${error.message}`);
      throw error;
    }
  }

  async unlinkTagFromPost(postId, tagId) {
    try {
      await pool.query(
        `DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2`,
        [postId, tagId]
      );
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to unlink tag from post: ${error.message}`);
      throw error;
    }
  }

  async getTagsForPost(postId) {
    try {
      const res = await pool.query(
        `SELECT t.* FROM tags t
         INNER JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1
         ORDER BY t.name ASC`,
        [postId]
      );
      return res.rows.map(row => new Tag(row));
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to get tags for post: ${error.message}`);
      throw error;
    }
  }

  async deleteUnusedTags() {
    try {
      const res = await pool.query(
        `DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM post_tags)`
      );
      return res.rowCount;
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to delete unused tags: ${error.message}`);
      throw error;
    }
  }

  async search(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const res = await pool.query(
        `SELECT *, 
         CASE 
           WHEN LOWER(name) = LOWER($1) THEN 1
           WHEN LOWER(name) LIKE LOWER($2) THEN 2
           ELSE 3
         END as relevance
         FROM tags 
         WHERE LOWER(name) LIKE LOWER($2)
         ORDER BY relevance ASC, name ASC
         LIMIT 20`,
        [searchTerm, searchPattern]
      );
      return res.rows.map(row => {
        const tag = new Tag(row);
        return tag;
      });
    } catch (error) {
      console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to search tags: ${error.message}`);
      throw error;
    }
  }
}

