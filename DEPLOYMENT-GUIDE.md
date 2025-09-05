# VERTEX CNC Web Sitesi - Deployment ve Bakım Kılavuzu

## Proje Yapısı

VERTEX CNC web sitesi projesi, modern web teknolojileriyle geliştirilmiş bir CNC firması web sitesi ve sipariş takip sistemidir.

### Teknoloji Stack'i
- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Cloudflare Workers, KV Storage, R2 Storage
- **Deployment:** Cloudflare Pages, Cloudflare Workers

## 1. Ortam Hazırlığı

### 1.1. Gerekli Araçlar
- Node.js (v18.x veya üzeri)
- PNPM paket yöneticisi
- Git
- Cloudflare hesabı
- Wrangler CLI

### 1.2. Cloudflare Hesabı Kurulumu
1. [Cloudflare](https://dash.cloudflare.com/sign-up) hesabı oluşturun
2. Workers ve Pages servislerini aktif edin
3. API token'ı alın: 
   - Dashboard > My Profile > API Tokens > Create Token
   - "Edit Cloudflare Workers" template seçin

## 2. Lokal Geliştirme Ortamı

### 2.1. Projeyi Klonlama
```bash
git clone https://github.com/vertexcnc/vertex-cnc-website.git
cd vertex-cnc-website
```

### 2.2. Bağımlılıkları Yükleme
```bash
# PNPM yükleyin (yoksa)
npm install -g pnpm

# Proje bağımlılıklarını yükleyin
pnpm install
```

### 2.3. Geliştirme Sunucusunu Başlatma
```bash
# Frontend geliştirme sunucusu
pnpm dev

# Worker geliştirme sunucusu
pnpm dev:worker
```

## 3. Deployment Süreci

### 3.1. Cloudflare Workers Kurulumu

#### KV Namespaces Oluşturma
1. Workers & Pages > KV bölümüne gidin
2. "Create namespace" düğmesini tıklayın
3. İki namespace oluşturun:
   - ORDERS_DB 
   - TRACKING_DB
4. Oluşturulan ID'leri wrangler.toml dosyasına ekleyin

#### R2 Bucket Oluşturma
1. R2 > Create bucket
2. Bucket adı: vertex-cnc-files
3. Public access yapılandırması
4. wrangler.toml dosyasını güncelleyin

#### Worker Deployment
```bash
# Wrangler'a giriş yapın
wrangler login

# Worker'ı deploy edin
wrangler deploy src/worker.js --name vertex-cnc-api
```

### 3.2. Environment Variables

Cloudflare Dashboard > Workers & Pages > vertex-cnc-api > Settings > Variables:

```
ENVIRONMENT = production
API_KEY = <güvenli-api-key>
ADMIN_API_KEY = <güvenli-admin-key>
SENDGRID_API_KEY = <sendgrid-api-key>
```

### 3.3. Frontend Deployment

#### GitHub ile Entegrasyon
1. GitHub'da bir repo oluşturun
2. Cloudflare Pages > Create a project
3. GitHub repo'nuzu seçin
4. Build settings:
   - Framework preset: Vite
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node version: 18.x

#### Environment Variables
Pages > Settings > Environment variables:

```
VITE_API_URL = https://<worker-subdomain>.workers.dev
VITE_SITE_URL = https://vertexcnc.tr
```

### 3.4. Domain Ayarları

1. DNS ayarlarını yapın:
   - Type: CNAME, Name: @, Target: pages.cloudflare.com
   - Type: CNAME, Name: api, Target: <worker-subdomain>.workers.dev
2. SSL/TLS ayarını "Full" olarak yapılandırın

## 4. İlk Defa Deploy

Eğer projeyi ilk defa deploy ediyorsanız, tüm işlemi otomatize eden script'i kullanabilirsiniz:

```bash
# Script'i çalıştırılabilir yapın
chmod +x deploy.sh

# Deploy script'ini çalıştırın
./deploy.sh
```

Script aşağıdaki işlemleri otomatik olarak yapacaktır:
1. Bağımlılıkları kontrol etme ve yükleme
2. Frontend build işlemi
3. KV namespaces oluşturma
4. R2 bucket oluşturma (eğer yoksa)
5. Worker deployment
6. wrangler.toml güncelleme

## 5. Güncelleme ve Bakım

### 5.1. Frontend Güncellemeleri
Frontend değişikliklerinden sonra:

```bash
# Frontend build işlemi
pnpm build

# Eğer Cloudflare Pages ile GitHub entegrasyonu yaptıysanız,
# değişiklikleri GitHub'a push etmek yeterli:
git add .
git commit -m "Frontend güncellemesi"
git push origin main
```

### 5.2. Worker Güncellemeleri
Worker kodunu güncelledikten sonra:

```bash
# Worker'ı tekrar deploy edin
wrangler deploy src/worker.js
```

### 5.3. KV Storage Yönetimi
```bash
# KV namespace içeriğini görüntüleme
wrangler kv:key list --namespace-id=<namespace-id>

# Değer ekleme
wrangler kv:key put --namespace-id=<namespace-id> "key" "value"

# Değer silme
wrangler kv:key delete --namespace-id=<namespace-id> "key"
```

### 5.4. R2 Bucket Yönetimi
```bash
# Dosyaları listeleme
wrangler r2 object list vertex-cnc-files

# Dosya yükleme
wrangler r2 object put vertex-cnc-files/example.jpg --file=./example.jpg

# Dosya silme
wrangler r2 object delete vertex-cnc-files/example.jpg
```

## 6. Admin Panel Kullanımı

Admin panel şu URL'de bulunmaktadır: `https://vertexcnc.tr/admin`

### 6.1. Giriş Yapma
- Admin paneline erişmek için API anahtarını kullanın
- API anahtarı: Cloudflare Workers environment variables'da tanımlanmış ADMIN_API_KEY değeri

### 6.2. Sipariş Yönetimi
- Siparişleri listeleme
- Sipariş detaylarını görüntüleme
- Sipariş durumunu güncelleme
- Müşteriye email gönderme

## 7. Sorun Giderme

### 7.1. Worker Deploy Hataları
- Wrangler oturum açık mı?
  ```bash
  wrangler whoami
  ```
- KV namespace ID'leri doğru mu?
- API anahtarları tanımlı mı?

### 7.2. Frontend Deploy Hataları
- Build işlemi başarılı mı?
- package.json bağımlılıkları güncel mi?
- Cloudflare Pages build logs'u kontrol edin

### 7.3. API Bağlantı Sorunları
- CORS ayarları doğru mu?
- API URL'leri doğru tanımlandı mı?
- Network hatalarını browser developer tools ile kontrol edin

## 8. İletişim ve Destek

Teknik destek için: destek@vertexcnc.tr
Geliştirme ekibi: dev@vertexcnc.tr

## 9. Güvenlik Notları

- API anahtarlarını güvenli bir şekilde yönetin, repo'ya dahil etmeyin
- Düzenli olarak API anahtarlarını ve giriş bilgilerini güncelleyin
- Hassas verileri daima şifreleyerek depolayın
- Rate limiting ayarlarını kontrol edin ve DDoS koruması için Cloudflare ayarlarını optimize edin
