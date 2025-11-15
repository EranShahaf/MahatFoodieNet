@echo off
REM ============================================
REM test-all.cmd
REM ============================================
REM Purpose: Run all tests (unit + E2E)
REM 
REM This script runs the test-all service which executes:
REM - All unit and integration tests
REM - All E2E tests
REM - Complete test suite
REM 
REM Usage: Double-click this file or run from command prompt
REM 
REM Note: Requires backend API and MinIO to be running
REM ============================================

docker-compose build test-all
docker-compose up --force-recreate test-all

