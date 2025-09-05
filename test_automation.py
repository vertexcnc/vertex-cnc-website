#!/usr/bin/env python3

import os
import requests
import json
import sys

# Renkli çıktı için
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def load_env():
    """Ortam değişkenlerini .env dosyasından yükler"""
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key] = value
                    
def test_cloudflare_connection():
    """Cloudflare API bağlantısını test eder"""
    token = os.getenv('CLOUDFLARE_API_TOKEN', "1il_17x8r1BV2Mtf_g3736NoAuRe-g5jFmT9c5gH")
    account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID', "ac59bcba451f212de66aef49fb66fc75")
    
    if not token or not account_id:
        print(f"{RED}Hata: CLOUDFLARE_API_TOKEN veya CLOUDFLARE_ACCOUNT_ID tanımlanmamış.{RESET}")
        print(f"{YELLOW}Bu değerleri .env dosyasına ekleyin veya GitHub secrets'a ekleyin.{RESET}")
        return False
    
    print(f"{YELLOW}Token: {token[:5]}...{token[-5:]} (uzunluk: {len(token)}){RESET}")
    print(f"{YELLOW}Account ID: {account_id}{RESET}")
    
    # Önce basit bir API çağrısı yapalım
    url = "https://api.cloudflare.com/client/v4/user/tokens/verify"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Önce token'ı doğrulayalım
        verify_response = requests.get(url, headers=headers)
        if verify_response.status_code == 200:
            print(f"{GREEN}✓ API token doğrulaması başarılı!{RESET}")
            
            # Şimdi Pages projelerine bakalım
            projects_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects"
            response = requests.get(projects_url, headers=headers)
            
            if response.status_code == 200:
                projects = response.json().get('result', [])
                print(f"{GREEN}✓ Cloudflare API bağlantısı başarılı!{RESET}")
                print(f"{GREEN}✓ {len(projects)} adet Pages projesi bulundu.{RESET}")
                for project in projects:
                    print(f"  - {project.get('name')}: {project.get('subdomain')}.pages.dev")
                return True
            else:
                print(f"{RED}✗ Pages API hatası: {response.status_code} - {response.text}{RESET}")
                print(f"{YELLOW}Bu hata account_id ile ilgili olabilir veya API token'ının Pages'a erişim izni olmayabilir.{RESET}")
                return False
        else:
            print(f"{RED}✗ Token doğrulama hatası: {verify_response.status_code} - {verify_response.text}{RESET}")
            print(f"{YELLOW}API token geçersiz veya süresi dolmuş olabilir.{RESET}")
            return False
    except Exception as e:
        print(f"{RED}✗ Bağlantı hatası: {str(e)}{RESET}")
        return False

def test_github_connection():
    """GitHub API bağlantısını test eder"""
    token = os.getenv('GITHUB_TOKEN')
    
    if not token:
        print(f"{RED}Hata: GITHUB_TOKEN tanımlanmamış.{RESET}")
        print(f"{YELLOW}Bu değeri .env dosyasına ekleyin veya GitHub secrets'a ekleyin.{RESET}")
        return False
    
    url = "https://api.github.com/repos/vertexcnc/vertex-cnc-website"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            repo_data = response.json()
            print(f"{GREEN}✓ GitHub API bağlantısı başarılı!{RESET}")
            print(f"{GREEN}✓ Repository: {repo_data.get('full_name')}{RESET}")
            
            # Workflow dosyalarını kontrol et
            workflows_url = f"https://api.github.com/repos/vertexcnc/vertex-cnc-website/actions/workflows"
            workflows_response = requests.get(workflows_url, headers=headers)
            
            if workflows_response.status_code == 200:
                workflows = workflows_response.json().get('workflows', [])
                print(f"{GREEN}✓ {len(workflows)} adet workflow dosyası bulundu.{RESET}")
                for workflow in workflows:
                    print(f"  - {workflow.get('name')}: {workflow.get('state')}")
            return True
        else:
            print(f"{RED}✗ GitHub API hatası: {response.status_code} - {response.text}{RESET}")
            return False
    except Exception as e:
        print(f"{RED}✗ Bağlantı hatası: {str(e)}{RESET}")
        return False

def verify_workflow_file():
    """GitHub Actions workflow dosyasını doğrular"""
    workflow_path = '.github/workflows/cloudflare-pages.yml'
    if not os.path.exists(workflow_path):
        print(f"{RED}✗ Workflow dosyası bulunamadı: {workflow_path}{RESET}")
        return False
    
    print(f"{GREEN}✓ GitHub Actions workflow dosyası mevcut.{RESET}")
    return True

def test_all():
    """Tüm bağlantıları ve ayarları test eder"""
    load_env()
    
    print("\n=== Cloudflare & GitHub Otomasyon Test ===\n")
    
    cloudflare_ok = test_cloudflare_connection()
    github_ok = test_github_connection()
    workflow_ok = verify_workflow_file()
    
    print("\n=== Test Sonuçları ===\n")
    
    if cloudflare_ok and github_ok and workflow_ok:
        print(f"{GREEN}✓ Tüm testler başarılı! Sistem tam otomasyona hazır.{RESET}")
        print(f"{GREEN}✓ GitHub'a bir commit push ettiğinizde, Cloudflare Pages'a otomatik deploy gerçekleşecek.{RESET}")
        return 0
    else:
        print(f"{YELLOW}⚠️  Bazı testler başarısız! Lütfen hataları düzeltin.{RESET}")
        if not cloudflare_ok:
            print(f"{YELLOW}⚠️  Cloudflare API anahtarlarını kontrol edin.{RESET}")
        if not github_ok:
            print(f"{YELLOW}⚠️  GitHub token'ını kontrol edin.{RESET}")
        if not workflow_ok:
            print(f"{YELLOW}⚠️  GitHub Actions workflow dosyasını kontrol edin.{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(test_all())
