import axios from 'axios';

// Create axios instance with base URL from environment variables
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // Increased to 30 seconds for slower connections
  headers: {
    'Content-Type': 'application/json'
  },
  // Add retry configuration
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Wait 1s, 2s, 3s between retries
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log all errors for debugging
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (!error.response || error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running and try again.');
    }
    
    // Handle specific HTTP errors
    switch (error.response.status) {
      case 401:
        throw new Error('Unauthorized. Please log in again.');
      case 403:
        throw new Error('Access denied. You do not have permission to view this content.');
      case 404:
        throw new Error('The sneaker collection is currently unavailable. Please try again later.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(error.response.data?.message || 'An unexpected error occurred. Please try again.');
    }
  }
);

// Add request interceptor to handle auth tokens if needed
api.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const separator = config.url?.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${timestamp}`;
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Circuit breaker state
let isCircuitOpen = false;
let lastFailureTime = 0;
const CIRCUIT_RESET_TIMEOUT = 60000; // Increased to 60 seconds for more stability
const FAILURE_THRESHOLD = 8; // Increased threshold to be more tolerant of temporary network issues
let failureCount = 0;

// Circuit breaker wrapper
export const withCircuitBreaker = async (request: Promise<any>) => {
  const now = Date.now();
  
  // Check if circuit should be reset
  if (isCircuitOpen && (now - lastFailureTime) > CIRCUIT_RESET_TIMEOUT) {
    console.log('Circuit breaker reset after timeout');
    isCircuitOpen = false;
    failureCount = 0;
  }
  
  if (isCircuitOpen) {
    throw new Error('Service is temporarily unavailable. Please try again in a minute.');
  }
  
  try {
    const result = await request;
    // Reset failure count on successful request
    if (failureCount > 0) {
      console.log('Request succeeded, resetting failure count');
      failureCount = 0;
    }
    return result;
  } catch (error) {
    failureCount++;
    
    console.log('Circuit Breaker Status:', {
      failureCount,
      failureThreshold: FAILURE_THRESHOLD,
      isCircuitOpen,
      resetTimeout: CIRCUIT_RESET_TIMEOUT,
      timeUntilReset: isCircuitOpen ? CIRCUIT_RESET_TIMEOUT - (now - lastFailureTime) : 0
    });

    // Only open circuit if we exceed failure threshold
    if (failureCount >= FAILURE_THRESHOLD) {
      isCircuitOpen = true;
      lastFailureTime = now;
      console.log('Circuit breaker opened due to multiple failures');
    }
    
    throw error;
  }
};