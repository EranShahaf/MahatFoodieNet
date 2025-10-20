// controllers/auth.controller.js
import express from "express";
import { authService } from "../services/auth.service.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const authRouter = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and get a JWT
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: JWT token
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  if (!result) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ token: result.token });
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile (requires auth)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
authRouter.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Admin-only route
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     x-roles:
 *       - admin
 */
authRouter.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});
