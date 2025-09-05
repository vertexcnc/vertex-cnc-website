import os
import requests
import time
import json
import logging
from datetime import datetime
import subprocess

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ai_agent.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("AI_Agent")

# Ortam değişkenleri
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN', "1il_17x8r1BV2Mtf_g3736NoAuRe-g5jFmT9c5gH")
CLOUDFLARE_ACCOUNT_ID = os.getenv('CLOUDFLARE_ACCOUNT_ID', "ac59bcba451f212de66aef49fb66fc75")
PROJECT_NAME = 'vertex-cnc-website1'
GITHUB_REPO = 'vertexcnc/vertex-cnc-website'
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

# API endpoints
CF_PAGES_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PROJECT_NAME}/deployments"
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}"

# API Headers
CF_HEADERS = {
    "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
    "Content-Type": "application/json"
}

GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def load_env():
    """Ortam değişkenlerini .env dosyasından yükler"""
    if os.path.exists('.env'):
        logger.info("Loading environment variables from .env file")
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key] = value
                    if 'token' in key.lower() or 'key' in key.lower():
                        logger.info(f"Loaded {key}=****{value[-4:]}")
                    else:
                        logger.info(f"Loaded {key}={value}")

def verify_token():
    """Cloudflare API token'ın geçerliliğini kontrol eder"""
    url = "https://api.cloudflare.com/client/v4/user/tokens/verify"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            return True
        else:
            logger.error(f"API token doğrulama hatası: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        logger.error(f"API token doğrulama sırasında hata: {str(e)}")
        return False

def check_deploy_status():
    """Cloudflare Pages deployment durumunu kontrol eder"""
    if not CLOUDFLARE_API_TOKEN or not CLOUDFLARE_ACCOUNT_ID:
        logger.error("CLOUDFLARE_API_TOKEN veya CLOUDFLARE_ACCOUNT_ID tanımlanmamış!")
        return False
    
    # Önce API token'ın geçerli olup olmadığını kontrol et
    if not verify_token():
        logger.error("API token geçersiz. Lütfen Cloudflare API token'ınızı kontrol edin.")
        return False
        
    try:
        logger.info(f"Checking deployment status for {PROJECT_NAME}")
        resp = requests.get(CF_PAGES_URL, headers=CF_HEADERS)
        
        if resp.status_code == 200:
            deployments = resp.json().get('result', [])
            if deployments:
                last = deployments[0]
                status = last.get('status')
                trigger = last.get('deployment_trigger', {}).get('type', 'unknown')
                logger.info(f"Son deploy durumu: {status}, tetikleyici: {trigger}")
                
                # Son deployment başarısızsa hata düzeltme
                if status != 'success':
                    logger.warning(f"Deploy başarısız! Hata düzeltme başlatılıyor...")
                    fix_deployment_issues(last)
                return status == 'success'
            else:
                logger.warning("Hiç deployment bulunamadı!")
                return False
        elif resp.status_code == 404:
            logger.warning(f"Proje bulunamadı: {PROJECT_NAME}. Yeni proje oluşturma denenecek.")
            create_cloudflare_project()
            return False
        else:
            logger.error(f"Cloudflare API hatası: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        logger.error(f"Bağlantı hatası: {str(e)}")
        return False

def fix_deployment_issues(deployment):
    """Deployment hatalarını tespit edip düzeltmeyi dener"""
    error_msg = deployment.get('latest_stage', {}).get('status_message', '')
    
    if 'npm' in error_msg.lower() or 'build' in error_msg.lower():
        logger.info("Npm veya build hatası tespit edildi. package.json kontrol ediliyor...")
        fix_npm_build_issues()
    
    elif 'permission' in error_msg.lower() or 'access' in error_msg.lower():
        logger.info("İzin hatası tespit edildi. Cloudflare API token yetkileri kontrol ediliyor...")
        create_github_issue("Cloudflare API Token İzin Hatası", 
                           f"Cloudflare Pages deploymentında izin hatası: {error_msg}\n\nLütfen token yetkilerini kontrol edin.")
    
    elif 'not found' in error_msg.lower() or '404' in error_msg:
        logger.info("Not Found hatası tespit edildi. Proje ve repo ayarları kontrol ediliyor...")
        check_project_settings()
    
    else:
        # Genel hata durumunda GitHub issue oluştur
        create_github_issue("Cloudflare Deployment Hatası", 
                           f"Deployment hatası oluştu: {error_msg}\n\nLütfen build loglarını kontrol edin.")

def fix_npm_build_issues():
    """NPM ve build sorunlarını çözmeye çalışır"""
    try:
        # package.json'ı kontrol et
        if os.path.exists('package.json'):
            with open('package.json', 'r') as f:
                pkg = json.load(f)
                
            # Build script'in doğru olduğundan emin ol
            if 'scripts' in pkg and 'build' in pkg['scripts']:
                logger.info(f"Build komutu: {pkg['scripts']['build']}")
            else:
                logger.warning("Build script bulunamadı! Ekleniyor...")
                if 'scripts' not in pkg:
                    pkg['scripts'] = {}
                pkg['scripts']['build'] = 'vite build'
                
                with open('package.json', 'w') as f:
                    json.dump(pkg, f, indent=2)
                
                # GitHub'a commit ve push
                subprocess.run(['git', 'add', 'package.json'], check=True)
                subprocess.run(['git', 'commit', '-m', 'AI Agent: Build script fixed'], check=True)
                subprocess.run(['git', 'push'], check=True)
                
                logger.info("package.json güncellendi ve GitHub'a push edildi.")
        else:
            logger.error("package.json dosyası bulunamadı!")
    except Exception as e:
        logger.error(f"NPM build hatası düzeltme sırasında hata: {str(e)}")

def check_project_settings():
    """Cloudflare Pages proje ayarlarını kontrol eder"""
    try:
        url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PROJECT_NAME}"
        resp = requests.get(url, headers=CF_HEADERS)
        
        if resp.status_code == 200:
            project = resp.json().get('result', {})
            logger.info(f"Proje ayarları: {json.dumps(project, indent=2)}")
        else:
            logger.error(f"Proje ayarları alınamadı: {resp.status_code} - {resp.text}")
            
            # Proje bulunamadıysa, yeni proje oluştur
            if resp.status_code == 404:
                logger.info("Proje bulunamadı. Yeni proje oluşturuluyor...")
                create_cloudflare_project()
    except Exception as e:
        logger.error(f"Proje ayarları kontrolü sırasında hata: {str(e)}")

def create_cloudflare_project():
    """Yeni bir Cloudflare Pages projesi oluşturur"""
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects"
    data = {
        "name": PROJECT_NAME,
        "production_branch": "main",
        "build_config": {
            "build_command": "npm run build",
            "destination_dir": "dist",
            "root_dir": ""
        }
    }
    
    try:
        resp = requests.post(url, headers=CF_HEADERS, json=data)
        if resp.status_code == 200:
            logger.info(f"Yeni proje oluşturuldu: {PROJECT_NAME}")
        else:
            logger.error(f"Proje oluşturma hatası: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"Proje oluşturma sırasında hata: {str(e)}")

def create_github_issue(title, body):
    """GitHub'da yeni bir issue oluşturur"""
    if not GITHUB_TOKEN:
        logger.error("GITHUB_TOKEN tanımlanmamış! GitHub issue oluşturulamıyor.")
        return
    
    url = f"{GITHUB_API_URL}/issues"
    data = {
        "title": title,
        "body": body + f"\n\n_Bu issue AI Agent tarafından otomatik oluşturuldu. {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_"
    }
    
    try:
        resp = requests.post(url, headers=GITHUB_HEADERS, json=data)
        if resp.status_code == 201:
            issue = resp.json()
            logger.info(f"GitHub issue oluşturuldu: {issue.get('html_url')}")
        else:
            logger.error(f"GitHub issue oluşturma hatası: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"GitHub issue oluşturma sırasında hata: {str(e)}")

def main():
    """AI Agent'in ana döngüsü"""
    logger.info("AI Agent başlatıldı.")
    load_env()
    
    check_interval = 300  # 5 dakika
    
    while True:
        logger.info("-" * 50)
        logger.info("Cloudflare & GitHub otomasyon kontrolü yapılıyor...")
        
        status_ok = check_deploy_status()
        
        if status_ok:
            logger.info("✅ Tüm sistemler çalışıyor!")
            check_interval = 300  # Başarılıysa 5 dakika bekle
        else:
            logger.warning("⚠️ Sorunlar tespit edildi!")
            check_interval = 60  # Sorun varsa 1 dakika bekle
        
        logger.info(f"Bir sonraki kontrol {check_interval} saniye sonra.")
        time.sleep(check_interval)

if __name__ == "__main__":
    main()
