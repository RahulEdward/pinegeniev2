# Pine Genie Database Initialization Script (PowerShell)
# This script initializes the Neon PostgreSQL database with all required tables and data

Write-Host "🚀 Initializing Pine Genie Database..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.local.template to .env.local and configure your database credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment configuration found" -ForegroundColor Green

# Install dependencies if needed
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Blue
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
    exit 1
}

# Seed subscription plans
Write-Host "🌱 Seeding subscription plans..." -ForegroundColor Blue
npm run db:seed-plans

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: Seeding may have failed, but continuing..." -ForegroundColor Yellow
}

# Run database health check
Write-Host "🏥 Running database health check..." -ForegroundColor Blue
npm run db:health

Write-Host ""
Write-Host "🎉 Database initialization completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "   2. Access Prisma Studio: npm run db:studio" -ForegroundColor White
Write-Host "   3. View the application at: https://pinegenie.com" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "   - Database health check: npm run db:health" -ForegroundColor White
Write-Host "   - Reset database: npm run db:reset" -ForegroundColor White
Write-Host "   - View database: npm run db:studio" -ForegroundColor White
Write-Host "   - Seed plans: npm run db:seed-plans" -ForegroundColor White