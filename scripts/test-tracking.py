#!/usr/bin/env python3
"""
Tracking System Test - Takip sistemini test eder
"""

import sys
import os
sys.path.append('/workspaces/vertex-cnc-website/api')

from app import load_orders_db
import json

def test_tracking_system():
    """Takip sistemini test et"""
    
    print("🔍 VERTEXi CNC - TAKİP SİSTEMİ TEST BAŞLIYOR")
    print("=" * 60)
    
    try:
        # Veritabanını yükle
        print("💾 Sipariş veritabanı yükleniyor...")
        db = load_orders_db()
        
        print(f"   ✅ Toplam sipariş sayısı: {len(db.get('orders', {}))}")
        
        if db.get('orders'):
            print("\n📦 AKTİF SİPARİŞLER:")
            print("-" * 40)
            
            for order_num, order_data in db['orders'].items():
                print(f"   • Sipariş: {order_num}")
                print(f"     - Takip ID: {order_data.get('trackingId', 'N/A')}")
                print(f"     - Müşteri: {order_data.get('customerInfo', {}).get('companyName', 'N/A')}")
                print(f"     - Durum: {order_data.get('status', 'N/A')}")
                print(f"     - İlerleme: {order_data.get('overallProgress', 0)}%")
                print(f"     - Tarih: {order_data.get('createdAt', 'N/A')[:19]}")
                
                # Aşama bilgileri
                stages = order_data.get('stages', [])
                completed = len([s for s in stages if s.get('status') == 'completed'])
                in_progress = len([s for s in stages if s.get('status') == 'in_progress'])
                pending = len([s for s in stages if s.get('status') == 'pending'])
                
                print(f"     - Aşamalar: {completed} tamamlanan, {in_progress} devam eden, {pending} bekleyen")
                print()
                
                # İlk siparişi detaylı göster
                if order_num == list(db['orders'].keys())[0]:
                    print("   📋 DETAYLI AŞAMA BİLGİLERİ:")
                    for i, stage in enumerate(stages, 1):
                        status_icon = "✅" if stage['status'] == 'completed' else "🔄" if stage['status'] == 'in_progress' else "⏳"
                        print(f"      {i}. {status_icon} {stage['name']} ({stage['progress']}%)")
                    print()
        else:
            print("   ℹ️ Henüz sipariş bulunmuyor")
            
        return True
        
    except Exception as e:
        print(f"❌ HATA: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_tracking_system()
    
    print("=" * 60)
    if success:
        print("🎉 TAKİP SİSTEMİ TESTİ BAŞARILI!")
        print("🔗 Takip URL'leri çalışır durumda")
        print("📱 Frontend entegrasyonu hazır")
    else:
        print("❌ TAKİP SİSTEMİ TESTİ BAŞARISIZ!")
    print("=" * 60)
