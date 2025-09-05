# Worker API Deployment Rehberi

Cloudflare dashboard'unuzdan aldığımız bilgilere göre "VERTEX-CNC-FULL-ACCESS" adlı bir API token'ınız bulunuyor ve bu token, Worker API'yi dağıtmak için gereken tüm izinlere sahip.

## 1. Worker API'yi Dağıtmak İçin Adımlar

### Token'ı `.dev.vars` Dosyasına Ekleyin

1. `.dev.vars` dosyasını açın:
```bash
nano .dev.vars
```

2. CLOUDFLARE_API_TOKEN değerini VERTEX-CNC-FULL-ACCESS token değeri ile değiştirin:
```plaintext
CLOUDFLARE_API_TOKEN=YOUR_VERTEX_CNC_FULL_ACCESS_TOKEN_VALUE
SENDGRID_API_KEY=4VR37VJ8PYTSR69KZFUJ8YRF
API_KEY=vertex-api-key-123456
ADMIN_API_KEY=vertex-admin-key-789012
NPM_TOKEN=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
```

### Worker API'yi Dağıtın

3. Token'ı çevre değişkeni olarak ayarlayın:
```bash
export CLOUDFLARE_API_TOKEN=YOUR_VERTEX_CNC_FULL_ACCESS_TOKEN_VALUE
```

4. Projeyi build edin:
```bash
npm run build
```

5. Worker'ı dağıtın:
```bash
npx wrangler deploy src/worker.js
```

## 2. Cloudflare Pages Entegrasyonu

Cloudflare Pages'de "vertex-cnc-website1" projeniz zaten yapılandırılmış durumda. Eğer çevre değişkenlerini güncellemek isterseniz:

1. Cloudflare Dashboard > Pages > vertex-cnc-website1 > Settings > Environment variables bölümüne gidin
2. API_URL değişkenini Worker'ınızın URL'si ile güncelleyin:
```
API_URL=https://vertex-cnc-api.vertexcnc.workers.dev
```

## 3. Token Bilgileri

Listenizde birkaç farklı token bulunuyor ve VERTEX-CNC-FULL-ACCESS adlı token, Worker API'yi dağıtmak için gerekli tüm izinlere sahip:

- Account.Cloudflare Pages
- Account.Workers R2 Storage
- Account.Workers KV Storage
- Account.Workers Scripts
- Account.Account Settings
- User.User Details
- Zone.Zone Settings
- Zone.Zone
- Zone.Workers Routes
- Zone.DNS

## 4. Başarılı Dağıtım Sonrası

Başarılı bir dağıtımdan sonra, Worker URL'niz şu formatta olacaktır:
```
https://vertex-cnc-api.vertexcnc.workers.dev
```

Bu URL'yi Cloudflare Pages projenizdeki `API_URL` ve `VITE_API_URL` çevre değişkenlerinde kullanabilirsiniz.

## 5. Sorun Giderme

Eğer dağıtım işlemi başarısız olursa:

1. Token izinlerini kontrol edin
2. Worker.js dosyasında hata olup olmadığını kontrol edin
3. Wrangler yapılandırmasını kontrol edin

Worker dağıtımını test etmek için:
```bash
curl https://vertex-cnc-api.vertexcnc.workers.dev/health
```

Çıktı şu şekilde olmalıdır:
```json
{"success":true,"data":{"status":"ok","service":"vertex-cnc-api"},"error":null,"timestamp":"2025-09-05T17:30:00.000Z"}
```
