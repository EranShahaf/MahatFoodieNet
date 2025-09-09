import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Backend API",
      version: "1.0.0",
      description: "Auto-generated API documentation",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "server",
      },
    ],
  },
  apis: ["./server.js"], // Path to the API files
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Get hello message
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend 🚀" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
