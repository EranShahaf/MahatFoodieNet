@echo off
REM ============================================
REM test-unit.cmd
REM ============================================
REM Purpose: Run unit and integration tests
REM 
REM This script runs the test-unit service which executes:
REM - Auth endpoint tests
REM - User endpoint tests
REM - Post endpoint tests
REM - Like endpoint tests
REM - Comment endpoint tests
REM - General API tests
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose build test-unit
docker-compose up --force-recreate test-unit

