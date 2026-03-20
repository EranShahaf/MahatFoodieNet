import express from "express";
import crypto from "crypto";
import { postService } from "../services/post.service.js";
import { createPresignedUploadUrl } from "../services/minio.service.js";
import { authenticate } from "../middlewares/authenticate.js";

export const postRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Manage user posts
 */

/**
 * @swagger
 * /api/posts/presigned-url:
 *   get:
 *     summary: Get a presigned URL for image upload
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Original filename
 *     responses:
 *       200:
 *         description: Presigned URL generated
 */
postRouter.get("/presigned-url", authenticate, async (req, res) => {
  try {
    const { filename } = req.query;
    if (!filename) {
      return res.status(400).json({ message: "Filename query parameter is required" });
    }

    const objectName = `posts/${crypto.randomUUID()}-${filename}`;
    const bucketName = `user-${req.user.id}`;

    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts/presigned-url - Generating URL for user: ${bucketName}`);
    const uploadUrl = await createPresignedUploadUrl(bucketName, objectName);
    
    res.json({ uploadUrl, objectName });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/posts/presigned-url - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               rating: { type: number }
 *               location: { type: string }
 *               image: { type: string, description: "optional base64 or file path" }
 *     responses:
 *       201:
 *         description: Post created
 */
postRouter.post("/", authenticate, async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/posts - Creating post by user: ${req.user.username} (id: ${req.user.id})`);
    const post = await postService.createPost({ ...req.body, user_id: req.user.id });
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/posts - Post created successfully: id ${post.id}`);
    res.status(201).json(post);
  } catch (err) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | POST /api/posts - Error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: List all posts or filter by location
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter posts by location
 *     responses:
 *       200:
 *         description: List of posts
 */
postRouter.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    if (location) {
      console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts?location=${location} - Getting posts by location`);
      const posts = await postService.getPostsByLocation(location);
      console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts?location=${location} - Retrieved ${posts.length} posts`);
      res.json(posts);
    } else {
      console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts - Listing all posts`);
      const posts = await postService.listPosts();
      console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts - Retrieved ${posts.length} posts`);
      res.json(posts);
    }
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/posts - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post deleted
 */
postRouter.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/posts/${id} - Deleting post by user: ${req.user.username}`);
    await postService.deletePost(id);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/posts/${id} - Post deleted successfully`);
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | DELETE /api/posts/${id} - Error: ${error.message}`);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});
