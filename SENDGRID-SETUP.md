# 🔑 SendGrid API Key Kurulumu

## API Key: 4VR37VJ8PYTSR69KZFUJ8YRF

### Cloudflare'de Environment Variable Ekleme:

1. **https://dash.cloudflare.com/** adresine gidin
2. **Workers & Pages** seçin
3. **vertex-cnc** projenizi bulun ve tıklayın
4. **Settings** tab'ına tıklayın
5. **Environment variables** bölümüne gidin
6. **Add variable** butonuna tıklayın

### Variable Bilgileri:
```
Variable name: SENDGRID_API_KEY
Value: 4VR37VJ8PYTSR69KZFUJ8YRF
Environment: Production
Encrypt: ✓ (checkbox'ı işaretleyin)
```

7. **Save** butonuna tıklayın

### 2. Deployment Tetikleme:

API key eklendikten sonra otomatik deployment başlayacak.

### 3. Test Etme:

1. **https://vertexcnc.tr** adresine gidin
2. Teklif formunu doldurun:
   - İsim: Test User
   - Email: test@example.com
   - Mesaj: Bu bir test mesajıdır
3. PDF dosyası ekleyin (isteğe bağlı)
4. **Teklif Al** butonuna tıklayın

### 4. Email Kontrolü:

- destek@vertexcnc.tr email adresinizi kontrol edin
- Spam klasörünü de kontrol etmeyi unutmayın

### 5. Çalışma Durumu Kontrolü:

Worker logs ile email gönderimi kontrol edilebilir:

```bash
npx wrangler tail vertex-cnc --format=pretty
```

## ✅ Başarı Mesajları:

Worker'da şu log'ları göreceksiniz:
- "Email sent successfully via SendGrid"
- "Quote email sent successfully to destek@vertexcnc.tr"

## ⚠️ Sorun Giderme:

Eğer email gelmezse:
1. API key doğru mu kontrol edin
2. SendGrid hesabınız active mi?
3. Worker logs'da hata var mı?
4. Email spam'de mi?

---

## 📧 Email Template Önizleme:

Gönderilecek email şu şekilde görünecek:

**Konu**: Yeni Teklif Talebi - [Müşteri İsmi]

**İçerik**:
- Müşteri bilgileri (isim, email, telefon, şirket)
- Proje detayları (hizmet türü, malzeme, adet)
- Mesaj içeriği
- Ekli dosyalar listesi
- Tarih/saat bilgisi

Profesyonel HTML formatında, mobil uyumlu tasarım.
