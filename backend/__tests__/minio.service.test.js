// Use CommonJS syntax
const { createBucketForUser, minioClient } = require("../services/minio.service.js");

// Mock minioClient
jest.mock("../services/minio.service.js", () => {
  const originalModule = jest.requireActual("../services/minio.service.js");
  return {
    ...originalModule,
    minioClient: {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
    },
  };
});

describe("createBucketForUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a bucket if it doesn't exist", async () => {
    minioClient.bucketExists.mockResolvedValue(false);
    minioClient.makeBucket.mockResolvedValue();

    await createBucketForUser("user-1");

    expect(minioClient.bucketExists).toHaveBeenCalledWith("user-1");
    expect(minioClient.makeBucket).toHaveBeenCalledWith("user-1", "us-east-1");
  });

  it("does not create a bucket if it exists", async () => {
    minioClient.bucketExists.mockResolvedValue(true);

    await createBucketForUser("user-2");

    expect(minioClient.makeBucket).not.toHaveBeenCalled();
  });

  it("throws if makeBucket fails", async () => {
    minioClient.bucketExists.mockResolvedValue(false);
    minioClient.makeBucket.mockRejectedValue(new Error("Failed"));

    await expect(createBucketForUser("user-3")).rejects.toThrow("Failed");
  });
});
