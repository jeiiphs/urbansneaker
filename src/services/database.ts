import axios from 'axios';
import { SERVER_CONFIG } from '../config';

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await axios.get(`${SERVER_CONFIG.BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

export const handleDatabaseError = (error: any): string => {
  if (!error.response) {
    return 'Database connection failed - please try again later';
  }
  
  switch (error.response.status) {
    case 503:
      return 'Database service is temporarily unavailable';
    case 504:
      return 'Database connection timed out';
    default:
      return error.response.data?.error || 'An unexpected database error occurred';
  }
};