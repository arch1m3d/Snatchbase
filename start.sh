#!/bin/bash
# Snatchbase - Simple Start Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Snatchbase"
echo ""

# Setup backend
echo "📦 Backend setup..."
cd backend

if [ ! -d "venv" ]; then
    echo "  Creating venv..."
    python3 -m venv venv
fi

source venv/bin/activate

if ! python -c "import fastapi" 2>/dev/null; then
    echo "  Installing dependencies..."
    pip install -q -r requirements.txt
fi

if [ ! -f "snatchbase.db" ]; then
    echo "  Setting up database..."
    ./setup_db.sh
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "  Starting API on :8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

cd ..

# Setup frontend
echo "📦 Frontend setup..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

echo "  Starting dev server on :3000..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Snatchbase is running!"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

# Trap exit
trap 'echo ""; echo "Stopping..."; kill $API_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM

wait
