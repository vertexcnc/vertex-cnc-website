# 🌐 CLOUDFLARE DNS AYARLARI - SENDGRID DOMAIN DOĞRULAMASI

## 📋 Cloudflare DNS Panel'ine Eklenecek Kayıtlar

Cloudflare Dashboard > vertexcnc.tr > DNS > Records bölümüne aşağıdaki kayıtları ekleyin:

### 1. SendGrid E-mail Routing
```
Tip: CNAME
Name: em7497.vertexcnc.tr
Target: u55791285.wl036.sendgrid.net
TTL: Auto
Proxy status: DNS only (gri bulut)
```

### 2. DKIM Authentication Key 1
```
Tip: CNAME
Name: s1._domainkey.vertexcnc.tr
Target: s1.domainkey.u55791285.wl036.sendgrid.net
TTL: Auto
Proxy status: DNS only (gri bulut)
```

### 3. DKIM Authentication Key 2
```
Tip: CNAME
Name: s2._domainkey.vertexcnc.tr
Target: s2.domainkey.u55791285.wl036.sendgrid.net
TTL: Auto
Proxy status: DNS only (gri bulut)
```

### 4. DMARC Policy
```
Tip: TXT
Name: _dmarc.vertexcnc.tr
Content: v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
TTL: Auto
```

### 5. Click Tracking
```
Tip: CNAME
Name: url5722.vertexcnc.tr
Target: sendgrid.net
TTL: Auto
Proxy status: DNS only (gri bulut)
```

### 6. SendGrid Subdomain
```
Tip: CNAME
Name: 55791285.vertexcnc.tr
Target: sendgrid.net
TTL: Auto
Proxy status: DNS only (gri bulut)
```

## ⚙️ Cloudflare'de DNS Kayıt Ekleme Adımları

1. **Cloudflare Dashboard'a giriş yapın**
   - https://dash.cloudflare.com
   - vertexcnc.tr domain'ini seçin

2. **DNS sekmesine gidin**
   - Sol menüden "DNS" > "Records"

3. **Her kayıt için "Add record" butonuna tıklayın**
   - Type seçin (CNAME veya TXT)
   - Name alanına yukarıdaki değerleri girin
   - Target/Content alanına hedef değerleri girin
   - Proxy status'u "DNS only" yapın (gri bulut)
   - "Save" butonuna tıklayın

## 🔍 Önemli Notlar

### CNAME Kayıtları:
- ⚠️ **Proxy Status mutlaka "DNS only" olmalı** (turuncu bulut değil, gri bulut)
- ⚠️ CNAME kayıtları CloudFlare proxy ile çalışmaz
- ⚠️ TTL'yi "Auto" bırakın

### TXT Kayıtları:
- ✅ DMARC kaydında `p=reject` sıkı güvenlik sağlar
- ✅ `adkim=s` ve `aspf=s` strict alignment aktifleştirir

## 🚀 Kayıtlar Eklendikten Sonra

### 1. DNS Propagation Kontrolü (10-15 dakika)
```bash
# DNS kayıtlarını kontrol edin:
nslookup em7497.vertexcnc.tr
nslookup s1._domainkey.vertexcnc.tr
nslookup s2._domainkey.vertexcnc.tr
```

### 2. SendGrid Domain Verification
- SendGrid Dashboard > Settings > Sender Authentication
- "Verify" butonuna tıklayın
- DNS propagation tamamlandıktan sonra doğrulama başarılı olmalı

### 3. Yeni SendGrid API Key Oluşturun
- Settings > API Keys > Create API Key
- "Full Access" seçin
- API Key'i kaydedin

### 4. .dev.vars Dosyasını Güncelleyin
```bash
SENDGRID_API_KEY=SG.yeni_api_key_buraya
```

## 📧 Test Etme

Domain doğrulaması tamamlandıktan sonra:

```bash
cd /workspaces/vertex-cnc-website
export $(cat .dev.vars | grep -v '^#' | xargs)
python scripts/test-sendgrid-standalone.py
```

## 🎯 Beklenen Sonuç

✅ DNS kayıtları eklendi  
✅ SendGrid domain doğrulaması tamamlandı  
✅ Yeni API key oluşturuldu  
✅ E-mail testi başarılı  
✅ Teklif Al sistemi aktif  

---

## 📞 Sorun Giderme

### DNS Kayıtları Görünmüyor:
- 10-15 dakika bekleyin (DNS propagation)
- Cloudflare cache'i temizleyin
- Proxy status'un "DNS only" olduğunu kontrol edin

### SendGrid Doğrulama Başarısız:
- DNS kayıtlarının tam olarak eşleştiğini kontrol edin
- Büyük/küçük harf duyarlılığına dikkat edin
- TTL değerlerini düşürün (300 saniye)

### E-mail Gönderim Hatası:
- Domain doğrulamasının tamamlandığını kontrol edin
- API key'in "Full Access" yetkisine sahip olduğunu kontrol edin
- SendGrid hesap limitlerini kontrol edin

**📋 Bu adımları tamamladıktan sonra VERTEX CNC e-mail sistemi tamamen aktif olacak!**
