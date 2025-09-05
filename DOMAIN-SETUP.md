# 🌐 VERTEX CNC - Custom Domain Setup Guide

## Cloudflare Pages Domain Entegrasyonu

### 📋 Gerekli Bilgiler:
- **Hedef Domain**: `vertexcnc.tr`
- **Mevcut Pages URL**: `vertex-cnc-website.pages.dev` (veya benzeri)
- **Cloudflare Account**: Mevcut hesabınız

### 🔧 Adım Adım Setup:

## 1. Cloudflare Dashboard'a Giriş
1. https://dash.cloudflare.com/ adresine gidin
2. Hesabınıza giriş yapın

## 2. Pages Projesi Bulun
1. Sol menüden **"Pages"** seçin
2. **"vertex-cnc"** projenizi bulun ve tıklayın

## 3. Custom Domain Ekleme
1. Proje sayfasında **"Custom domains"** tab'ına tıklayın
2. **"Set up a custom domain"** butonuna tıklayın
3. Domain adını girin: `vertexcnc.tr`

## 4. DNS Kayıtları Ayarlama

### A. Eğer Domain Cloudflare'de Hosted İse:
DNS kayıtları otomatik olarak oluşturulacak.

### B. Eğer Domain Başka Yerde Hosted İse:
Aşağıdaki DNS kayıtlarını domain sağlayıcınızda ekleyin:

```
Type: CNAME
Name: vertexcnc.tr (veya @)
Value: [Cloudflare tarafından verilen CNAME değeri]
```

## 5. SSL Sertifikası
- Cloudflare otomatik olarak SSL sertifikası sağlayacak
- 24 saat içinde aktif olacak

## 6. Worker Routes Güncelleme

Aşağıdaki route'ları ekleyin:
- `vertexcnc.tr/api/*` → Worker API
- `api.vertexcnc.tr/*` → Worker API (alt domain)

## 7. Environment Variables Güncelleme

```toml
[vars]
ENVIRONMENT = "production"
SITE_URL = "https://vertexcnc.tr"
API_BASE_URL = "https://vertexcnc.tr/api"
```

## 🚀 Domain Test Etme

Domain aktif olduktan sonra test edin:
1. `https://vertexcnc.tr` → Ana sayfa
2. `https://vertexcnc.tr/api/health` → Worker API test

## 📞 Sorun Çözme

### Yaygın Sorunlar:
1. **DNS Propagation**: 24-48 saat sürebilir
2. **SSL Sertifikası**: Cloudflare'de "Flexible" SSL seçin
3. **Worker Routes**: API route'larının doğru ayarlandığından emin olun

### DNS Test:
```bash
nslookup vertexcnc.tr
```

## 🔄 Otomatik Deployment

Domain aktif olduktan sonra:
- GitHub'a her push otomatik deployment tetikleyecek
- Hem frontend hem Worker API güncellenecek
- `https://vertexcnc.tr` adresinde yayınlanacak

## ⚙️ İleri Seviye Ayarlar

### Subdomain Ekleme (İsteğe Bağlı):
- `api.vertexcnc.tr` → Worker API
- `admin.vertexcnc.tr` → Admin panel (gelecek)

### Cache Ayarları:
- Static assets: 1 year cache
- API responses: No cache
- HTML: 1 hour cache

## 🏁 Final Kontrol Listesi

- [ ] Cloudflare Pages'de custom domain eklendi
- [ ] DNS kayıtları yapılandırıldı
- [ ] SSL sertifikası aktif
- [ ] Worker routes ayarlandı
- [ ] Environment variables güncellendi
- [ ] Domain test edildi
- [ ] Otomatik deployment test edildi

---

## 📧 Sonraki Adım: Email Entegrasyonu

Domain aktif olduktan sonra email entegrasyonu için:
1. Email routing setup
2. Contact form email delivery
3. Order notification emails
