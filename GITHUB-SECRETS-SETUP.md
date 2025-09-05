# GitHub Secrets Kurulum Rehberi

Bu rehber, Cloudflare ve GitHub arasında tam otomasyonu sağlamak için gerekli GitHub Secrets değerlerinin nasıl ekleneceğini açıklar.

## GitHub Secrets Nasıl Eklenir

1. GitHub'da repository'nize gidin: `https://github.com/vertexcnc/vertex-cnc-website`
2. "Settings" sekmesine tıklayın
3. Sol menüden "Secrets and variables" altında "Actions" seçeneğine tıklayın
4. "New repository secret" butonuna tıklayın
5. Aşağıdaki secrets'ları ekleyin:

### Cloudflare Secrets

| Secret Name | Nasıl Alınır |
|-------------|--------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard > User Profile > API Tokens > Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard > Ana sayfa > Sağ üst köşedeki hesap adınız altında Account ID |
| `CLOUDFLARE_ZONE_ID` | Cloudflare Dashboard > Domain seçin > Overview sayfasında Zone ID |

### GitHub Secrets

| Secret Name | Nasıl Alınır |
|-------------|--------------|
| `GITHUB_TOKEN` | GitHub > Settings > Developer settings > Personal access tokens > Generate new token |

## API Token Yetkileri

### Cloudflare API Token İçin Gerekli İzinler:
- Account: Account Settings (Read)
- Zone: Zone Settings (Read)
- Zone: Zone (Read)
- Account: Pages (Write)

### GitHub Token İçin Gerekli İzinler:
- repo (Full control)
- workflow (Workflow control)

## Doğrulama

Secrets'ları ekledikten sonra, bir commit push ederek GitHub Actions workflow'unun çalışıp çalışmadığını test edebilirsiniz. Eğer sorun olmazsa, her push işleminde Cloudflare Pages'a otomatik deploy gerçekleşecektir.
