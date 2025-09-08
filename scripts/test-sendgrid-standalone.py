#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SendGrid E-mail Test Script
SendGrid API'sinin çalışıp çalışmadığını test eder.
"""

import os
import sys
import json
import requests
from datetime import datetime

def test_sendgrid_email():
    """SendGrid ile test e-maili gönderir"""
    try:
        # Environment variables'ı yükle
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY', '4VR37VJ8PYTSR69KZFUJ8YRF')
        from_email = os.getenv('FROM_EMAIL', 'destek@vertexcnc.tr')
        
        print("🔧 SendGrid Test Başlatılıyor...")
        print(f"   API Key: {sendgrid_api_key[:10]}...")
        print(f"   From Email: {from_email}")
        
        # Test e-mail içeriği
        test_email = "test@example.com"  # Test için geçici e-mail
        
        # SendGrid API payload'u
        payload = {
            "personalizations": [{
                "to": [{"email": test_email}],
                "subject": f"VERTEX CNC SendGrid Test - {datetime.now().strftime('%d.%m.%Y %H:%M')}"
            }],
            "from": {"email": from_email, "name": "VERTEX CNC Test"},
            "content": [{
                "type": "text/html", 
                "value": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SendGrid Test</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
        .success {{ background-color: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h2>✅ SendGrid Test Başarılı!</h2>
            <p>VERTEX CNC e-mail sistemi çalışıyor.</p>
        </div>
        <p><strong>Test Zamanı:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</p>
        <p><strong>API Key:</strong> {sendgrid_api_key[:10]}...</p>
        <p><strong>Gönderen:</strong> {from_email}</p>
        <p><strong>Alıcı:</strong> {test_email}</p>
    </div>
</body>
</html>
                """
            }]
        }
        
        print(f"📧 Test e-maili gönderiliyor: {test_email}")
        
        # SendGrid API çağrısı
        response = requests.post(
            'https://api.sendgrid.com/v3/mail/send',
            headers={
                'Authorization': f'Bearer {sendgrid_api_key}',
                'Content-Type': 'application/json'
            },
            json=payload,
            timeout=30
        )
        
        print(f"📡 API Response: {response.status_code}")
        
        if response.status_code == 202:
            print("✅ SendGrid e-mail başarıyla gönderildi!")
            print(f"   Response Headers: {dict(response.headers)}")
            return True
        else:
            print(f"❌ SendGrid hatası: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        return False

def test_with_real_email():
    """Gerçek e-mail adresi ile test (opsiyonel)"""
    real_email = input("Gerçek e-mail adresi girin (test için) veya Enter'e basın: ").strip()
    
    if not real_email:
        print("⏭️ Gerçek e-mail testi atlandı.")
        return True
    
    try:
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY', '4VR37VJ8PYTSR69KZFUJ8YRF')
        from_email = os.getenv('FROM_EMAIL', 'destek@vertexcnc.tr')
        
        payload = {
            "personalizations": [{
                "to": [{"email": real_email}],
                "subject": f"VERTEX CNC Test E-mail - {datetime.now().strftime('%d.%m.%Y %H:%M')}"
            }],
            "from": {"email": from_email, "name": "VERTEX CNC"},
            "content": [{
                "type": "text/html", 
                "value": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VERTEX CNC Test</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
        .header {{ text-align: center; border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }}
        .logo {{ color: #ff6b35; font-size: 24px; font-weight: bold; }}
        .success {{ background-color: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VERTEX CNC</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">Mikron Hassasiyetinde Geleceği Şekillendiriyoruz</p>
        </div>
        
        <div class="success">
            <h2>✅ E-mail Sistemi Test Başarılı!</h2>
            <p>Teklif Al sistemi hazır ve çalışıyor.</p>
        </div>
        
        <h3>Test Detayları:</h3>
        <ul>
            <li><strong>Tarih:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</li>
            <li><strong>API:</strong> SendGrid</li>
            <li><strong>Gönderen:</strong> {from_email}</li>
            <li><strong>Test Türü:</strong> E-mail Sistem Doğrulaması</li>
        </ul>
        
        <p style="margin-top: 30px; text-align: center; color: #6b7280;">
            Bu e-mail VERTEX CNC e-mail sistemi tarafından otomatik olarak gönderilmiştir.
        </p>
    </div>
</body>
</html>
                """
            }]
        }
        
        print(f"📧 Gerçek e-mail gönderiliyor: {real_email}")
        
        response = requests.post(
            'https://api.sendgrid.com/v3/mail/send',
            headers={
                'Authorization': f'Bearer {sendgrid_api_key}',
                'Content-Type': 'application/json'
            },
            json=payload,
            timeout=30
        )
        
        if response.status_code == 202:
            print(f"✅ Gerçek e-mail başarıyla gönderildi: {real_email}")
            print("   📱 E-mail kutunuzu kontrol edin!")
            return True
        else:
            print(f"❌ Gerçek e-mail gönderilemedi: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Gerçek e-mail hatası: {str(e)}")
        return False

def main():
    print("="*60)
    print("📧 VERTEX CNC SENDGRID E-MAİL TESTİ")
    print("="*60)
    print(f"⏰ Test zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    
    # Environment variables kontrol
    env_vars = {
        'SENDGRID_API_KEY': os.getenv('SENDGRID_API_KEY', '4VR37VJ8PYTSR69KZFUJ8YRF'),
        'FROM_EMAIL': os.getenv('FROM_EMAIL', 'destek@vertexcnc.tr'),
        'SUPPORT_EMAIL': os.getenv('SUPPORT_EMAIL', 'destek@vertexcnc.tr')
    }
    
    print("\n🔧 Environment Variables:")
    for key, value in env_vars.items():
        if 'KEY' in key:
            display_value = f"{value[:10]}..." if value else "YOK"
        else:
            display_value = value or "YOK"
        print(f"   {key}: {display_value}")
    
    print("\n" + "="*60)
    print("🚀 TESTLER BAŞLATIYOR")
    print("="*60)
    
    # Test 1: SendGrid API Test
    print("\n📋 SendGrid API Testi...")
    sendgrid_success = test_sendgrid_email()
    
    # Test 2: Gerçek E-mail Test (opsiyonel)
    print("\n📋 Gerçek E-mail Testi (Opsiyonel)...")
    real_email_success = test_with_real_email()
    
    # Sonuçlar
    print("\n" + "="*60)
    print("📊 TEST SONUÇLARI")
    print("="*60)
    
    results = [
        ("SendGrid API Test", sendgrid_success),
        ("Gerçek E-mail Test", real_email_success)
    ]
    
    success_count = sum(1 for _, result in results if result)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Toplam: {success_count}/{len(results)} test başarılı")
    
    if sendgrid_success:
        print("\n🎉 SENDGRID E-MAİL SİSTEMİ ÇALIŞIYOR!")
        print("   ✅ Teklif Al formu e-mail gönderebilir")
        print("   ✅ Müşteri bilgilendirme e-mailleri gönderebilir")
        print("   ✅ Destek ekibi bildirimleri gönderebilir")
        return 0
    else:
        print("\n⚠️ E-MAİL SİSTEMİ SORUNLU!")
        print("   ❌ SendGrid API anahtarını kontrol edin")
        print("   ❌ Domain doğrulamasını kontrol edin")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️ Test kullanıcı tarafından durduruldu.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Beklenmeyen hata: {str(e)}")
        sys.exit(1)
