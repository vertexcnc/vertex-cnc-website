#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cloudflare DNS - SendGrid Kayıtları Otomatik Ekleme
"""

import requests
import json
import os
from datetime import datetime

# Cloudflare API ayarları
CLOUDFLARE_API_TOKEN = "VrhH5_su2KsZSc3_jCYXKN0iE4kHd4e0tpu2Y0Wp"
ZONE_NAME = "vertexcnc.tr"

# SendGrid DNS kayıtları
SENDGRID_DNS_RECORDS = [
    {
        "type": "CNAME",
        "name": "em7497",
        "content": "u55791285.wl036.sendgrid.net",
        "ttl": 300,
        "comment": "SendGrid - E-mail Tracking"
    },
    {
        "type": "CNAME", 
        "name": "s1._domainkey",
        "content": "s1.domainkey.u55791285.wl036.sendgrid.net",
        "ttl": 300,
        "comment": "SendGrid - DKIM Key 1"
    },
    {
        "type": "CNAME",
        "name": "s2._domainkey", 
        "content": "s2.domainkey.u55791285.wl036.sendgrid.net",
        "ttl": 300,
        "comment": "SendGrid - DKIM Key 2"
    },
    {
        "type": "TXT",
        "name": "_dmarc",
        "content": "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;",
        "ttl": 300,
        "comment": "SendGrid - DMARC Policy"
    },
    {
        "type": "CNAME",
        "name": "url5722",
        "content": "sendgrid.net",
        "ttl": 300,
        "comment": "SendGrid - URL Tracking"
    },
    {
        "type": "CNAME",
        "name": "55791285",
        "content": "sendgrid.net", 
        "ttl": 300,
        "comment": "SendGrid - Link Branding"
    }
]

def get_zone_id():
    """Cloudflare Zone ID'sini alır"""
    print(f"🔍 Zone ID alınıyor: {ZONE_NAME}")
    
    url = "https://api.cloudflare.com/client/v4/zones"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    params = {"name": ZONE_NAME}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data["success"] and data["result"]:
                zone_id = data["result"][0]["id"]
                print(f"✅ Zone ID bulundu: {zone_id}")
                return zone_id
            else:
                print(f"❌ Zone bulunamadı: {ZONE_NAME}")
                return None
        else:
            print(f"❌ API hatası: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Zone ID alınamadı: {str(e)}")
        return None

