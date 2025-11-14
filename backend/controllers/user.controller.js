// controllers/user.controller.js
import express from "express";
import { userService } from "../services/user.service.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management (admin only)
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Username already exists
 */
userRouter.post("/", async (req, res) => {
  const { username, password, roles } = req.body;
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/users - Creating user: ${username}`);
    const user = await userService.createUser(username, password, roles);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/users - User created successfully: ${username} (id: ${user.id})`);
    res.status(201).json(user); // user object now includes 'bucket' field
  } catch (err) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | POST /api/users - Error: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
userRouter.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/users/${id} - Deleting user by admin: ${req.user.username}`);
    await userService.deleteUser(id);
    console.log(`[CONTROLLER] ${new Date().toISOString()} | DELETE /api/users/${id} - User deleted successfully`);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | DELETE /api/users/${id} - Error: ${error.message}`);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (user)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
userRouter.get("/", authenticate, authorize("user"), async (req, res) => {
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/users - Listing users by: ${req.user.username}`);
    const users = await userService.listUsers();
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/users - Retrieved ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/users - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});
