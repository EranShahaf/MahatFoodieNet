Full-stack Dockerized project with:

- **Backend**: Node.js + Express + Swagger UI + MinIO + Postgres
- **Frontend**: React app
- **Storage**: MinIO (S3-compatible)
- **Database**: PostgreSQL
- **Docker Compose** for local development and easy deployment

---

## Prerequisites

- Docker & Docker Compose installed
- Node.js (for local dev if needed)
- npm/yarn

---

## 1. Setup & Run

Build and start all services:

```bash
docker-compose up --build
Backend → http://localhost:5000

Frontend → http://localhost:3000

MinIO Console → http://localhost:9001

Username: minioadmin

Password: minioadmin123

Postgres → localhost:5432

User: admin, Password: admin123, Database: mydb
```

---

## 2. Development Mode

docker-compose.override.yml enables:

Hot reload for backend (nodemon)

Hot reload for frontend (React dev server)

Proxy for frontend → backend to avoid CORS issues

Just run:
docker-compose up
No need to rebuild after code changes in backend/ or frontend/.

## 3. Backend Features
REST API at /api

Swagger UI: http://localhost:5000/api-docs

MinIO integration

Create a bucket example:

```js
import Minio from "minio";

const client = new Minio.Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin123",
});

await client.makeBucket("my-bucket", "us-east-1");
PostgreSQL integration via DATABASE_URL=postgres://admin:admin123@postgres:5432/mydb
```

CORS enabled for dev frontend (localhost:3000)

## 4. Frontend Features
React app with hot reload

Fetches backend API /api/hello via proxy in dev

Minimal setup in src/App.js

## 5. Docker Notes
docker-compose.yml → production-like setup (baked images, no hot reload)

docker-compose.override.yml → dev setup (volume mounts, hot reload, proxy)

MinIO & Postgres persist data in named volumes:

```yaml
volumes:
  minio-data:
  postgres-data:
```
6. Swagger Setup
Installed via swagger-ui-express + express-jsdoc-swagger

Automatically documents annotated endpoints

Access: http://localhost:5000/api-docs

## 7. Troubleshooting
CORS errors: handled via backend CORS middleware or React proxy

Hot reload not working: make sure docker-compose.override.yml mounts ./backend:/app and ./frontend:/app

MinIO hostname issues: use minio as host inside containers, localhost from host machine

Frontend fetch errors in dev: use React proxy or set REACT_APP_API_URL=http://localhost:5000 before building

## 8. Command Scripts (.cmd files)

The project includes several Windows batch scripts for common operations. Each script is documented with its purpose and usage:

### Quick Reference

| Script | Purpose | Data Loss? |
|--------|---------|------------|
| `init-users.cmd` | Initialize default users in database | No |
| `init-full-flow.cmd` | Run full flow test (user, post, like, comment) | No |
| `test-unit.cmd` | Run unit and integration tests | No |
| `test-e2e.cmd` | Run end-to-end tests | No |
| `test-all.cmd` | Run all tests (unit + E2E) | No |
| `backend_restart.cmd` | Restart backend with clean volumes | Yes (backend volumes) |
| `backend_restart_for_code.cmd` | Quick backend restart (preserves data) | No |
| `compose_restart.cmd` | Restart all services with clean volumes | Yes (all volumes) |
| `start_compose.cmd` | Start all services with clean build | Yes (all volumes) |
| `start_compose_prod.cmd` | Start in production mode | Yes (all volumes) |
| `fronted_restart.cmd` | Restart frontend service | Yes (frontend volumes) |

### Detailed Script Descriptions

#### `init-users.cmd`
**Purpose**: Initialize default users in the database

**What it does**:
- Runs the `init-users` Docker service
- Creates default admin and user accounts in PostgreSQL
- Shows logs to verify user creation

**When to use**:
- First time setup
- After resetting the database
- When you need to recreate default users

**Data loss**: No - only creates new users

---

#### `init-full-flow.cmd`
**Purpose**: Run the full flow test script

**What it does**:
- Runs the `init-full-flow` Docker service
- Executes a complete test flow that:
  1. Creates a random user with generated credentials
  2. Authenticates with the user and retrieves a JWT token
  3. Creates a post with random title, body, tags, rating, and location
  4. Likes the created post
  5. Adds a comment to the post
  6. Retrieves the post and extracts all information (post details, likes, comments)
- Shows logs with detailed progress and data at each step
- Uses random data for each execution

**When to use**:
- Testing the complete API flow
- Verifying all endpoints work correctly
- Demonstrating the application functionality
- Integration testing
- After making changes to verify everything still works

**Data loss**: No - only creates test data (user, post, like, comment)

**Note**: Each run generates different random data, so you can run it multiple times to test with various inputs.

---

#### `test-unit.cmd`
**Purpose**: Run unit and integration tests

**What it does**:
- Runs the `test-unit` Docker service
- Executes all unit and integration tests:
  - Auth endpoint tests (`auth.test.js`)
  - User endpoint tests (`users.test.js`)
  - Post endpoint tests (`posts.test.js`)
  - Like endpoint tests (`likes.test.js`)
  - Comment endpoint tests (`comments.test.js`)
  - General API tests (`api.test.js`)
- Uses mocked services for isolated testing
- Shows test results and coverage

**When to use**:
- After making code changes to verify functionality
- Before committing code
- During development to catch bugs early
- CI/CD pipeline integration

**Data loss**: No - tests use mocked services and don't modify real data

**Note**: These tests run quickly and don't require the full stack to be running (only backend service needed).

