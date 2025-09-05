# VERTEX CNC - Natro Deployment Rehberi

## 🎯 Hedef
vertexcnc.tr domainine VERTEX CNC web sitesini yüklemek ve tam otomatik sipariş sistemi kurmak.

## 📋 Gerekli Bilgiler
- **Domain**: vertexcnc.tr
- **Hosting**: Natro.com
- **E-posta**: destek@vertexcnc.tr
- **Web Sitesi**: React + Flask backend

## 🔧 Adım 1: Natro Paneline Giriş

### Panel Erişimi
1. **Ana Sayfa**: https://www.natro.com/
2. **Giriş Butonu**: Sağ üstteki "Giriş Yap" butonuna tıklayın
3. **Alternatif URL'ler**:
   - https://cpanel.natro.com/
   - https://my.natro.com/
   - https://client.natro.com/

### Giriş Bilgileri
- Kullanıcı adı veya e-posta adresiniz
- Natro hesap şifreniz

## 📁 Adım 2: Dosya Yükleme (FTP/File Manager)

### Yüklenecek Dosyalar
```
/public_html/
├── index.html
├── assets/
│   ├── index-CzfmcnrV.js
│   ├── index-tpd-AJIb.css
│   ├── vertex-logo-new-CxXHVGtb.png
│   ├── cnc-5axis-machining-TednU9zn.webp
│   ├── cnc-precision-parts-BZWaJLNX.jpg
│   ├── cnc-5axis-machine-DttDTaMV.jpg
│   ├── cnc-aerospace-Ht4yrTj0.webp
│   ├── cnc-turning-operations-A6XS-wEr.webp
│   └── cnc-turning-fuo9owh0.jpg
└── api/
    ├── app.py
    ├── orders_db.json
    └── requirements.txt
```

### File Manager Kullanımı
1. **cPanel'e girin** → File Manager
2. **public_html klasörünü** açın
3. **Mevcut dosyaları silin** (index.html, vb.)
4. **Yeni dosyaları yükleyin** (Upload butonunu kullanın)
5. **Dosya izinlerini kontrol edin** (644 for files, 755 for folders)

### FTP Kullanımı
```bash
FTP Sunucu: ftp.vertexcnc.tr
Kullanıcı: vertexcnc.tr kullanıcı adınız
Şifre: cPanel şifreniz
Port: 21 (veya 22 for SFTP)
```

## 🌐 Adım 3: DNS Ayarları

### A Record Ayarları
```
Tip: A
Host: @
Değer: [Natro sunucu IP adresi]
TTL: 14400
```

### CNAME Ayarları
```
Tip: CNAME
Host: www
Değer: vertexcnc.tr
TTL: 14400
```

### MX Records (E-posta için)
```
Tip: MX
Host: @
Değer: mail.vertexcnc.tr
Öncelik: 10
TTL: 14400
```

## 📧 Adım 4: E-posta Hesabı Oluşturma

### destek@vertexcnc.tr Hesabı
1. **cPanel** → **Email Accounts**
2. **Create** butonuna tıklayın
3. **Username**: destek
4. **Domain**: vertexcnc.tr
5. **Password**: Güçlü bir şifre belirleyin
6. **Mailbox Quota**: 1000 MB (veya Unlimited)

### SMTP Ayarları
```
SMTP Server: mail.vertexcnc.tr
Port: 587 (TLS) veya 465 (SSL)
Username: destek@vertexcnc.tr
Password: [belirlediğiniz şifre]
Encryption: TLS/SSL
```

## 🔒 Adım 5: SSL Sertifikası

### Let's Encrypt SSL (Ücretsiz)
1. **cPanel** → **SSL/TLS**
2. **Let's Encrypt** bölümüne gidin
3. **vertexcnc.tr** ve **www.vertexcnc.tr** seçin
4. **Issue** butonuna tıklayın
5. **Force HTTPS Redirect** aktif edin

### SSL Doğrulama
- https://vertexcnc.tr adresini test edin
- Yeşil kilit simgesini kontrol edin

