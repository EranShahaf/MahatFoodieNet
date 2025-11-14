@echo off
REM ============================================
REM backend_restart_for_code.cmd
REM ============================================
REM Purpose: Quick restart of backend service to apply code changes
REM 
REM This script:
REM   1. Stops the backend container (preserves volumes)
REM   2. Starts the backend in detached mode
REM   3. Waits 5 seconds
REM   4. Shows backend logs to verify it started correctly
REM 
REM Use this when you:
REM   - Made code changes and want to see them applied
REM   - Need to restart backend without losing data
REM   - Want to quickly check backend logs after restart
REM 
REM Note: This preserves volumes, so database data is kept
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose down backend
docker-compose up -d backend
timeout 5
docker logs backend