---

#### `test-e2e.cmd`
**Purpose**: Run end-to-end tests

**What it does**:
- Runs the `test-e2e` Docker service
- Executes the full E2E test suite (`e2e.test.js`)
- Tests the complete user journey:
  1. Creates a user
  2. Authenticates with the user
  3. Uploads a random image to MinIO
  4. Creates a post
  5. Likes the post
  6. Adds a comment to the post
  7. Retrieves the post and extracts all information
  8. Gets user profile
  9. Cleans up (deletes like, comment, post)
- Makes real API calls and interacts with actual services
- Waits for backend API to be ready before starting

**When to use**:
- Before deploying to production
- To verify the complete system works end-to-end
- Integration testing
- After major changes to ensure nothing broke

**Data loss**: No - E2E test creates test data but cleans up after itself

**Note**: Requires backend API and MinIO to be running. The test will wait for services to be available.

---

#### `test-all.cmd`
**Purpose**: Run all tests (unit + E2E)

**What it does**:
- Runs the `test-all` Docker service
- Executes the complete test suite:
  - All unit and integration tests
  - All E2E tests
- Provides comprehensive test coverage
- Shows results for all tests

**When to use**:
- Before major releases
- In CI/CD pipelines
- When you want to run the full test suite
- To ensure everything works together

**Data loss**: No - tests don't modify production data

**Note**: This is the most comprehensive test run and takes the longest. Requires all services to be running.

---

#### `backend_restart.cmd`
**Purpose**: Restart the backend service with a clean slate

**What it does**:
1. Stops and removes the backend container and its volumes
2. Rebuilds and starts the backend service

**When to use**:
- Clear backend data/volumes
- Apply backend code changes that require a rebuild
- Fix backend container issues

**Data loss**: Yes - backend volumes are deleted

---

#### `backend_restart_for_code.cmd`
**Purpose**: Quick restart of backend service to apply code changes

**What it does**:
1. Stops the backend container (preserves volumes)
2. Starts the backend in detached mode
3. Waits 5 seconds
4. Shows backend logs to verify it started correctly

**When to use**:
- Made code changes and want to see them applied quickly
- Need to restart backend without losing data
- Want to quickly check backend logs after restart

**Data loss**: No - volumes are preserved

---

#### `compose_restart.cmd`
**Purpose**: Restart all Docker Compose services with volumes cleared

**What it does**:
1. Stops and removes all containers and volumes
2. Starts all services fresh (backend, frontend, postgres, minio)

**When to use**:
- Start fresh with a clean database
- Clear all application data
- Reset the entire development environment

**Data loss**: ⚠️ **Yes - ALL data will be deleted** (database, MinIO storage)

---

#### `start_compose.cmd`
**Purpose**: Start all Docker Compose services with a clean build

**What it does**:
1. Stops and removes all containers and volumes
2. Builds and starts all services
3. ⚠️ **Note**: Last line stops services immediately (may be a bug)

**When to use**:
- Start the entire stack from scratch
- Rebuild all Docker images
- Reset everything to a clean state

**Data loss**: ⚠️ **Yes - ALL data will be deleted**

**⚠️ Warning**: This script has a bug - it stops services immediately after starting them. Consider removing the last line if you want services to stay running.

---

#### `start_compose_prod.cmd`
**Purpose**: Start Docker Compose in production mode

**What it does**:
1. Stops and removes all containers and volumes
2. Starts services using `docker-compose.yml` (production config)
   - Explicitly excludes `docker-compose.override.yml` (dev settings)
3. ⚠️ **Note**: Last line stops services immediately (may be a bug)

**When to use**:
- Run in production mode (no hot reload, baked images)
- Test production-like environment locally
- Deploy to a production-like setup

**Data loss**: ⚠️ **Yes - ALL data will be deleted**

**⚠️ Warning**: This script has a bug - it stops services immediately after starting them. Consider removing the last line if you want services to stay running.

---

#### `fronted_restart.cmd`
**Purpose**: Restart the frontend service with a clean slate

**Note**: Filename has a typo (`fronted` instead of `frontend`)

**What it does**:
1. Stops and removes the frontend container and its volumes
2. Rebuilds and starts the frontend service

**When to use**:
- Clear frontend build cache
- Apply frontend code changes that require a rebuild
- Fix frontend container issues
- Reset frontend to a clean state

**Data loss**: Yes - frontend volumes are deleted

---

## 9. Testing

The project includes comprehensive test suites for unit, integration, and E2E testing.

### Test Structure

Tests are located in `backend/__tests__/`:
- **Unit/Integration Tests**: Test individual endpoints with mocked services
- **E2E Tests**: Test the complete flow with real API calls

### Running Tests

#### Using Docker (Recommended)

```bash
# Run unit tests
test-unit.cmd

# Run E2E tests
test-e2e.cmd

# Run all tests
test-all.cmd
```

#### Using npm (Local Development)

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js
npm test -- e2e.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Requirements

- **Unit Tests**: Only require backend service to be running
- **E2E Tests**: Require backend API, MinIO, and database to be running
- **All Tests**: Require full stack to be running

### Test Documentation

See `backend/__tests__/README.md` for detailed test documentation.

---

## 10. Useful Commands
```bash
# Build and start all services
docker-compose up --build

# Only backend in dev
docker-compose up --build backend

# Stop and remove containers
docker-compose down

# List Docker volumes
docker volume ls

# Run tests
docker-compose up test-unit
docker-compose up test-e2e
docker-compose up test-all
```
