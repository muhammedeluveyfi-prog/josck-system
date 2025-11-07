import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import * as localStorage from './storage-local.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allows all origins in production (you can restrict this later)
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['*'] // Allow all origins in production (you can specify your frontend domain later)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to remove password from user object
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: 'local', message: 'Server is running with local storage' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await localStorage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// ============ USERS ENDPOINTS ============

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await localStorage.getUsers();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await localStorage.getUserById(req.params.id);
    if (user) {
      res.json(sanitizeUser(user));
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// Get user by username
app.get('/api/users/username/:username', authenticateToken, async (req, res) => {
  try {
    const user = await localStorage.getUserByUsername(req.params.username);
    if (user) {
      res.json(sanitizeUser(user));
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ error: 'Failed to get user', details: error.message });
  }
});

// Add new user (admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, createdAt, ...userData } = req.body;
    
    // Check if username already exists
    const existingUser = await localStorage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const newUser = await localStorage.addUser(userData);
    res.json(sanitizeUser(newUser));
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user', details: error.message });
  }
});

// Update user (admin only or self)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }
    
    const { id, createdAt, password, ...updates } = req.body;
    
    // If not admin, don't allow role changes
    if (req.user.role !== 'admin' && updates.role) {
      delete updates.role;
    }
    
    const updatedUser = await localStorage.updateUser(userId, updates);
    res.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await localStorage.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// ============ DEVICES ENDPOINTS ============

// Get all devices
app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const devices = await localStorage.getDevices();
    // Sort by createdAt descending
    devices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ error: 'Failed to get devices', details: error.message });
  }
});

// Get device by ID
app.get('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const device = await localStorage.getDeviceById(req.params.id);
    if (device) {
      res.json(device);
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).json({ error: 'Failed to get device', details: error.message });
  }
});

// Get devices by status
app.get('/api/devices/status/:status', authenticateToken, async (req, res) => {
  try {
    const devices = await localStorage.queryDevices({ status: req.params.status });
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices by status:', error);
    res.status(500).json({ error: 'Failed to get devices', details: error.message });
  }
});

// Get devices by technician ID
app.get('/api/devices/technician/:technicianId', authenticateToken, async (req, res) => {
  try {
    const devices = await localStorage.queryDevices({ technicianId: req.params.technicianId });
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices by technician:', error);
    res.status(500).json({ error: 'Failed to get devices', details: error.message });
  }
});

// Get device by order number
app.get('/api/devices/order/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const devices = await localStorage.queryDevices({ orderNumber: req.params.orderNumber });
    if (devices.length > 0) {
      res.json(devices[0]);
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device by order number:', error);
    res.status(500).json({ error: 'Failed to get device', details: error.message });
  }
});

// Get device by phone number
app.get('/api/devices/phone/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    const devices = await localStorage.queryDevices({ phoneNumber: req.params.phoneNumber });
    if (devices.length > 0) {
      res.json(devices[0]);
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device by phone number:', error);
    res.status(500).json({ error: 'Failed to get device', details: error.message });
  }
});

// Add new device
app.post('/api/devices', authenticateToken, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...deviceData } = req.body;
    const newDevice = await localStorage.addDevice(deviceData);
    res.json(newDevice);
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ error: 'Failed to add device', details: error.message });
  }
});

// Update device
app.put('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...updates } = req.body;
    const updatedDevice = await localStorage.updateDevice(req.params.id, updates);
    res.json({ success: true, device: updatedDevice });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device', details: error.message });
  }
});

// Add report to device
app.post('/api/devices/:id/reports', authenticateToken, async (req, res) => {
  try {
    const report = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    await localStorage.addReportToDevice(req.params.id, report);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding report:', error);
    res.status(500).json({ error: 'Failed to add report', details: error.message });
  }
});

// Delete device
app.delete('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    await localStorage.deleteDevice(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  const serverUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`;
  
  console.log('🚀 Server is running on ' + serverUrl);
  console.log('📡 API endpoints available at ' + serverUrl + '/api');
  console.log('🔐 Login endpoint: POST ' + serverUrl + '/api/auth/login');
  console.log('');
  console.log('📝 Default Admin Account:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
  console.log('💾 Using LOCAL STORAGE (JSON files)');
  console.log('📁 Data stored in: backend/data/');
  console.log('');
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Production mode - CORS enabled for all origins');
  }
});

