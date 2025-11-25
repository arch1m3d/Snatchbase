#!/bin/bash
# Simple working start script for Snatchbase

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Snatchbase..."
echo ""

# ============================================
# Backend Setup & Start
# ============================================
echo "📦 Setting up backend..."

cd backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -q -r requirements.txt
fi

# Setup database if needed
if [ ! -f "snatchbase.db" ]; then
    echo "Setting up database..."
    ./setup_db.sh
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from example..."
    cp .env.example .env
fi

# Start backend API in background
echo "Starting backend API on port 8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start file watcher in background (optional)
echo "Starting file watcher..."
python -m launcher.file_watcher_service > ../logs/file_watcher.log 2>&1 &
WATCHER_PID=$!
echo "✅ File watcher started (PID: $WATCHER_PID)"

cd ..

# ============================================
# Frontend Setup & Start
# ============================================
echo ""
echo "📦 Setting up frontend..."

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start frontend in background
echo "Starting frontend on port 3000..."
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

cd ..

# ============================================
# Done
# ============================================
echo ""
echo "✨ Snatchbase is running!"
echo ""
echo "📊 Access:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "📁 Drop ZIP files here: backend/data/incoming/uploads/"
echo ""
echo "🛑 To stop all services:"
echo "  kill $BACKEND_PID $FRONTEND_PID $WATCHER_PID"
echo ""
echo "📝 Logs are in: ./logs/"
echo ""

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Snatchbase..."
pkill -f "uvicorn app.main:app"
pkill -f "launcher.file_watcher_service"
pkill -f "vite"
echo "✅ All services stopped"
EOF
chmod +x stop.sh

echo "💡 Tip: Run ./stop.sh to stop all services"
echo ""

# Keep script running and tail logs
echo "Press Ctrl+C to stop all services"
echo "==================== LOGS ===================="

# Trap Ctrl+C to kill all processes
trap "echo ''; echo '🛑 Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $WATCHER_PID 2>/dev/null; exit 0" INT

# Wait for processes
wait
