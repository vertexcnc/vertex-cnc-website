#!/usr/bin/env python3

import os
import sys
import json

# Environment variables'ları set et
os.environ['SENDGRID_API_KEY'] = 'YOUR_SENDGRID_API_KEY_HERE'
os.environ['FROM_EMAIL'] = 'destek@vertexcnc.tr'
os.environ['SUPPORT_EMAIL'] = 'destek@vertexcnc.tr'
os.environ['NOTIFICATION_EMAIL'] = 'destek@vertexcnc.tr'

# App'yi import et
sys.path.append(os.path.dirname(__file__))
from app import send_sendgrid_email

# Test data
test_to = "test@vertexcnc.tr"
test_subject = "VERTEX CNC Debug Test"
test_body = """
<html>
<body>
<h1>VERTEX CNC Test Email</h1>
<p>Bu bir debug test emailidir.</p>
<p>Eğer bu emaili alıyorsanız SendGrid integration çalışıyor demektir.</p>
</body>
</html>
"""

print("🔍 DEBUG: SendGrid Email Test Başlıyor...")
print(f"🔍 API Key: {os.getenv('SENDGRID_API_KEY')[:20]}...")
print(f"🔍 From Email: {os.getenv('FROM_EMAIL')}")
print(f"🔍 To Email: {test_to}")

# Test email gönder
result = send_sendgrid_email(test_to, test_subject, test_body)

print(f"🔍 Sonuç: {'✅ BAŞARILI' if result else '❌ BAŞARISIZ'}")
