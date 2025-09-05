# Cloudflare Pages - VERTEX CNC Build Configuration

## Build Settings for Cloudflare Pages

### Framework Preset: 
**Vite** (Hiç kimse yerine Vite seçin)

### Build Command:
```bash
npm run build
```

### Build Output Directory:
```
dist
```

### Root Directory:
```
(boş bırakın - default)
```

### Environment Variables:
```bash
VITE_API_URL=https://vertex-cnc-production.vertex-cnc.workers.dev
VITE_SITE_URL=https://vertexcnc.pages.dev
NODE_ENV=production
```

## Alternative: Manual Upload

Eğer Git repository kullanmıyorsanız:

1. **"Upload assets"** seçin
2. Şu dosyaları yükleyin:
   - `dist/index.html`
   - `dist/favicon.ico`
   - `dist/assets/` klasörü (tüm içeriğiyle)

## Post-Deploy Checklist

Deploy sonrası kontrol edilecekler:

- [ ] Site açılıyor mu: https://vertexcnc.pages.dev
- [ ] Teklif formu çalışıyor mu
- [ ] API endpoints erişilebilir mi
- [ ] Responsive design kontrol

## Worker Integration

Pages deploy sonrası Worker'ı da deploy etmeyi unutmayın:

1. Workers & Pages > Create > Worker
2. Name: `vertex-cnc-production`
3. `src/worker.js` kodunu kopyalayın
4. KV namespaces: `ORDERS_DB`, `TRACKING_DB`

Bu ayarlarla deploy ettiğinizde tam işlevsel site çalışacak!
