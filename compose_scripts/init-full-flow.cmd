@echo off
REM ============================================
REM init-full-flow.cmd
REM ============================================
REM Purpose: Run the full flow test script
REM 
REM This script runs the init-full-flow service which:
REM - Creates a random user
REM - Authenticates with the user
REM - Creates a post
REM - Likes the post
REM - Adds a comment to the post
REM - Reads the post and extracts all information
REM 
REM Usage: Double-click this file or run from command prompt
REM ============================================

docker-compose build init-full-flow
docker-compose up --force-recreate init-full-flow