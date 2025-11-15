@echo off
REM ============================================
REM backend_restart.cmd
REM ============================================
REM Purpose: Restart the backend service with a clean slate
REM 
REM This script:
REM   1. Stops and removes the backend container and its volumes
REM   2. Rebuilds and starts the backend service
REM 
REM Use this when you need to:
REM   - Clear backend data/volumes
REM   - Apply backend code changes that require a rebuild
REM   - Fix backend container issues
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down -v backend
docker-compose up backend --build