#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VERTEX CNC E-mail Test - SMTP Fallback
Gmail SMTP ile test e-maili gönderir
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from datetime import datetime

def test_smtp_email():
    """SMTP ile test e-maili gönderir"""
    
    print("📧 SMTP E-mail Testi")
    print("=" * 50)
    
    # Gmail SMTP ayarları (örnek)
    smtp_config = {
        'server': 'smtp.gmail.com',
        'port': 587,
        'username': input("Gmail adresi girin (örn: destek@vertexcnc.tr): ").strip(),
        'password': input("Gmail App Password girin: ").strip(),
        'from_email': 'destek@vertexcnc.tr'
    }
    
    if not smtp_config['username'] or not smtp_config['password']:
        print("❌ Gmail bilgileri eksik!")
        return False
    
    # Test e-mail adresi
    test_email = input("Test e-mail adresi girin: ").strip()
    if not test_email:
        test_email = smtp_config['username']  # Kendine gönder
    
    try:
        print(f"\n🔧 SMTP Bağlantısı kuruluyor...")
        print(f"   Server: {smtp_config['server']}:{smtp_config['port']}")
        print(f"   Username: {smtp_config['username']}")
        print(f"   Test alıcı: {test_email}")
        
        # E-mail içeriği
        msg = MIMEMultipart()
        msg['From'] = formataddr(('VERTEX CNC', smtp_config['from_email']))
        msg['To'] = test_email
        msg['Subject'] = f"VERTEX CNC SMTP Test - {datetime.now().strftime('%d.%m.%Y %H:%M')}"
        
        # HTML e-mail içeriği
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>VERTEX CNC SMTP Test</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }}
        .logo {{ color: #ff6b35; font-size: 24px; font-weight: bold; }}
        .success {{ background-color: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center; }}
        .info {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VERTEX CNC</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">Mikron Hassasiyetinde Geleceği Şekillendiriyoruz</p>
        </div>
        
        <div class="success">
            <h2>✅ SMTP E-mail Sistemi Test Başarılı!</h2>
            <p>Teklif Al sistemi SMTP ile çalışıyor.</p>
        </div>
        
        <div class="info">
            <h3>Test Detayları:</h3>
            <ul>
                <li><strong>Gönderim Yöntemi:</strong> SMTP (Gmail)</li>
                <li><strong>Gönderen:</strong> {smtp_config['from_email']}</li>
                <li><strong>SMTP Server:</strong> {smtp_config['server']}</li>
                <li><strong>Test Tarihi:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</li>
            </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>VERTEX CNC E-mail Sistemi</strong></p>
            <p>Bu e-mail test amaçlı otomatik olarak gönderilmiştir.</p>
        </div>
    </div>
</body>
</html>
        """
        
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        # SMTP bağlantısı ve gönderim
        server = smtplib.SMTP(smtp_config['server'], smtp_config['port'])
        server.starttls()
        server.login(smtp_config['username'], smtp_config['password'])
        
        text = msg.as_string()
        server.sendmail(smtp_config['from_email'], test_email, text)
        server.quit()
        
        print(f"\n✅ E-mail başarıyla gönderildi!")
        print(f"   Gönderen: {smtp_config['from_email']}")
        print(f"   Alıcı: {test_email}")
        print(f"   📱 E-mail kutunuzu kontrol edin!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ SMTP hatası: {str(e)}")
        print("\n🔧 Olası çözümler:")
        print("   1. Gmail'de 2-Factor Authentication aktif olmalı")
        print("   2. App Password kullanılmalı (normal şifre değil)")
        print("   3. 'Less secure app access' kapalı olmalı")
        print("   4. Gmail hesabında SMTP erişimi açık olmalı")
        return False

def main():
    print("=" * 60)
    print("📧 VERTEX CNC SMTP E-MAİL TESTİ")
    print("=" * 60)
    print("⏰ Test zamanı:", datetime.now().strftime('%d.%m.%Y %H:%M:%S'))
    print()
    print("🔧 Gmail SMTP Kurulum Rehberi:")
    print("   1. Gmail hesabında 2-Factor Authentication açın")
    print("   2. Google Account > Security > App passwords")
    print("   3. 'Mail' için yeni App Password oluşturun")
    print("   4. O şifreyi burada kullanın (normal şifre değil)")
    print()
    
    try:
        success = test_smtp_email()
        
        if success:
            print("\n" + "=" * 60)
            print("🎉 SMTP E-MAİL SİSTEMİ ÇALIŞIYOR!")
            print("=" * 60)
            print("✅ Flask API'de SMTP ayarlarınızı güncelleyin:")
            print("   SMTP_USERNAME=gmail_adresiniz")
            print("   SMTP_PASSWORD=app_password")
            print("✅ Teklif Al sistemi SMTP ile çalışacak")
        else:
            print("\n" + "=" * 60)
            print("❌ SMTP KONFİGÜRASYONU GEREKLİ")
            print("=" * 60)
            print("⚠️ Gmail ayarlarını kontrol edin")
            print("⚠️ App Password kullandığınızdan emin olun")
            
    except KeyboardInterrupt:
        print("\n\n⏹️ Test durduruldu.")
    except Exception as e:
        print(f"\n\n💥 Beklenmeyen hata: {str(e)}")

if __name__ == "__main__":
    main()
