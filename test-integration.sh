#!/bin/bash
# Frontend-Backend Integration Test Script

echo "=== ATRI WebUI Integration Test ==="
echo ""

# Test 1: Backend Health Check
echo "Test 1: Backend Health Check"
response=$(curl -s http://localhost:8430/health)
if [[ $response == *"ok"* ]]; then
  echo "✅ Backend health check passed"
else
  echo "❌ Backend health check failed"
  exit 1
fi
echo ""

# Test 2: Characters API
echo "Test 2: Characters API"
response=$(curl -s http://localhost:8430/api/characters)
if [[ $response == *"atri"* ]]; then
  echo "✅ Characters API working"
  echo "   Response: $response"
else
  echo "❌ Characters API failed"
  exit 1
fi
echo ""

# Test 3: Create Chat Session
echo "Test 3: Create Chat Session"
response=$(echo '{"character_id":"atri","first_message":"你好"}' | curl -s -X POST http://localhost:8430/api/chats \
  -H "Content-Type: application/json" \
  -d @-)
chat_id=$(echo $response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [[ -n $chat_id ]]; then
  echo "✅ Chat session created"
  echo "   Chat ID: $chat_id"
else
  echo "❌ Chat session creation failed"
  echo "   Response: $response"
  exit 1
fi
echo ""

# Test 4: Get Chat History
echo "Test 4: Get Chat History"
response=$(curl -s "http://localhost:8430/api/chats?character_id=atri")
if [[ $response == *"$chat_id"* ]]; then
  echo "✅ Chat history retrieved"
else
  echo "❌ Chat history retrieval failed"
  exit 1
fi
echo ""

# Test 5: Frontend Server Check
echo "Test 5: Frontend Server Check"
response=$(curl -s http://localhost:5173/)
if [[ $response == *"<div id=\"app\"></div>"* ]]; then
  echo "✅ Frontend server running"
else
  echo "❌ Frontend server not responding"
  exit 1
fi
echo ""

echo "=== All Integration Tests Passed ✅ ==="
echo ""
echo "Manual Testing Steps:"
echo "1. Open browser: http://localhost:5173/"
echo "2. Check if character 'atri' appears in sidebar"
echo "3. Click 'atri' to select character"
echo "4. Check if chat history loads"
echo "5. Try sending a message: '你好'"
echo "6. Verify WebSocket connection in DevTools Network tab"
echo "7. Check if AI response streams back"
echo ""
