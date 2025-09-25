import { API_CONFIG, getApiUrl } from '../Config/ApiConfig';

// API Service for making HTTP requests
export class ApiService {
  static async makeRequest(endpoint, method = 'POST', data = null, headers = {}) {
    try {
      const url = getApiUrl(endpoint);
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: API_CONFIG.TIMEOUT,
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while making the request',
      };
    }
  }

  // Update appointment with delay time
  static async updateAppointment(appointmentId, delayTime) {
    const data = {
      appointment_id: appointmentId,
      delay_time: delayTime,
    };

    return await this.makeRequest(
      API_CONFIG.ENDPOINTS.APPOINTMENT_UPDATE,
      'POST',
      data
    );
  }
}

export default ApiService;
