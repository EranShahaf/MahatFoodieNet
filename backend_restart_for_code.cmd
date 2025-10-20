docker-compose down backend
docker-compose up -d backend
timeout 5
docker logs backend