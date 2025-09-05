# Cloudflare Workers Configuration for Vertex CNC

## Domains & Routes
### Production Domain:
- **Custom Domain**: vertexcnc.tr
- **Workers.dev**: web.vertexcnc-tr.workers.dev
- **Preview URLs**: *-web.vertexcnc-tr.workers.dev

### Route Patterns:
```
vertexcnc.tr/*
*.vertexcnc.tr/*
web.vertexcnc-tr.workers.dev/*
```

## Variables and Secrets
### Environment Variables:
```
NODE_ENV=production
SITE_URL=https://vertexcnc.tr
API_BASE_URL=https://api.vertexcnc.tr
CLOUDFLARE_ACCOUNT_ID=790a29c826b78918ad79c4f3e9dac2cc
CLOUDFLARE_ZONE_ID=ac59bcba451f212de66aef49fb66fc75
```

### Secrets (Encrypted):
```
CLOUDFLARE_API_TOKEN=_i-qaYgeFJ47azFXW-JfH3bs8KcNRmdAF4_QvUnX
DATABASE_CONNECTION_STRING=<encrypted>
EMAIL_API_KEY=<encrypted>
```

## Trigger Events
### HTTP Requests:
- **Route**: `vertexcnc.tr/*`
- **Methods**: GET, POST, PUT, DELETE

### Scheduled Events (Cron):
```javascript
// Her gün 02:00'da backup
"0 2 * * *"

// Her saat başı health check
"0 * * * *"

// Haftalık raporlar (Pazartesi 09:00)
"0 9 * * 1"
```

### Custom Events:
- Form submissions
- Quote requests
- Production tracking updates
- AI bot triggers

## Worker Functions
### Main Functions:
1. **Static Site Serving**: dist klasöründen dosya servisi
2. **API Proxy**: Backend API istekleri
3. **Form Handling**: Teklif ve iletişim formları
4. **Cache Management**: Statik içerik cache'i
5. **Security Headers**: Güvenlik başlıkları

### Example Worker Code:
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Static files from dist
    if (url.pathname.startsWith('/assets/')) {
      return handleStaticAssets(request);
    }
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // Main site
    return handleMainSite(request);
  }
}
```
