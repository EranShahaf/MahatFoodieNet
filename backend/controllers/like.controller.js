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
    const like = await likeService.addLike(req.user.id, req.body.post_id);
    res.status(201).json(like);
  } catch (err) {
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
  const likes = await likeService.listLikes();
  res.json(likes);
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
  await likeService.removeLike(req.user.id, req.params.post_id);
  res.json({ message: "Like removed" });
});
