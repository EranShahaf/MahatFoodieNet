// services/minio.service.js
import { Client } from "minio";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "false" ? false : true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

/**
 * Create bucket if it doesn't exist
 * @param {string} bucketName
 */
export const createBucketForUser = async (bucketName) => {
  const exists = await minioClient.bucketExists(bucketName);

  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`MinIO bucket created: ${bucketName}`);
  } else {
    console.log(`MinIO bucket already exists: ${bucketName}`);
  }
};
