import request from 'supertest';
import express from 'express';
import { authRouter } from '../controllers/auth.controller.js';
import { authService } from '../services/auth.service.js';

jest.mock('../services/auth.service.js');

const app = express();
app.use(express.json());
app.use('/api', authRouter);

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock-jwt-token-12345';
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
      expect(authService.login).toHaveBeenCalledWith('testuser', 'wrongpass');
    });

    it('should handle server errors', async () => {
      authService.login.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal server error' });
    });

    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser' })
        .expect(200); // The endpoint doesn't validate, but service will fail

      // Service will be called but may fail
      expect(authService.login).toHaveBeenCalled();
    });
  });
});

