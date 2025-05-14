// API Configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiTimeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${config.apiUrl}/api/auth/login`,
    REGISTER: `${config.apiUrl}/api/auth/register`,
    VALIDATE: `${config.apiUrl}/api/auth/validate`
  }
} as const;

// Routes configuration
export const routes = {
  home: '/',
  catalog: '/catalog',
  product: '/product/:id',
  cart: '/cart',
  checkout: '/checkout',
} as const;