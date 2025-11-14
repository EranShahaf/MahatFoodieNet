// middlewares/authenticate.js
import { authService } from "../services/auth.service.js";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} | Authentication failed: Missing or invalid token format - ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} | Authentication successful: ${decoded.username} - ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.error(`[AUTH MIDDLEWARE] ${new Date().toISOString()} | Authentication failed: Invalid or expired token - ${req.method} ${req.originalUrl} | Error: ${error.message}`);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
