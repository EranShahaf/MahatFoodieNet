@echo off
REM ============================================
REM start_compose.cmd
REM ============================================
REM Purpose: Start all Docker Compose services with a clean build
REM 
REM This script:
REM   1. Stops and removes all containers and volumes
REM   2. Builds and starts all services
REM   3. Cleans up again (this last line seems redundant - may be a bug)
REM 
REM WARNING: This will delete all data in volumes (database, MinIO storage)
REM 
REM Use this when you need to:
REM   - Start the entire stack from scratch
REM   - Rebuild all Docker images
REM   - Reset everything to a clean state
REM 
REM Note: The last line (docker-compose down -v) will immediately
REM       stop everything after starting - you may want to remove it
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down -v
docker-compose up --build
REM Note: The line below will stop services immediately after starting
REM Consider removing it if you want services to stay running
docker-compose down -v
