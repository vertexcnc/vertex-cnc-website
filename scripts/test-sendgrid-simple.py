#!/usr/bin/env python3
"""
SendGrid API Basit Test Scripti
Domain doğrulandıktan sonra e-mail gönderim testi
"""

import requests
import os
import time
from datetime import datetime

def test_sendgrid_auth():
    """SendGrid API kimlik doğrulaması test"""
    print("=" * 70)
    print("🧪 SENDGRID API KİMLİK DOĞRULAMA TESTİ")
    print("=" * 70)
    
    api_key = os.environ.get('SENDGRID_API_KEY')
    if not api_key:
        print("❌ SENDGRID_API_KEY environment variable bulunamadı!")
        return False
    
    print(f"🔑 API Key: {api_key[:20]}...")
    
    # Headers
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # API durumu kontrolü
    print("\n🔍 SendGrid API durumu kontrol ediliyor...")
    try:
        response = requests.get(
            'https://api.sendgrid.com/v3/user/account',
            headers=headers,
            timeout=10
        )
        
        print(f"📡 API Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SendGrid API kimlik doğrulaması başarılı!")
            print(f"📧 Account Type: {data.get('type', 'Unknown')}")
            return True
        else:
            print(f"❌ SendGrid API Hatası: {response.status_code}")
            print(f"📄 Hata Detayı: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Bağlantı hatası: {str(e)}")
        return False

def test_sendgrid_email():
    """SendGrid ile e-mail gönderim testi"""
    print("\n" + "=" * 70)
    print("📧 SENDGRID E-MAİL GÖNDERİM TESTİ")
    print("=" * 70)
    
    api_key = os.environ.get('SENDGRID_API_KEY')
    
    # Test e-mail verisi
    email_data = {
        "personalizations": [
            {
                "to": [
                    {
                        "email": "destek@vertexcnc.tr",
                        "name": "VERTEX CNC Destek"
                    }
                ],
                "subject": f"VERTEX CNC Test E-mail - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            }
        ],
        "from": {
            "email": "destek@vertexcnc.tr",
            "name": "VERTEX CNC Test System"
        },
        "content": [
            {
                "type": "text/html",
                "value": """
                <h2>🎉 SendGrid Test E-mail</h2>
                <p>Bu e-mail VERTEX CNC web sitesi e-mail sisteminin test mesajıdır.</p>
                <ul>
                    <li>✅ SendGrid API bağlantısı çalışıyor</li>
                    <li>✅ DNS kayıtları eklendi</li>
                    <li>✅ Domain doğrulaması tamamlandı</li>
                </ul>
                <p><strong>Gönderim Zamanı:</strong> {}</p>
                <hr>
                <small>VERTEX CNC - Premium CNC Makineleri</small>
                """.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            }
        ]
    }
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    print("📤 E-mail gönderiliyor...")
    try:
        response = requests.post(
            'https://api.sendgrid.com/v3/mail/send',
            headers=headers,
            json=email_data,
            timeout=15
        )
        
        print(f"📡 Response Code: {response.status_code}")
        
        if response.status_code == 202:
            print("✅ E-mail başarıyla gönderildi!")
            print("📬 Gelen kutuyu kontrol edin: destek@vertexcnc.tr")
            return True
        else:
            print(f"❌ E-mail gönderim hatası: {response.status_code}")
            print(f"📄 Hata Detayı: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ E-mail gönderim hatası: {str(e)}")
        return False

def main():
    print(f"⏰ Test Zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. API kimlik doğrulaması
    auth_success = test_sendgrid_auth()
    
    if auth_success:
        print("\n⏳ DNS yayılması için 5 saniye bekleniyor...")
        time.sleep(5)
        
        # 2. E-mail gönderim testi
        email_success = test_sendgrid_email()
        
        print("\n" + "=" * 70)
        if email_success:
            print("🎉 TÜM TESTLER BAŞARILI!")
            print("📧 E-mail sistemi hazır ve çalışıyor")
        else:
            print("⚠️ E-mail gönderim sorunu var")
            print("💡 DNS yayılmasını bekleyin ve tekrar deneyin")
    else:
        print("\n❌ API kimlik doğrulaması başarısız")
        print("💡 API key ve DNS ayarlarını kontrol edin")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
