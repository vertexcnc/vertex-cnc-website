# 🚀 VERTEX CNC - MANUAL DEPLOYMENT İnstructions

## ✅ HAZIRLİK TAMAMLANDI!

Projeniz Cloudflare deploy'ına hazır durumda. İşte yapılacaklar:

### 📂 Hazır Dosyalar:
- ✅ `dist/` klasörü - Production build dosyaları
- ✅ `src/worker.js` - Cloudflare Worker API
- ✅ `wrangler.toml` - Worker konfigürasyonu
- ✅ Tüm bağımlılıklar çözüldü

---

## 🌐 CLOUDFLARE PAGES DEPLOYMENT

### 1. Cloudflare Dashboard'a Gidin:
🔗 **https://dash.cloudflare.com**

### 2. Pages Bölümü:
- Sol menüde **"Workers & Pages"** tıklayın
- **"Create"** butonuna tıklayın
- **"Pages"** seçin
- **"Upload assets"** seçin

### 3. Dosya Yükleme:
- `dist` klasörünün **içindeki tüm dosyaları** seçin
- **KLASÖRÜ DEĞİL, İÇERİĞİNİ** yükleyin:
  - `index.html`
  - `favicon.ico`
  - `assets` klasörü
- **"Deploy site"** butonuna tıklayın

### 4. Site Ayarları:
- **Site name**: `vertex-cnc-website`
- **Production domain**: Otomatik oluşacak
- **Custom domain**: Daha sonra `vertexcnc.tr` ekleyebilirsiniz

---

## ⚡ CLOUDFLARE WORKER DEPLOYMENT

### 1. Worker Oluşturma:
- **Workers & Pages** > **"Create"** > **"Worker"**
- **Name**: `vertex-cnc-production`

### 2. Kod Yükleme:
- `src/worker.js` dosyasını açın
- Tüm kodu kopyalayın
- Worker editörüne yapıştırın
- **"Save and Deploy"** butonuna tıklayın

### 3. KV Storage Oluşturma:
- **Storage** > **"KV"** 
- **"Create namespace"**:
  - `ORDERS_DB`
  - `TRACKING_DB`

### 4. Worker'a KV Bağlama:
- Worker ayarlarında **"Settings"** > **"Variables"**
- **"KV Namespace Bindings"** bölümünde:
  - Variable name: `ORDERS_DB` → KV namespace: `ORDERS_DB`
  - Variable name: `TRACKING_DB` → KV namespace: `TRACKING_DB`

---

## 🔗 DOMAIN BAĞLANTISI

### 1. Worker Routes:
- Worker ayarlarında **"Triggers"** sekmesi
- **"Add route"**:
  - Route: `*.vertex-cnc-website.pages.dev/api/*`
  - Worker: `vertex-cnc-production`

### 2. Custom Domain (İsteğe bağlı):
- **DNS** bölümünde domain ekleyin
- **Pages** ayarlarında custom domain bağlayın

---

## 🧪 TEST URLs

Deploy sonrası test edebileceğiniz linkler:

### Frontend:
```
https://vertex-cnc-website.pages.dev
```

### API Endpoints:
```
https://vertex-cnc-production.vertex-cnc.workers.dev/health
https://vertex-cnc-production.vertex-cnc.workers.dev/api/send-quote-email
```

### Quote Form Test:
1. Ana sayfada **"Teklif Al"** bölümüne gidin
2. Formu doldurun ve gönderin
3. Sipariş numarası alacaksınız

### Tracking Test:
1. **"Sipariş Takip"** bölümüne gidin
2. Aldığınız takip numarasını girin
3. Sipariş durumunu görüntüleyin

---

## 📊 BEKLENEN SONUÇ

### ✅ Çalışacak Özellikler:
- Responsive web sitesi
- Teklif formu (sipariş numarası oluşturma)
- Sipariş takip sistemi
- API backend (KV database ile)
- CORS headers (frontend-backend iletişimi)

### 🔄 Otomatik İşlemler:
- Teklif gönderimi → Sipariş numarası oluşturma
- Takip ID'si ile veri sorgulama
- KV database'de veri saklama
- Error handling

---

## 🚨 TROUBLESHOOTING

### Worker Çalışmıyorsa:
1. KV bindings kontrol edin
2. CORS headers aktif mi kontrol edin
3. API endpoints'lerin doğru olduğunu kontrol edin

### Frontend-Backend Bağlantısı:
- Worker URL'ini frontend'e environment variable olarak ekleyin
- Console'da API çağrı hatalarını kontrol edin

### Performance:
- Cloudflare Analytics'te traffic kontrol edin
- Worker metrics'te API response times kontrol edin

---

## 📞 DEPLOYMENT DURUMU

**Status**: ✅ MANUEL DEPLOY READY  
**Files**: ✅ PREPARED  
**Configuration**: ✅ COMPLETE  
**Time to Deploy**: 15-20 minutes  

### Next Action:
1. Cloudflare Dashboard'a gidin
2. Pages ile frontend deploy edin
3. Worker ile backend deploy edin
4. Test edin ve enjoy! 🎉

---

**Deploy Link**: https://dash.cloudflare.com  
**Documentation**: CLOUDFLARE-DEPLOYMENT.md

---

## ÇERÇEVE HAZIR AYARI

Projeniz için Vite çerçevesi kullanılıyor. İşte ayarlar:

### Vite Ayarları:
- **Çerçeve hazır ayarı**: Vite
- **Oluştur komutu**: npm run build
- **Çıktı dizini oluştur**: dist
- **Kök dizin**: (boş bırakın)

---

## ENV DEĞİŞKENLERİ AYARLARI

Projeniz için gerekli olan environment değişkenleri:

### Değişkenler:
- `VITE_API_URL`: API URL'si
- `VITE_SITE_URL`: Site URL'si
- `NODE_ENV`: Node ortamı

### Örnek Değerler:
```
Variable name: VITE_API_URL
Value: https://vertex-cnc-production.vertex-cnc.workers.dev

Variable name: VITE_SITE_URL  
Value: https://vertexcnc.pages.dev

Variable name: NODE_ENV
Value: production
```
