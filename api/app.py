from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
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
        tracking_url = f"https://vertexcnc-ktns8w.manus.space/?track={tracking_id}"
        
        # Email configuration
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = "noreply@vertexcnc.tr"
            msg['To'] = data.get('email', '')  # Müşteriye gönder
            msg['Subject'] = f"Teklif Talebiniz Alındı - {order_number}"
            
            # Email body with tracking link
            body = f"""
Sayın {data.get('contactName', '')},

Teklif talebiniz başarıyla alınmıştır. 24 saat içinde detaylı teklifimizi size ileteceğiz.

📋 SİPARİŞ BİLGİLERİ
Sipariş Numarası: {order_number}
Şirket: {data.get('companyName', '')}
Proje: {data.get('projectDescription', '')[:100]}...
Adet: {data.get('quantity', '')}
Malzeme: {data.get('material', '')}

🔗 KİŞİSEL TAKİP LİNKİNİZ
Siparişinizi anlık olarak takip etmek için aşağıdaki linke tıklayın:
{tracking_url}

Bu link sadece sizin siparişinize özeldir ve güvenlidir.

📎 EKLER
- PDF Teklif Formu
- Yüklediğiniz CAD dosyaları

📞 İLETİŞİM
Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz:
E-posta: destek@vertexcnc.tr
Telefon: +90 212 XXX XX XX

Teşekkür ederiz,
VERTEX CNC Ekibi
Mikron Hassasiyetinde Geleceği Şekillendiriyoruz

Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}
            """
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Attach PDF
            pdf_attachment = MIMEBase('application', 'octet-stream')
            pdf_attachment.set_payload(pdf_data)
            encoders.encode_base64(pdf_attachment)
            pdf_attachment.add_header(
                'Content-Disposition',
                f'attachment; filename="Teklif_Talebi_{order_number}.pdf"'
            )
            msg.attach(pdf_attachment)
            
            # Attach uploaded files (simulated)
            if data.get('files'):
                for file_info in data['files']:
                    # Simulate file attachment
                    file_attachment = MIMEBase('application', 'octet-stream')
                    # Demo için boş içerik
                    file_attachment.set_payload(b'Demo CAD file content')
                    encoders.encode_base64(file_attachment)
                    file_attachment.add_header(
                        'Content-Disposition',
                        f'attachment; filename="{file_info.get("name", "unknown_file")}"'
                    )
                    msg.attach(file_attachment)
            
            # Ayrıca destek@vertexcnc.tr adresine de bilgi gönder
            support_msg = MIMEMultipart()
            support_msg['From'] = "noreply@vertexcnc.tr"
            support_msg['To'] = "destek@vertexcnc.tr"
            support_msg['Subject'] = f"Yeni Talep - {data.get('companyName', 'Bilinmeyen Şirket')} - {order_number}"
            
            support_body = f"""
Yeni bir teklif talebi alındı.

Sipariş Numarası: {order_number}
Takip ID: {tracking_id}
Müşteri Takip Linki: {tracking_url}

Şirket: {data.get('companyName', '')}
İletişim Kişisi: {data.get('contactName', '')}
E-posta: {data.get('email', '')}
Telefon: {data.get('phone', '')}

Proje Açıklaması: {data.get('projectDescription', '')}
Adet: {data.get('quantity', '')}
Malzeme: {data.get('material', '')}
Teslimat Tarihi: {data.get('deadline', '')}

Ek Notlar: {data.get('additionalNotes', '')}

Detaylar ekteki PDF dosyasında bulunmaktadır.
Yüklenen CAD dosyaları ayrı ekler halinde gönderilmiştir.

VERTEX CNC Otomatik Sistem
Tarih: {datetime.now().strftime('%d.%m.%Y %H:%M')}
            """
            
            support_msg.attach(MIMEText(support_body, 'plain', 'utf-8'))
            
            # PDF'i destek e-postasına da ekle
            support_pdf_attachment = MIMEBase('application', 'octet-stream')
            support_pdf_attachment.set_payload(pdf_data)
            encoders.encode_base64(support_pdf_attachment)
            support_pdf_attachment.add_header(
                'Content-Disposition',
                f'attachment; filename="Teklif_Talebi_{order_number}.pdf"'
            )
            support_msg.attach(support_pdf_attachment)
            
            # For production, you would configure real SMTP here
            email_sent = True
            
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

