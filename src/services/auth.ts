import axios from 'axios';
import { API_ENDPOINTS } from '../config';

const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

export const login = async (email: string, password: string) => {
  try {
    // Try to login through the server
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  } catch (error: any) {
    // If server is not available, check if admin credentials match
    if (!error.response && email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return {
        token: 'admin-fallback-token',
        user: {
          id: '1',
          email: ADMIN_CREDENTIALS.email,
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        }
      };
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Invalid credentials');
  }
};

export const register = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Registration failed. Please try again later.');
  }
};