// Cloudflare Worker for VERTEX CNC - API Proxy & Order Management
import { SendGrid } from '@sendgrid/mail';

// Flask API Backend URL (development ve production için)
const FLASK_API_URL = 'https://vertex-cnc-api.onrender.com'; // Production
// const FLASK_API_URL = 'http://localhost:5001'; // Development

// Standart API yanıt formatı oluşturan yardımcı fonksiyon
function createApiResponse(success, data = null, error = null, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Flask API'ye proxy request gönderen fonksiyon
async function proxyToFlask(request, endpoint, env) {
  try {
    const url = new URL(request.url);
    const flaskUrl = `${FLASK_API_URL}${endpoint || url.pathname}`;
    
    // Request headers'ı kopyala ve auth bilgilerini ekle
    const headers = new Headers(request.headers);
    headers.set('X-API-Key', env.API_KEY || 'default-key');
    
    const proxyRequest = new Request(flaskUrl, {
      method: request.method,
      headers: headers,
      body: request.method === 'GET' ? null : request.body
    });
    
    const response = await fetch(proxyRequest);
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    });
    
  } catch (error) {
    console.error('Flask proxy error:', error);
    
    // Fallback: Eğer Flask API'ye ulaşılamazsa, Cloudflare üzerinden handle et
    return await handleFallback(request, env);
  }
}

// Fallback handler - Flask API ulaşılamazsa Cloudflare üzerinden handle et
async function handleFallback(request, env) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
  };

  // OPTIONS request için CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Fallback: Basit e-mail gönderimi SendGrid ile
  if (url.pathname === '/api/send-quote-email' && request.method === 'POST') {
    return await handleQuoteEmailFallback(request, env, corsHeaders);
  }

  // Fallback: KV'den sipariş takibi
  if (url.pathname.startsWith('/api/track-order/')) {
    const trackingId = url.pathname.split('/').pop();
    return await handleTrackingFallback(trackingId, env, corsHeaders);
  }

  // Health check
  if (url.pathname === '/health') {
    return createApiResponse(true, { status: 'healthy', mode: 'fallback' }, null, 200, corsHeaders);
  }

  return createApiResponse(false, null, 'Endpoint not found', 404, corsHeaders);
}

// SendGrid ile e-mail gönderimi fallback
async function handleQuoteEmailFallback(request, env, corsHeaders) {
  try {
    const formData = await request.json();
    
    // Basit sipariş numarası oluştur
    const orderNumber = `VTX-${Date.now()}`;
    const trackingId = crypto.randomUUID();
    
    // SendGrid ile e-mail gönder
    if (env.SENDGRID_API_KEY) {
      const sgMail = {
        to: formData.email,
        from: env.FROM_EMAIL || 'destek@vertexcnc.tr',
        subject: `Teklif Talebiniz Alındı - ${orderNumber}`,
        html: `
          <h2>Teklif Talebiniz Alındı</h2>
          <p>Sayın ${formData.contactName},</p>
          <p>Teklif talebiniz başarıyla alınmıştır.</p>
          <p><strong>Sipariş No:</strong> ${orderNumber}</p>
          <p><strong>Takip ID:</strong> ${trackingId}</p>
          <p>24 saat içinde size dönüş yapacağız.</p>
          <p>VERTEX CNC Ekibi</p>
        `
      };

      await fetch('https://api.sendgrid.v3.mail.send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ personalizations: [{ to: [{ email: sgMail.to }] }], from: { email: sgMail.from }, subject: sgMail.subject, content: [{ type: 'text/html', value: sgMail.html }] })
      });
    }

    return createApiResponse(true, {
      orderNumber,
      trackingId,
      message: 'Teklif talebi alındı (fallback mode)'
    }, null, 200, corsHeaders);

  } catch (error) {
    return createApiResponse(false, null, error.message, 500, corsHeaders);
  }
}

