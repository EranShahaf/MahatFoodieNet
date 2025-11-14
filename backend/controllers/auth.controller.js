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
  try {
    const { username, password } = req.body;
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/login - Login request for: ${username}`);
    const result = await authService.login(username, password);
    if (!result) {
      console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/login - Login failed: Invalid credentials for ${username}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(`[CONTROLLER] ${new Date().toISOString()} | POST /api/login - Login successful for: ${username}`);
    res.json({ token: result.token });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | POST /api/login - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
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
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/profile - Profile request for user: ${req.user.username}`);
    res.json({ user: req.user });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/profile - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
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
  try {
    console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/admin - Admin access by: ${req.user.username}`);
    res.json({ message: "Welcome Admin", user: req.user });
  } catch (error) {
    console.error(`[CONTROLLER ERROR] ${new Date().toISOString()} | GET /api/admin - Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});
