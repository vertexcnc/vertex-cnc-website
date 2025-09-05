import os
from cloudflare import Cloudflare
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Ortam değişkenlerini al
token = os.getenv('CLOUDFLARE_API_TOKEN', "1il_17x8r1BV2Mtf_g3736NoAuRe-g5jFmT9c5gH")
account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID', "ac59bcba451f212de66aef49fb66fc75")

print(f"API Token: {token[:10]}..." if token else "Token bulunamadı")
print(f"Account ID: {account_id}")

# Cloudflare istemcisi oluştur
cf = Cloudflare(api_token=token)

try:
    print("\n=== Pages Projesi Oluşturuluyor ===")
    
    # Yeni Pages projesi oluştur
    project_data = {
        "name": "vertex-cnc-website1",
        "production_branch": "main"
    }
    
    project = cf.pages.projects.create(account_id=account_id, **project_data)
    print(f"✅ Pages projesi oluşturuldu!")
    print(f"   Proje adı: {project.name}")
    print(f"   Subdomain: {project.subdomain}.pages.dev")
    print(f"   GitHub'dan deploy için bu URL'yi kullanın:")
    print(f"   https://dash.cloudflare.com/{account_id}/pages/view/{project.name}")
    
except Exception as e:
    print(f"❌ Hata oluştu: {e}")
    print("Proje zaten mevcut olabilir veya API hatası.")

print(f"\n=== Sonraki Adımlar ===")
print("1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com")
print("2. Pages > vertex-cnc-website1 projesini bulun")
print("3. GitHub repo'yu bağlayın: https://github.com/vertexcnc/vertex-cnc-website")
print("4. Custom domain ekleyin: vertexcnc.tr")
print("5. Build ayarları: Publish directory = dist")
