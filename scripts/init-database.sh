#!/bin/bash

# Pine Genie Database Initialization Script
# This script initializes the Neon PostgreSQL database with all required tables and data

set -e

echo "🚀 Initializing Pine Genie Database..."
echo "=================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please copy .env.local.template to .env.local and configure your database credentials."
    exit 1
fi

# Load environment variables
source .env.local

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env.local"
    exit 1
fi

echo "✅ Environment configuration loaded"

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migration failed"
    exit 1
fi

# Seed subscription plans
echo "🌱 Seeding subscription plans..."
npm run db:seed-plans

# Run database health check
echo "🏥 Running database health check..."
npm run db:health

echo ""
echo "🎉 Database initialization completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Access Prisma Studio: npm run db:studio"
echo "   3. View the application at: https://pinegenie.com"
echo ""
echo "🔗 Useful commands:"
echo "   - Database health check: npm run db:health"
echo "   - Reset database: npm run db:reset"
echo "   - View database: npm run db:studio"
echo "   - Seed plans: npm run db:seed-plans"