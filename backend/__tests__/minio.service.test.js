// Mock the minio Client before importing the service
jest.mock("minio", () => {
  const mockBucketExists = jest.fn();
  const mockMakeBucket = jest.fn();
  const mockSetBucketPolicy = jest.fn();
  
  const mockClientInstance = {
    bucketExists: mockBucketExists,
    makeBucket: mockMakeBucket,
    setBucketPolicy: mockSetBucketPolicy,
  };
  
  // Store references on the module for test access
  const MockedMinio = jest.fn(() => mockClientInstance);
  MockedMinio.__mockBucketExists = mockBucketExists;
  MockedMinio.__mockMakeBucket = mockMakeBucket;
  MockedMinio.__mockSetBucketPolicy = mockSetBucketPolicy;
  MockedMinio.__mockClientInstance = mockClientInstance;
  
  return {
    Client: MockedMinio,
  };
});

// Import after mock is set up
import { createBucketForUser } from "../services/minio.service.js";
import { Client } from "minio";

// Get the mock functions from the mocked Client
const mockBucketExists = Client.__mockBucketExists;
const mockMakeBucket = Client.__mockMakeBucket;
const mockSetBucketPolicy = Client.__mockSetBucketPolicy;

describe("createBucketForUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetBucketPolicy.mockResolvedValue(undefined);
  });

  it("creates a bucket if it doesn't exist", async () => {
    mockBucketExists.mockResolvedValue(false);
    mockMakeBucket.mockResolvedValue(undefined);

    await createBucketForUser("user-1");

    expect(mockBucketExists).toHaveBeenCalledWith("user-1");
    expect(mockMakeBucket).toHaveBeenCalledWith("user-1", "us-east-1");
    expect(mockSetBucketPolicy).toHaveBeenCalled();
  });

  it("does not create a bucket if it exists", async () => {
    mockBucketExists.mockResolvedValue(true);

    await createBucketForUser("user-2");

    expect(mockBucketExists).toHaveBeenCalledWith("user-2");
    expect(mockMakeBucket).not.toHaveBeenCalled();
  });

  it("throws if makeBucket fails", async () => {
    mockBucketExists.mockResolvedValue(false);
    mockMakeBucket.mockRejectedValue(new Error("Failed"));

    await expect(createBucketForUser("user-3")).rejects.toThrow("Failed");
  });
});
