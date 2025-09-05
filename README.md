# VERTEX CNC - Modern CNC İşleme Hizmetleri

Modern React frontend ve Cloudflare Worker backend ile geliştirilmiş tam işlevsel CNC işleme hizmetleri web sitesi.

## 🚀 Özellikler

- **Teklif Talebi Sistemi**: CAD dosya yükleme ve detaylı teklif formu
- **Sipariş Takip Sistemi**: Gerçek zamanlı sipariş durumu takibi
- **Modern UI/UX**: React + Tailwind CSS ile duyarlı tasarım
- **Cloudflare Entegrasyonu**: Worker API, KV database, R2 storage
- **Email Sistemi**: SendGrid ile otomatik email bildirimleri

## 🛠️ Teknolojiler

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Build tool ve dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Backend
- **Cloudflare Workers** - Serverless compute
- **Cloudflare KV** - Key-value database
- **Cloudflare R2** - Object storage
- **SendGrid** - Email delivery service

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Cloudflare hesabı

### Local Development

```bash
# Repository'yi klonlayın
git clone https://github.com/vertexcnc/vertex-cnc-website.git
cd vertex-cnc-website

# Bağımlılıkları yükleyin
npm install

# Environment variables'ları ayarlayın
cp .dev.vars.example .dev.vars
# .dev.vars dosyasını API keyler ile doldurun

# Frontend'i başlatın
npm run dev

# Worker'ı başlatın (ayrı terminalde)
npm run worker:dev
```

## 🌐 Production Deployment

### Cloudflare Worker
```bash
# Worker'ı deploy edin
npm run worker:deploy

# KV namespaces oluşturun (ilk defa)
npm run kv:create
```

### Cloudflare Pages
```bash
# Frontend'i build edin
npm run build

# Pages'e deploy edin
npm run deploy:pages
```

## 🔧 Yapılandırma

### Environment Variables (.dev.vars)
```env
CLOUDFLARE_API_TOKEN=your_token_here
SENDGRID_API_KEY=your_sendgrid_key
API_KEY=your_api_key
ADMIN_API_KEY=your_admin_key
```

### API Endpoints

#### Production
- **Base URL**: `https://vertex-cnc-api.vertexcnc-tr.workers.dev`
- **Health Check**: `/health`
- **Quote Request**: `/api/send-quote-email`
- **Order Tracking**: `/api/track-order/{trackingId}`

## 📱 Kullanım

### Teklif Talebi
1. Ana sayfada "Teklif Al" butonuna tıklayın
2. Şirket bilgilerini doldurun
3. Proje detaylarını açıklayın
4. CAD dosyalarını yükleyin
5. Formu gönderin

### Sipariş Takibi
1. "Sipariş Takip" sayfasına gidin
2. Takip numaranızı girin
3. Sipariş durumunu görüntüleyin

## 🧪 Test

```bash
# API testlerini çalıştırın
npm run test:api

# Production testleri
node scripts/production-test.js
```

## 📁 Proje Yapısı

```
vertex-cnc-website/
├── src/
│   ├── components/          # React bileşenleri
│   ├── lib/                # Utility fonksiyonları
│   ├── assets/             # Statik dosyalar
│   └── worker.js           # Cloudflare Worker
├── scripts/                # Deployment scriptleri
├── archive/                # Eski/gereksiz dosyalar
├── package.json
├── wrangler.toml          # Cloudflare yapılandırması
└── README.md
```

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

**VERTEX CNC**
- Website: [vertexcnc.tr](https://vertexcnc.tr)
- Email: info@vertexcnc.tr

---

⚡ **Cloudflare ile güçlendirilmiştir** | 🚀 **Production Ready**
