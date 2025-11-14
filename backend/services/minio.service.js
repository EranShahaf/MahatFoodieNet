// services/minio.service.js
import { Client } from "minio";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true" || false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
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
    // 🔓 Set public-read policy
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  } else {
    console.log(`MinIO bucket already exists: ${bucketName}`);
  }
};

/**
 * Create a presigned URL for uploading a file
 * @param {string} bucketName - The name of the bucket
 * @param {string} objectName - The name/path of the object to upload
 * @param {number} expirySeconds - URL expiry time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Presigned URL for uploading
 */
export const createPresignedUploadUrl = async (
  bucketName,
  objectName,
  expirySeconds = 3600
) => {
  try {
    console.log(`[MINIO] ${new Date().toISOString()} | Creating presigned upload URL for bucket: ${bucketName}, object: ${objectName}, expiry: ${expirySeconds}s`);
    const url = await minioClient.presignedPutObject(
      bucketName,
      objectName,
      expirySeconds
    );
    console.log(`[MINIO] ${new Date().toISOString()} | Presigned upload URL created successfully for: ${objectName}`);
    return url;
  } catch (error) {
    console.error(`[MINIO ERROR] ${new Date().toISOString()} | Failed to create presigned upload URL: ${error.message}`);
    throw error;
  }
};

/**
 * Get the public file path/URL for accessing a file in MinIO
 * @param {string} bucketName - The name of the bucket
 * @param {string} objectName - The name/path of the object
 * @returns {string} Public URL to access the file
 */
export const getMinioFilePath = (bucketName, objectName) => {
  const useSSL = process.env.MINIO_USE_SSL === "true" || false;
  const protocol = useSSL ? "https" : "http";
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = parseInt(process.env.MINIO_PORT || "9000");
  
  // Construct the public URL
  // Format: http(s)://endpoint:port/bucketName/objectName
  const url = `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
  console.log(`[MINIO] ${new Date().toISOString()} | Generated file path for bucket: ${bucketName}, object: ${objectName}`);
  return url;
};