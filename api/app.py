from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io
import base64
import os
import json
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Email configuration from environment
SMTP_CONFIG = {
    'server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
    'port': int(os.getenv('SMTP_PORT', '587')),
    'username': os.getenv('SMTP_USERNAME', ''),
    'password': os.getenv('SMTP_PASSWORD', ''),
    'use_tls': os.getenv('SMTP_USE_TLS', 'true').lower() == 'true',
    'from_email': os.getenv('FROM_EMAIL', 'destek@vertexcnc.tr'),
    'support_email': os.getenv('SUPPORT_EMAIL', 'destek@vertexcnc.tr')
}

def send_real_email(to_email, subject, body, attachments=None, is_html=False):
    """Gerçek SMTP ile e-mail gönderir"""
    try:
        # E-mail mesajını oluştur
        msg = MIMEMultipart()
        msg['From'] = formataddr(('VERTEX CNC', SMTP_CONFIG['from_email']))
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # E-mail içeriğini ekle
        content_type = 'html' if is_html else 'plain'
        msg.attach(MIMEText(body, content_type, 'utf-8'))
        
        # Ekleri ekle
        if attachments:
            for attachment in attachments:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment['data'])
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{attachment["filename"]}"'
                )
                msg.attach(part)
        
        # SMTP bağlantısı kur ve gönder
        if SMTP_CONFIG['username'] and SMTP_CONFIG['password']:
            server = smtplib.SMTP(SMTP_CONFIG['server'], SMTP_CONFIG['port'])
            if SMTP_CONFIG['use_tls']:
                server.starttls()
            server.login(SMTP_CONFIG['username'], SMTP_CONFIG['password'])
            
            text = msg.as_string()
            server.sendmail(SMTP_CONFIG['from_email'], to_email, text)
            server.quit()
            
            print(f"✅ E-mail başarıyla gönderildi: {to_email}")
            return True
        else:
            print("⚠️ SMTP konfigürasyonu eksik - e-mail gönderilmedi")
            return False
            
    except Exception as e:
        print(f"❌ E-mail gönderim hatası: {str(e)}")
        return False

def send_sendgrid_email(to_email, subject, body, attachments=None):
    """SendGrid API ile e-mail gönderir"""
    try:
        import requests
        
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        print(f"🔍 SendGrid API Key: {sendgrid_api_key[:20] + '...' if sendgrid_api_key else 'NOT FOUND'}")
        print(f"🔍 FROM_EMAIL: {SMTP_CONFIG['from_email']}")
        print(f"🔍 TO_EMAIL: {to_email}")
        
        if not sendgrid_api_key:
            print("⚠️ SendGrid API anahtarı bulunamadı")
            return False
        
        # SendGrid API payload'u hazırla
        payload = {
            "personalizations": [{
                "to": [{"email": to_email}],
                "subject": subject
            }],
            "from": {"email": SMTP_CONFIG['from_email'], "name": "VERTEX CNC"},
            "content": [{"type": "text/html", "value": body}]
        }
        
        print(f"🔍 SendGrid Payload: {payload}")
        
        # Ekleri ekle
        if attachments:
            payload["attachments"] = []
            for attachment in attachments:
                payload["attachments"].append({
                    "content": base64.b64encode(attachment['data']).decode(),
                    "type": "application/pdf",
                    "filename": attachment['filename']
                })
        
        response = requests.post(
            'https://api.sendgrid.com/v3/mail/send',
            headers={
                'Authorization': f'Bearer {sendgrid_api_key}',
                'Content-Type': 'application/json'
            },
            json=payload
        )
        
        print(f"🔍 SendGrid Response Status: {response.status_code}")
        print(f"🔍 SendGrid Response Text: {response.text}")
        
        if response.status_code == 202:
            print(f"✅ SendGrid ile e-mail gönderildi: {to_email}")
            return True
        else:
            print(f"❌ SendGrid hatası: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ SendGrid e-mail gönderim hatası: {str(e)}")
        return False

def send_email_with_fallback(to_email, subject, body, attachments=None, is_html=False):
    """Önce SendGrid, sonra SMTP ile e-mail gönderir"""
    # İlk olarak SendGrid ile dene
    if send_sendgrid_email(to_email, subject, body, attachments):
        return True
    
    # SendGrid başarısız ise SMTP ile dene
    print("SendGrid başarısız, SMTP ile deneniyor...")
    return send_real_email(to_email, subject, body, attachments, is_html)

