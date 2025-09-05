# Email Rules Configuration for destek@vertexcnc.tr

## Rule Engine for Support Email Processing

### Email Rule Categories

#### 1. Quote Request Rules
**Triggers**: Keywords like "teklif", "fiyat", "quote", "price"
**Action**: Forward to Manus AI for quote generation
**Response**: Automated quote email

#### 2. Technical Support Rules
**Triggers**: Keywords like "problem", "hata", "destek", "technical"
**Action**: Create support ticket + AI response
**Response**: Technical assistance email

#### 3. Production Inquiry Rules
**Triggers**: Keywords like "sipariş", "üretim", "delivery", "status"
**Action**: Check production database + AI update
**Response**: Production status email

#### 4. General Information Rules
**Triggers**: Keywords like "info", "bilgi", "hakkında", "about"
**Action**: AI-powered company information
**Response**: Company brochure + capabilities

#### 5. Partnership/B2B Rules
**Triggers**: Keywords like "partnership", "collaboration", "supplier"
**Action**: Forward to sales team + AI qualification
**Response**: Business development contact

## Email Processing Workflow

### Step 1: Email Parsing
```javascript
function parseIncomingEmail(email) {
  return {
    from: email.sender,
    subject: email.subject,
    body: email.body,
    attachments: email.attachments,
    timestamp: new Date(),
    language: detectLanguage(email.body)
  };
}
```

### Step 2: Rule Classification
```javascript
function classifyEmailIntent(email) {
  const keywords = {
    quote: ['teklif', 'fiyat', 'quote', 'price', 'cost', 'estimate'],
    support: ['problem', 'hata', 'destek', 'help', 'issue', 'technical'],
    production: ['sipariş', 'üretim', 'delivery', 'status', 'order'],
    info: ['info', 'bilgi', 'hakkında', 'about', 'company'],
    partnership: ['partnership', 'collaboration', 'supplier', 'business']
  };
  
  // AI-powered intent classification
  return determineIntent(email.subject + ' ' + email.body, keywords);
}
```

### Step 3: Rule Execution
```javascript
function executeEmailRule(email, intent) {
  switch(intent) {
    case 'quote':
      return processQuoteRequest(email);
    case 'support':
      return processSupportRequest(email);
    case 'production':
      return processProductionInquiry(email);
    case 'info':
      return processInfoRequest(email);
    case 'partnership':
      return processPartnershipInquiry(email);
    default:
      return processGeneralInquiry(email);
  }
}
```

## Specific Rule Implementations

### Quote Request Processing
```javascript
async function processQuoteRequest(email) {
  // Extract requirements from email
  const requirements = extractRequirements(email.body);
  
  // Trigger Manus AI for quote generation
  const aiQuote = await callManusAI(
    `Generate detailed CNC quote for: ${requirements}`,
    { 
      customer_email: email.from,
      type: 'email_quote_request',
      original_message: email.body
    }
  );
  
  // Send automated quote response
  return sendQuoteResponse(email.from, aiQuote);
}
```

### Technical Support Processing
```javascript
async function processSupportRequest(email) {
  // Create support ticket
  const ticketId = await createSupportTicket(email);
  
  // Generate AI response
  const aiResponse = await callManusAI(
    `Provide technical support for: ${email.body}`,
    { 
      type: 'technical_support',
      ticket_id: ticketId,
      customer_email: email.from
    }
  );
  
  // Send support response
  return sendSupportResponse(email.from, aiResponse, ticketId);
}
```

### Production Status Processing
```javascript
async function processProductionInquiry(email) {
  // Extract order details from email
  const orderInfo = extractOrderInfo(email.body);
  
  // Check production database
  const productionStatus = await checkProductionStatus(orderInfo);
  
  // Generate AI status update
  const statusUpdate = await callManusAI(
    `Generate production status update: ${productionStatus}`,
    { 
      type: 'production_status',
      customer_email: email.from,
      order_info: orderInfo
    }
  );
  
  return sendStatusUpdate(email.from, statusUpdate);
}
```

## Response Templates

### Quote Response Template
```
Subject: Vertex CNC - Teklif Yanıtı [Auto-Generated]

Sayın [Customer Name],

Talebiniz için detaylı teklifimiz aşağıdadır:

[AI Generated Quote Details]

Bu teklif 30 gün geçerlidir.

Saygılarımızla,
Vertex CNC Otomatik Sistem
```

### Support Response Template
```
Subject: Vertex CNC Destek - Ticket #[ID]

Merhaba,

Destek talebiniz alınmıştır. Ticket #[ID]

[AI Generated Technical Response]

Ek yardıma ihtiyacınız varsa lütfen bu ticket numarasını belirtin.

Vertex CNC Teknik Destek
```

## Implementation Rules

### Priority Levels
1. **Urgent**: Production issues, quality problems
2. **High**: Quote requests, technical support
3. **Medium**: General inquiries, information requests
4. **Low**: Partnership inquiries, marketing

### Response Times
- **Quotes**: Immediate (AI-generated)
- **Support**: 5 minutes (AI) + 2 hours (human review)
- **Production**: Real-time status
- **General**: 30 minutes

### Escalation Rules
- Complex technical issues → Human technician
- High-value quotes (>50k) → Sales manager
- Partnership inquiries → Business development
- Complaints → Customer service manager

This rule engine will automatically process all emails sent to destek@vertexcnc.tr and provide intelligent, contextual responses.
