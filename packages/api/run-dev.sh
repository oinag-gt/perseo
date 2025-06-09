#!/bin/bash
echo "🚀 Starting PERSEO API Development Server..."

# Ensure we're in the API directory
cd /Users/david/dev/na/perseo/packages/api

# Set module resolution paths
export NODE_PATH="./node_modules:../shared:../../node_modules"

# Skip TypeScript compilation and use the working compiled version
echo "🏃 Starting server with existing build..."
node dist/api/src/main.js