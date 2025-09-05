# Git Geçmişi Temizleme ve Hassas Bilgileri Kaldırma Rehberi

GitHub'a push yaparken "Push cannot contain secrets" hatası alıyorsanız, bunun nedeni Git geçmişinde hassas bilgilerin (API anahtarları, tokenlar, şifreler vb.) bulunmasıdır. Bu sorunu çözmek için iki yöntem vardır:

## 1. GitHub'da Token'ı Güvenli Olarak İşaretleme

GitHub, tespit edilen hassas bilgileri güvenli olarak işaretlemenize olanak tanır. Bu, GitHub'a bu token'ın artık geçerli olmadığını veya güvenli bir şekilde paylaşılabileceğini söyler.

1. GitHub tarafından sağlanan unblock URL'sine gidin:
   ```
   https://github.com/vertexcnc/vertex-cnc-website/security/secret-scanning/unblock-secret/32Hp6Qkkhf6BVeSILHa8Tx1nPL7
   ```

2. Token'ı güvenli olarak işaretlemek için bir neden seçin:
   - "This token has been revoked" (Bu token iptal edildi)
   - "This token is a test or example" (Bu token bir test veya örnek)
   - "This token is still being used" (Bu token hala kullanılıyor)

3. "Unblock this secret" (Bu sırrın engelini kaldır) butonuna tıklayın.

Bu yöntem, token'ı değiştirmeden GitHub'a push yapmanıza izin verecektir.

## 2. Git Geçmişini Temizleme

Alternatif olarak, Git geçmişindeki hassas bilgileri tamamen kaldırabilirsiniz. Bu işlem daha karmaşıktır ancak hassas bilgilerin tamamen silinmesini sağlar.

### 2.1. Yerel Değişiklikleri Yedekleme

Önce mevcut değişikliklerinizi yedekleyin:

```bash
# Geçerli değişiklikleri stash'e kaydedin
git stash save "Temizlik öncesi değişiklikler"
```

### 2.2. Commit Geçmişini Düzenleme

Git filter-branch komutunu kullanarak belirli bir dosyadaki hassas bilgileri içeren tüm commitleri düzenleyebilirsiniz:

```bash
# Tüm commitlerdeki WORKER-DEPLOYMENT-GUIDE.md dosyasını temizle
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch WORKER-DEPLOYMENT-GUIDE.md" \
  --prune-empty --tag-name-filter cat -- --all

# Eğer belirli bir commit'ten itibaren temizlemek istiyorsanız
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch WORKER-DEPLOYMENT-GUIDE.md" \
  --prune-empty --tag-name-filter cat -- dd964f8c5dc2b15461a95b158737669df7213c65^..HEAD
```

### 2.3. Geçmişi Yeniden Oluşturma

Temiz bir geçmiş için:

```bash
# Git çöp toplayıcısını çalıştır
git gc --aggressive --prune=now

# Yerel referansları güncelle
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
```

### 2.4. Dosyayı Yeniden Ekleme

Şimdi temizlenmiş dosyayı yeniden ekleyin:

```bash
# Yeni içerikle dosyayı yeniden oluşturun
# Stash'ten değişiklikleri geri yükleyin (eğer stash kullandıysanız)
git stash pop

# Yeni dosyayı commit edin
git add WORKER-DEPLOYMENT-GUIDE.md
git commit -m "Güvenli içerikle WORKER-DEPLOYMENT-GUIDE.md yeniden eklendi"
```

### 2.5. Zorunlu Push

Son olarak, değişiklikleri zorunlu olarak push edin:

```bash
git push --force origin main
```

## Önemli Notlar

- **Zorunlu push (force push)**, paylaşılan depolarda sorunlara neden olabilir. Eğer başkaları da bu depoya katkıda bulunuyorsa, işlem öncesinde onlarla iletişime geçmeniz önerilir.
- Hassas bilgileri Git geçmişinden kaldırmak, bu bilgilerin daha önce klonlanan kopyalarda hala var olabileceği anlamına gelir.
- En iyi uygulama, sızıntı olmuş tokenları ve şifreleri değiştirmektir.
- `.gitignore` dosyanızı, `.env`, `.dev.vars` gibi hassas bilgiler içeren dosyaları dışlayacak şekilde yapılandırın.
- Commit etmeden önce `git diff` ile değişiklikleri gözden geçirin.
- [git-secrets](https://github.com/awslabs/git-secrets) gibi araçları kullanarak otomatik tarama yapın.

## Sonraki Adımlar

Geçmişi temizledikten sonra:

1. Etkilenen tüm tokenları ve API anahtarlarını yenileyin.
2. Hassas bilgileri `.dev.vars` gibi `.gitignore`'a eklenmiş dosyalarda saklayın.
3. Commit etmeden önce çift kontrol edin.

Bu adımları izleyerek Git geçmişinizdeki hassas bilgileri güvenli bir şekilde kaldırabilir ve GitHub'a başarıyla push yapabilirsiniz.
