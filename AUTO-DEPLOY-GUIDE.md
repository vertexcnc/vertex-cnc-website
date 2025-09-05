# Cloudflare ve GitHub Tam Otomasyon Kurulum Rehberi

Bu rehber, Vertex CNC sitesi için Cloudflare ve GitHub arasında tam otomatik deployment ve izleme sistemi kurulumunu açıklar.

## Hazırlanan Sistem

1. **GitHub Actions Workflow**: Her `main` branch push'unda otomatik olarak Cloudflare Pages'a deploy eder.
2. **AI Agent**: Cloudflare deployment durumunu izler, hataları tespit eder, otomatik düzeltmeler yapar veya GitHub issue açar.
3. **Test Script**: Cloudflare ve GitHub entegrasyonunun doğru çalıştığını test eder.
4. **Cron Job**: AI agent'ın düzenli çalışmasını sağlar.

## Kurulum Adımları

### 1. API Anahtarları ve Secrets

`.env` dosyasını düzenleyerek aşağıdaki değerleri ekleyin:

```
CLOUDFLARE_API_TOKEN=your_actual_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_actual_account_id_here
CLOUDFLARE_ZONE_ID=your_actual_zone_id_here
GITHUB_TOKEN=your_actual_github_token_here
```

GitHub repository secrets'larınıza da aynı değerleri ekleyin. Detaylı bilgi için `GITHUB-SECRETS-SETUP.md` dosyasına bakın.

### 2. GitHub Actions Kurulumu

`.github/workflows/cloudflare-pages.yml` dosyası otomatik olarak oluşturuldu. Bu workflow dosyası, her push'ta aşağıdaki işlemleri yapar:

- Repo'yu checkout eder
- Node.js kurar
- Bağımlılıkları yükler
- Projeyi build eder
- Cloudflare Pages'a deploy eder

### 3. AI Agent Kurulumu

AI agent, Cloudflare deployment durumunu sürekli izler ve şu yeteneklere sahiptir:

- Deployment durumunu kontrol etme
- Hata tespiti ve sınıflandırma
- Otomatik düzeltmeler (npm build hataları gibi)
- GitHub issue açma
- Loglama ve raporlama

AI agent'ı cron job olarak kurulum için:

```bash
sudo ./install_ai_agent_cron.sh
```

### 4. Test ve Doğrulama

Sistemin doğru çalıştığını test etmek için:

```bash
python3 test_automation.py
```

Bu script, Cloudflare ve GitHub bağlantılarını test eder ve varsa sorunları raporlar.

## Sistem İşleyişi

1. Geliştirici kod değişikliği yapar ve GitHub'a push eder
2. GitHub Actions otomatik olarak build ve Cloudflare'e deploy işlemlerini gerçekleştirir
3. AI agent düzenli olarak deployment durumunu kontrol eder
4. Sorun tespit edilirse otomatik düzeltme yapar veya GitHub issue açar
5. Tüm işlemler loglanır ve raporlanır

## Sorun Giderme

Eğer sistem düzgün çalışmıyorsa:

1. `.env` dosyasındaki API anahtarlarını kontrol edin
2. GitHub secrets değerlerinin doğru olduğunu doğrulayın
3. AI agent loglarını kontrol edin: `/var/log/ai-agent/monitor.log`
4. `test_automation.py` ile test edin ve hata raporlarını inceleyin
5. GitHub Actions workflow çalıştırmalarını ve build loglarını kontrol edin

## Güvenlik Notları

- API anahtarlarınızı ve token'larınızı asla public repo'larda paylaşmayın
- `.env` dosyasını `.gitignore` dosyasına ekleyin
- Cloudflare ve GitHub token'ları için minimum gerekli izinleri verin
