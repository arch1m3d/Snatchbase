#!/bin/bash

echo "🚀 Starting Snatchbase Intelligence Platform"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/app/main.py" ]; then
    print_error "Please run this script from the Snatchbase root directory"
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d "backend/data" ]; then
    print_status "Creating data directory..."
    mkdir -p backend/data
fi

# Check if we have JSON data files
json_files=$(find backend/data -name "*.json" 2>/dev/null | wc -l)
if [ "$json_files" -eq 0 ]; then
    print_warning "No JSON data files found in backend/data/"
    print_status "Place your stealer log JSON files in backend/data/ for auto-ingestion"
fi

# Setup backend
print_status "Setting up backend environment..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
print_status "Installing backend dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration..."
    cp .env.example .env
fi

# Start backend server in background
print_status "Starting backend server..."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
print_status "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend server started successfully on http://localhost:8000"
    print_status "API Documentation: http://localhost:8000/docs"
else
    print_error "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Setup frontend
cd ../frontend

print_status "Setting up frontend environment..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating frontend environment configuration..."
    cp .env.example .env
fi

# Start frontend server in background
print_status "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
print_status "Waiting for frontend to initialize..."
sleep 3

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend server started successfully on http://localhost:3000"
else
    print_warning "Frontend server may still be starting..."
fi

# Show final status
echo ""
print_success "🎉 Snatchbase is now running!"
echo ""
echo "📊 Services:"
echo "   • Backend API: http://localhost:8000"
echo "   • Frontend:    http://localhost:3000"
echo "   • API Docs:    http://localhost:8000/docs"
echo ""
echo "💡 Features:"
echo "   • Auto-ingestion of JSON files from backend/data/"
echo "   • Duplicate prevention (files won't be imported twice)"
echo "   • Real-time search across stealer log data"
echo "   • Analytics and visualization dashboard"
echo ""
echo "🛑 To stop all services, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
print_status "Monitoring services (press Ctrl+C to stop)..."
wait
