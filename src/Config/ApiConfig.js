// API Configuration
export const API_CONFIG = {
  // Update this with your actual API base URL
  BASE_URL: 'https://spiderdesk.asia/healto/api',
  
  // API Endpoints
  ENDPOINTS: {
    DOCTOR_DASHBOARD: '/doctor-dashboard',
    APPOINTMENT_UPDATE: '/appointment-update',
    DOCTOR_EDIT: '/doctor-edit',
    DOCTOR_UPDATE: '/doctor-update',
    DOCTOR_INACTIVE: '/doctor-inactive',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};


