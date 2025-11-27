#!/bin/bash
echo "🛑 Stopping Snatchbase..."
pkill -f "uvicorn app.main:app"
pkill -f "launcher.file_watcher_service"
pkill -f "vite"
echo "✅ All services stopped"
