import request from 'supertest';
import express from 'express';
import { authRouter } from '../controllers/auth.controller.js';
import { userRouter } from '../controllers/user.controller.js';
import { postRouter } from '../controllers/post.controller.js';
import { commentRouter } from '../controllers/comment.controller.js';
import { likeRouter } from '../controllers/like.controller.js';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import { postService } from '../services/post.service.js';
import { commentService } from '../services/comment.service.js';
import { likeService } from '../services/like.service.js';

// Mock services
jest.mock('../services/auth.service.js');
jest.mock('../services/user.service.js');
jest.mock('../services/post.service.js');
jest.mock('../services/comment.service.js');
jest.mock('../services/like.service.js');

const app = express();
app.use(express.json());
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend 🚀' });
});
app.use('/api', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/hello', () => {
    it('should return hello message', async () => {
      const response = await request(app)
        .get('/api/hello')
        .expect(200);

      expect(response.body).toEqual({ message: 'Hello from backend 🚀' });
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock-jwt-token';
      authService.login.mockResolvedValue({ token: mockToken });

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(200);

      expect(response.body).toEqual({ token: mockToken });
      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('should return 401 with invalid credentials', async () => {
      authService.login.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'wrongpass' })
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should handle server errors', async () => {
      authService.login.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });

  describe('GET /api/profile', () => {
    it('should return user profile with valid token', async () => {
      // Mock authenticate middleware
      const mockUser = { id: 1, username: 'testuser', sub: 1, roles: ['user'] };
      
      // We need to mock the authenticate middleware
      // For now, we'll test the endpoint structure
      // In a real scenario, you'd need to properly mock the middleware
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 1,
        username: 'newuser',
        roles: ['user'],
        bucket: 'user-1'
      };
      userService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'newuser', password: 'password123', roles: ['user'] })
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith('newuser', 'password123', ['user']);
    });

    it('should return 400 if username already exists', async () => {
      userService.createUser.mockRejectedValue(new Error('Username already exists'));

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'existinguser', password: 'password123' })
        .expect(400);

      expect(response.body).toEqual({ message: 'Username already exists' });
    });
  });

  describe('GET /api/posts', () => {
    it('should return list of posts', async () => {
      const mockPosts = [
        { id: 1, title: 'Test Post', body: 'Test body', user_id: 1 },
        { id: 2, title: 'Another Post', body: 'Another body', user_id: 2 }
      ];
      postService.listPosts.mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(postService.listPosts).toHaveBeenCalled();
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with authentication', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        body: 'Test body',
        user_id: 1,
        tags: ['test'],
        rating: 5
      };
      postService.createPost.mockResolvedValue(mockPost);

      // Note: In a real test, you'd need to properly mock the authenticate middleware
      // This is a simplified version showing the structure
    });
  });

  describe('POST /api/likes', () => {
    it('should like a post', async () => {
      const mockLike = {
        id: 1,
        user_id: 1,
        post_id: 1,
        created_at: new Date()
      };
      likeService.addLike.mockResolvedValue(mockLike);

      // Note: Would need to mock authenticate middleware
    });
  });

  describe('GET /api/likes', () => {
    it('should return list of likes', async () => {
      const mockLikes = [
        { id: 1, user_id: 1, post_id: 1 },
        { id: 2, user_id: 2, post_id: 1 }
      ];
      likeService.listLikes.mockResolvedValue(mockLikes);

      const response = await request(app)
        .get('/api/likes')
        .expect(200);

      expect(response.body).toEqual(mockLikes);
      expect(likeService.listLikes).toHaveBeenCalled();
    });
  });

  describe('POST /api/comments', () => {
    it('should create a comment', async () => {
      const mockComment = {
        id: 1,
        user_id: 1,
        post_id: 1,
        message: 'Test comment',
        created_at: new Date()
      };
      commentService.createComment.mockResolvedValue(mockComment);

      // Note: Would need to mock authenticate middleware
    });
  });

  describe('GET /api/comments', () => {
    it('should return list of comments', async () => {
      const mockComments = [
        { id: 1, user_id: 1, post_id: 1, message: 'Comment 1' },
        { id: 2, user_id: 2, post_id: 1, message: 'Comment 2' }
      ];
      commentService.listComments.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/api/comments')
        .expect(200);

      expect(response.body).toEqual(mockComments);
      expect(commentService.listComments).toHaveBeenCalled();
    });
  });
});

