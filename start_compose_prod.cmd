@echo off
REM ============================================
REM start_compose_prod.cmd
REM ============================================
REM Purpose: Start Docker Compose in production mode
REM 
REM This script:
REM   1. Stops and removes all containers and volumes
REM   2. Starts services using docker-compose.yml (production config)
REM      (explicitly excludes docker-compose.override.yml)
REM   3. Cleans up again (this last line seems redundant - may be a bug)
REM 
REM WARNING: This will delete all data in volumes (database, MinIO storage)
REM 
REM Use this when you need to:
REM   - Run in production mode (no hot reload, baked images)
REM   - Test production-like environment locally
REM   - Deploy to a production-like setup
REM 
REM Note: The last line (docker-compose down -v) will immediately
REM       stop everything after starting - you may want to remove it
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down -v
docker-compose -f docker-compose.yml up --build
REM Note: The line below will stop services immediately after starting
REM Consider removing it if you want services to stay running
docker-compose down -v
