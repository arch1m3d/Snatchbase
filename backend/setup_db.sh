#!/bin/bash
# PostgreSQL Database Setup Script for Snatchbase

echo "🔧 Setting up PostgreSQL for Snatchbase..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install it first:"
    echo "   brew install postgresql@15"
    exit 1
fi

# Start PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
brew services start postgresql@15

# Wait a moment for service to start
sleep 3

# Create database and user
echo "📦 Creating database and user..."
psql postgres <<EOF
-- Create database
CREATE DATABASE snatchbase;

-- Create user with password
CREATE USER snatchbase_user WITH PASSWORD 'snatchbase2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE snatchbase TO snatchbase_user;

-- For PostgreSQL 15+, also grant schema privileges
\c snatchbase
GRANT ALL ON SCHEMA public TO snatchbase_user;

-- Exit
\q
EOF

echo "✅ Database setup complete!"
echo ""
echo "📝 Your database credentials:"
echo "   Database: snatchbase"
echo "   User: snatchbase_user"
echo "   Password: snatchbase2024"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection string:"
echo "   DATABASE_URL=postgresql://snatchbase_user:snatchbase2024@localhost:5432/snatchbase"
echo ""
echo "💡 Next steps:"
echo "   1. Update your .env file with the connection string above"
echo "   2. Run: python -m uvicorn app.main:app --reload"
