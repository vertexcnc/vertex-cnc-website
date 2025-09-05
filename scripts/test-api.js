#!/usr/bin/env node
/**
 * API Test Script for VERTEX CNC
 * Tüm API endpoint'lerini test eder
 */

import fetch from 'node-fetch';

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.API_URL || 'http://localhost:8788',
  apiKey: process.env.API_KEY || 'vertex-api-key-123456',
  adminKey: process.env.ADMIN_API_KEY || 'vertex-admin-key-789012'
};

console.log('🧪 VERTEX CNC API Test Başlatılıyor...\n');
console.log(`🔗 Base URL: ${TEST_CONFIG.baseURL}\n`);

// Test utilities
async function testEndpoint(name, url, options = {}) {
  console.log(`📋 Testing: ${name}`);
  console.log(`🔗 URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS (${response.status})`);
      console.log(`📊 Response:`, data);
    } else {
      console.log(`❌ ERROR (${response.status})`);
      console.log(`📊 Error:`, data);
    }
    
    console.log('─'.repeat(50));
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
    console.log('─'.repeat(50));
    return { success: false, error: error.message };
  }
}

// Test cases
const tests = [
  {
    name: 'Health Check',
    url: `${TEST_CONFIG.baseURL}/health`,
    method: 'GET'
  },
  {
    name: 'Quote Request',
    url: `${TEST_CONFIG.baseURL}/api/send-quote-email`,
    method: 'POST',
    body: {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      phone: '+90 555 123 4567',
      description: 'Test project description',
      quantity: '10',
      material: 'aluminum'
    }
  },
  {
    name: 'Track Order (Admin)',
    url: `${TEST_CONFIG.baseURL}/api/orders`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TEST_CONFIG.adminKey}`
    }
  }
];

// Run tests
async function runTests() {
  const results = [];
  
  for (const test of tests) {
    const options = {
      method: test.method || 'GET',
      headers: test.headers || {}
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }
    
    const result = await testEndpoint(test.name, test.url, options);
    results.push({ ...test, result });
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.result.success).length;
  const total = results.length;
  
  results.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
  });
  
  console.log(`\n📈 RESULTS: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Start tests
runTests().catch(console.error);
