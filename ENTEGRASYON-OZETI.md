# VERTEX CNC Entegrasyon Özeti

## Mevcut Durum

VERTEX CNC projesi şu anda aşağıdaki bileşenlerle yapılandırılmıştır:

### 1. Frontend (Cloudflare Pages)
- **Proje Adı**: vertex-cnc-website1
- **Repository**: vertexcnc/vertex-cnc-website
- **Build Komutu**: npm install --legacy-peer-deps && npm run build
- **Output Directory**: dist
- **URL**: https://vertex-cnc-website1.pages.dev

### 2. Backend (Cloudflare Workers)
- **Worker Adı**: vertex-cnc-api
- **Yapılandırma Dosyası**: wrangler.toml
- **Ana Dosya**: src/worker.js
- **URL**: https://vertex-cnc-api.vertexcnc.workers.dev (deploy sonrası)

### 3. Depolama
- **KV Namespaces**:
  - ORDERS_DB
  - TRACKING_DB
- **R2 Bucket**:
  - FILE_BUCKET (vertex-cnc-files)

### 4. Kimlik Doğrulama
- API_KEY: vertex-api-key-123456
- ADMIN_API_KEY: vertex-admin-key-789012

### 5. Email Entegrasyonu
- **Servis**: SendGrid
- **API Key**: [GIZLI]
- **Gönderici**: teklifler@vertexcnc.tr
- **Alıcı**: destek@vertexcnc.tr

## API Endpoints

Worker API'niz aşağıdaki endpoints'leri sağlar:

- **GET /health**: API sağlık kontrolü
- **POST /api/send-quote-email**: Teklif formu gönderimi
- **GET /api/track-order/{trackingId}**: Sipariş durumu sorgulama
- **GET /api/orders**: Admin için sipariş listesi
- **PUT /api/orders**: Sipariş durumu güncelleme
- **POST /api/upload-file**: Dosya yükleme
- **GET /api/files/{fileKey}**: Dosya indirme
- **POST /webhook/email**: Email webhook
- **POST /webhook/manus**: Manus AI webhook

## Çevre Değişkenleri

Cloudflare Pages projenizde aşağıdaki çevre değişkenleri yapılandırılmıştır:

- **ADMIN_API_KEY**: (gizli)
- **API_KEY**: (gizli)
- **API_URL**: vertex-cnc-website1.pages.dev
- **CLOUD_API_KEY**: (gizli)
- **NODE_ENV**: production
- **NPM_TOKEN**: (gizli)
- **SENDGRID_API_KEY**: (gizli)
- **TO_EMAIL**: destek@vertexcnc.tr
- **VITE_SITE_URL**: https://vertexcnc.tr
- **formspree_API_Key**: (gizli)

## API Tokens

Cloudflare'da çeşitli API token'ları oluşturulmuştur:

1. **VERTEX-CNC-FULL-ACCESS**: Worker API dağıtımı için tam yetkili token
2. **VERTEX CNC Deployment Token**: Deployment için özel token
3. **Vertex CNC Pages API**: Pages yapılandırması için token
4. Çeşitli build token'ları

## Sonraki Adımlar

### 1. Worker API Dağıtımı
[WORKER-DEPLOYMENT-GUIDE.md](./WORKER-DEPLOYMENT-GUIDE.md) dosyasındaki adımları takip ederek Worker API'yi dağıtın.

### 2. Frontend Güncellemeleri
[FRONTEND-DEPLOYMENT-GUIDE.md](./FRONTEND-DEPLOYMENT-GUIDE.md) dosyasındaki adımları takip ederek frontend'i güncelleyebilirsiniz.

### 3. GitHub Entegrasyonu
[GITHUB-CLOUDFLARE-ENTEGRASYONU.md](./GITHUB-CLOUDFLARE-ENTEGRASYONU.md) dosyasındaki adımları takip ederek GitHub entegrasyonunu tamamlayın.

### 4. DNS Yapılandırması
- vertexcnc.tr domain'ini Cloudflare Pages'e yönlendirin
- api.vertexcnc.tr subdomain'ini Worker API'ye yönlendirin

### 5. Test ve İzleme
- Teklif formunu test edin
- Sipariş takip sistemini test edin
- Email bildirimlerini kontrol edin
- Analytics ve logları izleyin

## Önemli URL'ler

- **Frontend**: https://vertex-cnc-website1.pages.dev
- **Worker API**: https://vertex-cnc-api.vertexcnc.workers.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Repository**: https://github.com/vertexcnc/vertex-cnc-website

## Teknik Destek

Teknik sorunlar için bu belgelere başvurabilir veya aşağıdaki kaynaklara göz atabilirsiniz:

- [Cloudflare Workers Dokümanları](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Dokümanları](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Dokümanları](https://developers.cloudflare.com/workers/wrangler/)
