#!/bin/bash

echo "Testing PERSEO API..."
echo "===================="

# Test API health
echo -e "\n1. Testing API root:"
curl -s http://localhost:3001/api/v1 || echo "API might be starting..."

# Test Swagger docs
echo -e "\n\n2. Testing Swagger docs:"
curl -s http://localhost:3001/api/docs-json | head -20

# Test registration endpoint (should fail with validation)
echo -e "\n\n3. Testing registration endpoint (expecting validation error):"
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s | jq '.' 2>/dev/null || echo "Response received"

echo -e "\n\nAPI test complete!"