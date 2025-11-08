import { Device, User, DeviceReport } from '../types';
import { apiService } from '../services/apiService';

const STORAGE_KEYS = {
  CURRENT_USER: 'josck_current_user',
};

// Cache for users and devices to avoid multiple Firebase calls
let usersCache: User[] | null = null;
let devicesCache: Device[] | null = null;

export const storage = {
  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      if (usersCache) {
        return usersCache;
      }
      const users = await apiService.getUsers();
      usersCache = users;
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      // Throw error instead of returning empty array so callers can handle it
      throw error;
    }
  },

  // Synchronous version for backward compatibility (returns empty array initially)
  getUsersSync: (): User[] => {
    return usersCache || [];
  },

  saveUsers: async (users: User[]): Promise<void> => {
    try {
      // Update cache
      usersCache = users;
      // Note: In Firebase, we update users individually, not as a batch
      // This method is kept for compatibility but may need refactoring
      console.warn('saveUsers called - consider using individual update methods');
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  // Devices
  getDevices: async (): Promise<Device[]> => {
    try {
      if (devicesCache) {
        return devicesCache;
      }
      const devices = await apiService.getDevices();
      devicesCache = devices;
      return devices;
    } catch (error: any) {
      console.error('Error getting devices:', error);
      // Throw error instead of returning empty array so callers can handle it
      throw error;
    }
  },

  // Synchronous version for backward compatibility (returns empty array initially)
  getDevicesSync: (): Device[] => {
    return devicesCache || [];
  },

  saveDevices: async (devices: Device[]): Promise<void> => {
    try {
      // Update cache
      devicesCache = devices;
      // Note: In Firebase, we update devices individually, not as a batch
      // This method is kept for compatibility but may need refactoring
      console.warn('saveDevices called - consider using individual update methods');
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  },

  addDevice: async (device: Device): Promise<void> => {
    try {
      const { id, createdAt, updatedAt, ...deviceData } = device;
      const newDevice = await apiService.addDevice(deviceData as Omit<Device, 'id' | 'createdAt' | 'updatedAt'>);
      if (newDevice) {
        // Update cache
        if (devicesCache) {
          devicesCache = [newDevice, ...devicesCache];
        } else {
          devicesCache = await apiService.getDevices();
        }
      }
    } catch (error: any) {
      console.error('Error adding device:', error);
      // Re-throw with user-friendly message if needed
      if (error?.message) {
        throw error;
      }
      throw new Error('حدث خطأ أثناء إضافة الجهاز. يرجى المحاولة مرة أخرى.');
    }
  },

  updateDevice: async (deviceId: string, updates: Partial<Device>): Promise<void> => {
    try {
      const result = await apiService.updateDevice(deviceId, updates);
      if (result.success) {
        // Update cache
        if (devicesCache) {
          const index = devicesCache.findIndex(d => d.id === deviceId);
          if (index !== -1) {
            devicesCache[index] = { ...devicesCache[index], ...updates, updatedAt: new Date().toISOString() };
          }
        } else {
          devicesCache = await apiService.getDevices();
        }
      }
    } catch (error: any) {
      console.error('Error updating device:', error);
      // Re-throw with user-friendly message if needed
      if (error?.message) {
        throw error;
      }
      throw new Error('حدث خطأ أثناء تحديث الجهاز. يرجى المحاولة مرة أخرى.');
    }
  },

  addReport: async (deviceId: string, report: DeviceReport): Promise<void> => {
    try {
      const result = await apiService.addReport(deviceId, report);
      if (result && result.success) {
        // Update cache
        if (devicesCache) {
          const index = devicesCache.findIndex(d => d.id === deviceId);
          if (index !== -1) {
            if (!devicesCache[index].reports) {
              devicesCache[index].reports = [];
            }
            devicesCache[index].reports.push(report);
            devicesCache[index].updatedAt = new Date().toISOString();
          }
        } else {
          devicesCache = await apiService.getDevices();
        }
      }
    } catch (error: any) {
      console.error('Error adding report:', error);
      // Re-throw with user-friendly message if needed
      if (error?.message) {
        throw error;
      }
      throw new Error('حدث خطأ أثناء إضافة التقرير. يرجى المحاولة مرة أخرى.');
    }
  },

  deleteDevice: async (deviceId: string): Promise<boolean> => {
    try {
      const result = await apiService.deleteDevice(deviceId);
      if (result && result.success) {
        // Update cache
        if (devicesCache) {
          devicesCache = devicesCache.filter(d => d.id !== deviceId);
        } else {
          devicesCache = await apiService.getDevices();
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting device:', error);
      // Re-throw with user-friendly message if needed
      if (error?.message) {
        throw error;
      }
      throw new Error('حدث خطأ أثناء حذف الجهاز. يرجى المحاولة مرة أخرى.');
    }
  },

  // Current User (still using localStorage for session management)
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Add user
  addUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
    try {
      const newUser = await apiService.addUser(user);
      
      if (newUser && newUser.id) {
        // Update cache immediately
        if (usersCache) {
          usersCache = [...usersCache, newUser];
        } else {
          usersCache = await apiService.getUsers();
        }
        return newUser;
      }
      throw new Error('فشل إضافة المستخدم: لم يتم إرجاع بيانات المستخدم من السيرفر');
    } catch (error: any) {
      console.error('Error adding user in storage:', error);
      // Re-throw the error with a user-friendly message
      if (error?.message) {
        throw error;
      }
      throw new Error('حدث خطأ أثناء إضافة المستخدم. تأكد من اتصال السيرفر وأنك مسجل دخول كمدير.');
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      const result = await apiService.deleteUser(userId);
      
      if (result && result.success) {
        // Update cache
        if (usersCache) {
          usersCache = usersCache.filter(u => u.id !== userId);
        } else {
          usersCache = await apiService.getUsers();
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting user in storage:', error);
      throw error;
    }
  },

  // Helper methods to refresh cache
  refreshUsers: async (): Promise<void> => {
    usersCache = await apiService.getUsers();
  },

  refreshDevices: async (): Promise<void> => {
    devicesCache = await apiService.getDevices();
  },

  // Clear cache
  clearCache: (): void => {
    usersCache = null;
    devicesCache = null;
  },
};



