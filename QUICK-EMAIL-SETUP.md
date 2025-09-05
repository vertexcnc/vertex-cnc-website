# 🚀 Hızlı Email Çözümü - 5 Dakikada Kurulum

## Seçenek 1: SendGrid (ÜCRETSİZ - 100 email/gün)

### 1. SendGrid Hesabı Oluşturun:
1. https://sendgrid.com/free/ adresine gidin
2. **"Start for free"** tıklayın
3. Hesap oluşturun (email verification gerekli)

### 2. API Key Alın:
1. Dashboard → **Settings** → **API Keys**
2. **"Create API Key"** tıklayın
3. **"Restricted Access"** seçin
4. **Mail Send** → **Full Access** verin
5. API key'i kopyalayın (sadece 1 kez gösterilir!)

### 3. Cloudflare'de API Key Ekleyin:
1. https://dash.cloudflare.com/ → **Workers & Pages**
2. **vertex-cnc** projenizi seçin
3. **Settings** → **Environment variables**
4. **Add variable**:
   - Name: `SENDGRID_API_KEY`
   - Value: `SG.your_copied_api_key`
   - **Encrypt** seçin

### 4. Deploy ve Test:
```bash
git add .
git commit -m "Add SendGrid email service"
git push origin main
```

## Seçenek 2: Resend (ÜCRETSİZ - 3000 email/ay)

### 1. Resend Hesabı:
1. https://resend.com/ → **Sign up**
2. Email verification
3. **API Keys** → **Create API Key**

### 2. API Key Ekle:
- Name: `RESEND_API_KEY`
- Value: `re_your_api_key`

## Seçenek 3: Mailgun (ÜCRETSİZ - 100 email/gün)

### 1. Mailgun Hesabı:
1. https://www.mailgun.com/ → **Sign up**
2. Domain verification gerekli

### 2. API Keys:
- `MAILGUN_API_KEY`: API key
- `MAILGUN_DOMAIN`: sandbox domain

## 🎯 Hangi Servisi Seçmeliyim?

### SendGrid ✅ (ÖNERİLEN)
- ✅ Hızlı kurulum (5 dakika)
- ✅ Domain verification gerekmez
- ✅ Anında çalışır
- ✅ 100 email/gün yeterli

### Resend ✅ (MODERN)
- ✅ En modern API
- ✅ Developer-friendly
- ✅ 3000 email/ay

### Mailgun ⚠️
- ⚠️ Domain verification gerekli
- ⚠️ Setup daha karmaşık

## 📧 Test Etme

API key eklendikten sonra:

1. **Site**: https://vertexcnc.tr
2. **Teklif Formu**: Doldur ve gönder
3. **Email**: destek@vertexcnc.tr'de email var mı kontrol et

## 🔧 Worker Logs Kontrol:

```bash
npx wrangler tail vertex-cnc --format=pretty
```

## ⚡ Acil Durum!

Hiçbir email servisi çalışmıyorsa:
- Form verileri KV storage'a kaydediliyor
- Manuel olarak kontrol edebilirsiniz
- Worker logs'da email içeriği görülebilir

---

## 📞 Hangi Servisi Tercih Ediyorsunuz?

1. **SendGrid** (5 dakikada hazır) → Hemen setup yapalım
2. **Resend** (modern ve güçlü) → API key alalım
3. **Cloudflare Email** (tekrar deneme) → Domain ayarlarını kontrol edelim

Hangisini seçerseniz, 5 dakikada email sistemi çalışır hale gelecek!
