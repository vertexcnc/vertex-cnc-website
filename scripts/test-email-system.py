#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VERTEX CNC E-mail Test Script
Bu script e-mail sisteminin çalışıp çalışmadığını test eder.
"""

import os
import sys
import json
import requests
from datetime import datetime

# Test konfigürasyonu
TEST_CONFIG = {
    'api_url': 'http://localhost:5001',
    'test_email': 'test@example.com',
    'test_data': {
        'companyName': 'Test Şirketi',
        'contactName': 'Test Kullanıcı',
        'email': 'test@example.com',
        'phone': '+90 555 123 45 67',
        'projectDescription': 'Test projesi - CNC işleme talebi',
        'quantity': '10',
        'material': 'Alüminyum 6061',
        'deadline': '2024-12-31',
        'additionalNotes': 'Bu bir test talebidir.',
        'files': [
            {'name': 'test_part.dwg', 'size': '2.5 MB', 'type': 'application/dwg'},
            {'name': 'assembly.step', 'size': '1.8 MB', 'type': 'application/step'}
        ]
    }
}

def test_api_health():
    """API'nin çalışıp çalışmadığını kontrol eder"""
    try:
        response = requests.get(f"{TEST_CONFIG['api_url']}/health", timeout=10)
        if response.status_code == 200:
            print("✅ API sağlık kontrolü başarılı")
            return True
        else:
            print(f"❌ API sağlık kontrolü başarısız: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API bağlantı hatası: {str(e)}")
        return False

def test_quote_email():
    """Teklif e-maili gönderimini test eder"""
    try:
        print("📧 E-mail gönderim testi başlatılıyor...")
        
        response = requests.post(
            f"{TEST_CONFIG['api_url']}/api/send-quote-email",
            json=TEST_CONFIG['test_data'],
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ E-mail gönderim testi başarılı!")
                print(f"   📧 Sipariş No: {result.get('orderNumber')}")
                print(f"   🔗 Takip ID: {result.get('trackingId')}")
                print(f"   📎 PDF oluşturuldu: {result.get('pdfPath', 'Evet')}")
                print(f"   📨 E-mail durumu: {'Gönderildi' if result.get('emailSent') else 'Gönderilmedi'}")
                print(f"   📋 Ek sayısı: {result.get('attachments', 0)}")
                return True
            else:
                print(f"❌ E-mail gönderim hatası: {result.get('message', 'Bilinmeyen hata')}")
                return False
        else:
            print(f"❌ HTTP hatası: {response.status_code}")
            print(f"   Yanıt: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ E-mail test hatası: {str(e)}")
        return False

def test_order_tracking():
    """Sipariş takip sistemini test eder"""
    try:
        # Önce bir sipariş oluştur
        quote_response = requests.post(
            f"{TEST_CONFIG['api_url']}/api/send-quote-email",
            json=TEST_CONFIG['test_data'],
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if quote_response.status_code != 200:
            print("❌ Sipariş oluşturulamadı, takip testi yapılamıyor")
            return False
            
        quote_result = quote_response.json()
        tracking_id = quote_result.get('trackingId')
        
        if not tracking_id:
            print("❌ Takip ID alınamadı")
            return False
        
        # Takip sistemini test et
        tracking_response = requests.get(
            f"{TEST_CONFIG['api_url']}/api/track-order/{tracking_id}",
            timeout=10
        )
        
        if tracking_response.status_code == 200:
            tracking_result = tracking_response.json()
            if tracking_result.get('success'):
                print("✅ Sipariş takip testi başarılı!")
                print(f"   🔍 Takip ID: {tracking_id}")
                print(f"   📦 Sipariş durumu: {tracking_result.get('order', {}).get('status', 'Bilinmiyor')}")
                return True
            else:
                print(f"❌ Takip hatası: {tracking_result.get('message', 'Bilinmeyen hata')}")
                return False
        else:
            print(f"❌ Takip HTTP hatası: {tracking_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Takip test hatası: {str(e)}")
        return False

def print_environment_info():
    """Environment bilgilerini gösterir"""
    print("\n" + "="*60)
    print("🔧 ENVIRONMENT BİLGİLERİ")
    print("="*60)
    
    env_vars = [
        'SMTP_SERVER', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_USE_TLS',
        'SENDGRID_API_KEY', 'FROM_EMAIL', 'SUPPORT_EMAIL'
    ]
    
    for var in env_vars:
        value = os.getenv(var, 'YOK')
        if 'PASSWORD' in var or 'KEY' in var:
            value = '***' if value != 'YOK' else 'YOK'
        print(f"   {var}: {value}")

def main():
    """Ana test fonksiyonu"""
    print("="*60)
    print("📧 VERTEX CNC E-MAİL SİSTEM TESTİ")
    print("="*60)
    print(f"⏰ Test zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    print(f"🌐 API URL: {TEST_CONFIG['api_url']}")
    print(f"📧 Test e-mail: {TEST_CONFIG['test_email']}")
    
    # Environment bilgilerini göster
    print_environment_info()
    
    print("\n" + "="*60)
    print("🚀 TESTLER BAŞLATIYOR")
    print("="*60)
    
    tests = [
        ("API Sağlık Kontrolü", test_api_health),
        ("E-mail Gönderim", test_quote_email),
        ("Sipariş Takip", test_order_tracking)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name} testi çalışıyor...")
        result = test_func()
        results.append((test_name, result))
        
        if result:
            print(f"✅ {test_name} - BAŞARILI")
        else:
            print(f"❌ {test_name} - BAŞARISIZ")
    
    # Sonuçları özetle
    print("\n" + "="*60)
    print("📊 TEST SONUÇLARI")
    print("="*60)
    
    success_count = sum(1 for _, result in results if result)
    total_count = len(results)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"   {test_name}: {status}")
    
    print(f"\n🎯 Toplam: {success_count}/{total_count} test başarılı")
    
    if success_count == total_count:
        print("🎉 TÜM TESTLER BAŞARILI! E-mail sistemi çalışıyor.")
        return 0
    else:
        print("⚠️ Bazı testler başarısız. Lütfen konfigürasyonu kontrol edin.")
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
