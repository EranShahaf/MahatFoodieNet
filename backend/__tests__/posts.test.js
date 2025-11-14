import request from 'supertest';
import express from 'express';
import { postRouter } from '../controllers/post.controller.js';
import { postService } from '../services/post.service.js';
import { authenticate } from '../middlewares/authenticate.js';

jest.mock('../services/post.service.js');
jest.mock('../middlewares/authenticate.js', () => {
  return (req, res, next) => {
    req.user = { id: 1, username: 'testuser', sub: 1, roles: ['user'] };
    next();
  };
});

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
        { id: 1, title: 'Test Post 1', body: 'Test body 1', user_id: 1, username: 'user1' },
        { id: 2, title: 'Test Post 2', body: 'Test body 2', user_id: 2, username: 'user2' }
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
  });

  describe('POST /api/posts', () => {
    it('should create a new post with authentication', async () => {
      const postData = {
        title: 'Test Post',
        body: 'Test body',
        tags: ['test'],
        rating: 5,
        location: 'Test Location'
      };

      const mockPost = {
        id: 1,
        ...postData,
        user_id: 1,
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
        body: postData.body,
        user_id: 1
      });
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          ...postData,
          user_id: 1
        })
      );
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

