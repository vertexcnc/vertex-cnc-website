# 📧 VERTEX CNC E-MAİL SİSTEMİ - MERKEZ KONFİGÜRASYONU

## 🎯 Özet
Tüm e-mail trafiği **`destek@vertexcnc.tr`** adresine yönlendirilmiştir.

## ✅ Güncellenmiş Konfigürasyonlar

### 1. Environment Variables (.dev.vars)
```bash
FROM_EMAIL=destek@vertexcnc.tr
SUPPORT_EMAIL=destek@vertexcnc.tr
NOTIFICATION_EMAIL=destek@vertexcnc.tr
```

### 2. Cloudflare Workers (wrangler.toml)
```toml
FROM_EMAIL = "destek@vertexcnc.tr"
SUPPORT_EMAIL = "destek@vertexcnc.tr"
NOTIFICATION_EMAIL = "destek@vertexcnc.tr"
```

### 3. Flask API (api/app.py)
- Tüm e-mail fonksiyonları `destek@vertexcnc.tr` kullanıyor
- Müşteri e-mailleri: `destek@vertexcnc.tr`'den gönderilir
- Destek bildirimleri: `destek@vertexcnc.tr`'ye gönderilir

### 4. Cloudflare Worker (src/worker.js)
- SendGrid entegrasyonu: `destek@vertexcnc.tr`'den gönderim
- Fallback default: `destek@vertexcnc.tr`

## 📬 E-mail Akış Şeması

### Teklif Talebi Geldiğinde:
1. **Müşteriye Gönderilen E-mail:**
   - Gönderen: `destek@vertexcnc.tr`
   - Alıcı: Müşterinin e-mail adresi
   - İçerik: Teklif alındı onayı, takip linki, PDF ek

2. **Destek Ekibine Gönderilen E-mail:**
   - Gönderen: `destek@vertexcnc.tr`
   - Alıcı: `destek@vertexcnc.tr`
   - İçerik: Yeni talep bildirimi, müşteri bilgileri, PDF ek

### Sonuç: 
- ✅ Müşteri: Bilgilendirme e-maili alır
- ✅ Destek Ekibi: Yeni talep bildirimini `destek@vertexcnc.tr`'de görür

## 🔧 Kurulum Gereksinimleri

### SendGrid (Öncelikli)
1. **Geçerli API Anahtarı Gerekli:**
   - Mevcut anahtar: `4VR37VJ8PYTSR69KZFUJ8YRF` (GEÇERSİZ)
   - Yeni anahtar almanız gerekiyor

2. **Domain Doğrulaması:**
   - SendGrid'de `vertexcnc.tr` domain'ini doğrulayın
   - DNS kayıtlarını ekleyin

### SMTP Fallback (Alternatif)
Gmail veya başka SMTP servisi ile yedek sistem:
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=destek@vertexcnc.tr  # Gmail hesabı
SMTP_PASSWORD=uygulama_şifresi     # Gmail App Password
```

## 🚀 Aktif Hale Getirme Adımları

### 1. SendGrid Yöntemi (Önerilen)
```bash
# 1. SendGrid hesabında yeni API key oluşturun
# 2. .dev.vars dosyasını güncelleyin:
SENDGRID_API_KEY=SG.yeni_gecerli_anahtar_buraya

# 3. Production'da secret ekleyin:
wrangler secret put SENDGRID_API_KEY
# Yeni anahtarı girin

# 4. Deploy edin:
wrangler deploy
```

### 2. SMTP Yöntemi (Yedek)
```bash
# Gmail hesabında App Password oluşturun
# .dev.vars dosyasını güncelleyin:
SMTP_USERNAME=destek@vertexcnc.tr
SMTP_PASSWORD=gmail_app_password

# Flask API'yi çalıştırın:
python api/app.py
```

## 📋 Test Etme

### Otomatik Test:
```bash
cd /workspaces/vertex-cnc-website
export $(cat .dev.vars | grep -v '^#' | xargs)
python scripts/test-sendgrid-standalone.py
```

### Manuel Test:
1. Web sitesinde "Teklif Al" formunu doldurun
2. Gerçek e-mail adresinizi kullanın
3. `destek@vertexcnc.tr` kutusunu kontrol edin

## 📊 Beklenen Sonuçlar

### Başarılı Konfigürasyonda:
- ✅ Müşteri: Otomatik onay e-maili alır
- ✅ Destek: `destek@vertexcnc.tr`'de yeni talep bildirimi
- ✅ PDF: Teklif formu otomatik oluşturulur ve eklenir
- ✅ Takip: Müşteri kendine özel takip linki alır

### E-mail İçerikleri:
1. **Müşteri E-maili:**
   - Profesyonel HTML tasarım
   - Şirket logosu ve marka renkleri
   - Sipariş detayları tablosu
   - Kişisel takip linki
   - PDF teklif formu eki

2. **Destek E-maili:**
   - Acil bildirim tasarımı
   - Müşteri bilgileri tablosu
   - Proje detayları
   - 24 saat hatırlatması
   - Aynı PDF eki

## 🔒 Güvenlik

- ✅ Tek e-mail adresi yönetimi kolay
- ✅ Spam filtreleme tek noktadan
- ✅ API anahtarları güvenli saklama
- ✅ Environment variables ile konfigürasyon

## 📞 Sonraki Adımlar

1. **Acil:** Geçerli SendGrid API anahtarı alın
2. **Opsiyonel:** Gmail SMTP kurulumu yapın  
3. **Test:** Sistemi canlı test edin
4. **Monitoring:** E-mail delivery takibi kurun

---
**✅ SONUÇ:** Sistem tamamen `destek@vertexcnc.tr` merkezli çalışacak şekilde konfigüre edilmiştir. Sadece geçerli API anahtarı eklenmesi gerekiyor.
