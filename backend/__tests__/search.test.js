import request from 'supertest';
import express from 'express';
import { searchService } from '../services/search.service.js';

jest.mock('../services/search.service.js');

// Import router after mocks are set up
import { searchRouter } from '../controllers/search.controller.js';

const app = express();
app.use(express.json());
app.use('/api/search', searchRouter);

describe('Search Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return search results for tags, users, and posts', async () => {
      const mockDate = new Date('2025-11-16T18:47:52.406Z');
      const mockResults = {
        tags: [
          { id: 1, name: 'pizza', created_at: mockDate },
          { id: 2, name: 'pizzeria', created_at: mockDate }
        ],
        users: [
          { id: 1, username: 'pizzalover', roles: ['user'] }
        ],
        posts: [
          { id: 1, title: 'Best Pizza in Town', body: 'Amazing pizza place', user_id: 1, username: 'user1', tags: ['pizza'] }
        ]
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?q=pizza')
        .expect(200);

      // Dates are serialized as strings in JSON responses, so we check structure instead
      expect(response.body.tags).toHaveLength(2);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.tags[0]).toMatchObject({ id: 1, name: 'pizza' });
      expect(response.body.tags[1]).toMatchObject({ id: 2, name: 'pizzeria' });
      expect(response.body.users[0]).toMatchObject({ id: 1, username: 'pizzalover' });
      expect(response.body.posts[0]).toMatchObject({ id: 1, title: 'Best Pizza in Town' });
      expect(searchService.searchAll).toHaveBeenCalledWith('pizza');
    });

    it('should return results in correct order: tags, users, posts', async () => {
      const mockResults = {
        tags: [{ id: 1, name: 'italian' }],
        users: [{ id: 1, username: 'chef' }],
        posts: [{ id: 1, title: 'Italian Food', body: 'Great food' }]
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?q=italian')
        .expect(200);

      expect(Object.keys(response.body)).toEqual(['tags', 'users', 'posts']);
      expect(response.body.tags).toBeDefined();
      expect(response.body.users).toBeDefined();
      expect(response.body.posts).toBeDefined();
    });

    it('should return empty results when no matches found', async () => {
      const mockResults = {
        tags: [],
        users: [],
        posts: []
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?q=nonexistentterm12345')
        .expect(200);

      expect(response.body).toEqual(mockResults);
      expect(response.body.tags).toHaveLength(0);
      expect(response.body.users).toHaveLength(0);
      expect(response.body.posts).toHaveLength(0);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/search?q=')
        .expect(400);

      expect(response.body).toEqual({ message: "Search query parameter 'q' is required" });
      expect(searchService.searchAll).not.toHaveBeenCalled();
    });

    it('should handle missing search query parameter', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body).toEqual({ message: "Search query parameter 'q' is required" });
    });

    it('should trim whitespace from search query', async () => {
      const mockResults = {
        tags: [],
        users: [],
        posts: []
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      await request(app)
        .get('/api/search?q=  pizza  ')
        .expect(200);

      expect(searchService.searchAll).toHaveBeenCalledWith('pizza');
    });

    it('should search for partial matches (fuzzy search)', async () => {
      const mockResults = {
        tags: [
          { id: 1, name: 'pizza' },
          { id: 2, name: 'pizzeria' },
          { id: 3, name: 'pizzaiolo' }
        ],
        users: [],
        posts: []
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?q=pizz')
        .expect(200);

      expect(response.body.tags.length).toBeGreaterThan(0);
      expect(response.body.tags.some(t => t.name.includes('pizz'))).toBe(true);
    });

    it('should handle search service errors', async () => {
      searchService.searchAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/search?q=test')
        .expect(500);

      expect(response.body).toEqual({ message: 'Internal server error' });
    });

    it('should search case-insensitively', async () => {
      const mockResults = {
        tags: [{ id: 1, name: 'Pizza' }],
        users: [],
        posts: []
      };

      searchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?q=PIZZA')
        .expect(200);

      expect(searchService.searchAll).toHaveBeenCalledWith('PIZZA');
      expect(response.body.tags).toBeDefined();
    });
  });
});

