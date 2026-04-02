#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Starting Backend API Server..."
cd backend
node server.js &
BACKEND_PID=$!

echo "Starting Frontend React App..."
cd ../frontend
npm run dev -- --open &
FRONTEND_PID=$!

echo "Smart Life Optimizer is now running!"
echo "Backend PID: $BACKEND_PID (Port 5001)"
echo "Frontend PID: $FRONTEND_PID (Port 5173)"
echo "Press Ctrl+C to shut down both servers."

# Wait for process termination to cleanly kill children
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM EXIT
wait
