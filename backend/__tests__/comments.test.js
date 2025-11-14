import request from 'supertest';
import express from 'express';
import { commentRouter } from '../controllers/comment.controller.js';
import { commentService } from '../services/comment.service.js';
import { authenticate } from '../middlewares/authenticate.js';

jest.mock('../services/comment.service.js');
jest.mock('../middlewares/authenticate.js', () => {
  return (req, res, next) => {
    req.user = { id: 1, username: 'testuser', sub: 1, roles: ['user'] };
    next();
  };
});

const app = express();
app.use(express.json());
app.use('/api/comments', commentRouter);

describe('Comment Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/comments', () => {
    it('should return list of comments', async () => {
      const mockComments = [
        { id: 1, user_id: 1, post_id: 1, message: 'Comment 1', created_at: new Date() },
        { id: 2, user_id: 2, post_id: 1, message: 'Comment 2', created_at: new Date() }
      ];
      commentService.listComments.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/api/comments')
        .expect(200);

      expect(response.body).toEqual(mockComments);
      expect(commentService.listComments).toHaveBeenCalled();
    });
  });

  describe('POST /api/comments', () => {
    it('should create a comment', async () => {
      const commentData = {
        post_id: 1,
        message: 'Test comment'
      };

      const mockComment = {
        id: 1,
        user_id: 1,
        ...commentData,
        created_at: new Date()
      };

      commentService.createComment.mockResolvedValue(mockComment);

      const response = await request(app)
        .post('/api/comments')
        .send(commentData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        user_id: 1,
        post_id: commentData.post_id,
        message: commentData.message
      });
      expect(commentService.createComment).toHaveBeenCalledWith(1, commentData.post_id, commentData.message);
    });

    it('should handle comment creation errors', async () => {
      commentService.createComment.mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .post('/api/comments')
        .send({ post_id: 999, message: 'Test' })
        .expect(400);

      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('DELETE /api/comments/:post_id', () => {
    it('should delete a comment', async () => {
      commentService.deleteComment.mockResolvedValue();

      const response = await request(app)
        .delete('/api/comments/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Comment deleted' });
      expect(commentService.deleteComment).toHaveBeenCalledWith(1, '1');
    });
  });
});

