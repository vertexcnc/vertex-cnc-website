# Cloudflare Pages Build Ayarları

## Proje: vertexcnc-tr
## GitHub Repo: https://github.com/vertexcnc/vertexcnc-tr

### Build Settings:
- **Framework preset**: None (veya Static)
- **Build command**: (boş bırakın - zaten derlenmiş)
- **Build output directory**: dist
- **Root directory**: (boş bırakın)
- **Environment variables**: (şimdilik yok)

### Branch Settings:
- **Production branch**: main
- **Preview branches**: Tüm branch'ler

### Deploy Workflow:
1. GitHub'a push yapıldığında otomatik deploy başlar
2. Cloudflare Pages, dist klasöründeki dosyaları alır
3. CDN'e dağıtır
4. vertexcnc.tr domain'inde yayınlar

### Manuel Deploy (gerekirse):
```bash
# Dist klasörünü güncellemek için:
git add dist
git commit -m "Web sitesi güncellendi"
git push origin main
```

### Build Output Structure:
```
dist/
├── index.html          # Ana sayfa
├── favicon.ico         # Site ikonu
└── assets/
    ├── *.css           # Stil dosyaları
    ├── *.js            # JavaScript dosyaları
    └── *.jpg,*.png     # Görsel dosyalar
```

Bu ayarlarla projeniz otomatik olarak deploy olacaktır.
