interface Env {
  KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // API route handler
    if (path.startsWith('/api/orders')) {
      return handleOrders(request, env, ctx);
    } else if (path.startsWith('/api/quotes')) {
      return handleQuotes(request, env, ctx);
    }

    // Default response
    return new Response('Vertex CNC API çalışıyor', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};

async function handleOrders(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);
  const orderId = url.searchParams.get('id');

  // GET: Sipariş bilgisi getir
  if (method === 'GET' && orderId) {
    const orderData = await env.KV.get(`order:${orderId}`);
    if (!orderData) {
      return new Response(JSON.stringify({ error: 'Sipariş bulunamadı' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(orderData, {
      headers: { 'content-type': 'application/json' },
    });
  }

  // POST: Yeni sipariş oluştur
  if (method === 'POST') {
    try {
      const orderData = await request.json();
      const orderId = crypto.randomUUID();
      await env.KV.put(`order:${orderId}`, JSON.stringify({
        id: orderId,
        ...orderData,
        createdAt: new Date().toISOString(),
        status: 'Alındı'
      }));
      
      return new Response(JSON.stringify({ success: true, orderId }), {
        headers: { 'content-type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Sipariş işlenirken hata oluştu' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Desteklenmeyen işlem' }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}

async function handleQuotes(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const method = request.method;
  
  // POST: Yeni teklif oluştur
  if (method === 'POST') {
    try {
      const quoteData = await request.json();
      const quoteId = crypto.randomUUID();
      await env.KV.put(`quote:${quoteId}`, JSON.stringify({
        id: quoteId,
        ...quoteData,
        createdAt: new Date().toISOString(),
        status: 'Beklemede'
      }));
      
      return new Response(JSON.stringify({ success: true, quoteId }), {
        headers: { 'content-type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Teklif işlenirken hata oluştu' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Desteklenmeyen işlem' }), {
    status: 400,
    headers: { 'content-type': 'application/json' },
  });
}
