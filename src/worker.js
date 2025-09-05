// Cloudflare Worker for VERTEX CNC - Order Tracking & API
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

// Yetkilendirme yardımcı fonksiyonu
async function authorize(request, env, requiredRole = 'user') {
  // OPTIONS için yetkilendirme kontrolü yapma
  if (request.method === 'OPTIONS') {
    return true;
  }
  
  // Açık endpointler için yetkilendirme kontrolü yapma
  const url = new URL(request.url);
  const publicPaths = ['/health', '/api/track-order', '/api/send-quote-email'];
  
  if (publicPaths.some(path => url.pathname.startsWith(path)) || 
      url.pathname.match(/^\/api\/track-order\/[A-Za-z0-9-]+$/)) {
    return true;
  }
  
  // Auth header kontrolü
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  
  // Admin token kontrolü - gerçek uygulamada JWT veya daha güçlü bir token doğrulama kullanılmalı
  if (requiredRole === 'admin') {
    return token === env.ADMIN_API_KEY;
  }
  
  // Normal API token kontrolü
  return token === env.API_KEY;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
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
    
    // Save to KV storage
    await env.ORDERS_DB.put(trackingId, JSON.stringify(order));
    await env.TRACKING_DB.put(orderNumber, trackingId);
    
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
    const orderData = await env.ORDERS_DB.get(trackingId);
    
    if (!orderData) {
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
  const currentCount = await env.ORDERS_DB.get('order_counter') || '0';
  const newCount = parseInt(currentCount) + 1;
  await env.ORDERS_DB.put('order_counter', newCount.toString());
  return `ORD-${new Date().getFullYear()}-${newCount.toString().padStart(4, '0')}`;
}

async function sendConfirmationEmail(customerData, orderNumber, trackingId, env) {
  // Email içeriğini hazırlıyoruz
  const emailData = {
    to: customerData.email,
    from: "teklifler@vertexcnc.tr", // Doğrulanmış gönderici email adresi olmalı
    subject: `VERTEX CNC - Teklif Talebiniz Alındı (${orderNumber})`,
    templateId: "d-vertexcnc-quote-confirmation", // SendGrid şablon ID'si
    dynamicTemplateData: {
      customerName: customerData.name,
      orderNumber,
      trackingId,
      company: customerData.company,
      description: customerData.description,
      trackingUrl: `https://vertexcnc.tr/track/${trackingId}`
    }
  };
  
  try {
    // SendGrid API entegrasyonu örneği
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY || "";
    
    // API anahtarı kontrol
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API anahtarı bulunamadı');
      return false;
    }
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email: emailData.to }], 
          dynamic_template_data: emailData.dynamicTemplateData 
        }],
        from: { email: emailData.from },
        template_id: emailData.templateId
      })
    });
    
    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }
    
    console.log('Email gönderildi:', emailData.to);
    return true;
  } catch (error) {
    console.error('Email gönderim hatası:', error);
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
