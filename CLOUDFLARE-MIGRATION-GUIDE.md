# VERTEX CNC - Cloudflare Migration & Advanced Integration

## 🎯 **Hedef Sistem Mimarisi**

```
vertexcnc.tr Domain
├── Cloudflare DNS & Security
├── Cloudflare Pages (Frontend)
├── Cloudflare Workers (Backend API)
├── Cloudflare R2 (CAD File Storage)
├── Manus Mail Automation
└── Advanced Analytics & Monitoring
```

## 🚀 **Avantajlar**

### **Cloudflare Avantajları:**
- ⚡ **Global CDN**: Dünya çapında hızlı erişim
- 🛡️ **DDoS Koruması**: Otomatik saldırı koruması
- 🔒 **SSL/TLS**: Ücretsiz SSL sertifikası
- 📊 **Analytics**: Detaylı trafik analizi
- 🤖 **Bot Koruması**: Zararlı bot engelleme
- 💾 **R2 Storage**: CAD dosyaları için ucuz storage

### **Manus Integration Avantajları:**
- 📧 **AI Mail Automation**: Akıllı e-posta işleme
- 🔄 **Workflow Automation**: Tetikleme tabanlı süreçler
- 📈 **Real-time Monitoring**: Canlı sistem takibi
- 🎯 **Smart Routing**: Akıllı e-posta yönlendirme

## 📋 **Migration Adımları**

### **Adım 1: Cloudflare Hesabı ve Domain Transfer**

#### **1.1 Cloudflare Hesabı Oluşturma**
1. https://cloudflare.com/ adresine gidin
2. **Sign Up** ile hesap oluşturun
3. **Add Site** ile `vertexcnc.tr` ekleyin
4. **Free Plan** seçin (başlangıç için yeterli)

#### **1.2 DNS Kayıtlarını Kopyalama**
```bash
# Mevcut DNS kayıtlarını kontrol edin
nslookup vertexcnc.tr
dig vertexcnc.tr ANY
```

#### **1.3 Nameserver Değişikliği**
**Natro Panelinde:**
1. **Domain Management** → **vertexcnc.tr**
2. **Nameservers** bölümüne gidin
3. **Cloudflare nameservers** ile değiştirin:
   ```
   NS1: [cloudflare-ns1].cloudflare.com
   NS2: [cloudflare-ns2].cloudflare.com
   ```

### **Adım 2: Cloudflare Pages Deployment**

#### **2.1 GitHub Repository Oluşturma**
```bash
# Git repository oluşturun
git init
git add .
git commit -m "Initial VERTEX CNC deployment"
git remote add origin https://github.com/[username]/vertex-cnc.git
git push -u origin main
```

#### **2.2 Cloudflare Pages Kurulumu**
1. **Cloudflare Dashboard** → **Pages**
2. **Create a project** → **Connect to Git**
3. **GitHub repository** seçin
4. **Build settings**:
   ```
   Framework preset: React
   Build command: npm run build
   Build output directory: dist
   ```

### **Adım 3: Cloudflare Workers API**

#### **3.1 Worker Script Oluşturma**
```javascript
// vertex-cnc-api.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname === '/api/send-quote-email') {
      return handleQuoteEmail(request, env);
    }
    
    if (url.pathname.startsWith('/api/track-order/')) {
      return handleOrderTracking(request, env);
    }

    return new Response('API Endpoint not found', { status: 404 });
  }
};

async function handleQuoteEmail(request, env) {
  try {
    const formData = await request.json();
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Save to Cloudflare KV
    await env.ORDERS_KV.put(orderNumber, JSON.stringify({
      ...formData,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'quote_received'
    }));

    // Send to Manus Mail Automation
    await triggerManusWorkflow('quote_request', {
      ...formData,
      orderNumber
    });

    return new Response(JSON.stringify({
      success: true,
      orderNumber,
      message: 'Teklif talebiniz alındı'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
```

#### **3.2 Environment Variables**
```bash
# Cloudflare Workers Environment
MANUS_API_KEY=your-manus-api-key
MANUS_WEBHOOK_URL=https://api.manus.im/webhook
SMTP_ENDPOINT=https://api.resend.com/emails
```

### **Adım 4: Manus Mail Automation Integration**

