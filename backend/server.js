import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authRouter } from "./controllers/auth.controller.js";
import { userRouter } from "./controllers/user.controller.js";
import { postRouter } from "./controllers/post.controller.js";
import { commentRouter } from "./controllers/comment.controller.js";
import { likeRouter } from "./controllers/like.controller.js";
import { auditMiddleware } from "./middlewares/audit.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 🔹 Public example endpoint ---
/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Get hello message
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/api/hello", (req, res) => {
  console.log(`[CONTROLLER] ${new Date().toISOString()} | GET /api/hello - Hello endpoint accessed`);
  res.json({ message: "Hello from backend 🚀" });
});


// --- 🔹 Swagger setup ---
const swaggerOptions = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Backend API with RBAC",
      version: "1.0.0",
      description: "API with JWT-based authentication and role-based access control",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./controllers/*.js", "./server.js"], // include docs from controllers
};

const specs = swaggerJsdoc(swaggerOptions);
app.use(auditMiddleware);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/likes", likeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | Error: ${err.message}`);
  console.error(`[ERROR] Stack: ${err.stack}`);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`[INFO] ${new Date().toISOString()} | ✅ Backend running on port ${PORT}`);
  console.log(`[INFO] ${new Date().toISOString()} | 📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log(`[INFO] ${new Date().toISOString()} | SIGTERM received, shutting down gracefully...`);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log(`[INFO] ${new Date().toISOString()} | SIGINT received, shutting down gracefully...`);
  process.exit(0);
});
