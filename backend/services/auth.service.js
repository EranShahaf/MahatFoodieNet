// services/auth.service.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const userRepository = new UserRepository();

export const authService = {
  async login(username, password) {
    try {
      console.log(`[AUTH] ${new Date().toISOString()} | Login attempt for username: ${username}`);
      const user = await userRepository.findByUsername(username);
      if (!user) {
        console.log(`[AUTH] ${new Date().toISOString()} | Login failed: User not found - ${username}`);
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        console.log(`[AUTH] ${new Date().toISOString()} | Login failed: Invalid password for user - ${username}`);
        return null;
      }

      const token = jwt.sign(
        { sub: user.id, username: user.username, roles: user.roles },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log(`[AUTH] ${new Date().toISOString()} | Login successful for user: ${username} (id: ${user.id})`);
      return { token, user };
    } catch (error) {
      console.error(`[AUTH ERROR] ${new Date().toISOString()} | Login error for ${username}: ${error.message}`);
      throw error;
    }
  },

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`[AUTH] ${new Date().toISOString()} | Token verified for user: ${decoded.username}`);
      return decoded;
    } catch (error) {
      console.error(`[AUTH ERROR] ${new Date().toISOString()} | Token verification failed: ${error.message}`);
      throw error;
    }
  },
};
