import request from 'supertest';
import express from 'express';
import { userRouter } from '../controllers/user.controller.js';
import { userService } from '../services/user.service.js';

jest.mock('../services/user.service.js');

const app = express();
app.use(express.json());
app.use('/api/users', userRouter);

describe('User Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
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
      expect(userService.createUser).toHaveBeenCalled();
    });

    it('should create user with default roles if not provided', async () => {
      const mockUser = {
        id: 2,
        username: 'defaultuser',
        roles: ['user'],
        bucket: 'user-2'
      };
      userService.createUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({ username: 'defaultuser', password: 'password123' })
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalled();
    });
  });
});

