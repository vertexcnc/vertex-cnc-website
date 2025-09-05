# Cloudflare Pages - Frontend Deployment

Cloudflare API token'ınızda Worker dağıtımı için yeterli yetki olmadığından, şu an sadece frontend kısmı üzerinde çalışabiliriz. İşte frontend kısmını başarıyla dağıtmak için izleyebileceğiniz adımlar:

## 1. Mevcut Cloudflare Pages Yapılandırması

"vertex-cnc-website1" adlı Cloudflare Pages projeniz, GitHub deposuna bağlıdır. GitHub'a her push işlemi, otomatik olarak yeni bir dağıtım tetikler.

## 2. Frontend'i Güncelleme

Kodunuzda herhangi bir değişiklik yapıp GitHub'a push ettiğinizde, Cloudflare Pages otomatik olarak yeni bir dağıtımı tetikleyecektir.

Örnek:
```bash
# Bir dosyayı değiştir
nano src/components/sections/HeroSection.jsx

# Değişiklikleri commit et
git add .
git commit -m "HeroSection güncellendi"
git push origin main
```

## 3. Dağıtımı İzleme

1. Cloudflare Dashboard'a giriş yapın: https://dash.cloudflare.com
2. Workers & Pages > Pages > vertex-cnc-website1 seçin
3. "Deployments" sekmesinde en son dağıtımınızın durumunu görebilirsiniz

## 4. Çevre Değişkenlerini Güncelleme

Eğer API URL'sini değiştirmeniz gerekirse:

1. Cloudflare Dashboard > Pages > vertex-cnc-website1 > Settings > Environment variables
2. VITE_API_URL değerini güncelleyin
3. "Save" butonuna tıklayın
4. "Deployments" sekmesine gidin ve "Trigger deploy" butonuna tıklayarak yeni bir dağıtımı tetikleyin

## 5. Dağıtılan Frontend'i Görüntüleme

Dağıtım tamamlandıktan sonra, frontend'inize aşağıdaki URL ile erişebilirsiniz:
```
https://vertex-cnc-website1.pages.dev
```

## 6. API İzinleri İçin Sonraki Adımlar

Worker API'yi dağıtabilmek için Cloudflare API token'ınızı daha fazla yetkiyle güncellemeniz gerekiyor:

1. Cloudflare Dashboard > My Profile > API Tokens sayfasına gidin
2. Mevcut token'ı düzenleyin veya yeni bir token oluşturun
3. Aşağıdaki izinleri ekleyin:
   - Account > Worker Scripts > Edit
   - Account > Workers KV Storage > Edit
   - Account > Workers R2 Storage > Edit
   - User > User Details > Read
   - Account > Account Settings > Read

Daha fazla izne sahip bir API token ile, Worker API dağıtımını da yapabilirsiniz.

---

Bu adımları takip ederek frontend dağıtımınızı başarıyla gerçekleştirebilirsiniz. Worker API dağıtımı için ek izinlere sahip bir token almanız gerekecektir.
