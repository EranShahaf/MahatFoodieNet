import request from 'supertest';
import express from 'express';
import { likeService } from '../services/like.service.js';

jest.mock('../services/like.service.js');
jest.mock('../middlewares/authenticate.js', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'testuser', sub: 1, roles: ['user'] };
    next();
  })
}));

// Import router after mocks are set up
import { likeRouter } from '../controllers/like.controller.js';

const app = express();
app.use(express.json());
app.use('/api/likes', likeRouter);

describe('Like Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/likes', () => {
    it('should return list of likes', async () => {
      const mockLikes = [
        { id: 1, user_id: 1, post_id: 1, created_at: new Date() },
        { id: 2, user_id: 2, post_id: 1, created_at: new Date() }
      ];
      likeService.listLikes.mockResolvedValue(mockLikes);

      const response = await request(app)
        .get('/api/likes')
        .expect(200);

      // Dates are serialized to strings in JSON responses
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 1,
        user_id: 1,
        post_id: 1
      });
      expect(response.body[0].created_at).toBeDefined();
      expect(likeService.listLikes).toHaveBeenCalled();
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

      const response = await request(app)
        .post('/api/likes')
        .send({ post_id: 1 })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        user_id: 1,
        post_id: 1
      });
      expect(likeService.addLike).toHaveBeenCalledWith(1, 1);
    });

    it('should handle like errors', async () => {
      likeService.addLike.mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .post('/api/likes')
        .send({ post_id: 999 })
        .expect(400);

      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('DELETE /api/likes/:post_id', () => {
    it('should remove a like', async () => {
      likeService.removeLike.mockResolvedValue();

      const response = await request(app)
        .delete('/api/likes/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Like removed' });
      expect(likeService.removeLike).toHaveBeenCalledWith(1, '1');
    });
  });
});

