# VERTEX CNC Güncel Deployment Rehberi

Bu belge, VERTEX CNC web sitesi ve API'si için güncellenmiş deployment adımlarını içerir. Wrangler v2 yapılandırması ve güncel güvenlik önlemleri dahil edilmiştir.

## Ön Gereksinimler

- Node.js 18+ yüklü olmalıdır
- Cloudflare hesabı
- Wrangler CLI (devDependencies içinde bulunmaktadır, ayrıca kurulum gerekmez)

## Deployment Adımları

### 1. NPM Token Yapılandırması

NPM token'ınızı aşağıdaki komut ile çevre değişkeni olarak ayarlayın:

```bash
export NPM_TOKEN=YOUR_NPM_TOKEN
```

Veya `~/.npmrc` dosyasına ekleyin:

```
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN
```

### 2. Cloudflare'a Giriş Yapma

```bash
npx wrangler login
```

### 3. Kaynak Kodları İndirme ve Bağımlılıkları Yükleme

```bash
# Repo klonlama (gerekirse)
git clone https://github.com/your-username/vertex-cnc-website.git
cd vertex-cnc-website

# Bağımlılıkları yükleme
npm install
# veya
pnpm install
```

### 4. Cloudflare Kaynaklarını Oluşturma

KV namespaces ve R2 buckets oluşturmak için aşağıdaki komutları kullanabilirsiniz:

```bash
# KV Namespaces
npx wrangler kv:namespace create ORDERS_DB
npx wrangler kv:namespace create TRACKING_DB

# R2 Buckets
npx wrangler r2 bucket create vertex-cnc-files
npx wrangler r2 bucket create vertex-cnc-files-dev
```

Oluşturulan kaynakların ID'lerini wrangler.toml dosyasına ekleyin.

### 5. Çevresel Değişkenleri Ayarlama

wrangler.toml dosyasına gerekli çevresel değişkenleri ekleyin:

```toml
[vars]
ENVIRONMENT = "production"
SENDGRID_API_KEY = "your-sendgrid-api-key"
API_KEY = "your-vertex-api-key"
ADMIN_API_KEY = "your-vertex-admin-key"
```

### 6. Deployment Script Çalıştırma

```bash
chmod +x deploy.sh
./deploy.sh
```

Bu script aşağıdaki işlemleri otomatik olarak gerçekleştirecektir:
- Bağımlılıkların yüklenmesi
- Projenin derlenmesi
- KV ve R2 kaynakların oluşturulması (mevcut değilse)
- Worker API'nin deploy edilmesi
- wrangler.toml'un güncellenmesi

### 7. Cloudflare Pages Yapılandırma

Cloudflare Pages Dashboard'dan:

1. GitHub reposunu bağlayın
2. Build komutunu ayarlayın: `pnpm build`
3. Build çıktı dizinini ayarlayın: `dist`
4. Aşağıdaki çevresel değişkenleri ekleyin:
   - `VITE_API_URL=https://vertex-cnc-api.[worker-subdomain].workers.dev`
   - `VITE_SITE_URL=https://vertexcnc.tr`

### 8. Custom Domain Yapılandırma

Cloudflare Pages dashboard'dan:
1. Custom Domains sekmesine gidin
2. "Set up a custom domain" butonuna tıklayın
3. Alan adınızı girin ve talimatları izleyin

## Sorun Giderme

### Worker API Sorunları

Worker API'niz çalışmıyorsa:

1. `npx wrangler dev` komutu ile yerel olarak test edin
2. Wrangler.toml dosyasındaki KV ve R2 ID'lerinin doğru olduğundan emin olun
3. Cloudflare Dashboard'dan worker'ın durumunu kontrol edin

### Pages Derleme Sorunları

Cloudflare Pages derleme hatası verirse:

1. Build komutunun doğru olduğundan emin olun (`pnpm build`)
2. Pages Dashboard'da build loglarını kontrol edin
3. Gerekli çevresel değişkenlerin tanımlandığından emin olun

## Bakım ve Güncelleme

### Güvenlik Güncellemeleri

Düzenli olarak bağımlılıkları güncelleyin:

```bash
npm audit
npm audit fix
```

### Wrangler Güncellemeleri

Wrangler'ı güncel tutun:

```bash
npm update wrangler
```

## İletişim ve Destek

Teknik sorunlar için: [destek@vertexcnc.tr](mailto:destek@vertexcnc.tr)