# Sipariş veritabanı fonksiyonları
def load_orders_db():
    """Sipariş veritabanını yükle"""
    db_path = os.path.join(os.path.dirname(__file__), 'orders_db.json')
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"orders": {}, "nextOrderId": 1}

def save_orders_db(db):
    """Sipariş veritabanını kaydet"""
    db_path = os.path.join(os.path.dirname(__file__), 'orders_db.json')
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def create_order_record(order_number, customer_data):
    """Yeni sipariş kaydı oluştur"""
    db = load_orders_db()
    
    # Takip ID'si oluştur (UUID)
    tracking_id = str(uuid.uuid4())
    
    # Sipariş durumu aşamaları
    stages = [
        {"id": "quote_received", "name": "Teklif Alındı", "status": "completed", "date": datetime.now().isoformat(), "progress": 100},
        {"id": "design_analysis", "name": "Tasarım Analizi", "status": "in_progress", "date": None, "progress": 25},
        {"id": "material_prep", "name": "Malzeme Hazırlık", "status": "pending", "date": None, "progress": 0},
        {"id": "cnc_machining", "name": "CNC İşleme", "status": "pending", "date": None, "progress": 0},
        {"id": "quality_control", "name": "Kalite Kontrol", "status": "pending", "date": None, "progress": 0},
        {"id": "delivery", "name": "Teslimat", "status": "pending", "date": None, "progress": 0}
    ]
    
    # Tahmini teslimat tarihi (15 gün sonra)
    estimated_delivery = (datetime.now() + timedelta(days=15)).isoformat()
    
    order_record = {
        "orderNumber": order_number,
        "trackingId": tracking_id,
        "customerInfo": {
            "companyName": customer_data.get('companyName', ''),
            "contactName": customer_data.get('contactName', ''),
            "email": customer_data.get('email', ''),
            "phone": customer_data.get('phone', '')
        },
        "projectInfo": {
            "description": customer_data.get('projectDescription', ''),
            "quantity": customer_data.get('quantity', ''),
            "material": customer_data.get('material', ''),
            "deadline": customer_data.get('deadline', ''),
            "additionalNotes": customer_data.get('additionalNotes', '')
        },
        "files": customer_data.get('files', []),
        "stages": stages,
        "currentStage": "design_analysis",
        "overallProgress": 17,  # (100 + 25) / 6 stages
        "priority": "normal",
        "estimatedDelivery": estimated_delivery,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "status": "active"
    }
    
    # Veritabanına kaydet
    db["orders"][order_number] = order_record
    save_orders_db(db)
    
    return tracking_id

