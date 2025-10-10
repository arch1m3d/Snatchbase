#!/bin/bash

echo "🚀 Starting Snatchbase Intelligence Platform"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/app/main.py" ]; then
    echo "❌ Error: Please run this script from the Snatchbase root directory"
    exit 1
fi

# Create data/incoming/uploads directory if it doesn't exist
mkdir -p backend/data/incoming/uploads

# Start backend
print_status "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to initialize
sleep 2

# Show info
echo ""
print_success "Snatchbase is running!"
echo ""
echo "📊 Access Points:"
echo "   • Frontend:    http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs:    http://localhost:8000/docs"
echo ""
echo "📦 Auto-Ingestion:"
echo "   • Drop unencrypted ZIP files into: backend/data/incoming/uploads/"
echo "   • Backend automatically detects and processes them"
echo "   • View results in the web interface"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✓ All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep running
wait
