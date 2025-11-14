import express from "express";
import { commentService } from "../services/comment.service.js";
import { authenticate } from "../middlewares/authenticate.js";

export const commentRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Manage comments on posts
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
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
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 */
commentRouter.post("/", authenticate, async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/comments - Creating comment by user: ${req.user.username} on post: ${req.body.post_id}`);
    const comment = await commentService.createComment(req.user.id, req.body.post_id, req.body.message);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/comments - Comment created successfully: id ${comment.id}`);
    res.status(201).json(comment);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | POST /api/comments - Error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
commentRouter.get("/", async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/comments - Listing all comments`);
    const comments = await commentService.listComments();
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/comments - Retrieved ${comments.length} comments`);
    res.json(comments);
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/comments - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/comments/{post_id}:
 *   delete:
 *     summary: Delete your comment from a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Comment deleted
 */
commentRouter.delete("/:post_id", authenticate, async (req, res) => {
  try {
    const { post_id } = req.params;
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/comments/${post_id} - Deleting comment by user: ${req.user.username}`);
    await commentService.deleteComment(req.user.id, post_id);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/comments/${post_id} - Comment deleted successfully`);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | DELETE /api/comments/${post_id} - Error: ${error.message}`);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});
