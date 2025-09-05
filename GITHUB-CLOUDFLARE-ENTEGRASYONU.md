# GitHub ve Cloudflare Pages Entegrasyonu

## 1. GitHub Entegrasyonu

1. Tarayıcınızı açın ve şu adrese gidin: https://pages.cloudflare.com
2. Cloudflare hesabınıza giriş yapın
3. "Create a project" (Bir proje oluştur) butonuna tıklayın
   **NOT**: Zaten "vertex-cnc-website1" adlı bir projeniz var. Mevcut projeyi kullanabilirsiniz.
4. Eğer yeni proje oluşturacaksanız "Connect to Git" (Git'e Bağlan) seçeneğini seçin
5. GitHub hesabınıza bağlanın (yetkilendirme gerekecektir)
6. `vertex-cnc-website` repository'sini seçin
7. Aşağıdaki ayarları yapın:
   - **Project name**: vertex-cnc-website1 (mevcut projeniz)
   - **Production branch**: main
   - **Framework preset**: Vite
   - **Build command**: npm run build
   - **Build output directory**: dist

## 2. Çevre Değişkenlerini Ayarlama

Cloudflare Pages Dashboard > vertex-cnc-website1 > Settings > Environment variables bölümüne aşağıdaki değişkenleri ekleyin:

```
VITE_API_URL=https://vertex-cnc-api.vertexcnc.workers.dev
VITE_SITE_URL=https://vertexcnc.tr
CLOUDFLARE_API_TOKEN=CBrhj9CfyoYjdf90pH-zJfp2i4igciJLsxvRBBlN
SENDGRID_API_KEY=4VR37VJ8PYTSR69KZFUJ8YRF
API_KEY=vertex-api-key-123456
ADMIN_API_KEY=vertex-admin-key-789012
```

## 3. Mevcut Pages Projesini Güncelleme

Halihazırda var olan "vertex-cnc-website1" projesini güncellemek için:

1. Cloudflare Pages Dashboard > vertex-cnc-website1 sayfasına gidin
2. "Settings" sekmesine tıklayın 
3. "Build & deployments" bölümünde şu ayarları kontrol edin/güncelleyin:
   - **Framework preset**: Vite
   - **Build command**: npm run build
   - **Build output directory**: dist
   - **Node.js version**: 18 veya üzeri
4. "Save" butonuna tıklayarak değişiklikleri kaydedin
5. "Deployments" sekmesine giderek "Trigger deploy" butonuna tıklayın ve "Deploy latest commit" seçeneğini seçerek yeni bir dağıtımı tetikleyin

## 4. Pages Fonksiyonlarını Yapılandırma (İsteğe Bağlı)

Eğer Pages Functions kullanmak isterseniz:

1. Settings > Functions bölümüne gidin
2. "Configure Functions" seçeneğine tıklayın
3. Gerekirse ek çevre değişkenlerini ekleyin

## 5. Özel Alan Adı (Custom Domain) Ekleme

1. Custom domains bölümüne gidin
2. "Set up a custom domain" butonuna tıklayın
3. `vertexcnc.tr` adresini girin
4. DNS ayarlarını takip edin veya DNS'iniz zaten Cloudflare'da ise otomatik olarak yapılandırın

## 6. Analytics ve İzleme

1. Analytics bölümünden site trafiğinizi izleyebilirsiniz
2. Insights bölümünden performans metriklerini görebilirsiniz

## 7. Değişiklikleri Yayınlama

Bu aşamadan sonra, GitHub'a her push işlemi otomatik olarak yeni bir dağıtım tetikleyecektir:

```bash
git add .
git commit -m "Yeni özellik: [özellik adı]"
git push origin main
```

## 8. Log İzleme

Cloudflare Pages > vertex-cnc-website1 > Deployments bölümünden her dağıtımın log'larını inceleyebilirsiniz.

---

Bu adımları takip ederek GitHub entegrasyonu ile Cloudflare Pages üzerinde sitenizi yayınlamış olacaksınız. Her push işlemi otomatik olarak yeni bir dağıtımı tetikleyecektir.