def check_existing_record(zone_id, record_name, record_type):
    """Mevcut DNS kaydını kontrol eder"""
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    params = {
        "name": f"{record_name}.{ZONE_NAME}" if record_name != "@" else ZONE_NAME,
        "type": record_type
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data["success"] and data["result"]:
                return data["result"][0]["id"]  # Mevcut kayıt ID'si
        return None
        
    except Exception as e:
        print(f"   ⚠️ Kontrol hatası: {str(e)}")
        return None

def add_dns_record(zone_id, record):
    """DNS kaydı ekler veya günceller"""
    record_name = record["name"]
    full_name = f"{record_name}.{ZONE_NAME}" if record_name != "@" else ZONE_NAME
    
    print(f"\n📋 İşleniyor: {record['type']} {full_name}")
    print(f"   Content: {record['content']}")
    
    # Mevcut kaydı kontrol et
    existing_id = check_existing_record(zone_id, record_name, record["type"])
    
    if existing_id:
        print(f"   ⚠️ Mevcut kayıt bulundu, güncelleniyor...")
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{existing_id}"
        method = "PUT"
    else:
        print(f"   ➕ Yeni kayıt ekleniyor...")
        url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
        method = "POST"
    
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "type": record["type"],
        "name": full_name,
        "content": record["content"],
        "ttl": record["ttl"],
        "comment": record["comment"]
    }
    
    try:
        if method == "POST":
            response = requests.post(url, headers=headers, json=payload)
        else:
            response = requests.put(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            data = response.json()
            if data["success"]:
                print(f"   ✅ Başarılı: {record['type']} {full_name}")
                return True
            else:
                print(f"   ❌ API hatası: {data.get('errors', 'Bilinmeyen hata')}")
                return False
        else:
            print(f"   ❌ HTTP hatası: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Kayıt eklenemedi: {str(e)}")
        return False

def verify_dns_records(zone_id):
    """Eklenen DNS kayıtlarını doğrular"""
    print(f"\n🔍 DNS kayıtları doğrulanıyor...")
    
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                existing_records = data["result"]
                
                sendgrid_records = [r for r in existing_records 
                                  if "sendgrid" in r.get("content", "").lower() 
                                  or r.get("name", "").startswith(("em", "s1._domainkey", "s2._domainkey", "_dmarc", "url", "55791285"))]
                
                print(f"📊 SendGrid DNS Kayıtları ({len(sendgrid_records)} adet):")
                for record in sendgrid_records:
                    print(f"   ✅ {record['type']} {record['name']} → {record['content']}")
                
                return len(sendgrid_records)
            else:
                print(f"❌ API hatası: {data.get('errors')}")
                return 0
        else:
            print(f"❌ HTTP hatası: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"❌ Doğrulama hatası: {str(e)}")
        return 0

def main():
    print("=" * 70)
    print("🚀 CLOUDFLARE DNS - SENDGRID KAYITLARI OTOMATİK EKLEME")
    print("=" * 70)
    print(f"⏰ Başlangıç zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    print(f"🌐 Domain: {ZONE_NAME}")
    print(f"🔑 API Token: {CLOUDFLARE_API_TOKEN[:20]}...")
    
    # Zone ID al
    zone_id = get_zone_id()
    if not zone_id:
        print("\n❌ Zone ID alınamadı, işlem durduruluyor.")
        return 1
    
    print(f"\n📋 {len(SENDGRID_DNS_RECORDS)} adet SendGrid DNS kaydı eklenecek:")
    for record in SENDGRID_DNS_RECORDS:
        print(f"   • {record['type']} {record['name']} → {record['content'][:50]}...")
    
    # Onay al
    print(f"\n⚠️ Bu kayıtlar {ZONE_NAME} domain'ine eklenecek!")
    confirm = input("Devam etmek istiyor musunuz? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("❌ İşlem iptal edildi.")
        return 0
    
    # DNS kayıtlarını ekle
    print(f"\n🔧 DNS kayıtları ekleniyor...")
    
    success_count = 0
    for record in SENDGRID_DNS_RECORDS:
        if add_dns_record(zone_id, record):
            success_count += 1
    
    # Sonuçları doğrula
    print(f"\n📊 İşlem tamamlandı: {success_count}/{len(SENDGRID_DNS_RECORDS)} başarılı")
    
    # DNS kayıtlarını doğrula
    verified_count = verify_dns_records(zone_id)
    
    print(f"\n" + "=" * 70)
    if success_count == len(SENDGRID_DNS_RECORDS):
        print("🎉 TÜM SENDGRID DNS KAYITLARI BAŞARIYLA EKLENDİ!")
        print("=" * 70)
        print("✅ Yapılacaklar:")
        print("   1. SendGrid hesabında domain doğrulamasını tamamlayın")
        print("   2. DNS yayılmasını bekleyin (5-30 dakika)")
        print("   3. SendGrid API'sini test edin")
        print("   4. E-mail gönderim testini yapın")
        
        print(f"\n🔗 SendGrid Domain Doğrulama:")
        print(f"   https://app.sendgrid.com/settings/sender_auth")
        
        return 0
    else:
        print("⚠️ BAZI DNS KAYITLARI EKLENEMEDİ!")
        print("=" * 70)
        print("❌ Manuel olarak eklenmesi gerekebilir")
        print("📞 Cloudflare dashboard'da kontrol edin")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️ İşlem kullanıcı tarafından durduruldu.")
        exit(1)
    except Exception as e:
        print(f"\n\n💥 Beklenmeyen hata: {str(e)}")
        exit(1)
