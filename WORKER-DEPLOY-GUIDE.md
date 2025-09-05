# 🛠️ WORKER API MANUAL DEPLOY - ADIM ADIM

## 📋 ŞU ANDA YAPILACAKLAR:

### 1. 🌐 Cloudflare Dashboard'a Git:
**URL:** https://dash.cloudflare.com

### 2. 🔧 Worker Oluştur:
1. **Sol menüden**: "Workers & Pages" tıkla
2. **Create** butonuna tıkla
3. **"Create Worker"** seç (Pages değil)
4. **Name:** `vertex-cnc-production` yaz
5. **"Deploy"** tıkla

### 3. 📝 Worker Kodunu Kopyala:
**Bu kodu kopyala** (tam worker.js içeriği):

```javascript
// Cloudflare Worker for VERTEX CNC - Order Tracking & API
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          service: 'vertex-cnc-api'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Default 404
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    
    default:
      if (path.startsWith('/track-order/')) {
        const trackingId = path.replace('/track-order/', '');
        return await getOrderStatus(trackingId, env, corsHeaders);
      }
      return new Response('API endpoint not found', { 
        status: 404,
        headers: corsHeaders
      });
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
          error: \`Field '\${field}' is required\` 
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
  
  if (request.method === 'GET') {
    // Get orders list (admin endpoint - add authentication)
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
  return \`ORD-\${new Date().getFullYear()}-\${newCount.toString().padStart(4, '0')}\`;
}

async function sendConfirmationEmail(customerData, orderNumber, trackingId, env) {
  // Integration with email service (Cloudflare Email Workers or external API)
  const emailData = {
    to: customerData.email,
    subject: \`VERTEX CNC - Teklif Talebiniz Alındı (\${orderNumber})\`,
    template: 'quote_confirmation',
    data: {
      customerName: customerData.name,
      orderNumber,
      trackingId,
      company: customerData.company,
      description: customerData.description,
      trackingUrl: \`https://vertexcnc.tr/track/\${trackingId}\`
    }
  };
  
  // Send via your email service
  console.log('Sending confirmation email:', emailData);
  // Implementation depends on your email service
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
```

### 4. 📋 Worker Editor'de:
1. **Varsayılan kodu sil**
2. **Yukarıdaki kodu yapıştır**
3. **"Save and Deploy"** tıkla

### 5. ⚙️ KV Storage Ekle:
1. **Settings** tab'ına git
2. **Variables** bölümünde
3. **"Add binding"** tıkla
4. **Binding name**: `ORDERS_DB`
5. **KV Namespace**: "Create new" → `vertex-orders`
6. **Tekrar add binding**:
   - **Binding name**: `TRACKING_DB`  
   - **KV Namespace**: "Create new" → `vertex-tracking`

### 6. ✅ Test Et:
Worker URL'niz: `https://vertex-cnc-production.[sizin-username].workers.dev`

**Health check**: `/health` endpoint'ini test edin

---

## 🚀 BAŞLAMAYA HAZIR MISINIZ?

1. **Cloudflare dashboard açın**: https://dash.cloudflare.com
2. **Workers & Pages → Create Worker**
3. **Kodu kopyala-yapıştır**
4. **KV storage ekle**

**Hangi adımdasınız? Yardıma ihtiyacınız var mı?** 🎯
