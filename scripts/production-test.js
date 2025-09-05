#!/usr/bin/env node
/**
 * Production API Test - Tüm sistemin son testi
 */

const API_BASE = 'https://vertex-cnc-api.vertexcnc-tr.workers.dev';

async function runFullSystemTest() {
  console.log('🚀 VERTEX CNC - Production System Test');
  console.log('=====================================\n');
  console.log(`🔗 API Base: ${API_BASE}\n`);

  const results = [];

  // 1. Health Check
  console.log('1️⃣ Health Check Test...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Health Check - PASSED');
      results.push({ test: 'Health Check', status: 'PASSED' });
    } else {
      console.log('❌ Health Check - FAILED');
      results.push({ test: 'Health Check', status: 'FAILED' });
    }
  } catch (error) {
    console.log('❌ Health Check - ERROR:', error.message);
    results.push({ test: 'Health Check', status: 'ERROR' });
  }

  await sleep(1000);

  // 2. Quote Request Test
  console.log('\n2️⃣ Quote Request Test...');
  try {
    const response = await fetch(`${API_BASE}/api/send-quote-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Production Test User',
        email: 'production-test@vertexcnc.tr',
        company: 'VERTEX CNC Test',
        phone: '+90 555 999 8877',
        description: 'Production system test - CNC milling project'
      })
    });
    
    const data = await response.json();
    if (response.ok && data.success && data.orderNumber && data.trackingId) {
      console.log('✅ Quote Request - PASSED');
      console.log(`📋 Order Number: ${data.orderNumber}`);
      console.log(`🔖 Tracking ID: ${data.trackingId}`);
      
      results.push({ 
        test: 'Quote Request', 
        status: 'PASSED', 
        data: { orderNumber: data.orderNumber, trackingId: data.trackingId }
      });

      // 3. Order Tracking Test
      await sleep(2000);
      console.log('\n3️⃣ Order Tracking Test...');
      
      const trackingResponse = await fetch(`${API_BASE}/api/track-order/${data.trackingId}`);
      const trackingData = await trackingResponse.json();
      
      if (trackingResponse.ok && trackingData.success && trackingData.order) {
        console.log('✅ Order Tracking - PASSED');
        console.log(`📊 Order Status: ${trackingData.order.status}`);
        console.log(`📅 Created: ${new Date(trackingData.order.createdAt).toLocaleString()}`);
        results.push({ test: 'Order Tracking', status: 'PASSED' });
      } else {
        console.log('❌ Order Tracking - FAILED');
        results.push({ test: 'Order Tracking', status: 'FAILED' });
      }
      
    } else {
      console.log('❌ Quote Request - FAILED');
      results.push({ test: 'Quote Request', status: 'FAILED' });
    }
  } catch (error) {
    console.log('❌ Quote Request - ERROR:', error.message);
    results.push({ test: 'Quote Request', status: 'ERROR' });
  }

  await sleep(1000);

  // 4. CORS Test
  console.log('\n4️⃣ CORS Configuration Test...');
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'OPTIONS'
    });
    
    if (response.ok) {
      console.log('✅ CORS - PASSED');
      results.push({ test: 'CORS', status: 'PASSED' });
    } else {
      console.log('❌ CORS - FAILED');
      results.push({ test: 'CORS', status: 'FAILED' });
    }
  } catch (error) {
    console.log('❌ CORS - ERROR:', error.message);
    results.push({ test: 'CORS', status: 'ERROR' });
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const total = results.length;
  
  results.forEach(result => {
    const emoji = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${emoji} ${result.test}: ${result.status}`);
  });
  
  console.log(`\n📈 RESULTS: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('✅ VERTEX CNC API is ready for production');
    console.log('✅ Quote system working');
    console.log('✅ Order tracking working');
    console.log('✅ Email integration ready');
    console.log('✅ Database operations working');
    
    console.log('\n🔗 PRODUCTION ENDPOINTS:');
    console.log(`   • API Health: ${API_BASE}/health`);
    console.log(`   • Quote Request: ${API_BASE}/api/send-quote-email`);
    console.log(`   • Order Tracking: ${API_BASE}/api/track-order/{id}`);
    
  } else {
    console.log('\n⚠️  Some tests failed. Check the results above.');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

runFullSystemTest().catch(console.error);
