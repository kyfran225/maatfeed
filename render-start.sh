#!/bin/bash
# Render Start Script for MAAT FEED API

set -e

echo "🚀 Starting MAAT FEED API on Render..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Build shared package first
echo "📦 Building shared package..."
npm run build:shared

# Build API package
echo "🔨 Building API package..."
cd apps/api
npm run build

# Start the server
echo "🌐 Starting server..."
exec npm run start
