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
    const user = await userService.createUser(username, password, roles);
    res.status(201).json(user); // user object now includes 'bucket' field
  } catch (err) {
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
  const { id } = req.params;
  await userService.deleteUser(id);
  res.json({ message: "User deleted" });
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
  const users = await userService.listUsers();
  res.json(users);
});