#### **4.1 Manus Dashboard Kurulumu**
1. **Manus Dashboard** → **Mail Automation**
2. **@manus.bot** e-posta adresini alın
3. **Webhook URL** ayarlayın: `https://vertexcnc.tr/api/manus-webhook`

#### **4.2 Workflow Konfigürasyonu**
```json
{
  "workflows": {
    "quote_request": {
      "trigger": "email_received",
      "conditions": ["subject.contains('Yeni Teklif')"],
      "actions": [
        "generate_pdf_quote",
        "send_customer_confirmation",
        "notify_support_team",
        "create_tracking_entry"
      ]
    },
    "order_status_update": {
      "trigger": "status_changed",
      "conditions": ["order.status !== previous.status"],
      "actions": [
        "send_status_notification",
        "update_tracking_system"
      ]
    }
  }
}
```

### **Adım 5: Advanced Features**

#### **5.1 Cloudflare R2 Storage**
```javascript
// CAD file upload to R2
async function uploadCADFile(file, orderNumber) {
  const key = `cad-files/${orderNumber}/${file.name}`;
  
  await env.R2_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      orderNumber: orderNumber,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  return `https://r2.vertexcnc.tr/${key}`;
}
```

#### **5.2 Real-time Analytics**
```javascript
// Cloudflare Analytics API
async function trackEvent(eventType, data) {
  await fetch('https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: data
    })
  });
}
```

### **Adım 6: Security & Performance**

#### **6.1 Security Rules**
```javascript
// Cloudflare Security Rules
const securityRules = [
  {
    name: "Block malicious bots",
    expression: "(cf.bot_management.score < 30)",
    action: "block"
  },
  {
    name: "Rate limit API",
    expression: "(http.request.uri.path matches \"/api/.*\")",
    action: "rate_limit",
    rateLimit: {
      requests: 100,
      period: 60
    }
  }
];
```

#### **6.2 Performance Optimization**
```javascript
// Cache configuration
const cacheConfig = {
  "rules": [
    {
      "expression": "(http.request.uri.path matches \".*\\.(css|js|png|jpg|jpeg|gif|ico|svg)$\")",
      "action": "cache",
      "cache_ttl": 86400
    }
  ]
};
```

## 🔧 **Implementation Plan**

### **Hafta 1: Foundation**
- [ ] Cloudflare hesabı oluşturma
- [ ] Domain transfer başlatma
- [ ] DNS kayıtlarını kopyalama
- [ ] Basic Pages deployment

### **Hafta 2: Backend & API**
- [ ] Cloudflare Workers kurulumu
- [ ] API endpoints geliştirme
- [ ] KV storage konfigürasyonu
- [ ] R2 bucket kurulumu

### **Hafta 3: Manus Integration**
- [ ] Manus Mail Automation kurulumu
- [ ] Workflow konfigürasyonu
- [ ] Webhook entegrasyonu
- [ ] Test ve debugging

### **Hafta 4: Advanced Features**
- [ ] Analytics kurulumu
- [ ] Security rules
- [ ] Performance optimization
- [ ] Monitoring ve alerting

## 💰 **Maliyet Analizi**

### **Cloudflare Costs:**
- **Free Plan**: $0/month (başlangıç için yeterli)
- **Pro Plan**: $20/month (gelişmiş özellikler)
- **R2 Storage**: $0.015/GB/month
- **Workers**: $5/10M requests

### **Manus Costs:**
- **Mail Automation**: Kullanıma göre pricing
- **API Calls**: Request bazlı ücretlendirme

### **Total Estimated Cost:**
- **Başlangıç**: $0-25/month
- **Büyüme**: $50-100/month
- **Enterprise**: $200+/month

## 🎯 **Migration Timeline**

### **Immediate (1-2 gün):**
1. Cloudflare hesabı oluşturma
2. Domain ekleme
3. DNS konfigürasyonu

### **Short-term (1 hafta):**
1. Pages deployment
2. Basic Workers API
3. SSL kurulumu

### **Medium-term (2-4 hafta):**
1. Manus integration
2. Advanced workflows
3. R2 storage

### **Long-term (1-3 ay):**
1. Analytics ve monitoring
2. Performance optimization
3. Advanced security

Bu yaklaşımla çok daha güçlü, ölçeklenebilir ve otomatik bir sistem kurabiliriz! Hangi adımdan başlamak istiyorsunuz?

