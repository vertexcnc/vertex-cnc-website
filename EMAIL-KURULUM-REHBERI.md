# VERTEX CNC E-MAİL SİSTEMİ KURULUM REHBERİ

## 📧 Genel Bakış

Bu rehber, VERTEX CNC web sitesinde "Teklif Al" bölümünün gerçek e-mail gönderim özelliğini aktif hale getirmek için gerekli adımları açıklar.

## 🔧 Mevcut E-mail Entegrasyonları

### 1. SendGrid (Öncelikli)
- **Avantajlar**: Yüksek teslimat oranı, detaylı istatistikler, profesyonel e-mail servisi
- **Kurulum**: SendGrid hesabı açıp API anahtarı almak yeterli
- **Kullanım**: Hem Cloudflare Workers hem de Flask API destekli

### 2. SMTP (Alternatif)
- **Avantajlar**: Mevcut e-mail hesaplarını kullanabilir, ücretsiz
- **Kurulum**: Gmail, Outlook vb. SMTP ayarları gerekli
- **Kullanım**: Sadece Flask API'de destekli

## 🚀 Hızlı Kurulum

### Adım 1: SendGrid Hesabı Oluşturma

1. [SendGrid](https://sendgrid.com) hesabı oluşturun
2. E-mail doğrulaması yapın
3. Settings > API Keys bölümünden yeni API anahtarı oluşturun
4. **Full Access** yetkisi verin
5. API anahtarını güvenli bir yere kaydedin

### Adım 2: Domain Doğrulaması (Önerilen)

1. SendGrid > Settings > Sender Authentication
2. Domain Authentication seçin
3. `vertexcnc.tr` domain'ini ekleyin
4. DNS kayıtlarını ekleyin:
   ```dns
   Type: CNAME
   Host: s1._domainkey
   Value: s1.domainkey.uXXXXXX.wl123.sendgrid.net
   
   Type: CNAME  
   Host: s2._domainkey
   Value: s2.domainkey.uXXXXXX.wl123.sendgrid.net
   ```

### Adım 3: Environment Variables Ayarlama

#### Cloudflare Workers için (.dev.vars):
```bash
# SendGrid
SENDGRID_API_KEY=SG.gerçek_api_anahtarınız_buraya

# E-mail ayarları
FROM_EMAIL=teklifler@vertexcnc.tr
SUPPORT_EMAIL=destek@vertexcnc.tr
NOTIFICATION_EMAIL=bilgi@vertexcnc.tr
```

#### Flask API için (environment variables):
```bash
# SendGrid
SENDGRID_API_KEY=SG.gerçek_api_anahtarınız_buraya

# SMTP Alternatifi (Gmail örneği)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=vertex.cnc.mailer@gmail.com
SMTP_PASSWORD=uygulama_şifreniz_buraya
SMTP_USE_TLS=true

# E-mail ayarları
FROM_EMAIL=teklifler@vertexcnc.tr
SUPPORT_EMAIL=destek@vertexcnc.tr
```

### Adım 4: Production Deployment

#### Cloudflare Workers:
```bash
# Secrets ekle
wrangler secret put SENDGRID_API_KEY
# API anahtarınızı girin

# Deploy
wrangler deploy
```

#### Flask API (VPS/Server):
```bash
# Environment variables ayarla
export SENDGRID_API_KEY="SG.gerçek_api_anahtarınız"
export FROM_EMAIL="teklifler@vertexcnc.tr"
export SUPPORT_EMAIL="destek@vertexcnc.tr"

# Servisi başlat
python api/app.py
```

## 🧪 Test Etme

### Otomatik Test:
```bash
cd /workspaces/vertex-cnc-website
python scripts/test-email-system.py
```

### Manuel Test:
1. Web sitesinde "Teklif Al" formunu doldurun
2. Gerçek e-mail adresinizi kullanın
3. Formu gönderin
4. E-mail kutunuzu kontrol edin

## 📋 E-mail Şablonları

### Müşteri E-maili
- ✅ Teklif talebinin alındığı onayı
- 📋 Sipariş detayları (şirket, proje, adet, vb.)
- 🔗 Kişisel takip linki
- 📎 PDF teklif formu eki
- 📞 İletişim bilgileri

### Destek Ekibi E-maili
- 🚨 Yeni talep bildirimi
- 👤 Müşteri bilgileri
- 📋 Proje detayları
- ⏰ 24 saat yanıt hatırlatması
- 🔗 Admin takip linki

## 🔒 Güvenlik Ayarları

### SPF Kaydı:
```dns
Type: TXT
Host: @
Value: v=spf1 include:sendgrid.net ~all
```

### DKIM Ayarı:
SendGrid domain doğrulaması sırasında otomatik eklenir.

### DMARC Kaydı:
```dns
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@vertexcnc.tr
```

## 🐛 Sorun Giderme

### E-mail Gönderilmiyor
1. **API Anahtarı Kontrolü**: SendGrid dashboard'da API anahtarının aktif olduğunu kontrol edin
2. **Domain Doğrulaması**: Sender Authentication'ın tamamlandığını kontrol edin
3. **Rate Limiting**: SendGrid limitlerinizi kontrol edin
4. **Log Kontrolü**: Console log'larını inceleyin

### E-mail Spam'e Düşüyor
1. **SPF/DKIM/DMARC**: DNS kayıtlarının doğru ayarlandığını kontrol edin
2. **Sender Reputation**: SendGrid reputation score'unuzu kontrol edin
3. **Content Analysis**: E-mail içeriğini spam filtreleri için test edin

### SMTP Hatası (Alternative kullanımda)
1. **Gmail App Password**: 2FA aktifse uygulama şifresi kullanın
2. **Firewall**: SMTP portlarının (587, 465) açık olduğunu kontrol edin
3. **Authentication**: Kullanıcı adı/şifre kombinasyonunu doğrulayın

## 📊 Monitoring ve Analytics

### SendGrid Dashboard:
- E-mail delivery statistikleri
- Bounce/spam reports
- Click/open rates
- API usage metrics

### Application Logs:
```python
# Console log'larında aranacak mesajlar:
"✅ E-mail başarıyla gönderildi"
"❌ E-mail gönderim hatası"
"✅ Müşteri e-maili gönderildi"
"✅ Destek ekibi bilgilendirildi"
```

## 🔄 Backup Plan

E-mail servisi çalışmazsa:
1. **Fallback SMTP**: SendGrid başarısız ise SMTP devreye girer
2. **Manual Notification**: Console log'larından manuel e-mail gönderimi
3. **Database Backup**: Tüm talepler veritabanında saklanır

## 📞 Destek

E-mail sistemi ile ilgili sorunlarda:
1. **Log Dosyaları**: Console ve server log'larını toplayın
2. **Error Messages**: Hata mesajlarını tam olarak kaydedin
3. **Test Results**: Test scriptinin çıktısını paylaşın

## 🎯 Başarı Kriterleri

✅ **Sistem Hazır** olduğunda:
- [ ] SendGrid API anahtarı aktif
- [ ] Domain doğrulaması tamamlanmış
- [ ] Test e-maili başarıyla gönderilmiş
- [ ] Müşteri ve destek e-maili şablonları çalışıyor
- [ ] PDF eki doğru şekilde ekleniyor
- [ ] Takip linkleri aktif

## 🚀 Sonraki Adımlar

1. **E-mail Templates**: SendGrid Dynamic Templates kullanarak daha gelişmiş şablonlar
2. **Automation**: E-mail dizileri ve otomatik takip e-mailleri
3. **Analytics**: Müşteri davranış analizi ve A/B testleri
4. **Integration**: CRM sistemleri ile entegrasyon

---

**Not**: Bu rehber, production ortamında e-mail sisteminin tam olarak çalışması için gerekli tüm adımları içerir. Herhangi bir adımda sorun yaşarsanız, log dosyalarını inceleyin ve gerekirse SMTP fallback sistemini kullanın.
