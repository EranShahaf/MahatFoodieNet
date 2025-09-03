Full-stack Dockerized project with:

- **Backend**: Node.js + Express + Swagger UI + MinIO + Postgres
- **Frontend**: React app
- **Storage**: MinIO (S3-compatible)
- **Database**: PostgreSQL
- **Docker Compose** for local development and easy deployment

---

## Project Structure

project/
├── backend/
│ ├── server.js
│ ├── swagger.js
│ ├── package.json
│ └── Dockerfile
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── App.js
│ │ └── index.js
│ ├── package.json
│ └── Dockerfile
├── docker-compose.yml
└── docker-compose.override.yml

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

2. Development Mode
docker-compose.override.yml enables:

Hot reload for backend (nodemon)

Hot reload for frontend (React dev server)

Proxy for frontend → backend to avoid CORS issues

Just run:
docker-compose up
No need to rebuild after code changes in backend/ or frontend/.

3. Backend Features
REST API at /api

Swagger UI: http://localhost:5000/api-docs

MinIO integration

Create a bucket example:

js
Copy code
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

CORS enabled for dev frontend (localhost:3000)

4. Frontend Features
React app with hot reload

Fetches backend API /api/hello via proxy in dev

Minimal setup in src/App.js

5. Docker Notes
docker-compose.yml → production-like setup (baked images, no hot reload)

docker-compose.override.yml → dev setup (volume mounts, hot reload, proxy)

MinIO & Postgres persist data in named volumes:

yaml
Copy code
volumes:
  minio-data:
  postgres-data:
6. Swagger Setup
Installed via swagger-ui-express + express-jsdoc-swagger

Automatically documents annotated endpoints

Access: http://localhost:5000/api-docs

7. Troubleshooting
CORS errors: handled via backend CORS middleware or React proxy

Hot reload not working: make sure docker-compose.override.yml mounts ./backend:/app and ./frontend:/app

MinIO hostname issues: use minio as host inside containers, localhost from host machine

Frontend fetch errors in dev: use React proxy or set REACT_APP_API_URL=http://localhost:5000 before building

8. Useful Commands
bash
Copy code
# Build and start all services
docker-compose up --build

# Only backend in dev
docker-compose up --build backend

# Stop and remove containers
docker-compose down

# List Docker volumes
docker volume ls
