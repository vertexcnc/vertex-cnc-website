#!/usr/bin/env python3
"""
Direct API Test - Direkt API fonksiyonlarını test eder
"""

import sys
import os
sys.path.append('/workspaces/vertex-cnc-website/api')

# Import API functions directly
from app import create_order_record, create_pdf_quote, send_email_with_fallback
from datetime import datetime
import json

def test_direct_quote_system():
    """API fonksiyonlarını doğrudan test et"""
    
    print("🧪 VERTEXi CNC - DİREKT API TEST BAŞLIYOR")
    print("=" * 60)
    print(f"📅 Test Zamanı: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
    print()
    
    # Test data
    test_data = {
        "companyName": "Test Şirketi A.Ş.",
        "contactName": "Ahmet Yılmaz",
        "email": "destek@vertexcnc.tr",
        "phone": "+90 532 123 45 67",
        "projectDescription": "CNC ile işlenecek 50 adet alüminyum parça. Hassas ölçümler gerekiyor.",
        "quantity": "50 adet",
        "material": "Alüminyum 6061-T6",
        "deadline": "2 hafta",
        "additionalNotes": "Kalite kontrol sertifikası gerekli. ISO 9001 uyumlu üretim isteniyor.",
        "files": [
            {
                "name": "part_drawing.dwg",
                "size": 2048576,
                "type": "application/dwg"
            }
        ]
    }
    
    try:
        # 1. Sipariş numarası oluştur
        print("📦 SİPARİŞ NUMARASI OLUŞTURULUYOR...")
        order_number = f"VTX-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"
        print(f"   ✅ Sipariş No: {order_number}")
        
        # 2. Sipariş kaydı oluştur
        print("💾 SİPARİŞ KAYDI OLUŞTURULUYOR...")
        tracking_id = create_order_record(order_number, test_data)
        print(f"   ✅ Takip ID: {tracking_id}")
        
        # 3. PDF oluştur
        print("📄 PDF OLUŞTURULUYOR...")
        pdf_buffer = create_pdf_quote(test_data, order_number)
        pdf_data = pdf_buffer.getvalue()
        print(f"   ✅ PDF boyutu: {len(pdf_data)} bytes")
        
        # PDF'i kaydet
        pdf_filename = f"/tmp/test_quote_{order_number}.pdf"
        with open(pdf_filename, 'wb') as f:
            f.write(pdf_data)
        print(f"   ✅ PDF kaydedildi: {pdf_filename}")
        
        # 4. Takip URL'si oluştur
        print("🔗 TAKİP URL'Sİ OLUŞTURULUYOR...")
        tracking_url = f"http://localhost:5174/track/{tracking_id}"
        print(f"   ✅ Takip URL: {tracking_url}")
        
        # 5. E-mail gönder
        print("📧 E-MAİL GÖNDERİLİYOR...")
        
        # HTML e-mail içeriği
        customer_email_html = f"""
        <h2>Teklif Talebiniz Alındı - {order_number}</h2>
        <p>Sayın {test_data.get('contactName', '')},</p>
        <p>Teklif talebiniz başarıyla alınmıştır.</p>
        <p><strong>Sipariş Numarası:</strong> {order_number}</p>
        <p><strong>Takip Linki:</strong> <a href="{tracking_url}">Siparişi Takip Et</a></p>
        <p>24 saat içinde detaylı teklifimizi size ileteceğiz.</p>
        <p>VERTEX CNC Ekibi</p>
        """
        
        # PDF eki hazırla
        attachments = [{
            'filename': f'Teklif_Talebi_{order_number}.pdf',
            'data': pdf_data
        }]
        
        # E-mail gönder
        email_sent = send_email_with_fallback(
            to_email=test_data.get('email', ''),
            subject=f"Teklif Talebiniz Alındı - {order_number}",
            body=customer_email_html,
            attachments=attachments,
            is_html=True
        )
        
        print(f"   ✅ E-mail durumu: {'Gönderildi' if email_sent else 'Gönderilemedi'}")
        
        # 6. Sonuçları göster
        print()
        print("🎉 TEST SONUÇLARI")
        print("=" * 30)
        print(f"✅ Sipariş Numarası: {order_number}")
        print(f"✅ Takip ID: {tracking_id}")
        print(f"✅ PDF Oluşturuldu: {pdf_filename}")
        print(f"✅ E-mail Gönderildi: {'Evet' if email_sent else 'Hayır'}")
        print(f"✅ Takip URL: {tracking_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ HATA: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_direct_quote_system()
    
    print()
    print("=" * 60)
    if success:
        print("🎉 TÜM TESTLER BAŞARILI!")
        print("📧 E-posta kontrolü: destek@vertexcnc.tr")
        print("📄 PDF dosyası /tmp/ klasöründe")
    else:
        print("❌ TESTLER BAŞARISIZ!")
    print("=" * 60)