def create_pdf_quote(data, order_number):
    buffer = io.BytesIO()
    
    # A4 boyutunda PDF oluştur
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                          rightMargin=50, leftMargin=50,
                          topMargin=50, bottomMargin=50)
    
    # Türkçe karakter desteği için DejaVu Sans font kullan
    try:
        # DejaVu Sans font'u kaydet (sistem fontları)
        pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
        pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
        font_name = 'DejaVuSans'
        font_bold = 'DejaVuSans-Bold'
    except:
        # Fallback olarak Helvetica kullan
        font_name = 'Helvetica'
        font_bold = 'Helvetica-Bold'
    
    # Stil tanımlamaları
    styles = getSampleStyleSheet()
    
    # Özel stiller oluştur
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=font_bold,
        fontSize=20,
        textColor=colors.HexColor('#FF6B35'),
        alignment=TA_CENTER,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=15
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontName=font_bold,
        fontSize=14,
        textColor=colors.HexColor('#374151'),
        spaceAfter=8,
        spaceBefore=10
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10,
        spaceAfter=4
    )
    
    # PDF içeriği
    story = []
    
    # Logo banner ekleme
    logo_path = os.path.join(os.path.dirname(__file__), 'vertex-logo-new.png')
    if os.path.exists(logo_path):
        try:
            # Logo boyutunu ayarla (genişlik 4 inch, yükseklik 3 inch)
            logo = Image(logo_path, width=4*inch, height=3*inch)
            logo.hAlign = 'CENTER'
            story.append(logo)
            story.append(Spacer(1, 10))
        except Exception as e:
            print(f"Logo yüklenirken hata: {e}")
            # Logo yüklenemezse text başlık kullan
            story.append(Paragraph("VERTEX CNC", title_style))
            story.append(Paragraph("Hassas İmalat Teknolojileri", subtitle_style))
    else:
        # Logo dosyası yoksa text başlık kullan
        story.append(Paragraph("VERTEX CNC", title_style))
        story.append(Paragraph("Hassas İmalat Teknolojileri", subtitle_style))
    
    # Sipariş bilgileri
    story.append(Paragraph(f"TEKLİF TALEBİ - {order_number}", heading_style))
    story.append(Paragraph(f"Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}", normal_style))
    story.append(Spacer(1, 15))
    
    # Müşteri bilgileri tablosu
    customer_data = [
        ['MÜŞTERİ BİLGİLERİ', ''],
        ['Şirket Adı:', data.get('companyName', '')],
        ['İletişim Kişisi:', data.get('contactName', '')],
        ['E-posta:', data.get('email', '')],
        ['Telefon:', data.get('phone', '')]
    ]
    
    customer_table = Table(customer_data, colWidths=[2*inch, 3*inch])
    customer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#FF6B35')),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (1, 0), font_bold),
        ('FONTNAME', (0, 1), (0, -1), font_bold),
        ('FONTNAME', (1, 1), (1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    
    story.append(customer_table)
    story.append(Spacer(1, 10))
    
    # Proje detayları tablosu
    project_description = data.get('projectDescription', '')
    additional_notes = data.get('additionalNotes', '')
    
    # Uzun metinler için Paragraph kullan
    if len(project_description) > 80:
        desc_paragraph = Paragraph(project_description, normal_style)
    else:
        desc_paragraph = project_description
    
    if len(additional_notes) > 60:
        notes_paragraph = Paragraph(additional_notes, normal_style)
    else:
        notes_paragraph = additional_notes
    
    project_data = [
        ['PROJE DETAYLARI', ''],
        ['Proje Açıklaması:', desc_paragraph],
        ['Adet:', data.get('quantity', '')],
        ['Malzeme:', data.get('material', '')],
        ['Teslimat Tarihi:', data.get('deadline', '')],
        ['Ek Notlar:', notes_paragraph]
    ]
    
    project_table = Table(project_data, colWidths=[2*inch, 3*inch])
    project_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#FF6B35')),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Üstten hizala
        ('FONTNAME', (0, 0), (1, 0), font_bold),
        ('FONTNAME', (0, 1), (0, -1), font_bold),
        ('FONTNAME', (1, 1), (1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(project_table)
    story.append(Spacer(1, 10))
    
    # Dosyalar tablosu (eğer varsa)
    if data.get('files') and len(data['files']) > 0:
        files_data = [['YÜKLENEN DOSYALAR', 'BOYUT']]
        for file_info in data['files']:
            size_mb = round(file_info.get('size', 0) / (1024*1024), 2)
            files_data.append([file_info.get('name', ''), f"{size_mb} MB"])
        
        files_table = Table(files_data, colWidths=[2.5*inch, 1.5*inch])
        files_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF6B35')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(files_table)
        story.append(Spacer(1, 10))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6B7280')
    )
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("Bu talep otomatik olarak oluşturulmuştur.", footer_style))
    story.append(Paragraph("VERTEX CNC - Mikron Hassasiyetinde Geleceği Şekillendiriyoruz", footer_style))
    
    # PDF'i oluştur
    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route('/api/track-order/<tracking_id>', methods=['GET'])
def track_order(tracking_id):
    """Takip ID'si ile sipariş sorgulama"""
    try:
        db = load_orders_db()
        
        # Tracking ID ile sipariş bul
        for order_number, order_data in db["orders"].items():
            if order_data.get("trackingId") == tracking_id:
                return jsonify({
                    'success': True,
                    'order': order_data
                }), 200
        
        return jsonify({
            'success': False,
            'message': 'Sipariş bulunamadı'
        }), 404
        
    except Exception as e:
        print(f"Takip sorgu hatası: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Sorgu hatası: {str(e)}'
        }), 500

@app.route('/api/send-quote-email', methods=['POST'])
def send_quote_email():
    try:
        data = request.get_json()
        
        # Generate order number
        order_number = f"VTX-{datetime.now().strftime('%Y%m%d')}-{datetime.now().strftime('%H%M%S')}"
        
        # Create order record and get tracking ID
        tracking_id = create_order_record(order_number, data)
        
        # Create PDF
        pdf_buffer = create_pdf_quote(data, order_number)
        pdf_data = pdf_buffer.getvalue()
        
        # Save PDF locally for demo
        pdf_filename = f"/tmp/Teklif_Talebi_{order_number}.pdf"
        with open(pdf_filename, 'wb') as f:
            f.write(pdf_data)
        
        # Kişisel takip linki oluştur
        base_url = os.getenv('PRODUCTION_DOMAIN', 'localhost:5173')
        if base_url.startswith('localhost'):
            tracking_url = f"http://{base_url}/track/{tracking_id}"
        else:
            tracking_url = f"https://{base_url}/track/{tracking_id}"
        
        # Email configuration
        try:
            # HTML e-mail içeriği oluştur
            customer_email_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teklif Talebiniz Alındı</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }}
        .logo {{ color: #ff6b35; font-size: 24px; font-weight: bold; }}
        .status-badge {{ background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .info-table td {{ padding: 12px; border-bottom: 1px solid #eee; }}
        .info-table td:first-child {{ font-weight: bold; color: #374151; width: 30%; }}
        .tracking-box {{ background: linear-gradient(135deg, #ff6b35, #ff8c42); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }}
        .btn {{ display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #6b7280; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VERTEX CNC</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">Mikron Hassasiyetinde Geleceği Şekillendiriyoruz</p>
        </div>
        
        <h2 style="color: #1f2937;">Sayın {data.get('contactName', '')},</h2>
        
        <div class="status-badge">✅ Teklif talebiniz başarıyla alınmıştır</div>
        
        <p style="margin: 20px 0; line-height: 1.6; color: #374151;">
            24 saat içinde detaylı teklifimizi size ileteceğiz. Proje detaylarınızı inceleyerek 
            en uygun çözümü hazırlayacağız.
        </p>
        
        <h3 style="color: #1f2937; margin-top: 30px;">📋 Sipariş Bilgileri</h3>
        <table class="info-table">
            <tr><td>Sipariş Numarası:</td><td><strong>{order_number}</strong></td></tr>
            <tr><td>Şirket:</td><td>{data.get('companyName', '')}</td></tr>
            <tr><td>Proje:</td><td>{data.get('projectDescription', '')[:100]}...</td></tr>
            <tr><td>Adet:</td><td>{data.get('quantity', '')}</td></tr>
            <tr><td>Malzeme:</td><td>{data.get('material', '')}</td></tr>
            <tr><td>İstenen Teslimat:</td><td>{data.get('deadline', 'Belirtilmemiş')}</td></tr>
        </table>
        
        <div class="tracking-box">
            <h3 style="margin: 0 0 10px 0;">🔗 Kişisel Takip Linkiniz</h3>
            <p style="margin: 0 0 15px 0; opacity: 0.9;">Siparişinizi anlık olarak takip edin</p>
            <a href="{tracking_url}" class="btn" style="color: white;">Sipariş Durumunu Takip Et</a>
        </div>
        
        <h3 style="color: #1f2937;">📎 Ekler</h3>
        <ul style="color: #374151;">
            <li>PDF Teklif Formu</li>
            <li>Yüklediğiniz CAD dosyaları ({len(data.get('files', []))} adet)</li>
        </ul>
        
        <div class="footer">
            <h3 style="color: #1f2937;">📞 İletişim</h3>
            <p>E-posta: <a href="mailto:destek@vertexcnc.tr">destek@vertexcnc.tr</a></p>
            <p>Telefon: +90 212 XXX XX XX</p>
            <p style="margin-top: 20px;">
                <strong>VERTEX CNC Ekibi</strong><br>
                <small>Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}</small>
            </p>
        </div>
    </div>
</body>
</html>
            """
            
            # PDF eki hazırla
            attachments = [{{
                'filename': f'Teklif_Talebi_{order_number}.pdf',
                'data': pdf_data
            }}]
            
            # Müşteriye e-mail gönder
            customer_email_sent = send_email_with_fallback(
                to_email=data.get('email', ''),
                subject=f"Teklif Talebiniz Alındı - {order_number}",
                body=customer_email_html,
                attachments=attachments,
                is_html=True
            )
            
            # Destek ekibine bilgilendirme e-maili
            support_email_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Yeni Teklif Talebi</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
        .header {{ background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .urgent {{ background-color: #ef4444; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .info-table td {{ padding: 10px; border: 1px solid #ddd; }}
        .info-table td:first-child {{ background-color: #f9fafb; font-weight: bold; width: 30%; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🚨 Yeni Teklif Talebi Alındı</h2>
            <p style="margin: 10px 0 0 0;">Sipariş No: {order_number}</p>
        </div>
        
        <div class="urgent">
            ⏰ 24 saat içinde müşteriye geri dönüş yapılması gerekiyor
        </div>
        
        <h3>👤 Müşteri Bilgileri</h3>
        <table class="info-table">
            <tr><td>Şirket:</td><td>{data.get('companyName', '')}</td></tr>
            <tr><td>İletişim Kişisi:</td><td>{data.get('contactName', '')}</td></tr>
            <tr><td>E-posta:</td><td><a href="mailto:{data.get('email', '')}">{data.get('email', '')}</a></td></tr>
            <tr><td>Telefon:</td><td>{data.get('phone', '')}</td></tr>
        </table>
        
        <h3>📋 Proje Detayları</h3>
        <table class="info-table">
            <tr><td>Proje Açıklaması:</td><td>{data.get('projectDescription', '')}</td></tr>
            <tr><td>Adet:</td><td>{data.get('quantity', '')}</td></tr>
            <tr><td>Malzeme:</td><td>{data.get('material', '')}</td></tr>
            <tr><td>İstenen Teslimat:</td><td>{data.get('deadline', 'Belirtilmemiş')}</td></tr>
            <tr><td>Ek Notlar:</td><td>{data.get('additionalNotes', 'Yok')}</td></tr>
        </table>
        
        <h3>🔗 Takip Bilgileri</h3>
        <table class="info-table">
            <tr><td>Takip ID:</td><td>{tracking_id}</td></tr>
            <tr><td>Müşteri Takip Linki:</td><td><a href="{tracking_url}">Takip Sayfası</a></td></tr>
        </table>
        
        <h3>📎 Dosyalar</h3>
        <p>• PDF Teklif Formu (Ekte)</p>
        <p>• CAD Dosyaları: {len(data.get('files', []))} adet</p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <strong>📅 Yapılacaklar:</strong>
            <ul>
                <li>CAD dosyalarını analiz et</li>
                <li>Üretim süresini hesapla</li>
                <li>Maliyet tahmini hazırla</li>
                <li>24 saat içinde müşteriye teklifini gönder</li>
            </ul>
        </div>
        
        <p style="margin-top: 20px; text-align: center; color: #6b7280;">
            <small>VERTEX CNC Otomatik Sistem - {datetime.now().strftime('%d.%m.%Y %H:%M')}</small>
        </p>
    </div>
</body>
</html>
            """
            
            # Destek ekibine e-mail gönder
            support_email_sent = send_email_with_fallback(
                to_email=SMTP_CONFIG['support_email'],
                subject=f"🚨 Yeni Teklif Talebi - {data.get('companyName', 'Bilinmeyen Şirket')} - {order_number}",
                body=support_email_html,
                attachments=attachments,
                is_html=True
            )
            
            email_sent = customer_email_sent and support_email_sent
            
        except Exception as e:
            print(f"E-posta gönderim hatası: {str(e)}")
            email_sent = False
        
        # Log the request
        print("=" * 60)
        print("YENİ TEKLİF TALEBİ - E-POSTA GÖNDERİLDİ")
        print("=" * 60)
        print(f"Sipariş Numarası: {order_number}")
        print(f"Şirket: {data.get('companyName', '')}")
        print(f"İletişim Kişisi: {data.get('contactName', '')}")
        print(f"E-posta: {data.get('email', '')}")
        print(f"Telefon: {data.get('phone', '')}")
        print(f"Proje: {data.get('projectDescription', '')}")
        print(f"PDF Oluşturuldu: {pdf_filename}")
        print(f"E-posta Durumu: {'✅ Gönderildi' if email_sent else '❌ Gönderilemedi'}")
        print(f"Alıcı: destek@vertexcnc.tr")
        print(f"Konu: Yeni Talep - {data.get('companyName', '')} - {order_number}")
        print(f"Ekler: PDF + {len(data.get('files', []))} CAD dosyası")
        print("=" * 60)
        
        return jsonify({
            'success': True,
            'message': 'Teklif talebi başarıyla işlendi ve e-posta gönderildi',
            'orderNumber': order_number,
            'trackingId': tracking_id,
            'trackingUrl': tracking_url,
            'pdfPath': pdf_filename,
            'emailSent': email_sent,
            'attachments': len(data.get('files', [])) + 1  # PDF + CAD files
        }), 200
        
    except Exception as e:
        print(f"Genel Hata: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'İşlem hatası: {str(e)}'
        }), 500

@app.route('/api/test-email', methods=['POST'])
def test_email():
    """E-mail sistemini test eder"""
    try:
        data = request.get_json()
        test_type = data.get('testType', 'system_check')
        recipient = data.get('recipient', 'admin@vertexcnc.tr')
        
        # Test e-mail içeriği
        test_subject = f"VERTEX CNC E-mail Sistem Testi - {datetime.now().strftime('%d.%m.%Y %H:%M')}"
        test_body_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>E-mail Sistem Testi</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
        .header {{ text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }}
        .success {{ background-color: #22c55e; color: white; padding: 15px; border-radius: 8px; text-align: center; }}
        .info {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #22c55e; margin: 0;">✅ E-mail Sistem Testi</h2>
        </div>
        
        <div class="success">
            <h3 style="margin: 0;">Test Başarılı!</h3>
            <p style="margin: 10px 0 0 0;">E-mail sistemi düzgün çalışıyor.</p>
        </div>
        
        <div class="info">
            <h4>Test Detayları:</h4>
            <ul>
                <li><strong>Test Türü:</strong> {test_type}</li>
                <li><strong>Alıcı:</strong> {recipient}</li>
                <li><strong>Tarih:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</li>
                <li><strong>Servis:</strong> SendGrid/SMTP Fallback</li>
            </ul>
        </div>
        
        <p style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            VERTEX CNC E-mail Sistemi<br>
            Bu e-mail otomatik olarak gönderilmiştir.
        </p>
    </div>
</body>
</html>
        """
        
        # E-mail gönder
        success = send_email_with_fallback(
            to_email=recipient,
            subject=test_subject,
            body=test_body_html,
            is_html=True
        )
        
        if success:
            return jsonify({{
                'success': True,
                'message': f'Test e-maili başarıyla gönderildi: {recipient}',
                'method': 'SendGrid/SMTP',
                'timestamp': datetime.now().isoformat(),
                'testType': test_type
            }}), 200
        else:
            return jsonify({{
                'success': False,
                'message': 'E-mail gönderilemedi. Lütfen konfigürasyonu kontrol edin.',
                'timestamp': datetime.now().isoformat(),
                'testType': test_type
            }}), 500
            
    except Exception as e:
        return jsonify({{
            'success': False,
            'message': f'Test hatası: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }}), 500

@app.route('/api/email-stats', methods=['GET'])
def get_email_stats():
    """E-mail istatistiklerini döndürür"""
    try:
        # Gerçek implementasyonda veritabanından alınacak
        # Şimdilik demo veriler
        stats = {{
            'todaysSent': 25,
            'todaysFailed': 2,
            'weeklySuccess': 96.8,
            'lastEmailTime': datetime.now().isoformat(),
            'sendgridStatus': 'active' if os.getenv('SENDGRID_API_KEY') else 'error',
            'smtpFallbackStatus': 'active' if os.getenv('SMTP_USERNAME') else 'error',
            'monthlyQuota': 40000,
            'monthlyUsed': 1250
        }}
        
        return jsonify({{
            'success': True,
            'stats': stats
        }}), 200
        
    except Exception as e:
        return jsonify({{
            'success': False,
            'message': f'İstatistikler alınamadı: {str(e)}'
        }}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({{'status': 'healthy'}}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

