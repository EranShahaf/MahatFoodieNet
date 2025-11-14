# Test Suite

This directory contains comprehensive tests for the MahatFoodieNet backend API.

## Test Files

### Unit/Integration Tests

- **`auth.test.js`** - Tests for authentication endpoints
  - POST /api/login
  - GET /api/profile
  - GET /api/admin

- **`users.test.js`** - Tests for user management endpoints
  - POST /api/users (create user)
  - GET /api/users (list users)
  - DELETE /api/users/:id (delete user)

- **`posts.test.js`** - Tests for post endpoints
  - GET /api/posts (list all posts)
  - POST /api/posts (create post)
  - DELETE /api/posts/:id (delete post)

- **`likes.test.js`** - Tests for like endpoints
  - GET /api/likes (list all likes)
  - POST /api/likes (like a post)
  - DELETE /api/likes/:post_id (remove like)

- **`comments.test.js`** - Tests for comment endpoints
  - GET /api/comments (list all comments)
  - POST /api/comments (add comment)
  - DELETE /api/comments/:post_id (delete comment)

- **`api.test.js`** - General API endpoint tests

- **`minio.service.test.js`** - Tests for MinIO service functions

### E2E Tests

- **`e2e.test.js`** - End-to-end test that simulates the full flow:
  1. Create a user
  2. Authenticate with the user
  3. Upload a random image to MinIO
  4. Create a post
  5. Like the post
  6. Add a comment to the post
  7. Read the post and extract all information
  8. Get user profile
  9. Delete the like
  10. Delete the comment
  11. Delete the post

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test -- auth.test.js
npm test -- e2e.test.js
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

## E2E Test Requirements

The E2E test requires:
- Backend API running on `http://localhost:5000` (or set `API_URL` env var)
- MinIO running and accessible (default: `localhost:9000`)
- Database connection available
- Test images in `scripts/init_images/` directory (optional)

### Running E2E Tests

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Wait for services to be ready, then run:
   ```bash
   npm test -- e2e.test.js
   ```

## Test Structure

All tests use:
- **Jest** as the test framework
- **Supertest** for HTTP assertions
- **Mocks** for services to isolate unit tests
- **Real API calls** for E2E tests

## Notes

- Unit tests mock services to test controller logic in isolation
- E2E tests make real API calls and require running services
- The E2E test creates real data in the database (cleanup is recommended)
- Tests are configured to work with ES modules via Babel