// KV'den takip bilgisi alma fallback
async function handleTrackingFallback(trackingId, env, corsHeaders) {
  try {
    // Basit mock data döndür
    const mockOrder = {
      orderNumber: `VTX-${Date.now()}`,
      trackingId: trackingId,
      status: 'active',
      overallProgress: 25,
      customerInfo: {
        companyName: 'Test Şirketi',
        contactName: 'Test Müşteri',
        email: 'test@example.com'
      },
      stages: [
        { id: 'quote_received', name: 'Teklif Alındı', status: 'completed', progress: 100 },
        { id: 'design_analysis', name: 'Tasarım Analizi', status: 'in_progress', progress: 50 },
        { id: 'production', name: 'Üretim', status: 'pending', progress: 0 }
      ],
      createdAt: new Date().toISOString()
    };

    return createApiResponse(true, { order: mockOrder }, null, 200, corsHeaders);
  } catch (error) {
    return createApiResponse(false, null, error.message, 500, corsHeaders);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    };

    // OPTIONS request için
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Flask API'ye proxy et - primary method
      return await proxyToFlask(request, null, env);
      
    } catch (error) {
      console.error('Worker error:', error);
      
      // Fallback handling
      return await handleFallback(request, env);
    }
  }
};
    
    // CORS headers - Güvenlik için sınırlandırıldı
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ENVIRONMENT === 'production' ? 'https://vertexcnc.tr' : '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
    
    // Handle OPTIONS (preflight) requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // API Routes
      if (url.pathname.startsWith('/api/')) {
        return await handleAPI(request, env, corsHeaders);
      }
      
      // Webhook routes
      if (url.pathname.startsWith('/webhook/')) {
        return await handleWebhook(request, env, corsHeaders);
      }
      
      // Health check
      if (url.pathname === '/health') {
        return createApiResponse(true, { 
          status: 'ok', 
          service: 'vertex-cnc-api'
        }, null, 200, corsHeaders);
      }
      
      // Default 404
      return createApiResponse(false, null, {
        code: "NOT_FOUND",
        message: "Endpoint bulunamadı"
      }, 404, corsHeaders);
      
    } catch (error) {
      console.error('Worker error:', {
        url: request.url,
        method: request.method,
        error: error.message,
        stack: error.stack
      });
      return createApiResponse(false, null, {
        code: "INTERNAL_ERROR",
        message: "Sunucu hatası oluştu"
      }, 500, corsHeaders);
    }
  }
};

// API Handler
async function handleAPI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  
  switch (path) {
    case '/send-quote-email':
      return await handleQuoteRequest(request, env, corsHeaders);
    
    case '/track-order':
      return await handleOrderTracking(request, env, corsHeaders);
    
    case '/orders':
      return await handleOrdersAPI(request, env, corsHeaders);
    
    case '/upload-file':
      return await handleFileUpload(request, env, corsHeaders);
    
    default:
      if (path.startsWith('/track-order/')) {
        const trackingId = path.replace('/track-order/', '');
        return await getOrderStatus(trackingId, env, corsHeaders);
      }
      if (path.startsWith('/files/')) {
        const fileKey = path.replace('/files/', '');
        return await getFile(fileKey, env, corsHeaders);
      }
      return createApiResponse(false, null, {
        code: "NOT_FOUND",
        message: "API endpoint bulunamadı"
      }, 404, corsHeaders);
  }
}

