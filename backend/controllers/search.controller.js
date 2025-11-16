import express from "express";
import { searchService } from "../services/search.service.js";

export const searchRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Search
 *     description: Search functionality across tags, users, and posts
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search across tags, users, and posts
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query term
 *     responses:
 *       200:
 *         description: Search results ordered by tags, users, posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 */
searchRouter.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        message: "Search query parameter 'q' is required" 
      });
    }

    const trimmedQuery = q.trim();
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/search?q=${trimmedQuery} - Performing search`);
    const results = await searchService.searchAll(trimmedQuery);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/search?q=${trimmedQuery} - Search completed`);
    
    res.json(results);
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/search - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

