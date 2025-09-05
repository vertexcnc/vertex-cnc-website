# 📧 VERTEX CNC - Email Entegrasyonu Kurulum Rehberi

## Sorun: Teklif formundan gelen PDF'ler destek@vertexcnc.tr adresine gelmiyor

### ✅ Yapılan Düzeltmeler:
1. **Email Gönderim Fonksiyonu Eklendi**: Worker'a gerçek email gönderim kodu eklendi
2. **HTML Email Template**: Güzel görünümlü email şablonu oluşturuldu
3. **PDF Ek Desteği**: Dosya eklerinin listesi email'de gösteriliyor

## 🔧 Cloudflare Email Routing Kurulumu

### 1. Cloudflare Dashboard'da Email Routing Aktifleştirme

1. **https://dash.cloudflare.com/** adresine gidin
2. **vertexcnc.tr** domain'inizi seçin
3. Sol menüden **"Email"** → **"Email Routing"** seçin
4. **"Enable Email Routing"** butonuna tıklayın

### 2. Email Adreslerini Yapılandırma

**Destination Addresses (Hedef Adresler):**
```
destek@vertexcnc.tr → [Gerçek email adresiniz]
noreply@vertexcnc.tr → [Gerçek email adresiniz]
```

**Routing Rules (Yönlendirme Kuralları):**
```
destek@vertexcnc.tr → Forward to: [gmail/outlook adresiniz]
noreply@vertexcnc.tr → Drop (veya forward)
```

### 3. DNS Kayıtları (Otomatik Oluşturulacak)

Cloudflare otomatik olarak şu DNS kayıtlarını oluşturacak:
```
MX vertexcnc.tr → route.mx.cloudflare.net
TXT vertexcnc.tr → v=spf1 include:_spf.mx.cloudflare.net ~all
```

### 4. Email Workers Binding (İsteğe Bağlı)

`wrangler.toml` dosyasına email worker binding eklendi:
```toml
[durable_objects]
bindings = [
  { name = "EMAIL_PROCESSOR", class_name = "EmailProcessor" }
]
```

## 🚀 Test Etme

### 1. Email Routing Test:
```bash
# Test email gönder
echo "Test message" | mail -s "Test Subject" destek@vertexcnc.tr
```

### 2. Form Test:
1. **https://vertexcnc.tr** sitesinde teklif formunu doldurun
2. PDF dosyası ekleyin
3. Formu gönderin
4. **destek@vertexcnc.tr** email'inizde email olup olmadığını kontrol edin

### 3. Worker Logs:
```bash
npx wrangler tail vertex-cnc
```

## 📧 Email Template Özellikleri

Yeni email template'i şunları içeriyor:
- ✅ **Müşteri Bilgileri**: İsim, email, telefon, şirket
- ✅ **Proje Detayları**: Hizmet türü, malzeme, adet, mesaj
- ✅ **Dosya Ekleri**: PDF ve diğer dosyaların listesi
- ✅ **HTML Format**: Güzel görünümlü tasarım
- ✅ **Tarih/Saat**: Türkçe format
- ✅ **Mobile Responsive**: Tüm cihazlarda uyumlu

## 🔧 Sorun Giderme

### Email Gelmiyor İse:

1. **Cloudflare Email Routing**: Aktif mi kontrol edin
2. **DNS Propagation**: 24 saat bekleyin
3. **Worker Logs**: Hata mesajları var mı bakın
4. **Spam Folder**: Spam klasörünü kontrol edin
5. **Email Forwarding**: Doğru adrese yönlendiriliyor mu?

### Worker Error Logs:
```bash
# Real-time logs
npx wrangler tail vertex-cnc --format=pretty

# Specific time range
npx wrangler tail vertex-cnc --since=1h
```

### Email Service Alternatives:

Cloudflare Email Routing çalışmıyorsa, alternative servisler:

1. **SendGrid**: API key ile email gönderimi
2. **Mailgun**: SMTP/API email service
3. **Amazon SES**: AWS email service
4. **Resend**: Modern email API

## 📋 Kontrol Listesi

Email çalışması için:
- [ ] Cloudflare Email Routing aktif
- [ ] DNS kayıtları doğru
- [ ] Email forwarding yapılandırıldı
- [ ] Worker deployed
- [ ] Form test edildi
- [ ] Email geldi mi kontrol edildi

## 🔄 Sonraki Adımlar

1. **Email Routing Setup**: Cloudflare'de aktifleştirin
2. **Test Email**: Form ile test gönderin
3. **PDF Attachment**: Dosya eki test edin
4. **Production Deploy**: Worker'ı deploy edin

---

## 📞 Acil Çözüm

Eğer hala email gelmiyorsa, geçici çözüm olarak:
1. Form verilerini KV storage'a kaydet
2. Manual olarak email'leri kontrol et
3. External email service kullan (SendGrid vb.)
