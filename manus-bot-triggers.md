# Manus AI Bot Trigger Configuration

## Email Trigger Setup
**Trigger Email**: vertexcnc@manus.bot
**Purpose**: Automated AI bot activation for Vertex CNC

## Trigger Events

### 1. Quote Requests
- **Source**: Contact form on vertexcnc.tr
- **Trigger**: Form submission → Email to vertexcnc@manus.bot
- **AI Action**: Generate CNC machining quote
- **Response**: Automated quote email to customer

### 2. Customer Inquiries
- **Source**: Support/contact forms
- **Trigger**: Customer question → Email notification
- **AI Action**: Analyze inquiry and provide response
- **Response**: Intelligent customer support

### 3. Production Updates
- **Source**: Internal production system
- **Trigger**: Order status change → Bot notification
- **AI Action**: Generate customer update
- **Response**: Automated progress emails

## Email Template for Triggers

### Quote Request Trigger:
```
To: vertexcnc@manus.bot
Subject: New Quote Request - [Customer Name]
Body:
  Customer: [Name]
  Email: [Email]
  Company: [Company]
  Requirements: [Message]
  
  Action Required: Generate CNC quote
```

### Customer Inquiry Trigger:
```
To: vertexcnc@manus.bot
Subject: Customer Inquiry - [Topic]
Body:
  Customer: [Name]
  Email: [Email]
  Inquiry: [Message]
  
  Action Required: Provide support response
```

## Bot Response Workflow

1. **Email Received** → vertexcnc@manus.bot
2. **AI Processing** → Manus AI analyzes content
3. **Response Generation** → Intelligent reply created
4. **Customer Notification** → Email/webhook to customer
5. **Internal Logging** → Record in CRM/database

## Integration Points

### Cloudflare Worker
- Handles form submissions
- Triggers email notifications
- Receives AI responses via webhook

### Manus AI Platform
- Monitors vertexcnc@manus.bot inbox
- Processes trigger emails
- Generates intelligent responses
- Sends webhooks back to worker

### Email Services
- SendGrid/Mailgun for email delivery
- SMTP relay for trigger emails
- Email parsing for Manus AI

## Environment Variables Required
```env
MANUS_AI_URL=https://loudport-8kxy8u.manus.space/
MANUS_TRIGGER_EMAIL=vertexcnc@manus.bot
MANUS_API_KEY=<your-api-key>
EMAIL_SERVICE_API_KEY=<email-service-key>
```

## Testing the Trigger
1. Submit quote form on vertexcnc.tr
2. Check email sent to vertexcnc@manus.bot
3. Verify Manus AI processes the email
4. Confirm response webhook received
5. Validate customer receives AI-generated quote

This setup enables fully automated AI-driven customer interaction for Vertex CNC.
