# 🚀 GitHub Repository Setup Guide

## 1. GitHub'da Yeni Repository Oluşturun

### Adım 1: GitHub'a Gidin
🔗 **https://github.com**

### Adım 2: New Repository
- Sağ üst köşedeki **"+"** butonuna tıklayın
- **"New repository"** seçin

### Adım 3: Repository Ayarları
```
Repository name: vertex-cnc-website
Description: VERTEX CNC - Yüksek Hassas İmalat Teknolojileri Web Sitesi
Public: ✅ (seçili)
Add a README file: ❌ (seçmeyin - zaten var)
Add .gitignore: ❌ (seçmeyin - zaten var)
Choose a license: ❌ (şimdilik boş)
```

### Adım 4: Create Repository
**"Create repository"** butonuna tıklayın

## 2. Git Remote Ekleme

Repository oluşturduktan sonra GitHub size bir URL verecek. Örnek:
```
https://github.com/[KULLANICI-ADINIZ]/vertex-cnc-website.git
```

### Terminal Komutları:
```bash
# Remote ekleyin (GitHub URL'inizi kullanın)
git remote add origin https://github.com/[KULLANICI-ADINIZ]/vertex-cnc-website.git

# Branch'i main olarak ayarlayın
git branch -M main

# Push yapın
git push -u origin main
```

## 3. Cloudflare Pages ile Bağlama

GitHub repository oluşturduktan sonra:

1. **Cloudflare Pages** > **"Create a project"**
2. **"Connect to Git"** seçin
3. **GitHub** hesabınızı authorize edin
4. **"vertex-cnc-website"** repository'sini seçin
5. Build settings:
   - Framework: **Vite**
   - Build command: **npm run build**
   - Output directory: **dist**

## 4. Environment Variables

Cloudflare Pages'te şu environment variables'ları ekleyin:
```
VITE_API_URL=https://vertex-cnc-production.vertex-cnc.workers.dev
VITE_SITE_URL=https://vertexcnc.pages.dev
NODE_ENV=production
```

## 5. Deployment

Bu adımlardan sonra:
- ✅ Her git push otomatik deploy tetikleyecek
- ✅ Site https://vertexcnc.pages.dev adresinde yayınlanacak
- ✅ SSL certificate otomatik oluşacak
- ✅ Global CDN aktif olacak

---

**Next Step**: GitHub repository URL'ini alıp terminal'de remote ekleyin!
