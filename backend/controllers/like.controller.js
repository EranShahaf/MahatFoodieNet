import express from "express";
import { likeService } from "../services/like.service.js";
import { authenticate } from "../middlewares/authenticate.js";

export const likeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Likes
 *     description: Manage likes on posts
 */

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Like a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id: { type: integer }
 *     responses:
 *       201:
 *         description: Post liked
 */
likeRouter.post("/", authenticate, async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/likes - Adding like by user: ${req.user.username} on post: ${req.body.post_id}`);
    const like = await likeService.addLike(req.user.id, req.body.post_id);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/likes - Like added successfully: id ${like.id}`);
    res.status(201).json(like);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | POST /api/likes - Error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/likes:
 *   get:
 *     summary: Get all likes
 *     tags: [Likes]
 *     responses:
 *       200:
 *         description: List of likes
 */
likeRouter.get("/", async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/likes - Listing all likes`);
    const likes = await likeService.listLikes();
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/likes - Retrieved ${likes.length} likes`);
    res.json(likes);
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/likes - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/likes/{post_id}:
 *   delete:
 *     summary: Remove a like from a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Like removed
 */
likeRouter.delete("/:post_id", authenticate, async (req, res) => {
  try {
    const { post_id } = req.params;
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/likes/${post_id} - Removing like by user: ${req.user.username}`);
    await likeService.removeLike(req.user.id, post_id);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/likes/${post_id} - Like removed successfully`);
    res.json({ message: "Like removed" });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | DELETE /api/likes/${post_id} - Error: ${error.message}`);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});
