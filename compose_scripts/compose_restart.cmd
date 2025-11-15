@echo off
REM ============================================
REM compose_restart.cmd
REM ============================================
REM Purpose: Restart all Docker Compose services with volumes cleared
REM 
REM This script:
REM   1. Stops and removes all containers and volumes
REM   2. Starts all services fresh (backend, frontend, postgres, minio)
REM 
REM WARNING: This will delete all data in volumes (database, MinIO storage)
REM 
REM Use this when you need to:
REM   - Start fresh with a clean database
REM   - Clear all application data
REM   - Reset the entire development environment
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down -v
docker-compose up