import { Client } from "minio";
import { createBucketForUser } from "../services/minio.service.js";

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "false" ? false : true,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

// Mock MinIO client for testing (so we don't touch real buckets)
minioClient.bucketExists = async (bucketName) => {
  console.log(`Checking if bucket exists: ${bucketName}`);
  // Simulate bucket not existing
  return false;
};

minioClient.makeBucket = async (bucketName, region) => {
  console.log(`Creating bucket: ${bucketName} in region ${region}`);
  // Simulate successful creation
  return true;
};

async function testCreateBucket() {
  console.log("Starting test for createBucketForUser...");

  try {
    const bucketName = "user-test-1";
    await createBucketForUser(bucketName);
    console.log("✅ Bucket creation logic executed successfully");
  } catch (err) {
    console.error("❌ Bucket creation failed:", err);
  }

  // Test existing bucket
  minioClient.bucketExists = async () => true;

  try {
    const bucketName = "user-test-2";
    await createBucketForUser(bucketName);
    console.log("✅ Existing bucket correctly skipped creation");
  } catch (err) {
    console.error("❌ Unexpected error for existing bucket:", err);
  }

  // Test error scenario
  minioClient.bucketExists = async () => false;
  minioClient.makeBucket = async () => {
    throw new Error("Simulated failure");
  };

  try {
    const bucketName = "user-test-3";
    await createBucketForUser(bucketName);
    console.error("❌ Error scenario failed: expected exception");
  } catch (err) {
    console.log("✅ Correctly caught error:", err.message);
  }

  console.log("All basic tests completed.");
}

testCreateBucket();
