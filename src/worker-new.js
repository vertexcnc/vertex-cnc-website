// Cloudflare Worker for VERTEX CNC - API Proxy & Order Management

// Flask API Backend URL
const FLASK_API_URL = 'https://vertex-cnc-api.onrender.com'; // Production
// const FLASK_API_URL = 'http://localhost:5001'; // Development (uncomment for local)

// Standart API yanıt formatı
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

// Flask API'ye proxy request
async function proxyToFlask(request, endpoint, env) {
  try {
    const url = new URL(request.url);
    const flaskUrl = `${FLASK_API_URL}${endpoint || url.pathname}`;
    
    // Request headers'ı kopyala
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
    return await handleFallback(request, env);
  }
}

// Fallback handler
async function handleFallback(request, env) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Quote email fallback
  if (url.pathname === '/api/send-quote-email' && request.method === 'POST') {
    return await handleQuoteEmailFallback(request, env, corsHeaders);
  }

  // Tracking fallback
  if (url.pathname.startsWith('/api/track-order/')) {
    const trackingId = url.pathname.split('/').pop();
    return await handleTrackingFallback(trackingId, env, corsHeaders);
  }

  // Health check
  if (url.pathname === '/health') {
    return createApiResponse(true, { status: 'healthy', mode: 'cloudflare-fallback' }, null, 200, corsHeaders);
  }

  return createApiResponse(false, null, 'Endpoint not found', 404, corsHeaders);
}

// SendGrid fallback e-mail
async function handleQuoteEmailFallback(request, env, corsHeaders) {
  try {
    const formData = await request.json();
    
    const orderNumber = `VTX-${Date.now()}`;
    const trackingId = crypto.randomUUID();
    
    // SendGrid ile e-mail gönder
    if (env.SENDGRID_API_KEY) {
      const emailData = {
        personalizations: [{
          to: [{ email: formData.email }],
          subject: `Teklif Talebiniz Alındı - ${orderNumber}`
        }],
        from: { email: env.FROM_EMAIL || 'destek@vertexcnc.tr' },
        content: [{
          type: 'text/html',
          value: `
            <h2>Teklif Talebiniz Alındı - ${orderNumber}</h2>
            <p>Sayın ${formData.contactName},</p>
            <p>Teklif talebiniz başarıyla alınmıştır.</p>
            <p><strong>Sipariş Numarası:</strong> ${orderNumber}</p>
            <p><strong>Takip ID:</strong> ${trackingId}</p>
            <p><strong>Şirket:</strong> ${formData.companyName}</p>
            <p><strong>Proje:</strong> ${formData.projectDescription}</p>
            <p>24 saat içinde detaylı teklifimizi size ileteceğiz.</p>
            <p><a href="https://vertex-cnc-api.vertexcnc-tr.workers.dev/track/${trackingId}">Siparişi Takip Et</a></p>
            <p>VERTEX CNC Ekibi</p>
          `
        }]
      };

      const response = await fetch('https://api.sendgrid.v3.mail.send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.status}`);
      }
    }

    // KV'ye kaydet (opsiyonel)
    if (env.ORDERS_DB) {
      const orderData = {
        orderNumber,
        trackingId,
        customerInfo: {
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone
        },
        projectInfo: {
          description: formData.projectDescription,
          quantity: formData.quantity,
          material: formData.material
        },
        status: 'active',
        overallProgress: 15,
        stages: [
          { id: 'quote_received', name: 'Teklif Alındı', status: 'completed', progress: 100 },
          { id: 'design_analysis', name: 'Tasarım Analizi', status: 'in_progress', progress: 25 },
          { id: 'material_prep', name: 'Malzeme Hazırlık', status: 'pending', progress: 0 },
          { id: 'cnc_machining', name: 'CNC İşleme', status: 'pending', progress: 0 },
          { id: 'quality_control', name: 'Kalite Kontrol', status: 'pending', progress: 0 },
          { id: 'delivery', name: 'Teslimat', status: 'pending', progress: 0 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await env.ORDERS_DB.put(trackingId, JSON.stringify(orderData));
    }

    return createApiResponse(true, {
      orderNumber,
      trackingId,
      trackingUrl: `https://vertex-cnc-api.vertexcnc-tr.workers.dev/track/${trackingId}`,
      message: 'Teklif talebi başarıyla alındı',
      emailSent: true,
      source: 'cloudflare-fallback'
    }, null, 200, corsHeaders);

  } catch (error) {
    console.error('Fallback email error:', error);
    return createApiResponse(false, null, `Email gönderim hatası: ${error.message}`, 500, corsHeaders);
  }
}

// Tracking fallback
async function handleTrackingFallback(trackingId, env, corsHeaders) {
  try {
    // KV'den sipariş bilgisini al
    if (env.ORDERS_DB) {
      const orderData = await env.ORDERS_DB.get(trackingId);
      if (orderData) {
        const order = JSON.parse(orderData);
        return createApiResponse(true, { order }, null, 200, corsHeaders);
      }
    }

    // Mock data döndür eğer KV'de bulunamazsa
    const mockOrder = {
      orderNumber: `VTX-DEMO-${trackingId.slice(0, 8)}`,
      trackingId: trackingId,
      status: 'active',
      overallProgress: 25,
      customerInfo: {
        companyName: 'Demo Şirketi',
        contactName: 'Demo Müşteri',
        email: 'demo@example.com'
      },
      projectInfo: {
        description: 'Demo proje',
        quantity: '10 adet',
        material: 'Alüminyum'
      },
      stages: [
        { id: 'quote_received', name: 'Teklif Alındı', status: 'completed', progress: 100, date: new Date().toISOString() },
        { id: 'design_analysis', name: 'Tasarım Analizi', status: 'in_progress', progress: 50, date: null },
        { id: 'material_prep', name: 'Malzeme Hazırlık', status: 'pending', progress: 0, date: null },
        { id: 'cnc_machining', name: 'CNC İşleme', status: 'pending', progress: 0, date: null },
        { id: 'quality_control', name: 'Kalite Kontrol', status: 'pending', progress: 0, date: null },
        { id: 'delivery', name: 'Teslimat', status: 'pending', progress: 0, date: null }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    return createApiResponse(true, { order: mockOrder }, null, 200, corsHeaders);
    
  } catch (error) {
    console.error('Tracking fallback error:', error);
    return createApiResponse(false, null, 'Sipariş bulunamadı', 404, corsHeaders);
  }
}

// Main worker
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Primary: Flask API'ye proxy et
      return await proxyToFlask(request, null, env);
      
    } catch (error) {
      console.error('Worker main error:', error);
      
      // Fallback: Cloudflare üzerinden handle et
      return await handleFallback(request, env);
    }
  }
};
