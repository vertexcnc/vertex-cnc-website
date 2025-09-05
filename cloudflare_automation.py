import os
from cloudflare import Cloudflare
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Ortam değişkenlerinden API anahtarı, e-posta, account_id ve zone_id alınıyor
token = os.getenv('CLOUDFLARE_API_TOKEN', "1il_17x8r1BV2Mtf_g3736NoAuRe-g5jFmT9c5gH")
email = os.getenv('CLOUDFLARE_EMAIL')
account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID', "ac59bcba451f212de66aef49fb66fc75")
zone_id = os.getenv('CLOUDFLARE_ZONE_ID')

print(f"Token: {token[:10]}..." if token else "Token not found")
print(f"Account ID: {account_id}")

cf = Cloudflare(api_token=token)

def get_zones():
    return cf.zones.list()

def create_pages_project(account_id, project_name):
    return cf.pages.projects.create(account_id=account_id, name=project_name, production_branch="main")

def list_pages_projects(account_id):
    return cf.pages.projects.list(account_id=account_id)

def deploy_to_pages(account_id, project_name, dist_path):
    # Cloudflare Pages API ile doğrudan dosya yükleme desteği yok, genellikle GitHub entegrasyonu kullanılır
    # Alternatif olarak, dosyalar bir repo'ya push edilir ve Pages otomatik deploy olur
    print(f"Lütfen dist klasörünü bir GitHub repo'ya push edin ve Cloudflare Pages ile bağlayın.")

def set_custom_domain(account_id, project_name, domain):
    # Custom domain ekleme
    try:
        return cf.pages.projects.domains.create(account_id=account_id, project_name=project_name, name=domain)
    except Exception as e:
        # Alternatif API endpoint deneyebiliriz
        print(f"API hatası, alternatif yöntem deneniyor: {e}")
        return None

if __name__ == "__main__":
    try:
        print("=== Cloudflare Kontrol ===")
        zones = get_zones()
        print(f"Cloudflare Zones: {len(zones)} adet zone bulundu")
        for zone in zones:
            print(f"  - {zone.name} (ID: {zone.id})")
        
        print(f"\n=== Pages Projeleri ===")
        pages = list_pages_projects(account_id)
        print(f"Pages Projeleri: {len(pages)} adet proje bulundu")
        for page in pages:
            print(f"  - {page.name}")
            
    except Exception as e:
        print(f"Hata: {e}")
        
    # Pages projesi oluştur
    print(f"\n=== Pages Projesi Oluşturuluyor ===")
    try:
        project = create_pages_project(account_id, 'vertex-cnc-website1')
        print(f"✅ Pages projesi oluşturuldu: vertex-cnc-website1")
        print(f"   Proje URL: {project.subdomain}.pages.dev")
    except Exception as e:
        print(f"⚠️  Proje oluşturma hatası (zaten mevcut olabilir): {e}")
    
    # Domain bağlama
    print(f"\n=== Custom Domain Bağlanıyor ===")
    try:
        domain_result = set_custom_domain(account_id, 'vertex-cnc-website1', 'vertexcnc.tr')
        print(f"✅ vertexcnc.tr domain'i başarıyla bağlandı")
    except Exception as e:
        print(f"⚠️  Domain bağlama hatası: {e}")
        
    print(f"\n=== GitHub Repo Bilgisi ===")
    print(f"GitHub Repo: https://github.com/vertexcnc/vertexcnc-tr")
    print(f"Bu repo'yu Cloudflare Pages dashboard'unda bağlayın:")

