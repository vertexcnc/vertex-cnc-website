# Cloudflare API Token Sorunlarını Giderme Rehberi

Bu rehber, GitHub Actions ile Cloudflare Pages ve Workers deployment sırasında karşılaşılan API token sorunlarını çözmenize yardımcı olacaktır.

## 1. Karşılaşılan Sorunlar

### Kimlik Doğrulama Hatası (403)
```
API returned: {"success":false,"errors":[{"code":10000,"message":"Authentication error"}]}
```

### Wrangler Login Hatası
```
✘ [ERROR] Unknown arguments: api-token, apiToken
```

## 2. Sorunların Çözümü

### Doğru API Token Oluşturma

Mevcut Cloudflare API tokenlarınızda sorun varsa, şu adımları izleyerek yeni bir token oluşturun:

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) sayfasına gidin
2. "Create Token" butonuna tıklayın
3. "Create Custom Token" seçeneğini seçin
4. Token'a anlamlı bir isim verin (örn. "GitHub Deployment Token")
5. İzinleri şu şekilde ayarlayın:
   - `Account` > `Cloudflare Pages` > `Edit`
   - `Account` > `Worker Scripts` > `Edit`
   - `Account` > `Account Settings` > `Read`
   - `Zone` > `Zone` > `Read`
   - `Zone` > `Zone Settings` > `Read`
6. "Continue to Summary" ve ardından "Create Token" butonlarına tıklayın
7. Oluşturulan token'ı güvenli bir yere kaydedin

### API Token'ı Test Etme

Yeni token'ı aşağıdaki curl komutuyla test edin:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json"
```

Başarılı bir yanıt:
```json
{
  "result": {
    "id": "your-token-id",
    "status": "active"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

### GitHub Actions Secrets Güncelleme

1. [GitHub repository](https://github.com/vertexcnc/vertex-cnc-website) > Settings > Secrets and variables > Actions
2. `CLOUDFLARE_API_TOKEN` secret'ını düzenleyin ve yeni token değerini girin
3. Diğer secret'ların doğru olduğundan emin olun:
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare hesap ID'niz)
   - `CLOUDFLARE_ZONE_ID` (Alan adı zone ID'niz)

## 3. Wrangler Sorunlarını Çözme

### Güncel Wrangler Sürüm Hatalarını Düzeltme

Yeni Wrangler sürümleri (2.0+), API token girişi için farklı bir yöntem kullanır:

1. GitHub workflow dosyasını şu şekilde düzenleyin:
   ```yaml
   - name: Deploy Worker
     run: |
       cd worker
       npx wrangler deploy
     env:
       CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
   ```

2. Eski `wrangler login` komutunu kullanmak yerine, ortam değişkenleri aracılığıyla token'ı iletin.

3. Eğer `wrangler.toml` dosyanız varsa, şunları doğrulayın:
   - account_id değerinin doğru olduğunu kontrol edin
   - name değerinin doğru olduğunu kontrol edin

## 4. Doğrulama ve Test

Değişiklikleri yaptıktan sonra:

1. Küçük bir değişiklik yaparak repository'nize bir commit push edin
2. GitHub Actions sekmesinden workflow çalışmasını izleyin
3. Herhangi bir hata olup olmadığını kontrol edin
4. Deploymentın başarılı olduğunu doğrulayın

## 5. Ek İpuçları

- **Yetkiler**: Token'ınızın doğru kaynaklara (account ve zone) erişim izni olduğundan emin olun
- **Proje Adı**: Cloudflare Pages projesi adının GitHub workflow dosyasında belirtilen ad ile aynı olduğunu kontrol edin
- **Sürümler**: Wrangler ve actions paketlerinin güncel sürümlerini kullandığınızdan emin olun
- **Ortam Değişkenleri**: Wrangler ile ilgili sorunlarda, `.env` dosyası yerine doğrudan ortam değişkenlerini kullanmayı deneyin
