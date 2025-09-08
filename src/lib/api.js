// API Configuration for VERTEX CNC
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001',
    workerURL: 'http://localhost:5001'
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
    workerURL: import.meta.env.VITE_API_URL || 'http://localhost:5001'
  }
};

// Get current environment
const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
const config = API_CONFIG[environment];

console.log('API Configuration:', { environment, config });

// API Endpoints
export const API_ENDPOINTS = {
  // Quote and order management
  sendQuoteEmail: `${config.workerURL}/api/send-quote-email`,
  trackOrder: `${config.workerURL}/api/track-order`,
  getOrderStatus: (trackingId) => `${config.workerURL}/api/track-order/${trackingId}`,
  
  // Health check
  health: `${config.workerURL}/health`,


  // Admin endpoints
  orders: `${config.workerURL}/api/orders`,
  
  // Webhooks
  emailWebhook: `${config.workerURL}/webhook/email`,
  manusWebhook: `${config.workerURL}/webhook/manus`
};

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options
  };

  try {
    const response = await fetch(endpoint, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred' 
    };
  }
};

// Specific API functions
export const submitQuoteRequest = async (formData) => {
  return await apiCall(API_ENDPOINTS.sendQuoteEmail, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
};

export const trackOrder = async (trackingId) => {
  return await apiCall(API_ENDPOINTS.getOrderStatus(trackingId));
};

export const checkAPIHealth = async () => {
  return await apiCall(API_ENDPOINTS.health);
};

// Admin API fonksiyonları
export const getAllOrders = async (token) => {
  return await apiCall(API_ENDPOINTS.orders, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const updateOrderStatus = async (token, updateData) => {
  return await apiCall(API_ENDPOINTS.orders, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
};

export default {
  endpoints: API_ENDPOINTS,
  call: apiCall,
  submitQuoteRequest,
  trackOrder,
  checkAPIHealth
};
