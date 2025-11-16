import request from 'supertest';
import express from 'express';
import { postService } from '../services/post.service.js';

jest.mock('../services/post.service.js');
jest.mock('../middlewares/authenticate.js', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'testuser', sub: 1, roles: ['user'] };
    next();
  })
}));

// Import router after mocks are set up
import { postRouter } from '../controllers/post.controller.js';

const app = express();
app.use(express.json());
app.use('/api/posts', postRouter);

describe('Post Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return list of posts', async () => {
      const mockPosts = [
        { id: 1, title: 'Test Post 1', body: 'Test body 1', user_id: 1, username: 'user1', tags: ['pizza', 'italian'] },
        { id: 2, title: 'Test Post 2', body: 'Test body 2', user_id: 2, username: 'user2', tags: ['burger'] }
      ];
      postService.listPosts.mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(postService.listPosts).toHaveBeenCalled();
    });

    it('should return empty array when no posts exist', async () => {
      postService.listPosts.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should filter posts by location when location query parameter is provided', async () => {
      const mockPosts = [
        { id: 1, title: 'NYC Post', body: 'Test body', user_id: 1, username: 'user1', location: 'New York, NY', tags: ['pizza'] },
        { id: 2, title: 'NYC Post 2', body: 'Test body 2', user_id: 2, username: 'user2', location: 'New York, NY', tags: ['burger'] }
      ];
      postService.getPostsByLocation.mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/api/posts?location=New York, NY')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(postService.getPostsByLocation).toHaveBeenCalledWith('New York, NY');
      expect(postService.listPosts).not.toHaveBeenCalled();
    });

    it('should return empty array when no posts found for location', async () => {
      postService.getPostsByLocation.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/posts?location=NonExistent')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(postService.getPostsByLocation).toHaveBeenCalledWith('NonExistent');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post with authentication and tags', async () => {
      const postData = {
        title: 'Test Post',
        body: 'Test body',
        tags: ['pizza', 'italian', 'dinner'],
        rating: 5,
        location: 'Test Location'
      };

      const mockPost = {
        id: 1,
        ...postData,
        user_id: 1,
        created_at: new Date(),
        tags: ['pizza', 'italian', 'dinner'] // Tags should be returned as array
      };

      postService.createPost.mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: postData.title,
        body: postData.body,
        user_id: 1,
        tags: expect.arrayContaining(['pizza', 'italian', 'dinner'])
      });
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          ...postData,
          user_id: 1
        })
      );
    });

    it('should create a post without tags', async () => {
      const postData = {
        title: 'Test Post',
        body: 'Test body',
        rating: 5,
        location: 'Test Location'
      };

      const mockPost = {
        id: 1,
        ...postData,
        user_id: 1,
        tags: [],
        created_at: new Date()
      };

      postService.createPost.mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: postData.title,
        tags: []
      });
    });

    it('should create a post with empty tags array', async () => {
      const postData = {
        title: 'Test Post',
        body: 'Test body',
        tags: [],
        rating: 5,
        location: 'Test Location'
      };

      const mockPost = {
        id: 1,
        ...postData,
        user_id: 1,
        tags: [],
        created_at: new Date()
      };

      postService.createPost.mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body.tags).toEqual([]);
    });

    it('should handle post creation errors', async () => {
      postService.createPost.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'Test', body: 'Test body' })
        .expect(400);

      expect(response.body).toEqual({ message: 'User not found' });
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      postService.deletePost.mockResolvedValue();

      const response = await request(app)
        .delete('/api/posts/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Post deleted' });
      expect(postService.deletePost).toHaveBeenCalledWith('1');
    });

    it('should handle delete errors', async () => {
      postService.deletePost.mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .delete('/api/posts/999')
        .expect(500);

      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });
});

