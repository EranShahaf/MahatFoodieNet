// services/auth.service.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const authService = {
  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    const token = jwt.sign(
      { sub: user.id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, user };
  },

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  },
};
