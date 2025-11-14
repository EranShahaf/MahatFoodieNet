// services/user.service.js
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository.js";
import { createBucketForUser } from "./minio.service.js";

const userRepository = new UserRepository();

export const userService = {
  async createUser(username, password, roles = ["user"]) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Creating user: ${username} with roles: ${roles.join(", ")}`);
      const existing = await userRepository.findByUsername(username);
      if (existing) {
        console.log(`[SERVICE] ${new Date().toISOString()} | User creation failed: Username already exists - ${username}`);
        throw new Error("Username already exists");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userRepository.create(username, passwordHash, roles);

      // Create MinIO bucket for this user
      // Bucket name can be "user-{id}" or "username" depending on your convention
      const bucketName = `user-${user.id}`;
      console.log(`[SERVICE] ${new Date().toISOString()} | Creating MinIO bucket for user: ${bucketName}`);
      await createBucketForUser(bucketName);

      console.log(`[SERVICE] ${new Date().toISOString()} | User created successfully: ${username} (id: ${user.id}, bucket: ${bucketName})`);
      return { ...user, bucket: bucketName };
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to create user ${username}: ${error.message}`);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Deleting user: ${id}`);
      await userRepository.delete(id);
      console.log(`[SERVICE] ${new Date().toISOString()} | User deleted successfully: ${id}`);
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to delete user ${id}: ${error.message}`);
      throw error;
    }
  },

  async listUsers() {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Listing all users`);
      const users = await userRepository.findAll();
      console.log(`[SERVICE] ${new Date().toISOString()} | Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to list users: ${error.message}`);
      throw error;
    }
  },

  async getUser(username) {
    try {
      console.log(`[SERVICE] ${new Date().toISOString()} | Getting user: ${username}`);
      const user = await userRepository.findByUsername(username);
      return user;
    } catch (error) {
      console.error(`[SERVICE ERROR] ${new Date().toISOString()} | Failed to get user ${username}: ${error.message}`);
      throw error;
    }
  }
};
