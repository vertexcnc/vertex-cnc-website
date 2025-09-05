# Worker API ve GitHub Pages Entegrasyonu

## 1. Worker API'yi Doğrudan Dağıtma

Mevcut Cloudflare API token'ınız ile Worker API'yi doğrudan dağıtabilirsiniz:

```bash
export CLOUDFLARE_API_TOKEN=CBrhj9CfyoYjdf90pH-zJfp2i4igciJLsxvRBBlN
cd /workspaces/vertex-cnc-website
npm run build
npx wrangler deploy src/worker.js
```

## 2. API URL'yi Belirleme

Worker başarıyla dağıtıldıktan sonra, konsol çıktısında Worker URL'nizi göreceksiniz. Genellikle şu formattadır:
```
https://vertex-cnc-api.vertexcnc.workers.dev
```

Bu URL'yi Pages projenizde VITE_API_URL çevre değişkeni olarak kullanmanız gerekmektedir.

## 3. Pages Projesi ile Entegrasyon

1. Cloudflare Pages Dashboard > vertex-cnc-website1 > Settings > Environment variables bölümüne gidin
2. VITE_API_URL değerini Worker URL'niz ile güncelleyin:
   ```
   VITE_API_URL=https://vertex-cnc-api.vertexcnc.workers.dev
   ```
3. "Save" butonuna tıklayın

## 4. Yeni Bir Dağıtımı Tetikleme

1. "Deployments" sekmesine gidin
2. "Trigger deploy" butonuna tıklayın
3. "Deploy latest commit" seçeneğini seçin

## 5. Entegrasyonu Test Etme

1. Dağıtım tamamlandıktan sonra, verilen URL'den sitenize erişin:
   ```
   https://vertex-cnc-website1.pages.dev
   ```
2. Sipariş takip formunu ve teklif formunu test edin
3. API çağrılarının Worker'ınıza başarıyla ulaştığından emin olun

## 6. Hata Ayıklama

Herhangi bir sorunla karşılaşırsanız:

1. Worker loglarını kontrol edin:
   ```bash
   npx wrangler tail vertex-cnc-api
   ```
2. Pages dağıtım loglarını Cloudflare Dashboard'dan inceleyin
3. Tarayıcı geliştirici araçlarındaki konsol çıktılarını kontrol edin

---

Bu adımları takip ederek Worker API'nizi doğrudan dağıtıp, mevcut Cloudflare Pages projenizle entegrasyonu tamamlayabilirsiniz.
