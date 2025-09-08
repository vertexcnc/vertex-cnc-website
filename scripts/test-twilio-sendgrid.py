#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Twilio SendGrid API Test
SID:SECRET formatı ile test
"""

import requests
import base64
import json
from datetime import datetime

def test_twilio_sendgrid():
    """Twilio SendGrid API ile test"""
    
    # Twilio SID ve Secret  
    sid = "YOUR_TWILIO_SID_HERE"
    secret = "YOUR_TWILIO_SECRET_HERE"
    
    print("🔧 Twilio SendGrid Test Başlatılıyor...")
    print(f"   SID: {sid}")
    print(f"   Secret: {secret[:10]}...")
    
    # Basic Auth header oluştur
    credentials = f"{sid}:{secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    try:
        # Twilio SendGrid API endpoint'i
        url = "https://api.sendgrid.com/v3/mail/send"
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }
        
        # Test e-mail payload'u
        payload = {
            "personalizations": [{
                "to": [{"email": "destek@vertexcnc.tr"}],
                "subject": f"VERTEX CNC Twilio Test - {datetime.now().strftime('%d.%m.%Y %H:%M')}"
            }],
            "from": {"email": "destek@vertexcnc.tr", "name": "VERTEX CNC"},
            "content": [{
                "type": "text/html", 
                "value": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Twilio SendGrid Test</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
        .success {{ background-color: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h2>✅ Twilio SendGrid Test Başarılı!</h2>
            <p>VERTEX CNC e-mail sistemi çalışıyor.</p>
        </div>
        <p><strong>Test Zamanı:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</p>
        <p><strong>SID:</strong> {sid}</p>
        <p><strong>Auth Type:</strong> Basic Auth</p>
    </div>
</body>
</html>
                """
            }]
        }
        
        print(f"📧 Test e-maili gönderiliyor...")
        print(f"   URL: {url}")
        print(f"   Auth: Basic {encoded_credentials[:20]}...")
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"📡 API Response: {response.status_code}")
        
        if response.status_code == 202:
            print("✅ Twilio SendGrid e-mail başarıyla gönderildi!")
            return True
        else:
            print(f"❌ Twilio SendGrid hatası: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        return False

def test_regular_sendgrid():
    """Normal SendGrid API formatı ile test"""
    
    # Normal SendGrid API Key formatları dene
    api_keys = [
        "SG.YOUR_API_KEY_PART1.YOUR_API_KEY_PART2",
        "SG.YOUR_API_KEY_PART1-YOUR_API_KEY_PART2", 
        "YOUR_API_KEY_PART1.YOUR_API_KEY_PART2"
    ]
    
    for i, api_key in enumerate(api_keys, 1):
        print(f"\n📋 SendGrid Format {i} Test...")
        print(f"   API Key: {api_key[:20]}...")
        
        try:
            url = "https://api.sendgrid.com/v3/mail/send"
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "personalizations": [{
                    "to": [{"email": "destek@vertexcnc.tr"}],
                    "subject": f"VERTEX CNC SendGrid Format {i} Test - {datetime.now().strftime('%H:%M')}"
                }],
                "from": {"email": "destek@vertexcnc.tr", "name": "VERTEX CNC"},
                "content": [{
                    "type": "text/plain", 
                    "value": f"SendGrid Format {i} test e-maili. Test zamanı: {datetime.now()}"
                }]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            print(f"   📡 Response: {response.status_code}")
            
            if response.status_code == 202:
                print(f"   ✅ Format {i} başarılı!")
                return True, api_key
            else:
                print(f"   ❌ Format {i} başarısız: {response.text[:100]}")
                
        except Exception as e:
            print(f"   ❌ Format {i} hatası: {str(e)}")
    
    return False, None

def main():
    print("=" * 60)
    print("📧 VERTEX CNC TWILIO SENDGRID TEST")
    print("=" * 60)
    print(f"⏰ Test zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    
    # Test 1: Twilio Basic Auth
    print("\n🔧 Test 1: Twilio Basic Auth...")
    twilio_success = test_twilio_sendgrid()
    
    if twilio_success:
        print("\n🎉 TWİLİO SENDGRID BAŞARILI!")
        print("   API anahtarınız Twilio formatında çalışıyor")
        return
    
    # Test 2: Farklı SendGrid formatları
    print("\n🔧 Test 2: SendGrid API Key Formatları...")
    sendgrid_success, working_key = test_regular_sendgrid()
    
    if sendgrid_success:
        print(f"\n🎉 SENDGRID BAŞARILI!")
        print(f"   Çalışan format: {working_key[:30]}...")
        print("\n✅ .dev.vars dosyasını güncelleyin:")
        print(f"SENDGRID_API_KEY={working_key}")
    else:
        print("\n❌ TÜM FORMATLAR BAŞARISIZ!")
        print("\n🔧 Çözüm önerileri:")
        print("   1. SendGrid hesabında yeni API Key oluşturun")
        print("   2. 'Full Access' yetkisi verin")
        print("   3. Domain doğrulaması yapın")
        print("   4. Sender Authentication tamamlayın")

if __name__ == "__main__":
    main()
