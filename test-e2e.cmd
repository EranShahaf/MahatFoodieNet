@echo off
REM ============================================
REM test-e2e.cmd
REM ============================================
REM Purpose: Run end-to-end tests
REM 
REM This script runs the test-e2e service which executes:
REM - Full E2E test flow (similar to init-full-flow)
REM - Tests the complete user journey:
REM   1. Create user
REM   2. Authenticate
REM   3. Upload image to MinIO
REM   4. Create post
REM   5. Like post
REM   6. Add comment
REM   7. Retrieve post with all data
REM   8. Cleanup (delete like, comment, post)
REM 
REM Usage: Double-click this file or run from command prompt
REM 
REM Note: Requires backend API and MinIO to be running
REM ============================================

docker-compose build test-e2e
docker-compose up --force-recreate test-e2e

