@echo off
REM ============================================
REM init-users.cmd
REM ============================================
REM Purpose: Initialize default users in the database
REM 
REM This script runs the init-users service which creates
REM default admin and user accounts in the PostgreSQL database.
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose up -d init-users
timeout 1
docker logs init-users