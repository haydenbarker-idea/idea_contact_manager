# Deployment Logs

This directory contains automated deployment logs that are synced from the server to GitHub.

## Purpose
- Scripts on the server automatically save detailed logs here
- Logs are committed and pushed to GitHub after each deployment
- The AI assistant can read these logs directly from the repo for debugging
- This eliminates the need to copy/paste large terminal outputs

## File Format
- `YYYYMMDD-HHMMSS-deployment.log` - Main deployment log
- `YYYYMMDD-HHMMSS-build.log` - Build output
- `YYYYMMDD-HHMMSS-service.log` - Service status and logs

## Usage
After running a deployment script, logs are automatically:
1. Saved to this directory
2. Committed to git
3. Pushed to GitHub

The user just needs to say "done" and the assistant can read all logs!

