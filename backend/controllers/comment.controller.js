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
    const comment = await commentService.createComment(req.user.id, req.body.post_id, req.body.message);
    res.status(201).json(comment);
  } catch (err) {
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
  const comments = await commentService.listComments();
  res.json(comments);
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
  await commentService.deleteComment(req.user.id, req.params.post_id);
  res.json({ message: "Comment deleted" });
});