// Quote Request Handler
async function handleQuoteRequest(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }
  
  try {
    const data = await request.json();
    
    // Validate required fields
    const required = ['name', 'email', 'company', 'phone', 'description'];
    for (const field of required) {
      if (!data[field]) {
        return new Response(JSON.stringify({ 
          error: `Field '${field}' is required` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Generate order number and tracking ID
    const orderNumber = await generateOrderNumber(env);
    const trackingId = generateTrackingId();
    
    // Create order record
    const order = {
      orderNumber,
      trackingId,
      customerData: data,
      status: 'Teklif Hazırlanıyor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: [
        {
          stage: 'Teklif Alındı',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Teklif talebiniz başarıyla alındı'
        },
        {
          stage: 'Teknik İnceleme',
          status: 'pending',
          timestamp: null,
          description: 'Teknik ekibimiz tarafından inceleniyor'
        },
        {
          stage: 'Fiyat Hesaplama',
          status: 'pending',
          timestamp: null,
          description: 'Fiyat hesaplaması yapılıyor'
        },
        {
          stage: 'Teklif Hazırlama',
          status: 'pending',
          timestamp: null,
          description: 'Detaylı teklif hazırlanıyor'
        },
        {
          stage: 'Teklif Gönderildi',
          status: 'pending',
          timestamp: null,
          description: 'Teklif e-posta ile gönderilecek'
        }
      ]
    };
    
    // Save to KV storage (simulated for development)
    if (env.ORDERS_DB) {
      await env.ORDERS_DB.put(trackingId, JSON.stringify(order));
    }
    if (env.TRACKING_DB) {
      await env.TRACKING_DB.put(orderNumber, trackingId);
    }
    
    // Send confirmation email (implement with your email service)
    await sendConfirmationEmail(data, orderNumber, trackingId, env);
    
    return new Response(JSON.stringify({
      success: true,
      orderNumber,
      trackingId,
      message: 'Teklif talebiniz başarıyla alındı',
      estimatedResponse: '24 saat içinde'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Quote request error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process quote request',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Order Tracking Handler
async function getOrderStatus(trackingId, env, corsHeaders) {
  try {
    let orderData = null;
    
    // KV'den veri almaya çalış
    if (env.ORDERS_DB) {
      orderData = await env.ORDERS_DB.get(trackingId);
    }
    
    if (!orderData) {
      // Development için mock data
      if (env.ENVIRONMENT === 'development' || !env.ORDERS_DB) {
        const mockOrder = {
          orderNumber: 'ORD-2024-0001',
          trackingId: trackingId,
          status: 'Teklif Hazırlanıyor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stages: [
            {
              stage: 'Teklif Alındı',
              status: 'completed',
              timestamp: new Date().toISOString(),
              description: 'Teklif talebiniz başarıyla alındı'
            },
            {
              stage: 'Teknik İnceleme',
              status: 'pending',
              timestamp: null,
              description: 'Teknik ekibimiz tarafından inceleniyor'
            }
          ],
          customerData: {
            name: 'Demo Müşteri',
            company: 'Demo Şirket'
          }
        };
        
        return new Response(JSON.stringify({
          success: true,
          order: {
            orderNumber: mockOrder.orderNumber,
            trackingId: mockOrder.trackingId,
            status: mockOrder.status,
            createdAt: mockOrder.createdAt,
            updatedAt: mockOrder.updatedAt,
            stages: mockOrder.stages,
            customerInfo: {
              name: mockOrder.customerData.name,
              company: mockOrder.customerData.company
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Order not found',
        message: 'Belirtilen takip numarası bulunamadı'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const order = JSON.parse(orderData);
    
    // Return tracking information
    return new Response(JSON.stringify({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        trackingId: order.trackingId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        stages: order.stages,
        customerInfo: {
          name: order.customerData.name,
          company: order.customerData.company
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Order tracking error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get order status',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Order Management API
async function handleOrdersAPI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Admin yetkisi kontrolü
  const isAuthorized = await authorize(request, env, 'admin');
  if (!isAuthorized) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Yetkisiz erişim'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'GET') {
    // Get orders list (admin endpoint)
    const orders = await getAllOrders(env);
    return new Response(JSON.stringify(orders), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'PUT') {
    // Update order status
    const data = await request.json();
    const result = await updateOrderStatus(data.trackingId, data.status, data.stage, env);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { 
    status: 405,
    headers: corsHeaders
  });
}

// Webhook Handler
async function handleWebhook(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/webhook', '');
  
  switch (path) {
    case '/email':
      return await handleEmailWebhook(request, env, corsHeaders);
    case '/manus':
      return await handleManusWebhook(request, env, corsHeaders);
    default:
      return new Response('Webhook not found', { 
        status: 404,
        headers: corsHeaders
      });
  }
}

// Utility Functions
function generateTrackingId() {
  return 'VTX-' + Date.now().toString(36).toUpperCase() + '-' + 
         Math.random().toString(36).substr(2, 5).toUpperCase();
}

async function generateOrderNumber(env) {
  if (!env.ORDERS_DB) {
    // Development için basit counter
    return `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4).padStart(4, '0')}`;
  }
  
  const currentCount = await env.ORDERS_DB.get('order_counter') || '0';
  const newCount = parseInt(currentCount) + 1;
  await env.ORDERS_DB.put('order_counter', newCount.toString());
  return `ORD-${new Date().getFullYear()}-${newCount.toString().padStart(4, '0')}`;
}

async function sendConfirmationEmail(customerData, orderNumber, trackingId, env) {
  try {
    // SendGrid API anahtarı al
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY || "";
    
    // API anahtarı kontrol
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API anahtarı bulunamadı');
      return false;
    }
    
    // Takip URL'si oluştur
    const trackingUrl = `https://vertexcnc.tr/?track=${trackingId}`;
    
    // HTML e-mail içeriği hazırla
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teklif Talebiniz Alındı</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #ff6b35; font-size: 24px; font-weight: bold; }
        .status-badge { background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; }
        .tracking-box { background: linear-gradient(135deg, #ff6b35, #ff8c42); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background-color: #ffffff; color: #ff6b35; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #ffffff; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .info-table td:first-child { font-weight: bold; color: #374151; width: 30%; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VERTEX CNC</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">Mikron Hassasiyetinde Geleceği Şekillendiriyoruz</p>
        </div>
        
        <h2 style="color: #1f2937;">Sayın ${customerData.name || customerData.contactName},</h2>
        
        <div class="status-badge">✅ Teklif talebiniz başarıyla alınmıştır</div>
        
        <p style="margin: 20px 0; line-height: 1.6; color: #374151;">
            24 saat içinde detaylı teklifimizi size ileteceğiz. Proje detaylarınızı inceleyerek 
            en uygun çözümü hazırlayacağız.
        </p>
        
        <h3 style="color: #1f2937; margin-top: 30px;">📋 Sipariş Bilgileri</h3>
        <table class="info-table">
            <tr><td>Sipariş Numarası:</td><td><strong>${orderNumber}</strong></td></tr>
            <tr><td>Şirket:</td><td>${customerData.company || 'Belirtilmemiş'}</td></tr>
            <tr><td>Proje:</td><td>${(customerData.description || '').substring(0, 100)}...</td></tr>
            <tr><td>Takip ID:</td><td>${trackingId}</td></tr>
        </table>
        
        <div class="tracking-box">
            <h3 style="margin: 0 0 10px 0;">🔗 Kişisel Takip Linkiniz</h3>
            <p style="margin: 0 0 15px 0; opacity: 0.9;">Siparişinizi anlık olarak takip edin</p>
            <a href="${trackingUrl}" class="btn">Sipariş Durumunu Takip Et</a>
        </div>
        
        <div class="footer">
            <h3 style="color: #1f2937;">📞 İletişim</h3>
            <p>E-posta: <a href="mailto:destek@vertexcnc.tr">destek@vertexcnc.tr</a></p>
            <p>Telefon: +90 212 XXX XX XX</p>
            <p style="margin-top: 20px;">
                <strong>VERTEX CNC Ekibi</strong><br>
                <small>Tarih: ${new Date().toLocaleString('tr-TR')}</small>
            </p>
        </div>
    </div>
</body>
</html>
    `;
    
    // SendGrid API çağrısı
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: customerData.email }],
          subject: `VERTEX CNC - Teklif Talebiniz Alındı (${orderNumber})`
        }],
        from: { 
          email: env.FROM_EMAIL || "destek@vertexcnc.tr",
          name: "VERTEX CNC"
        },
        content: [{
          type: "text/html",
          value: htmlContent
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Müşteri e-maili gönderildi:', customerData.email);
    
    // Destek ekibine de bilgilendirme gönder
    await sendSupportNotification(customerData, orderNumber, trackingId, env);
    
    return true;
  } catch (error) {
    console.error('❌ Email gönderim hatası:', error);
    return false;
  }
}

// Destek ekibine bilgilendirme e-maili gönder
async function sendSupportNotification(customerData, orderNumber, trackingId, env) {
  try {
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY || "";
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API anahtarı bulunamadı');
      return false;
    }
    
    const trackingUrl = `https://vertexcnc.tr/?track=${trackingId}`;
    
    // Destek ekibi için HTML e-mail içeriği
    const supportHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Yeni Teklif Talebi</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
        .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .urgent { background-color: #ef4444; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 10px; border: 1px solid #ddd; }
        .info-table td:first-child { background-color: #f9fafb; font-weight: bold; width: 30%; }
        .action-box { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🚨 Yeni Teklif Talebi Alındı</h2>
            <p style="margin: 10px 0 0 0;">Sipariş No: ${orderNumber}</p>
        </div>
        
        <div class="urgent">
            ⏰ 24 saat içinde müşteriye geri dönüş yapılması gerekiyor
        </div>
        
        <h3>👤 Müşteri Bilgileri</h3>
        <table class="info-table">
            <tr><td>Şirket:</td><td>${customerData.company || 'Belirtilmemiş'}</td></tr>
            <tr><td>İletişim Kişisi:</td><td>${customerData.name || customerData.contactName || 'Belirtilmemiş'}</td></tr>
            <tr><td>E-posta:</td><td><a href="mailto:${customerData.email}">${customerData.email}</a></td></tr>
            <tr><td>Telefon:</td><td>${customerData.phone || 'Belirtilmemiş'}</td></tr>
        </table>
        
        <h3>📋 Proje Detayları</h3>
        <table class="info-table">
            <tr><td>Proje Açıklaması:</td><td>${customerData.description || 'Belirtilmemiş'}</td></tr>
            <tr><td>Hizmet Türü:</td><td>${customerData.serviceType || 'Belirtilmemiş'}</td></tr>
            <tr><td>Malzeme:</td><td>${customerData.material || 'Belirtilmemiş'}</td></tr>
            <tr><td>Adet:</td><td>${customerData.quantity || 'Belirtilmemiş'}</td></tr>
        </table>
        
        <h3>🔗 Takip Bilgileri</h3>
        <table class="info-table">
            <tr><td>Takip ID:</td><td>${trackingId}</td></tr>
            <tr><td>Müşteri Takip Linki:</td><td><a href="${trackingUrl}">Takip Sayfası</a></td></tr>
        </table>
        
        <div class="action-box">
            <strong>📅 Yapılacaklar:</strong>
            <ul>
                <li>CAD dosyalarını analiz et</li>
                <li>Üretim süresini hesapla</li>
                <li>Maliyet tahmini hazırla</li>
                <li>24 saat içinde müşteriye teklifini gönder</li>
            </ul>
        </div>
        
        <p style="margin-top: 20px; text-align: center; color: #6b7280;">
            <small>VERTEX CNC Otomatik Sistem - ${new Date().toLocaleString('tr-TR')}</small>
        </p>
    </div>
</body>
</html>
    `;
    
    // Destek ekibine e-mail gönder
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: env.SUPPORT_EMAIL || "destek@vertexcnc.tr" }],
          subject: `🚨 Yeni Teklif Talebi - ${customerData.company || 'Bilinmeyen Şirket'} - ${orderNumber}`
        }],
        from: { 
          email: env.FROM_EMAIL || "destek@vertexcnc.tr",
          name: "VERTEX CNC Sistem"
        },
        content: [{
          type: "text/html",
          value: supportHtmlContent
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Destek ekibi bilgilendirildi:', env.SUPPORT_EMAIL || "destek@vertexcnc.tr");
    return true;
    
  } catch (error) {
    console.error('❌ Destek e-maili gönderim hatası:', error);
    return false;
  }
}

async function updateOrderStatus(trackingId, status, stageUpdate, env) {
  try {
    const orderData = await env.ORDERS_DB.get(trackingId);
    if (!orderData) {
      throw new Error('Order not found');
    }
    
    const order = JSON.parse(orderData);
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    // Update stage if provided
    if (stageUpdate) {
      const stageIndex = order.stages.findIndex(s => s.stage === stageUpdate.stage);
      if (stageIndex !== -1) {
        order.stages[stageIndex] = {
          ...order.stages[stageIndex],
          status: stageUpdate.status,
          timestamp: new Date().toISOString(),
          description: stageUpdate.description || order.stages[stageIndex].description
        };
      }
    }
    
    await env.ORDERS_DB.put(trackingId, JSON.stringify(order));
    
    return { success: true, order };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAllOrders(env) {
  if (!env.ORDERS_DB) {
    // Development için mock data
    return {
      orders: [
        {
          orderNumber: 'ORD-2024-0001',
          trackingId: 'VTX-DEV-001',
          status: 'Teklif Hazırlanıyor',
          createdAt: new Date().toISOString(),
          customerData: {
            name: 'Demo Müşteri',
            company: 'Demo Şirket',
            email: 'demo@example.com'
          }
        }
      ],
      total: 1
    };
  }
  
  // This is a simplified version - in production you'd want pagination
  const ordersList = await env.ORDERS_DB.list();
  const orders = [];
  
  for (const key of ordersList.keys) {
    if (key.name !== 'order_counter') {
      const orderData = await env.ORDERS_DB.get(key.name);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }
  }
  
  return { orders, total: orders.length };
}

async function handleEmailWebhook(request, env, corsHeaders) {
  // Handle incoming emails to destek@vertexcnc.tr
  return new Response(JSON.stringify({ status: 'email webhook received' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleManusWebhook(request, env, corsHeaders) {
  // Handle Manus AI webhooks
  return new Response(JSON.stringify({ status: 'manus webhook received' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Dosya yükleme fonksiyonu
async function handleFileUpload(request, env, corsHeaders) {
  // Authorization kontrolü
  const isAuthorized = await authorize(request, env);
  if (!isAuthorized) {
    return createApiResponse(false, null, {
      code: "UNAUTHORIZED",
      message: "Bu işlem için yetkiniz yok"
    }, 401, corsHeaders);
  }
  
  try {
    // multipart/form-data içeren POST isteği
    if (request.method !== 'POST') {
      return createApiResponse(false, null, {
        code: "METHOD_NOT_ALLOWED",
        message: "Sadece POST istekleri kabul edilir"
      }, 405, corsHeaders);
    }
    
    // formData'dan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file');
    const orderNumber = formData.get('orderNumber');
    
    if (!file) {
      return createApiResponse(false, null, {
        code: "BAD_REQUEST",
        message: "Dosya bulunamadı"
      }, 400, corsHeaders);
    }
    
    // Dosya kontrolleri
    const fileSize = file.size;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    // Dosya boyutu kontrolü (50MB'a kadar)
    if (fileSize > 50 * 1024 * 1024) {
      return createApiResponse(false, null, {
        code: "FILE_TOO_LARGE",
        message: "Dosya boyutu 50MB'ı geçemez"
      }, 400, corsHeaders);
    }
    
    // Dosya tipi kontrolü
    const allowedExtensions = ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs', 'pdf', 'jpg', 'png'];
    if (!allowedExtensions.includes(fileExtension)) {
      return createApiResponse(false, null, {
        code: "INVALID_FILE_TYPE",
        message: "Geçersiz dosya türü. İzin verilen türler: " + allowedExtensions.join(', ')
      }, 400, corsHeaders);
    }
    
    // Benzersiz bir dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileKey = `uploads/${orderNumber || 'order'}/${timestamp}-${randomString}-${fileName}`;
    
    // Dosyayı R2'ye yükle
    await env.FILE_BUCKET.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });
    
    // Başarılı yanıt
    return createApiResponse(true, {
      fileKey,
      fileName,
      fileSize,
      fileType: file.type,
      url: `/api/files/${fileKey}`
    }, null, 200, corsHeaders);
    
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return createApiResponse(false, null, {
      code: "UPLOAD_ERROR",
      message: "Dosya yüklenirken bir hata oluştu"
    }, 500, corsHeaders);
  }
}

// Dosya getirme fonksiyonu
async function getFile(fileKey, env, corsHeaders) {
  try {
    // R2'den dosyayı al
    const object = await env.FILE_BUCKET.get(fileKey);
    
    if (!object) {
      return createApiResponse(false, null, {
        code: "FILE_NOT_FOUND",
        message: "Dosya bulunamadı"
      }, 404, corsHeaders);
    }
    
    // Dosya içeriği ve meta veriler
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // CORS ayarlarını ekle
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error('Dosya getirme hatası:', error);
    return createApiResponse(false, null, {
      code: "RETRIEVE_ERROR",
      message: "Dosya getirilirken bir hata oluştu"
    }, 500, corsHeaders);
  }
}
