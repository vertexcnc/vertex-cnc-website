#!/usr/bin/env python3
"""
VERTEX CNC - Teklif Talebi Test Scripti
Sipariş oluşturma ve e-mail gönderimini test eder
"""

import requests
import json
from datetime import datetime

# Test data
test_quote_data = {
    "companyName": "Test Şirketi A.Ş.",
    "contactName": "Ahmet Yılmaz",
    "email": "destek@vertexcnc.tr",  # Test için kendi e-mail adresimize gönderelim
    "phone": "+90 532 123 45 67",
    "projectDescription": "CNC ile işlenecek 50 adet alüminyum parça. Hassas ölçümler gerekiyor. CAD dosyası ektedir.",
    "quantity": "50 adet",
    "material": "Alüminyum 6061-T6",
    "deadline": "2 hafta",
    "additionalNotes": "Kalite kontrol sertifikası gerekli. ISO 9001 uyumlu üretim isteniyor.",
    "files": [
        {
            "name": "part_drawing.dwg",
            "size": 2048576,  # 2MB
            "type": "application/dwg"
        },
        {
            "name": "3d_model.step",
            "size": 5242880,  # 5MB
            "type": "application/step"
        }
    ]
}

def test_quote_request():
    """Teklif talebi gönder ve sonucu test et"""
    
    print("🧪 VERTEX CNC - TEKLİF TALEBİ TEST BAŞLIYOR")
    print("=" * 60)
    print(f"📅 Test Zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    print()
    
    # Test verilerini göster
    print("📋 TEST VERİLERİ:")
    print(f"   • Şirket: {test_quote_data['companyName']}")
    print(f"   • İletişim: {test_quote_data['contactName']}")
    print(f"   • E-posta: {test_quote_data['email']}")
    print(f"   • Proje: {test_quote_data['projectDescription'][:50]}...")
    print(f"   • Dosya Sayısı: {len(test_quote_data['files'])}")
    print()
    
    try:
        # API'ye POST isteği gönder
        print("📤 API'ye teklif talebi gönderiliyor...")
        
        url = "http://127.0.0.1:5001/api/send-quote-email"
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.post(url, json=test_quote_data, headers=headers, timeout=30)
        
        print(f"📡 HTTP Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ TEKLİF TALEBİ BAŞARILI!")
            print("=" * 60)
            print(f"📦 Sipariş Numarası: {result.get('orderNumber', 'N/A')}")
            print(f"🔗 Takip ID: {result.get('trackingId', 'N/A')}")
            print(f"🌐 Takip URL: {result.get('trackingUrl', 'N/A')}")
            print(f"📄 PDF Oluşturuldu: {'✅' if result.get('pdfPath') else '❌'}")
            print(f"📧 E-mail Gönderildi: {'✅' if result.get('emailSent') else '❌'}")
            print(f"📎 Ek Dosya Sayısı: {result.get('attachments', 0)}")
            print()
            
            # Takip testi
            tracking_id = result.get('trackingId')
            if tracking_id:
                print("🔍 SİPARİŞ TAKİP TESTİ")
                print("=" * 30)
                test_tracking(tracking_id)
            
            return True
            
        else:
            print(f"❌ API Hatası: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Hata Mesajı: {error_data.get('message', 'Bilinmeyen hata')}")
            except:
                print(f"   Ham Yanıt: {response.text}")
            
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ İstek zaman aşımına uğradı (30 saniye)")
        return False
    except requests.exceptions.ConnectionError:
        print("🔌 API'ye bağlanılamadı. Flask uygulaması çalışıyor mu?")
        return False
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {str(e)}")
        return False

def test_tracking(tracking_id):
    """Sipariş takibini test et"""
    
    try:
        print(f"📱 Takip ID: {tracking_id}")
        
        url = f"http://127.0.0.1:5001/api/track-order/{tracking_id}"
        response = requests.get(url, timeout=10)
        
        print(f"📡 Takip API Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                order = result.get('order', {})
                print("✅ Sipariş bilgileri alındı:")
                print(f"   • Sipariş No: {order.get('orderNumber', 'N/A')}")
                print(f"   • Durum: {order.get('status', 'N/A')}")
                print(f"   • İlerleme: {order.get('overallProgress', 0)}%")
                print(f"   • Müşteri: {order.get('customerInfo', {}).get('companyName', 'N/A')}")
                
                # Aşama bilgileri
                stages = order.get('stages', [])
                print(f"   • Toplam Aşama: {len(stages)}")
                completed_stages = len([s for s in stages if s.get('status') == 'completed'])
                print(f"   • Tamamlanan: {completed_stages}/{len(stages)}")
                
            else:
                print(f"❌ Takip hatası: {result.get('message', 'Bilinmeyen hata')}")
        else:
            print(f"❌ Takip API hatası: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Takip test hatası: {str(e)}")

if __name__ == "__main__":
    success = test_quote_request()
    
    print()
    print("=" * 60)
    if success:
        print("🎉 TÜM TESTLER BAŞARILI!")
        print("📧 E-posta kontrolü: destek@vertexcnc.tr")
        print("📱 Frontend test: http://localhost:5173")
        print("🔗 Takip sayfası aktif")
    else:
        print("❌ TESTLER BAŞARISIZ!")
        print("🔧 API bağlantısını ve Flask uygulamasını kontrol edin")
    print("=" * 60)
