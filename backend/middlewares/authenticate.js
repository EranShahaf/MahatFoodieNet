// middlewares/authenticate.js
import { authService } from "../services/auth.service.js";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
