# Cloudflare API Token Çözüm Rehberi

Cloudflare API token ile Worker dağıtımı yaparken karşılaşılan sorunun çözümü için bu rehberi kullanabilirsiniz.

## Sorunun Tanımı

Worker API dağıtımı yaparken aşağıdaki hata mesajı alınıyor:
```
A request to the Cloudflare API (/memberships) failed.
Authentication error [code: 10000]
```

Bu hata genellikle API token'ının eksik izinlerden kaynaklanır.

## API Token İzinlerini Güncelleme

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) adresine gidin.

2. Mevcut tokenlarınızı görüntüleyin veya yeni bir token oluşturun.

3. "VERTEX-CNC-FULL-ACCESS" token'ınızı düzenleyin veya yeni bir token oluşturun.

4. Token'a aşağıdaki izinleri ekleyin:
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

5. İzin kapsamını "All accounts" ve "All zones" olarak ayarlayın.

6. Token'ı kaydedin ve kopyalayın.

## Token'ı Kullanma

Token'ı oluşturduktan sonra, `.dev.vars` dosyasını güncelleyin:

```
CLOUDFLARE_API_TOKEN=yeni_token_değeri
SENDGRID_API_KEY=...
API_KEY=...
ADMIN_API_KEY=...
NPM_TOKEN=...
```

Ardından, terminal oturumunuzda token'ı çevre değişkeni olarak ayarlayın:

```bash
export CLOUDFLARE_API_TOKEN=yeni_token_değeri
```

Ve Worker dağıtımını yeniden deneyin:

```bash
npx wrangler deploy src/worker.js
```

## Alternatif Çözüm: Cloudflare Dashboard Kullanımı

API token sorunları devam ederse, Cloudflare Dashboard üzerinden manuel dağıtım yapabilirsiniz:

1. Cloudflare Dashboard > Workers & Pages bölümüne gidin.
2. "Create Application" > "Create Worker" seçeneğini seçin.
3. Yeni bir Worker oluşturun veya var olan Worker'ı düzenleyin.
4. "Quick Edit" seçeneğini kullanarak `worker.js` dosyanızın içeriğini kopyalayıp yapıştırın.
5. KV ve R2 bağlantılarını manuel olarak ekleyin.
6. "Save and Deploy" butonuna tıklayın.

## Hata Ayıklama

Daha fazla hata ayıklama bilgisi için:

```bash
WRANGLER_LOG=debug npx wrangler deploy src/worker.js
```

Bu komut, daha ayrıntılı hata mesajları sağlayacaktır.

---

Bu adımları takip ederek token sorununu çözebilir ve Worker API'nizi başarıyla dağıtabilirsiniz.
