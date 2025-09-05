# VERTEX CNC Site Deployment Kontrol Listesi

Bu belge, VERTEX CNC web sitesinin deployment sürecinin başarıyla tamamlanması için bir kontrol listesi sağlar.

## 1. Ön Gereksinimler

- [x] Cloudflare hesabı oluşturuldu
- [x] GitHub hesabı oluşturuldu
- [x] Proje GitHub'a yüklendi
- [x] Cloudflare API token'ları oluşturuldu
- [x] SendGrid hesabı yapılandırıldı
- [ ] NPM paketleri kuruldu (`npm install --legacy-peer-deps`)

## 2. Cloudflare Pages Kurulumu

- [x] Cloudflare'de Pages projesi oluşturuldu (vertex-cnc-website1)
- [x] GitHub entegrasyonu yapılandırıldı
- [x] Build ayarları yapılandırıldı:
  - [x] Build komutu: `npm install --legacy-peer-deps && npm run build`
  - [x] Output directory: `dist`
- [x] Çevre değişkenleri ayarlandı:
  - [x] API_KEY
  - [x] ADMIN_API_KEY
  - [x] SENDGRID_API_KEY
  - [x] VITE_API_URL
  - [x] TO_EMAIL

## 3. Cloudflare Workers Kurulumu

- [ ] wrangler.toml kontrol edildi
- [ ] KV namespaces oluşturuldu:
  - [ ] ORDERS_DB
  - [ ] TRACKING_DB
- [ ] R2 bucket oluşturuldu (vertex-cnc-files)
- [ ] .dev.vars dosyası doğru şekilde yapılandırıldı:
  - [ ] CLOUDFLARE_API_TOKEN = VERTEX-CNC-FULL-ACCESS token değeri
  - [ ] SENDGRID_API_KEY
  - [ ] API_KEY
  - [ ] ADMIN_API_KEY

## 4. Worker API Dağıtımı

- [ ] VERTEX-CNC-FULL-ACCESS token değeri .dev.vars dosyasına eklendi
- [ ] `npm run build` komutu çalıştırıldı
- [ ] `npx wrangler deploy src/worker.js` komutu çalıştırıldı
- [ ] Worker URL'si doğrulandı: `https://vertex-cnc-api.vertexcnc.workers.dev`
- [ ] API sağlık kontrolü yapıldı: `curl https://vertex-cnc-api.vertexcnc.workers.dev/health`

## 5. Frontend-Worker Entegrasyonu

- [ ] Cloudflare Pages'teki VITE_API_URL değeri Worker URL'sine ayarlandı
- [ ] Yeni bir deployment tetiklendi
- [ ] Frontend URL'si test edildi: `https://vertex-cnc-website1.pages.dev`

## 6. DNS Yapılandırması (İsteğe Bağlı)

- [ ] vertexcnc.tr domaininin DNS kayıtları Cloudflare'e eklendi
- [ ] Cloudflare Pages'e CNAME kaydı oluşturuldu
- [ ] api.vertexcnc.tr subdomain'i Worker'a yönlendirildi
- [ ] SSL sertifikaları kontrol edildi

## 7. Uygulama Testleri

- [ ] Anasayfa yükleniyor
- [ ] Teklif formu çalışıyor ve email gönderimi başarılı
- [ ] Sipariş takip sistemi çalışıyor
- [ ] Admin paneline erişim kontrol edildi
- [ ] Dosya yükleme ve indirme testi yapıldı

## 8. Dağıtım Sonrası Kontroller

- [ ] Cloudflare Analytics aktif
- [ ] Worker kullanım istatistikleri görünüyor
- [ ] KV ve R2 depolaması çalışıyor
- [ ] Email bildirimleri doğru şekilde gönderiliyor
- [ ] Hata logları kontrol edildi

## 9. Git Temizliği

- [ ] Tüm hassas bilgiler .gitignore'a eklendi
- [ ] Git geçmişinde hassas bilgi kalmadığından emin olundu
- [ ] Tüm API tokenları ve şifreler güvende

## 10. Başarılı Dağıtım İçin Son Adımlar

- [ ] Projenin GitHub'ının en son sürümü
- [ ] Tüm dokümantasyon güncellenmiş durumda
- [ ] Tüm servislere (Cloudflare, SendGrid) erişim bilgileri güvenli bir şekilde saklanıyor

---

Bu kontrol listesini takip ederek VERTEX CNC web sitesinin başarılı bir şekilde dağıtımını sağlayabilirsiniz. Herhangi bir sorunla karşılaşırsanız, ilgili dokümantasyonu kontrol edin:

- [WORKER-DEPLOYMENT-GUIDE.md](./WORKER-DEPLOYMENT-GUIDE.md) - Worker API dağıtımı
- [FRONTEND-DEPLOYMENT-GUIDE.md](./FRONTEND-DEPLOYMENT-GUIDE.md) - Frontend dağıtımı
- [ENTEGRASYON-OZETI.md](./ENTEGRASYON-OZETI.md) - Genel entegrasyon özeti
- [GIT-TEMIZLIK-REHBERI.md](./GIT-TEMIZLIK-REHBERI.md) - Git geçmişi temizliği
