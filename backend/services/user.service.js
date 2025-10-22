// services/user.service.js
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository.js";
import { createBucketForUser } from "./minio.service.js";

export const userService = {
    async createUser(username, password, roles = ["user"]) {
        const existing = await userRepository.findByUsername(username);
        if (existing) throw new Error("Username already exists");
    
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userRepository.createUser(username, passwordHash, roles);
    
        // Create MinIO bucket for this user
        // Bucket name can be "user-{id}" or "username" depending on your convention
        const bucketName = `user-${user.id}`;
        await createBucketForUser(bucketName);
    
        return { ...user, bucket: bucketName };
      },

  async deleteUser(id) {
    return await userRepository.deleteUser(id);
  },

  async listUsers() {
    return await userRepository.findAll();
  },
};
