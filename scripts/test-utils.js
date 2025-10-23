const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

class ApiTester {
  constructor() {
    this.token = '';
    this.cookies = '';
  }

  setToken(token) {
    this.token = token;
  }

  setCookies(cookies) {
    this.cookies = cookies;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(this.cookies && { Cookie: this.cookies }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for NextAuth sessions
      });

      // Store cookies from response for subsequent requests
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        this.setCookies(setCookieHeader);
      }

      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          // Response was supposed to be JSON but parsing failed
          console.warn(`Failed to parse JSON response for ${endpoint}`);
        }
      } else {
        // Non-JSON response (could be text, HTML, etc.)
        const text = await response.text();
        data = text || null;
      }

      return {
        status: response.status,
        data,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.error(`API Test Error for ${endpoint}:`, error.message);
      return {
        status: 0,
        data: { error: error.message },
        success: false,
        headers: {},
      };
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Helper method to upload files
  async upload(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(this.cookies && { Cookie: this.cookies }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      return {
        status: response.status,
        data,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      console.error(`API Upload Error for ${endpoint}:`, error.message);
      return {
        status: 0,
        data: { error: error.message },
        success: false,
        headers: {},
      };
    }
  }

  // Reset tester state
  reset() {
    this.token = '';
    this.cookies = '';
  }

  // Log current state (useful for debugging)
  getState() {
    return {
      hasToken: !!this.token,
      hasCookies: !!this.cookies,
      baseUrl: API_BASE_URL,
    };
  }
}

// Export singleton instance
const tester = new ApiTester();

module.exports = {
  ApiTester,
  tester,
  API_BASE_URL,
};