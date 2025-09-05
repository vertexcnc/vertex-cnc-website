#!/bin/bash
# VERTEX CNC Deployment Script

echo "🚀 VERTEX CNC Deployment Starting..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Download: https://nodejs.org/"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📥 Installing dependencies..."
# Set NPM token if available
if [ -n "$NPM_TOKEN" ]; then
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
    echo "✅ NPM token set"
fi
pnpm install

echo "🏗️ Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Files ready in: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🔧 Setting up Cloudflare Worker..."

# No need to globally install Wrangler, we'll use npx
echo "📦 Using Wrangler from devDependencies..."

# Check wrangler login status
echo "Checking Cloudflare login status..."
npx wrangler whoami || (echo "Please login to Cloudflare:" && npx wrangler login)

echo "🗂️ Creating KV namespaces..."
echo "Creating ORDERS_DB namespace..."
npx wrangler kv:namespace create "ORDERS_DB"

echo "Creating TRACKING_DB namespace..."
npx wrangler kv:namespace create "TRACKING_DB"

echo "📤 Deploying Worker..."
npx wrangler deploy

# Create R2 bucket if it doesn't exist
echo "🪣 Setting up R2 bucket..."
BUCKET_EXISTS=$(npx wrangler r2 bucket list | grep -c "vertex-cnc-files")
if [ "$BUCKET_EXISTS" -eq 0 ]; then
    echo "Creating R2 bucket: vertex-cnc-files"
    npx wrangler r2 bucket create vertex-cnc-files
    echo "Creating R2 bucket: vertex-cnc-files-dev (preview)"
    npx wrangler r2 bucket create vertex-cnc-files-dev
else
    echo "R2 bucket already exists"
fi

# Update wrangler.toml with the new KV namespace IDs
echo "⚙️ Updating wrangler.toml with KV namespace IDs..."
ORDERS_DB_ID=$(npx wrangler kv:namespace list | grep ORDERS_DB | awk '{print $1}')
TRACKING_DB_ID=$(npx wrangler kv:namespace list | grep TRACKING_DB | awk '{print $1}')

if [ ! -z "$ORDERS_DB_ID" ] && [ ! -z "$TRACKING_DB_ID" ]; then
    # Create a backup of wrangler.toml
    cp wrangler.toml wrangler.toml.bak
    
    # Update the KV namespace IDs in wrangler.toml
    sed -i "s/ORDERS_DB.*id.*=.*/ORDERS_DB\", id = \"$ORDERS_DB_ID\" },/" wrangler.toml
    sed -i "s/TRACKING_DB.*id.*=.*/TRACKING_DB\", id = \"$TRACKING_DB_ID\" },/" wrangler.toml
    
    echo "✅ Updated wrangler.toml with new KV namespace IDs"
else
    echo "⚠️ Could not find KV namespace IDs"
fi

echo "🔄 Deploying Worker with updated config..."
npx wrangler deploy

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Cloudflare Pages: https://pages.cloudflare.com"
echo "2. Connect your GitHub repository"
echo "3. Set build command: pnpm build"
echo "4. Set build output: dist"
echo "5. Add environment variables:"
echo "   - VITE_API_URL=https://vertex-cnc-api.[worker-subdomain].workers.dev"
echo "   - VITE_SITE_URL=https://vertexcnc.tr"
echo ""
echo "🌐 Your sites will be available at:"
echo "   - Frontend: https://[project-name].pages.dev"
echo "   - API: https://vertex-cnc-api.[worker-subdomain].workers.dev"
echo "   - Custom domain: https://vertexcnc.tr"
echo ""
echo "📚 Full documentation: ./DEPLOY-GUIDE.md"
