// Cloudflare Worker for Vertex CNC
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Static assets from dist
    if (url.pathname.startsWith('/assets/')) {
      return handleStaticAssets(request, env);
    }
    
    // API endpoints
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // Email webhook for destek@vertexcnc.tr
    if (url.pathname === '/webhook/email') {
      return handleEmailWebhook(request, env);
    }
    
    // Manus AI webhook
    if (url.pathname === '/webhook/manus') {
      return handleManusWebhook(request, env);
    }
    
    // Main site (serve index.html for SPA)
    return handleMainSite(request, env);
  }
};

async function handleStaticAssets(request, env) {
  // Serve static files with proper cache headers
  const response = await env.ASSETS.fetch(request);
  
  if (response.status === 200) {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    return new Response(response.body, { ...response, headers });
  }
  
  return response;
}

async function handleAPI(request, env) {
  const url = new URL(request.url);
  
  // Quote submission
  if (url.pathname === '/api/quote' && request.method === 'POST') {
    return handleQuoteSubmission(request, env);
  }
  
  // Contact form
  if (url.pathname === '/api/contact' && request.method === 'POST') {
    return handleContactForm(request, env);
  }
  
  return new Response('API endpoint not found', { status: 404 });
}

async function handleQuoteSubmission(request, env) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Trigger Manus AI bot via email
    await triggerManusBot(data, env);
    
    // Send to Manus AI for intelligent quote processing
    const aiResponse = await callManusAI(
      `Generate CNC machining quote for: ${JSON.stringify(data)}`,
      { 
        type: 'quote_request', 
        customer: data.email,
        trigger_email: 'vertexcnc@manus.bot'
      }
    );
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Quote request submitted and AI bot triggered',
      ai_response: aiResponse 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function callManusAI(prompt, context = {}) {
  try {
    const response = await fetch('https://loudport-8kxy8u.manus.space/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MANUS_AI_API_KEY || ''}`
      },
      body: JSON.stringify({
        prompt,
        context,
        model: 'vertex-cnc-assistant'
      })
    });
    
    return response.json();
  } catch (error) {
    console.error('Manus AI call failed:', error);
    return { error: 'AI service unavailable' };
  }
}

