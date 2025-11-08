import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize data files if they don't exist
async function initializeFiles() {
  await ensureDataDir();
  
  try {
    await fs.access(USERS_FILE);
  } catch {
    // File doesn't exist, create with default users
    const defaultUsers = [
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
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf8');
  }
  
  try {
    await fs.access(DEVICES_FILE);
  } catch {
    // File doesn't exist, create with empty array
    await fs.writeFile(DEVICES_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// Read users from file
export async function getUsers() {
  await initializeFiles();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Write users to file
async function saveUsers(users) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Add user
export async function addUser(userData) {
  const users = await getUsers();
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

// Update user
export async function updateUser(userId, updates) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }
  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

// Delete user
export async function deleteUser(userId) {
  const users = await getUsers();
  const filtered = users.filter(u => u.id !== userId);
  await saveUsers(filtered);
  return true;
}

// Get user by ID
export async function getUserById(userId) {
  const users = await getUsers();
  return users.find(u => u.id === userId) || null;
}

// Get user by username
export async function getUserByUsername(username) {
  const users = await getUsers();
  return users.find(u => u.username === username) || null;
}

// Read devices from file
export async function getDevices() {
  await initializeFiles();
  try {
    const data = await fs.readFile(DEVICES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading devices:', error);
    return [];
  }
}

// Write devices to file
async function saveDevices(devices) {
  await ensureDataDir();
  await fs.writeFile(DEVICES_FILE, JSON.stringify(devices, null, 2), 'utf8');
}

// Add device
export async function addDevice(deviceData) {
  const devices = await getDevices();
  const newDevice = {
    ...deviceData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  devices.push(newDevice);
  await saveDevices(devices);
  return newDevice;
}

// Update device
export async function updateDevice(deviceId, updates) {
  const devices = await getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index === -1) {
    throw new Error('Device not found');
  }
  devices[index] = { ...devices[index], ...updates, updatedAt: new Date().toISOString() };
  await saveDevices(devices);
  return devices[index];
}

// Delete device
export async function deleteDevice(deviceId) {
  const devices = await getDevices();
  const filtered = devices.filter(d => d.id !== deviceId);
  await saveDevices(filtered);
  return true;
}

// Get device by ID
export async function getDeviceById(deviceId) {
  const devices = await getDevices();
  return devices.find(d => d.id === deviceId) || null;
}

// Query devices
export async function queryDevices(filters = {}) {
  let devices = await getDevices();
  
  if (filters.status) {
    devices = devices.filter(d => d.status === filters.status);
  }
  
  if (filters.technicianId) {
    devices = devices.filter(d => d.technicianId === filters.technicianId);
  }
  
  if (filters.orderNumber) {
    devices = devices.filter(d => d.orderNumber === filters.orderNumber);
  }
  
  if (filters.phoneNumber) {
    devices = devices.filter(d => d.phoneNumber === filters.phoneNumber);
  }
  
  // Sort by createdAt descending
  devices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return devices;
}

// Add report to device
export async function addReportToDevice(deviceId, report) {
  const devices = await getDevices();
  const index = devices.findIndex(d => d.id === deviceId);
  if (index === -1) {
    throw new Error('Device not found');
  }
  
  if (!devices[index].reports) {
    devices[index].reports = [];
  }
  
  devices[index].reports.push(report);
  devices[index].updatedAt = new Date().toISOString();
  await saveDevices(devices);
  return devices[index];
}


