# Deployment Yönergesi

VERTEX CNC web sitesini tamamen çalışır durumda dağıtmak için aşağıdaki adımları izleyin:

## 1. Cloudflare API Token İzinlerini Güncelleme

1. [Cloudflare Dashboard > API Tokens](https://dash.cloudflare.com/profile/api-tokens) sayfasına gidin.
2. "Create Token" butonuna tıklayın veya "VERTEX-CNC-FULL-ACCESS" tokenını düzenleyin.
3. API token izinlerinin aşağıdaki gibi ayarlandığından emin olun:
   - **Account Resources**
     - Account > Account Settings > Read
     - Account > Workers R2 Storage > Edit
     - Account > Workers KV Storage > Edit
     - Account > Workers Scripts > Edit
     - Account > Cloudflare Pages > Edit
   - **User Resources**
     - User > User Details > Read
     - User > Memberships > Read
   - **Zone Resources**
     - Zone > Workers Routes > Edit
     - Zone > DNS > Edit
     - Zone > Zone Settings > Read
     - Zone > Zone > Read
4. "Continue to summary" ve "Create Token" butonlarına tıklayın.
5. Oluşturulan token değerini `.dev.vars` dosyasına ekleyin.

## 2. Worker API Dağıtımı

### Wrangler CLI ile Dağıtım
```bash
# Çevre değişkenlerini ayarla
export CLOUDFLARE_API_TOKEN=your_new_token_value

# Bağımlılıkları yükle
npm install --legacy-peer-deps

# Projeyi build et
npm run build

# Worker API'yi dağıt
npx wrangler deploy src/worker.js
```

### Manuel Dağıtım (Wrangler CLI çalışmazsa)
1. [Cloudflare Dashboard > Workers & Pages](https://dash.cloudflare.com/workers-and-pages) sayfasına gidin.
2. "Create Application" > "Create Worker" seçeneğini tıklayın.
3. Worker adını "vertex-cnc-api" olarak ayarlayın.
4. "Quick Edit" seçeneğini kullanarak `src/worker.js` dosyasını içeriğini editöre yapıştırın.
5. KV ve R2 bağlantılarını ekleyin:
   - KV Namespace 1: ORDERS_DB
   - KV Namespace 2: TRACKING_DB
   - R2 Bucket: FILE_BUCKET (vertex-cnc-files)
6. Çevre değişkenleri ekleyin:
   - SENDGRID_API_KEY
   - API_KEY
   - ADMIN_API_KEY
7. "Save and Deploy" butonuna tıklayın.

## 3. Frontend Dağıtımı

Frontend dağıtımı GitHub ile otomatik olarak çalışıyor. Herhangi bir değişikliği GitHub'a push ettiğinizde, Cloudflare Pages otomatik olarak yeni bir dağıtım başlatacaktır.

Cloudflare Pages ayarlarını kontrol edin:
1. [Cloudflare Dashboard > Pages](https://dash.cloudflare.com/pages) sayfasına gidin.
2. "vertex-cnc-website1" projesini tıklayın.
3. "Settings" sekmesinde aşağıdaki ayarları kontrol edin:
   - Build settings:
     - Framework preset: None
     - Build command: `npm install --legacy-peer-deps && npm run build`
     - Build output directory: `/dist`
   - Environment variables:
     - VITE_API_URL: `https://vertex-cnc-api.vertexcnc.workers.dev`

## 4. Deployment Testi

Worker API dağıtıldıktan sonra aşağıdaki testleri yapın:

1. API sağlık kontrolü:
```bash
curl https://vertex-cnc-api.vertexcnc.workers.dev/health
```

2. Frontend sayfasını tarayıcıda açın:
```
https://vertex-cnc-website1.pages.dev
```

3. Teklif formunu test edin.
4. Sipariş takip sistemini test edin.

## 5. Sorun Giderme

Worker API dağıtımında sorun yaşarsanız:
1. API token izinlerini tekrar kontrol edin.
2. Wrangler CLI çalışmazsa manuel dağıtım yöntemini deneyin.
3. KV ve R2 namespace ve bucket'ların doğru şekilde oluşturulduğundan emin olun.

Frontend dağıtımında sorun yaşarsanız:
1. Cloudflare Pages build loglarını kontrol edin.
2. Çevre değişkenlerinin doğru ayarlandığından emin olun.
3. Manuel olarak yeniden dağıtımı tetikleyin.

## 6. Başarılı Deployment Sonrası

Hem Worker API hem de frontend başarıyla dağıtıldığında:
1. Custom domain ayarlarını yapılandırın (isteğe bağlı).
2. DNS ayarlarını yapılandırın.
3. SSL sertifikalarını kontrol edin.
4. Analytics ve izleme araçlarını ayarlayın.

---

Bu yönergeleri izleyerek VERTEX CNC web sitesini tam işlevsel olarak dağıtabilirsiniz. Herhangi bir sorunla karşılaşırsanız, Cloudflare belgelerine başvurun veya daha fazla yardım için destek ekibimizle iletişime geçin.