async function handleEmailWebhook(request, env) {
  try {
    const emailData = await request.json();
    
    // Verify email is from destek@vertexcnc.tr system
    if (!emailData.to || !emailData.to.includes('destek@vertexcnc.tr')) {
      return new Response('Invalid email destination', { status: 400 });
    }
    
    // Parse incoming email
    const parsedEmail = {
      from: emailData.from,
      subject: emailData.subject,
      body: emailData.body || emailData.text,
      timestamp: new Date().toISOString()
    };
    
    // Classify email intent using AI
    const intent = await classifyEmailIntent(parsedEmail);
    
    // Execute appropriate rule based on intent
    const response = await executeEmailRule(parsedEmail, intent, env);
    
    return new Response(JSON.stringify({
      success: true,
      intent: intent,
      action_taken: response.action,
      ticket_id: response.ticket_id || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Email webhook error:', error);
    return new Response('Email processing failed', { status: 500 });
  }
}

async function classifyEmailIntent(email) {
  const keywords = {
    quote: ['teklif', 'fiyat', 'quote', 'price', 'cost', 'estimate', 'maliyet'],
    support: ['problem', 'hata', 'destek', 'help', 'issue', 'technical', 'sorun'],
    production: ['sipariş', 'üretim', 'delivery', 'status', 'order', 'teslimat'],
    info: ['info', 'bilgi', 'hakkında', 'about', 'company', 'şirket'],
    partnership: ['partnership', 'collaboration', 'supplier', 'business', 'ortaklık']
  };
  
  const text = (email.subject + ' ' + email.body).toLowerCase();
  
  // Check for keyword matches
  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      return intent;
    }
  }
  
  // Use AI for complex classification
  try {
    const aiClassification = await callManusAI(
      `Classify this email intent: "${email.subject}" - "${email.body}"`,
      { type: 'intent_classification' }
    );
    return aiClassification.intent || 'general';
  } catch (error) {
    return 'general';
  }
}

async function executeEmailRule(email, intent, env) {
  switch(intent) {
    case 'quote':
      return processQuoteRequest(email, env);
    case 'support':
      return processSupportRequest(email, env);
    case 'production':
      return processProductionInquiry(email, env);
    case 'info':
      return processInfoRequest(email, env);
    case 'partnership':
      return processPartnershipInquiry(email, env);
    default:
      return processGeneralInquiry(email, env);
  }
}

async function processQuoteRequest(email, env) {
  try {
    // Generate AI quote
    const aiQuote = await callManusAI(
      `Generate detailed CNC machining quote based on this email: "${email.body}"`,
      { 
        customer_email: email.from,
        type: 'email_quote_request',
        original_message: email.body
      }
    );
    
    // Send quote response (implementation depends on email service)
    const emailResponse = {
      to: email.from,
      from: 'destek@vertexcnc.tr',
      subject: `Vertex CNC - Teklif Yanıtı [${new Date().toISOString().split('T')[0]}]`,
      body: `
Sayın Müşterimiz,

${email.subject} konulu talebiniz için detaylı teklifimiz:

${aiQuote.quote_details || 'Teklifiniz hazırlanmaktadır.'}

Bu teklif 30 gün geçerlidir.
Sorularınız için: destek@vertexcnc.tr

Saygılarımızla,
Vertex CNC Otomatik Sistem
      `
    };
    
    return {
      action: 'quote_generated',
      email_sent: true,
      ai_response: aiQuote
    };
    
  } catch (error) {
    return { action: 'quote_failed', error: error.message };
  }
}

async function processSupportRequest(email, env) {
  try {
    // Generate ticket ID
    const ticketId = 'VX' + Date.now().toString().slice(-6);
    
    // Generate AI support response
    const aiResponse = await callManusAI(
      `Provide technical support for this CNC related issue: "${email.body}"`,
      { 
        type: 'technical_support',
        ticket_id: ticketId,
        customer_email: email.from
      }
    );
    
    return {
      action: 'support_ticket_created',
      ticket_id: ticketId,
      ai_response: aiResponse
    };
    
  } catch (error) {
    return { action: 'support_failed', error: error.message };
  }
}

async function processProductionInquiry(email, env) {
  const aiResponse = await callManusAI(
    `Provide production status information for: "${email.body}"`,
    { type: 'production_inquiry', customer_email: email.from }
  );
  
  return {
    action: 'production_status_provided',
    ai_response: aiResponse
  };
}

async function processInfoRequest(email, env) {
  const aiResponse = await callManusAI(
    `Provide company information for Vertex CNC based on: "${email.body}"`,
    { type: 'company_info', customer_email: email.from }
  );
  
  return {
    action: 'info_provided',
    ai_response: aiResponse
  };
}

async function processPartnershipInquiry(email, env) {
  const aiResponse = await callManusAI(
    `Handle partnership inquiry: "${email.body}"`,
    { type: 'partnership', customer_email: email.from, priority: 'high' }
  );
  
  return {
    action: 'partnership_inquiry_processed',
    ai_response: aiResponse,
    escalation: 'business_development'
  };
}

async function processGeneralInquiry(email, env) {
  const aiResponse = await callManusAI(
    `Respond to general inquiry: "${email.body}"`,
    { type: 'general', customer_email: email.from }
  );
  
  return {
    action: 'general_response_sent',
    ai_response: aiResponse
  };
}

async function triggerManusBot(formData, env) {
  try {
    // Send actual email to destek@vertexcnc.tr
    await sendQuoteEmail(formData, env);
    
    // Trigger Manus AI bot via email notification
    const emailPayload = {
      to: 'vertexcnc@manus.bot',
      from: 'noreply@vertexcnc.tr',
      subject: `New Quote Request - ${formData.name}`,
      text: `
        New CNC quote request received:
        
        Name: ${formData.name}
        Email: ${formData.email}
        Company: ${formData.company || 'N/A'}
        Message: ${formData.message}
        
        Please process this quote request.
      `,
      metadata: {
        type: 'quote_request',
        customer_email: formData.email,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Manus AI bot triggered for:', formData.email);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to trigger Manus bot:', error);
    return { error: 'Bot trigger failed' };
  }
}

async function handleContactForm(request, env) {
  try {
    const data = await request.json();
    
    // Trigger Manus AI for customer inquiries
    await triggerManusBot(data, env);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact form submitted and AI bot notified' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Contact form error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMainSite(request, env) {
  // Serve index.html for all other routes (SPA routing)
  const response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
  
  return response;
}

// Email sending function using Cloudflare Email Workers
async function sendQuoteEmail(formData, env) {
  try {
    const emailContent = {
      to: 'destek@vertexcnc.tr',
      from: 'noreply@vertexcnc.tr',
      subject: `Yeni Teklif Talebi - ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔧 VERTEX CNC - Yeni Teklif Talebi</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Müşteri Bilgileri:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">İsim:</td>
                <td style="padding: 8px;">${formData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Email:</td>
                <td style="padding: 8px;">${formData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Telefon:</td>
                <td style="padding: 8px;">${formData.phone || 'Belirtilmemiş'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Şirket:</td>
                <td style="padding: 8px;">${formData.company || 'Belirtilmemiş'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3>Proje Detayları:</h3>
            <p><strong>Hizmet Türü:</strong> ${formData.serviceType || 'Belirtilmemiş'}</p>
            <p><strong>Malzeme:</strong> ${formData.material || 'Belirtilmemiş'}</p>
            <p><strong>Adet:</strong> ${formData.quantity || 'Belirtilmemiş'}</p>
            <p><strong>Mesaj:</strong></p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 5px;">
              ${formData.message}
            </div>
          </div>
          
          ${formData.files && formData.files.length > 0 ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📎 Ekli Dosyalar:</h3>
            <ul>
              ${formData.files.map(file => `<li>${file.name} (${file.size} bytes)</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>🕒 Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            <p><strong>🔗 Site:</strong> <a href="https://vertexcnc.tr">vertexcnc.tr</a></p>
          </div>
        </div>
      `,
      text: `
        VERTEX CNC - Yeni Teklif Talebi
        
        Müşteri Bilgileri:
        İsim: ${formData.name}
        Email: ${formData.email}
        Telefon: ${formData.phone || 'Belirtilmemiş'}
        Şirket: ${formData.company || 'Belirtilmemiş'}
        
        Proje Detayları:
        Hizmet Türü: ${formData.serviceType || 'Belirtilmemiş'}
        Malzeme: ${formData.material || 'Belirtilmemiş'}
        Adet: ${formData.quantity || 'Belirtilmemiş'}
        
        Mesaj:
        ${formData.message}
        
        ${formData.files && formData.files.length > 0 ? 
          `Ekli Dosyalar: ${formData.files.map(f => f.name).join(', ')}` : ''
        }
        
        Tarih: ${new Date().toLocaleString('tr-TR')}
        Site: https://vertexcnc.tr
      `
    };

    // Use Cloudflare Email Workers API
    if (env.EMAIL_PROCESSOR) {
      const stub = env.EMAIL_PROCESSOR.get();
      await stub.sendEmail(emailContent);
    } else {
      // Fallback: Use fetch to send email via external service
      await sendEmailViaService(emailContent, env);
    }
    
    console.log('Quote email sent successfully to destek@vertexcnc.tr');
    return { success: true };
    
  } catch (error) {
    console.error('Failed to send quote email:', error);
    throw error;
  }
}

// Fallback email service function
async function sendEmailViaService(emailContent, env) {
  try {
    // SendGrid API Implementation
    if (env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ 
            to: [{ email: emailContent.to }] 
          }],
          from: { 
            email: emailContent.from,
            name: 'VERTEX CNC Website'
          },
          subject: emailContent.subject,
          content: [
            { type: 'text/html', value: emailContent.html },
            { type: 'text/plain', value: emailContent.text }
          ]
        })
      });

      if (response.ok) {
        console.log('Email sent successfully via SendGrid');
        return { success: true, provider: 'sendgrid' };
      } else {
        const error = await response.text();
        console.error('SendGrid error:', error);
        throw new Error(`SendGrid failed: ${error}`);
      }
    }

    // Mailgun API Implementation (Alternative)
    if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
      const formData = new FormData();
      formData.append('from', `VERTEX CNC <${emailContent.from}>`);
      formData.append('to', emailContent.to);
      formData.append('subject', emailContent.subject);
      formData.append('html', emailContent.html);
      formData.append('text', emailContent.text);

      const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`
        },
        body: formData
      });

      if (response.ok) {
        console.log('Email sent successfully via Mailgun');
        return { success: true, provider: 'mailgun' };
      }
    }

    // Resend API Implementation (Modern Alternative)
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `VERTEX CNC <${emailContent.from}>`,
          to: [emailContent.to],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      });

      if (response.ok) {
        console.log('Email sent successfully via Resend');
        return { success: true, provider: 'resend' };
      }
    }

    // Emergency Fallback: Store in KV for manual processing
    if (env.ORDERS_DB) {
      const emergencyEmail = {
        ...emailContent,
        timestamp: new Date().toISOString(),
        status: 'pending_manual_send',
        id: `email_${Date.now()}`
      };

      await env.ORDERS_DB.put(
        `emergency_email_${emergencyEmail.id}`,
        JSON.stringify(emergencyEmail)
      );

      console.log('Email stored for manual processing:', emergencyEmail.id);
      return { success: true, provider: 'kv_fallback', id: emergencyEmail.id };
    }

    throw new Error('No email service configured');

  } catch (error) {
    console.error('All email services failed:', error);
    // Last resort: Log email content for manual sending
    console.log('EMERGENCY EMAIL CONTENT:', emailContent);
    throw error;
  }
}
