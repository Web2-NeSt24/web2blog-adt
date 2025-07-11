#!/bin/bash

echo "Starting web2blog application..."

# Start backend in background
echo "Starting backend..."
python manage.py runserver &
BACKEND_PID=$!

# Wait a moment for backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Both services are starting..."
echo "Frontend will be available at http://localhost:5173"
echo "Backend will be available at http://localhost:8000"
echo "Press Ctrl+C to stop both services"

# Function to cleanup processes when script is interrupted
cleanup() {
    echo "Stopping services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to catch Ctrl+C
trap cleanup INT

# Wait for user interrupt
wait