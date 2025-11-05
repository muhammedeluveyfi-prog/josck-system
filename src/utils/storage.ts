import { Device, User, DeviceReport } from '../types';

const STORAGE_KEYS = {
  USERS: 'josck_users',
  DEVICES: 'josck_devices',
  CURRENT_USER: 'josck_current_user',
};

export const storage = {
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      // Initialize with default users
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'مدير النظام',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          username: 'operations',
          password: 'ops123',
          name: 'موظف العمليات',
          role: 'operations',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          username: 'technician1',
          password: 'tech123',
          name: 'فني 1',
          role: 'technician',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          username: 'technician2',
          password: 'tech123',
          name: 'فني 2',
          role: 'technician',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          username: 'customer_service',
          password: 'cs123',
          name: 'خدمة العملاء',
          role: 'customer_service',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Devices
  getDevices: (): Device[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
    return data ? JSON.parse(data) : [];
  },

  saveDevices: (devices: Device[]): void => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  },

  addDevice: (device: Device): void => {
    const devices = storage.getDevices();
    devices.push(device);
    storage.saveDevices(devices);
  },

  updateDevice: (deviceId: string, updates: Partial<Device>): void => {
    const devices = storage.getDevices();
    const index = devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      devices[index] = { ...devices[index], ...updates, updatedAt: new Date().toISOString() };
      storage.saveDevices(devices);
    }
  },

  addReport: (deviceId: string, report: DeviceReport): void => {
    const devices = storage.getDevices();
    const index = devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      if (!devices[index].reports) {
        devices[index].reports = [];
      }
      devices[index].reports.push(report);
      devices[index].updatedAt = new Date().toISOString();
      storage.saveDevices(devices);
    }
  },

  // Current User
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
};


