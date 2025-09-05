# VERTEX CNC - Cloudflare Deployment Guide

## 🚀 Cloudflare Pages ile Frontend Deployment

### 1. Cloudflare Pages Setup

#### Repository Bağlantısı:
1. GitHub'da yeni repository oluşturun: `vertex-cnc-website`
2. Cloudflare Pages'e gidin: https://pages.cloudflare.com
3. "Create a project" > "Connect to Git"
4. Repository'yi seçin

#### Build Settings:
```
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Root directory: (leave empty)
Node.js version: 18.17.0
```

#### Environment Variables:
```
NODE_ENV=production
VITE_API_URL=https://vertex-cnc-production.vertex-cnc.workers.dev
VITE_SITE_URL=https://vertexcnc.tr
```

### 2. Cloudflare Workers ile Backend API

#### Worker Deployment:
```bash
# Wrangler CLI kurulumu (Node.js gerekli)
npm install -g wrangler

# Worker deploy
wrangler deploy src/worker.js --name vertex-cnc-production

# KV namespaces oluşturma
wrangler kv:namespace create "ORDERS_DB"
wrangler kv:namespace create "TRACKING_DB"
```

#### Worker Route Configuration:
```
Routes:
- vertexcnc.tr/api/*
- api.vertexcnc.tr/*

Custom Domains:
- api.vertexcnc.tr (API endpoint)
- vertexcnc.tr (main website)
```

### 3. Domain Configuration

#### DNS Records (Cloudflare):
```
Type: CNAME
Name: vertexcnc.tr
Content: vertex-cnc-website.pages.dev
Proxy: ON (Orange Cloud)

Type: CNAME  
Name: api.vertexcnc.tr
Content: vertex-cnc-production.vertex-cnc.workers.dev
Proxy: ON (Orange Cloud)
```

## 🛠️ Local Development Setup

### Prerequisites:
```bash
# Node.js 18+ kurulumu gerekli
# PNPM kurulumu
npm install -g pnpm

# Dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build
```

### API Development:
```bash
# Worker local development
wrangler dev src/worker.js --local

# KV storage test
wrangler kv:key put --binding=ORDERS_DB "test-key" "test-value"
```

## 📋 Deployment Checklist

### Frontend (Cloudflare Pages):
- [x] Repository GitHub'a push edildi
- [x] Cloudflare Pages proje oluşturuldu
- [x] Build settings yapılandırıldı
- [x] Environment variables eklendi
- [x] Custom domain bağlandı (vertexcnc.tr)

### Backend (Cloudflare Workers):
- [x] Worker kodu hazırlandı (src/worker.js)
- [x] wrangler.toml konfigürasyonu
- [x] KV namespaces tanımlandı
- [x] API routes konfigürasyonu
- [x] Custom domain bağlandı (api.vertexcnc.tr)

### Database (Cloudflare KV):
- [x] ORDERS_DB namespace (sipariş verileri)
- [x] TRACKING_DB namespace (takip numaraları)

## 🔧 Environment Variables

### Production Variables:
```
# Cloudflare Pages
VITE_API_URL=https://api.vertexcnc.tr
VITE_SITE_URL=https://vertexcnc.tr

# Cloudflare Workers
ENVIRONMENT=production
SITE_URL=https://vertexcnc.tr
API_BASE_URL=https://api.vertexcnc.tr
```

## 📈 Monitoring & Analytics

### Cloudflare Analytics:
- Page views tracking
- Performance metrics
- Geographic distribution
- Bot detection

### Worker Analytics:
- API request volumes
- Response times
- Error rates
- Geographic latency

## 🚨 Troubleshooting

### Common Issues:
1. **Build Errors**: Node.js version compatibility
2. **API CORS**: Worker headers configuration
3. **Domain Issues**: DNS propagation (24-48 hours)
4. **KV Storage**: Rate limiting (1000 operations/min)

### Debug Commands:
```bash
# Worker logs
wrangler tail vertex-cnc-production

# KV operations
wrangler kv:key list --binding=ORDERS_DB

# Performance testing
wrangler dev src/worker.js --inspect
```

## 📞 Support

For deployment issues:
- GitHub Issues: Create issue in repository
- Cloudflare Support: Enterprise plan support
- Documentation: https://developers.cloudflare.com

---

**Deploy Date**: 2025-09-03  
**Last Updated**: 2025-09-03  
**Status**: Production Ready ✅
