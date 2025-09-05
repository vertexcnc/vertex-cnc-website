# VERTEX CNC Deployment Script for Windows PowerShell

Write-Host "🚀 VERTEX CNC Deployment Starting..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ PNPM found: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Blue
    npm install -g pnpm
}

Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Building project..." -ForegroundColor Blue
pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📁 Files ready in: dist/" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Setting up Cloudflare Worker..." -ForegroundColor Blue

# Check if wrangler is installed
try {
    $wranglerVersion = npx wrangler --version
    Write-Host "✅ Wrangler found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Wrangler will be installed via npx..." -ForegroundColor Blue
}

Write-Host "🗂️ Creating KV namespaces..." -ForegroundColor Blue
Write-Host "Creating ORDERS_DB namespace..." -ForegroundColor Yellow
npx wrangler kv:namespace create "ORDERS_DB"

Write-Host "Creating TRACKING_DB namespace..." -ForegroundColor Yellow
npx wrangler kv:namespace create "TRACKING_DB"

Write-Host "📤 Deploying Worker..." -ForegroundColor Blue
npx wrangler deploy src/worker.js --name vertex-cnc-production

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Cloudflare Pages: https://pages.cloudflare.com" -ForegroundColor White
Write-Host "2. Connect your GitHub repository" -ForegroundColor White
Write-Host "3. Set build command: pnpm build" -ForegroundColor White
Write-Host "4. Set build output: dist" -ForegroundColor White
Write-Host "5. Add environment variables:" -ForegroundColor White
Write-Host "   - VITE_API_URL=https://vertex-cnc-production.vertex-cnc.workers.dev" -ForegroundColor Gray
Write-Host "   - VITE_SITE_URL=https://vertexcnc.tr" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Your sites will be available at:" -ForegroundColor Cyan
Write-Host "   - Frontend: https://[project-name].pages.dev" -ForegroundColor White
Write-Host "   - API: https://vertex-cnc-production.vertex-cnc.workers.dev" -ForegroundColor White
Write-Host "   - Custom domain: https://vertexcnc.tr" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full documentation: ./CLOUDFLARE-DEPLOYMENT.md" -ForegroundColor Yellow

Read-Host "Press Enter to continue..."
