# VERTEX CNC - Deployment Kılavuzu

Bu belge, VERTEX CNC web sitesinin ve API'sinin Cloudflare üzerinde nasıl deploy edileceğini detaylandırmaktadır.

## Ön Gereksinimler

- Node.js v18.x veya daha yenisi
- PNPM paket yöneticisi
- Cloudflare hesabı
- Git ve GitHub hesabı
- Wrangler CLI (Cloudflare Workers için)

## Adım 1: Cloudflare Hesabı Ayarları

### 1.1 Cloudflare R2 Bucket Oluşturma
1. Cloudflare Dashboard > R2 > Create bucket
2. "vertex-cnc-files" adında bucket oluşturun
3. Public access için yapılandırma ayarlayın

### 1.2 Cloudflare Workers KV Namespaces Oluşturma
1. Cloudflare Dashboard > Workers & Pages > KV
2. İki namespace oluşturun:
   - ORDERS_DB
   - TRACKING_DB
3. Oluşturulan ID'leri wrangler.toml dosyasına ekleyin

## Adım 2: API Deployment (Cloudflare Workers)

```bash
# Bağımlılıkları yükleyin
pnpm install

# KV namespaces oluşturun
npx wrangler kv:namespace create "ORDERS_DB"
npx wrangler kv:namespace create "TRACKING_DB"

# R2 bucket oluşturun
# Önce Cloudflare Dashboard'dan bucket oluşturmanız gerekir

# Wrangler.toml dosyasını düzenleyin
# KV ve R2 ID'lerini güncelleyin

# Worker'ı deploy edin
npx wrangler deploy src/worker.js --name vertex-cnc-api
```

### 2.1 Environment Variables Ayarları

Cloudflare Dashboard > Workers & Pages > vertex-cnc-api > Settings > Variables

```
ENVIRONMENT = production
API_KEY = your-secure-api-key
ADMIN_API_KEY = your-secure-admin-key
SENDGRID_API_KEY = your-sendgrid-api-key
```

## Adım 3: Frontend Deployment (Cloudflare Pages)

### 3.1 GitHub Repo Hazırlığı

```bash
# GitHub reposuna push yapın
git add .
git commit -m "Deployment ready"
git push origin main
```

### 3.2 Cloudflare Pages Ayarları

1. Cloudflare Dashboard > Pages > Create a project
2. GitHub reposunu seçin
3. Build ayarlarını yapın:
   - Framework preset: Vite
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node version: 18.x

### 3.3 Environment Variables

Pages > Settings > Environment variables:

```
VITE_API_URL = https://vertex-cnc-api.[worker-subdomain].workers.dev
VITE_SITE_URL = https://vertexcnc.tr
```

## Adım 4: Domain Ayarları

1. Cloudflare Dashboard > Websites > vertexcnc.tr > DNS
2. Pages için bir CNAME kaydı ekleyin:
   - Type: CNAME
   - Name: @
   - Target: pages.cloudflare.com
   - Proxy status: Proxied

3. API için bir CNAME kaydı ekleyin:
   - Type: CNAME
   - Name: api
   - Target: vertex-cnc-api.[worker-subdomain].workers.dev
   - Proxy status: Proxied

## Adım 5: Email Entegrasyonu

1. SendGrid hesabı oluşturun
2. Domain verification yapın
3. Email şablonu oluşturun
4. API anahtarını alın ve Cloudflare Worker'da yapılandırın

## Sorun Giderme

### API Bağlantı Sorunları
- CORS ayarlarını kontrol edin
- API URL'lerinin doğru olduğundan emin olun
- Environment variable'ların doğru set edildiğini kontrol edin

### Worker Deployment Sorunları
- `wrangler whoami` ile giriş durumunu kontrol edin
- KV ve R2 ID'lerinin doğru olduğunu kontrol edin
- Log kayıtlarını kontrol edin

### Frontend Deployment Sorunları
- Build hatalarını kontrol edin
- Bağımlılık versiyonlarını kontrol edin
- Environment variable'ların doğru set edildiğini kontrol edin

## Güncel Tutma

Yeni bir deploy yapmak için:

```bash
# Backend (Worker) güncellemesi
npx wrangler deploy src/worker.js

# Frontend güncellemesi
# GitHub'a push yaptığınızda otomatik deploy edilecektir
git add .
git commit -m "Update: ..."
git push origin main
```

## Önemli Linkler
- Admin Panel: https://vertexcnc.tr/admin
- API Documentation: https://vertexcnc.tr/api-docs
- Cloudflare Dashboard: https://dash.cloudflare.com