## 🐍 Adım 6: Python/Flask Backend Kurulumu

### Python Sürümü Kontrolü
1. **cPanel** → **Python App**
2. **Create Application** tıklayın
3. **Python Version**: 3.8+ seçin
4. **Application Root**: /api
5. **Application URL**: vertexcnc.tr/api

### Gerekli Paketler
```bash
pip install flask flask-cors reportlab
```

### Environment Variables
```
FLASK_ENV=production
FLASK_APP=app.py
SMTP_SERVER=mail.vertexcnc.tr
SMTP_PORT=587
SMTP_USERNAME=destek@vertexcnc.tr
SMTP_PASSWORD=[e-posta şifresi]
```

## 🧪 Adım 7: Test ve Doğrulama

### Frontend Testi
- [ ] https://vertexcnc.tr ana sayfa yükleniyor
- [ ] Logo ve görseller görünüyor
- [ ] Responsive tasarım çalışıyor
- [ ] Tüm bölümler düzgün görünüyor

### Backend API Testi
- [ ] https://vertexcnc.tr/api/health endpoint'i çalışıyor
- [ ] Teklif formu gönderimi çalışıyor
- [ ] PDF oluşturma çalışıyor
- [ ] E-posta gönderimi çalışıyor

### E-posta Sistemi Testi
- [ ] destek@vertexcnc.tr hesabı çalışıyor
- [ ] SMTP gönderim çalışıyor
- [ ] PDF ekleri gönderiliyor
- [ ] Türkçe karakterler düzgün görünüyor

### Sipariş Takip Testi
- [ ] Takip paneli çalışıyor
- [ ] Demo siparişler görünüyor
- [ ] Arama fonksiyonu çalışıyor
- [ ] Kişisel takip linkleri çalışıyor

## 🚀 Adım 8: Canlıya Alma

### Son Kontroller
1. **Tüm URL'leri test edin**
2. **Mobil uyumluluğu kontrol edin**
3. **Form gönderimlerini test edin**
4. **E-posta alımını doğrulayın**
5. **SSL sertifikasını kontrol edin**

### Monitoring Kurulumu
- Google Analytics (opsiyonel)
- Uptime monitoring
- Error tracking
- Performance monitoring

## 📞 Destek Bilgileri

### Natro Destek
- **Telefon**: 0212 213 1 213
- **E-posta**: destek@natro.com
- **Canlı Destek**: Natro panelinden

### Teknik Destek
- **VERTEX CNC**: destek@vertexcnc.tr
- **Acil Durum**: +90 531 521 89 81

## 🔧 Sorun Giderme

### Yaygın Sorunlar
1. **Site açılmıyor**: DNS propagation bekleyin (24-48 saat)
2. **SSL hatası**: Let's Encrypt yeniden deneyin
3. **E-posta gönderilmiyor**: SMTP ayarlarını kontrol edin
4. **Python hatası**: Paket kurulumlarını kontrol edin

### Log Dosyaları
- **cPanel Error Logs**: Hata mesajları için
- **Python App Logs**: Backend hataları için
- **Email Logs**: E-posta gönderim logları için

## ✅ Deployment Checklist

- [ ] Natro paneline giriş yapıldı
- [ ] Dosyalar public_html'e yüklendi
- [ ] DNS ayarları yapıldı
- [ ] E-posta hesabı oluşturuldu
- [ ] SSL sertifikası kuruldu
- [ ] Python backend kuruldu
- [ ] Tüm testler başarılı
- [ ] Site canlıya alındı
- [ ] Monitoring aktif

## 🎉 Tamamlandı!

VERTEX CNC web sitesi artık https://vertexcnc.tr adresinde canlı!

### Özellikler
✅ Profesyonel tasarım
✅ CAD dosya yükleme
✅ PDF teklif oluşturma
✅ E-posta otomasyonu
✅ Sipariş takip sistemi
✅ Responsive tasarım
✅ SSL güvenliği
✅ Türkçe dil desteği

