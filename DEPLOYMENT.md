# VERTEX CNC Web Sitesi - Production Deployment

## Proje Özeti
- **Domain**: vertexcnc.tr (Natro.com hosting)
- **Teknoloji**: React + Vite + Tailwind CSS
- **Backend**: Flask API (Python)
- **Özellikler**: CAD dosya yükleme, PDF oluşturma, sipariş takip, e-posta otomasyonu

## Production Hazırlık Listesi

### 1. Frontend Optimizasyonu
- [x] Build optimizasyonu (Vite)
- [x] Asset compression
- [x] Responsive tasarım testi
- [x] Cross-browser uyumluluk
- [x] SEO meta tags

### 2. Backend Konfigürasyonu
- [x] Flask production settings
- [x] CORS konfigürasyonu
- [x] Error handling
- [x] Logging sistemi
- [x] PDF oluşturma (ReportLab)

### 3. E-posta Sistemi
- [x] SMTP konfigürasyonu
- [x] PDF eki gönderimi
- [x] Template sistemi
- [x] Hata yönetimi

### 4. Güvenlik
- [ ] HTTPS/SSL sertifikası
- [ ] Input validation
- [ ] File upload güvenliği
- [ ] Rate limiting
- [ ] CSRF koruması

### 5. Manus Mail Otomasyon
- [ ] Mail Manus entegrasyonu
- [ ] Tetikleme kuralları
- [ ] Workflow otomasyonu
- [ ] Monitoring ve logging

## Deployment Adımları

### Adım 1: Build Oluşturma
```bash
cd /home/ubuntu/loud-portfolio-template-project
npm run build
```

### Adım 2: Natro.com Hosting Yükleme
- FTP/SFTP ile dosya yükleme
- Domain yönlendirme ayarları
- SSL sertifikası kurulumu

### Adım 3: Backend Deployment
- Python Flask uygulaması kurulumu
- Gerekli paketlerin yüklenmesi
- Environment variables ayarları

### Adım 4: DNS Konfigürasyonu
- A record ayarları
- CNAME kayıtları
- MX records (e-posta için)

### Adım 5: Test ve Monitoring
- Fonksiyonel testler
- Performance testleri
- E-posta gönderim testleri
- Sipariş takip sistemi testleri

## Manus Mail Otomasyon Entegrasyonu

### Mail Manus Özellikleri
- Otomatik e-posta işleme
- Tetikleme tabanlı workflow'lar
- AI destekli e-posta yönetimi
- Gerçek zamanlı monitoring

### Entegrasyon Planı
1. Manus dashboard'da Mail Manus aktivasyonu
2. @manus.bot e-posta adresinin alınması
3. Webhook entegrasyonu
4. Tetikleme kurallarının tanımlanması

### Otomasyon Kuralları
- Teklif talebi geldiğinde → PDF oluştur + e-posta gönder
- Sipariş durumu değiştiğinde → Müşteriye bilgilendirme
- CAD dosyası yüklendiğinde → Otomatik analiz başlat
- Teslimat yaklaştığında → Hatırlatma e-postası

## Monitoring ve Maintenance
- Uptime monitoring
- Error tracking
- Performance metrics
- Backup stratejisi
- Security updates

## İletişim Bilgileri
- **Teknik Destek**: destek@vertexcnc.tr
- **Hosting**: Natro.com
- **Domain**: vertexcnc.tr

