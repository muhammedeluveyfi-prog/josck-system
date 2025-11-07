import { Device, User, DeviceReport } from '../types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get token from localStorage
const getToken = (): string | null => {
  const token = localStorage.getItem('josck_auth_token');
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return token;
};

// Set token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('josck_auth_token', token);
};

// Remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('josck_auth_token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No token found for API request to:', endpoint);
  }

  // Only log in development
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      hasToken: !!token,
    });
  }

  let response: Response;
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت مهلة الاتصال. تأكد من أن السيرفر يعمل على http://localhost:3000');
      }
      throw fetchError;
    }
  } catch (fetchError: any) {
    // Network error - server is not running or unreachable
    if (fetchError.message.includes('Failed to fetch') || 
        fetchError.message.includes('NetworkError') ||
        fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
        fetchError.message.includes('انتهت مهلة الاتصال') ||
        fetchError.name === 'TypeError' ||
        fetchError.name === 'AbortError') {
      throw new Error('لا يمكن الاتصال بالسيرفر. تأكد من أن السيرفر يعمل على http://localhost:3000');
    }
    throw fetchError;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error,
      });
    }
    
    // Provide user-friendly error messages
    let errorMessage = error.error || `خطأ في الاتصال (${response.status})`;
    
    if (response.status === 401) {
      errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
    } else if (response.status === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذه العملية.';
    } else if (response.status === 404) {
      errorMessage = 'البيانات المطلوبة غير موجودة.';
    } else if (response.status === 503) {
      // Service Unavailable - usually Firebase API not enabled
      errorMessage = error.error || 'السيرفر غير متاح حالياً. يرجى التحقق من إعدادات Firebase.';
    } else if (response.status >= 500) {
      errorMessage = error.error || 'خطأ في السيرفر. يرجى المحاولة لاحقاً.';
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};

// API Service
export const apiService = {
  // ============ Authentication ============
  
  /**
   * Login user
   */
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Save token
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  /**
   * Verify token
   */
  verifyToken: async (): Promise<{ valid: boolean; user: any }> => {
    return apiRequest('/auth/verify');
  },

  /**
   * Logout (just remove token locally)
   */
  logout: (): void => {
    removeAuthToken();
  },

  // ============ Users ============

  /**
   * Get all users
   */
  getUsers: async (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username: string): Promise<User> => {
    return apiRequest<User>(`/users/username/${username}`);
  },

  /**
   * Add new user
   */
  addUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  /**
   * Update user
   */
  updateUser: async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean }> => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // ============ Devices ============

  /**
   * Get all devices
   */
  getDevices: async (): Promise<Device[]> => {
    return apiRequest<Device[]>('/devices');
  },

  /**
   * Get device by ID
   */
  getDeviceById: async (deviceId: string): Promise<Device> => {
    return apiRequest<Device>(`/devices/${deviceId}`);
  },

  /**
   * Get devices by status
   */
  getDevicesByStatus: async (status: string): Promise<Device[]> => {
    return apiRequest<Device[]>(`/devices/status/${status}`);
  },

  /**
   * Get devices by technician ID
   */
  getDevicesByTechnician: async (technicianId: string): Promise<Device[]> => {
    return apiRequest<Device[]>(`/devices/technician/${technicianId}`);
  },

  /**
   * Get device by order number
   */
  getDeviceByOrderNumber: async (orderNumber: string): Promise<Device> => {
    return apiRequest<Device>(`/devices/order/${orderNumber}`);
  },

  /**
   * Get device by phone number
   */
  getDeviceByPhoneNumber: async (phoneNumber: string): Promise<Device> => {
    return apiRequest<Device>(`/devices/phone/${phoneNumber}`);
  },

  /**
   * Add new device
   */
  addDevice: async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> => {
    return apiRequest<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  },

  /**
   * Update device
   */
  updateDevice: async (deviceId: string, updates: Partial<Device>): Promise<{ success: boolean }> => {
    return apiRequest(`/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Add report to device
   */
  addReport: async (deviceId: string, report: DeviceReport): Promise<{ success: boolean }> => {
    return apiRequest(`/devices/${deviceId}/reports`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  /**
   * Delete device
   */
  deleteDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    return apiRequest(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },
};


