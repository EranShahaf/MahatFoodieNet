import axios from 'axios';
import { Client } from 'minio';
import fs from 'fs';
import path from 'path';

// Get images directory path relative to project root
// In Docker container, we're in /app, so scripts/init_images is at /app/scripts/init_images
const getImagesDir = () => {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'scripts', 'init_images'),
    path.join(process.cwd(), 'backend', 'scripts', 'init_images'),
    '/app/scripts/init_images'
  ];
  
  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
  }
  return path.join(process.cwd(), 'scripts', 'init_images');
};

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123';

// Helper functions
function randomString(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random user data
function generateRandomUser() {
  const adjectives = ['test', 'e2e', 'integration', 'automated'];
  const nouns = ['user', 'tester', 'bot', 'script'];
  return {
    username: `${randomElement(adjectives)}_${randomElement(nouns)}_${randomInt(1000, 9999)}`,
    password: `Test${randomString(10)}!`,
    roles: ['user']
  };
}

// Generate random post data
function generateRandomPost() {
  const titles = ['Test Post', 'E2E Test Post', 'Integration Test'];
  const bodies = ['This is a test post for E2E testing.', 'Automated test content.'];
  return {
    title: randomElement(titles),
    body: randomElement(bodies),
    tags: ['test', 'e2e'],
    rating: randomInt(1, 5),
    location: 'Test Location'
  };
}

// Upload random image to MinIO
async function uploadRandomImageToMinIO(bucketName) {
  try {
    const imagesDir = getImagesDir();
    
    // Check if images directory exists
    if (!fs.existsSync(imagesDir)) {
      console.log('⚠️  Images directory not found, skipping image upload');
      return null;
    }

    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.jfif') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
    
    if (imageFiles.length === 0) {
      console.log('⚠️  No image files found, skipping image upload');
      return null;
    }
    
    const randomImageFile = randomElement(imageFiles);
    const imagePath = path.join(imagesDir, randomImageFile);
    const imageBuffer = fs.readFileSync(imagePath);
    const fileExtension = path.extname(randomImageFile);
    
    const timestamp = Date.now();
    const randomSuffix = randomString(6);
    const objectName = `posts/${timestamp}-${randomSuffix}${fileExtension}`;
    
    const minioClient = new Client({
      endPoint: MINIO_ENDPOINT,
      port: MINIO_PORT,
      useSSL: false,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
    });
    
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
    
    await minioClient.putObject(bucketName, objectName, imageBuffer, {
      'Content-Type': `image/${fileExtension === '.jfif' ? 'jpeg' : fileExtension.slice(1)}`,
    });
    
    const imageUrl = `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${bucketName}/${objectName}`;
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }
}

describe('E2E Full Flow Test', () => {
  let userData;
  let token;
  let userId;
  let bucketName;
  let postId;
  let likeId;
  let commentId;

  // Wait for API to be ready
  beforeAll(async () => {
    // Wait for API to be available
    let retries = 10;
    while (retries > 0) {
      try {
        await axios.get(`${API_URL}/api/hello`);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, 30000);

  describe('Full Flow: User Creation to Post Retrieval', () => {
    test('Step 1: Create a user', async () => {
      userData = generateRandomUser();
      
      const response = await axios.post(`${API_URL}/api/users`, userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.username).toBe(userData.username);
      expect(response.data).toHaveProperty('bucket');
      
      userId = response.data.id;
      bucketName = response.data.bucket || `user-${userId}`;
      
      console.log(`✅ User created: ${userData.username} (ID: ${userId})`);
    });

    test('Step 2: Authenticate with the user', async () => {
      const response = await axios.post(`${API_URL}/api/login`, {
        username: userData.username,
        password: userData.password
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      
      token = response.data.token;
      expect(token).toBeTruthy();
      
      console.log(`✅ Authenticated: Token received`);
    });

    test('Step 3: Upload a random image to MinIO', async () => {
      const imageUrl = await uploadRandomImageToMinIO(bucketName);
      
      if (imageUrl) {
        expect(imageUrl).toContain(bucketName);
        expect(imageUrl).toMatch(/^http/);
        console.log(`✅ Image uploaded: ${imageUrl}`);
      } else {
        console.log(`⚠️  Image upload skipped`);
      }
    });

    test('Step 4: Create a post', async () => {
      const postData = generateRandomPost();
      const imageUrl = await uploadRandomImageToMinIO(bucketName);
      
      if (imageUrl) {
        postData.image = imageUrl;
      }
      
      const response = await axios.post(
        `${API_URL}/api/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe(postData.title);
      expect(response.data.body).toBe(postData.body);
      expect(response.data.user_id).toBe(userId);
      
      postId = response.data.id;
      
      console.log(`✅ Post created: "${postData.title}" (ID: ${postId})`);
    });

    test('Step 5: Like the post', async () => {
      const response = await axios.post(
        `${API_URL}/api/likes`,
        { post_id: postId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.post_id).toBe(postId);
      expect(response.data.user_id).toBe(userId);
      
      likeId = response.data.id;
      
      console.log(`✅ Post liked: Like ID ${likeId}`);
    });

    test('Step 6: Add a comment to the post', async () => {
      const commentText = 'This is a test comment from E2E test';
      
      const response = await axios.post(
        `${API_URL}/api/comments`,
        {
          post_id: postId,
          message: commentText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.post_id).toBe(postId);
      expect(response.data.user_id).toBe(userId);
      expect(response.data.message).toBe(commentText);
      
      commentId = response.data.id;
      
      console.log(`✅ Comment added: "${commentText}" (ID: ${commentId})`);
    });

    test('Step 7: Read the post and extract all information', async () => {
      // Get all posts
      const postsResponse = await axios.get(`${API_URL}/api/posts`);
      expect(postsResponse.status).toBe(200);
      expect(Array.isArray(postsResponse.data)).toBe(true);
      
      const foundPost = postsResponse.data.find(p => p.id === postId);
      expect(foundPost).toBeDefined();
      expect(foundPost.id).toBe(postId);
      expect(foundPost.title).toBeDefined();
      expect(foundPost.body).toBeDefined();
      
      // Get all likes
      const likesResponse = await axios.get(`${API_URL}/api/likes`);
      expect(likesResponse.status).toBe(200);
      const postLikes = likesResponse.data.filter(l => l.post_id === postId);
      expect(postLikes.length).toBeGreaterThan(0);
      expect(postLikes.some(l => l.id === likeId)).toBe(true);
      
      // Get all comments
      const commentsResponse = await axios.get(`${API_URL}/api/comments`);
      expect(commentsResponse.status).toBe(200);
      const postComments = commentsResponse.data.filter(c => c.post_id === postId);
      expect(postComments.length).toBeGreaterThan(0);
      expect(postComments.some(c => c.id === commentId)).toBe(true);
      
      console.log(`✅ Post retrieved with ${postLikes.length} like(s) and ${postComments.length} comment(s)`);
    });

    test('Step 8: Get user profile', async () => {
      const response = await axios.get(
        `${API_URL}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.username).toBe(userData.username);
      
      console.log(`✅ Profile retrieved for: ${response.data.user.username}`);
    });

    test('Step 9: Delete the like', async () => {
      const response = await axios.delete(
        `${API_URL}/api/likes/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Like removed');
      
      console.log(`✅ Like removed`);
    });

    test('Step 10: Delete the comment', async () => {
      const response = await axios.delete(
        `${API_URL}/api/comments/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Comment deleted');
      
      console.log(`✅ Comment deleted`);
    });

    test('Step 11: Delete the post', async () => {
      const response = await axios.delete(
        `${API_URL}/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Post deleted');
      
      console.log(`✅ Post deleted`);
    });
  });
});

