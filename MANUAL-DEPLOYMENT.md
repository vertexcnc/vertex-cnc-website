# 🚀 VERTEX CNC - Manual Deployment Guide

## Node.js Kurulumu Sonrası Adımlar

### 1. PowerShell'i Yeniden Başlatın
PowerShell'i kapatıp yeniden açın, ardından tekrar deneyin:
```powershell
node --version
npm --version
```

### 2. Eğer Node.js Hala Tanınmıyorsa:

#### Option A: PATH Güncelleme
```powershell
# Node.js'in kurulu olduğu yolu PATH'e ekleyin
$env:PATH += ";C:\Program Files\nodejs"
# veya
$env:PATH += ";C:\Program Files (x86)\nodejs"
```

#### Option B: Tam Yol Kullanma
```powershell
& "C:\Program Files\nodejs\node.exe" --version
& "C:\Program Files\nodejs\npm.exe" --version
```

## 🌐 Manual Cloudflare Deployment (Alternatif)

### 1. GitHub Repository Oluşturma

1. **GitHub'a gidin**: https://github.com
2. **New Repository** butonuna tıklayın
3. **Repository name**: `vertex-cnc-website`
4. **Public** seçin
5. **Create repository** butonuna tıklayın

### 2. Kod Yükleme

Proje klasöründe Git komutlarını çalıştırın:

```bash
git init
git add .
git commit -m "VERTEX CNC - Production Ready Website"
git branch -M main
git remote add origin https://github.com/[KULLANICI-ADINIZ]/vertex-cnc-website.git
git push -u origin main
```

### 3. Cloudflare Pages Setup

1. **Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Pages** sekmesine gidin
3. **Create a project** > **Connect to Git**
4. **GitHub** hesabınızı bağlayın
5. **vertex-cnc-website** repository'sini seçin

### 4. Build Configuration

**Framework preset**: Vite
**Build command**: `npm run build`
**Build output directory**: `dist`
**Root directory**: (boş bırakın)
**Node.js version**: `18.17.0`

### 5. Environment Variables

Pages ayarlarında şu değişkenleri ekleyin:

```
VITE_API_URL = https://vertex-cnc-production.vertex-cnc.workers.dev
VITE_SITE_URL = https://vertexcnc.tr
NODE_ENV = production
```

## 🔧 Cloudflare Workers Deployment

### 1. Wrangler ile Deploy

Eğer Node.js çalışıyorsa:

```powershell
# PNPM kurulumu
npm install -g pnpm

# Proje dependencies
pnpm install

# Worker deploy
npx wrangler login
npx wrangler deploy src/worker.js --name vertex-cnc-production
```

### 2. KV Namespaces

```powershell
npx wrangler kv:namespace create "ORDERS_DB"
npx wrangler kv:namespace create "TRACKING_DB"
```

### 3. Manual Worker Deployment

Eğer komut satırı çalışmıyorsa:

1. **Cloudflare Dashboard** > **Workers & Pages**
2. **Create** > **Create Worker**
3. **Name**: `vertex-cnc-production`
4. `src/worker.js` dosyasının içeriğini kopyalayın
5. Worker editörüne yapıştırın
6. **Save and Deploy**

## 📊 Verification Checklist

### Frontend (Pages):
- [ ] Repository GitHub'a yüklendi
- [ ] Cloudflare Pages projesi oluşturuldu
- [ ] Build başarılı oldu
- [ ] Site erişilebilir durumda
- [ ] Environment variables eklendi

### Backend (Worker):
- [ ] Worker deploy edildi
- [ ] API endpoints test edildi
- [ ] KV namespaces oluşturuldu
- [ ] CORS headers çalışıyor

### Domain:
- [ ] Custom domain bağlandı (vertexcnc.tr)
- [ ] SSL certificate aktif
- [ ] DNS ayarları yapıldı

## 🎯 Test URLs

Deploy sonrası test edilecek linkler:

### Frontend:
- https://vertex-cnc-website.pages.dev
- https://vertexcnc.tr (custom domain)

### API:
- https://vertex-cnc-production.vertex-cnc.workers.dev/health
- https://vertex-cnc-production.vertex-cnc.workers.dev/api/track-order/test

## 🚨 Troubleshooting

### Build Errors:
- Node.js version 18+ gerekli
- `pnpm install` komutu çalıştırılmalı
- `package.json` scripts kontrol edilmeli

### API Errors:
- CORS headers kontrol edilmeli
- KV bindings doğru yapılandırılmalı
- Environment variables eksiksiz olmalı

### Domain Issues:
- DNS propagation 24-48 saat sürebilir
- SSL certificate otomatik oluşturulur
- Cloudflare proxy (orange cloud) aktif olmalı

---

**Status**: Manual deployment ready ✅
**Next Action**: GitHub upload + Cloudflare Pages setup
**Estimated Time**: 30-45 minutes
