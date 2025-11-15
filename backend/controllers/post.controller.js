// import express from "express";
// import multer from "multer";
// import { postService } from "../services/post.service.js";
// import { authenticate } from "../middlewares/authenticate.js";

// export const postRouter = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// /**
//  * @swagger
//  * /api/posts:
//  *   post:
//  *     summary: Create a new post with optional image upload
//  *     tags: [Posts]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               image:
//  *                 type: string
//  *                 format: binary
//  *               title:
//  *                 type: string
//  *               body:
//  *                 type: string
//  *               tags:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *               rating:
//  *                 type: number
//  *               location:
//  *                 type: string
//  *             required:
//  *               - title
//  *               - body
//  *     responses:
//  *       201:
//  *         description: Post created successfully
//  */
// postRouter.post("/", authenticate, upload.single("image"), async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { title, body, tags, rating, location } = req.body;

//     let imagePath = null;
//     if (req.file) {
//       // Delegate upload to service layer
//       imagePath = await postService.uploadPostImage(userId, req.file);
//     }

//     const post = await postService.createPost({
//       user_id: userId,
//       title,
//       body,
//       tags,
//       rating,
//       location,
//       image_path: imagePath,
//     });

//     res.status(201).json(post);
//   } catch (err) {
//     console.error("Error creating post:", err);
//     res.status(400).json({ message: err.message });
//   }
// });

// postRouter.get("/", async (req, res) => {
//   const posts = await postService.listPosts();
//   res.json(posts);
// });

// postRouter.delete("/:id", authenticate, async (req, res) => {
//   const { id } = req.params;
//   await postService.deletePost(id, req.user);
//   res.json({ message: "Post deleted" });
// });



import express from "express";
import { postService } from "../services/post.service.js";
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
 *     summary: List all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 */
postRouter.get("/", async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts - Listing all posts`);
    const posts = await postService.listPosts();
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/posts - Retrieved ${posts.length} posts`);
    res.json(posts);
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
