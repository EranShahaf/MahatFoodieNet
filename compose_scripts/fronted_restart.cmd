@echo off
REM ============================================
REM fronted_restart.cmd
REM ============================================
REM Purpose: Restart the frontend service with a clean slate
REM 
REM Note: Filename has a typo (fronted instead of frontend)
REM 
REM This script:
REM   1. Stops and removes the frontend container and its volumes
REM   2. Rebuilds and starts the frontend service
REM 
REM Use this when you need to:
REM   - Clear frontend build cache
REM   - Apply frontend code changes that require a rebuild
REM   - Fix frontend container issues
REM   - Reset frontend to a clean state
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down -v frontend
docker-compose up frontend --build