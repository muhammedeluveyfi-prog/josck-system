import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allows all origins in production
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

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  DEVICES: 'devices',
};

// JWT Secret (يجب أن يكون في .env في الإنتاج)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper functions
const timestampToISO = (timestamp) => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp || new Date().toISOString();
};

const isoToTimestamp = (isoString) => {
  return Timestamp.fromDate(new Date(isoString));
};

const docToUser = (docData) => {
  const data = docData.data();
  return {
    id: docData.id,
    username: data.username || '',
    password: data.password || '', // سيتم إخفاؤه في الاستجابة
    name: data.name || '',
    role: data.role || 'technician',
    createdAt: timestampToISO(data.createdAt),
  };
};

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

const docToDevice = (docData) => {
  const data = docData.data();
  return {
    id: docData.id,
    orderNumber: data.orderNumber || '',
    deviceName: data.deviceName || '',
    imei: data.imei || '',
    phoneNumber: data.phoneNumber || '',
    faultType: data.faultType || '',
    expectedDuration: data.expectedDuration || '',
    scheduledStartDate: data.scheduledStartDate || '',
    expectedDurationValue: data.expectedDurationValue,
    expectedDurationUnit: data.expectedDurationUnit,
    expectedDurationDays: data.expectedDurationDays,
    expectedDurationHours: data.expectedDurationHours,
    status: data.status || 'new',
    location: data.location || 'operations',
    technicianId: data.technicianId || '',
    technicianName: data.technicianName || '',
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
    reports: (data.reports || []).map((r) => ({
      id: r.id || '',
      deviceId: r.deviceId || '',
      content: r.content || '',
      authorId: r.authorId || '',
      authorName: r.authorName || '',
      authorRole: r.authorRole || 'technician',
      createdAt: timestampToISO(r.createdAt),
    })),
    finalReport: data.finalReport || '',
    needsApproval: data.needsApproval || false,
    approvalReason: data.approvalReason || '',
    isRepairable: data.isRepairable,
    repairReason: data.repairReason || '',
  };
};

// ============ AUTH ENDPOINTS ============

// Initialize database (public endpoint for first-time setup)
// This endpoint creates collections and default data
app.post('/api/init', async (req, res) => {
  try {
    const results = {
      users: { created: 0, exists: false },
      devices: { created: 0, exists: false },
      collections: []
    };

    // Check and initialize Users collection
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(usersRef);
      
      if (usersSnapshot.empty) {
        const defaultUsers = await initializeDefaultUsers();
        results.users.created = defaultUsers.length;
        results.collections.push('users');
      } else {
        results.users.exists = true;
        results.users.created = usersSnapshot.size;
      }
    } catch (error) {
      console.error('Error initializing users collection:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize users collection',
        details: error.message 
      });
    }

    // Check and initialize Devices collection (create empty if needed)
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const devicesSnapshot = await getDocs(devicesRef);
      
      if (devicesSnapshot.empty) {
        // Create an empty document to initialize the collection
        await addDoc(devicesRef, {
          _init: true,
          createdAt: Timestamp.now(),
        });
        // Delete the init document
        const initSnapshot = await getDocs(query(devicesRef, where('_init', '==', true)));
        if (!initSnapshot.empty) {
          await deleteDoc(doc(db, COLLECTIONS.DEVICES, initSnapshot.docs[0].id));
        }
        results.devices.created = 0;
        results.collections.push('devices');
      } else {
        results.devices.exists = true;
        results.devices.created = devicesSnapshot.size;
      }
    } catch (error) {
      console.error('Error initializing devices collection:', error);
      // Don't fail if devices collection fails
    }

    res.json({
      success: true,
      message: 'Database initialized successfully',
      results: results,
      collections: results.collections.length > 0 
        ? `Created collections: ${results.collections.join(', ')}`
        : 'All collections already exist'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    
    // Check if it's a Firebase permission error
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Firestore API')) {
      return res.status(503).json({ 
        error: 'Firebase Firestore API غير مفعّل. يرجى تفعيل Cloud Firestore API من Google Cloud Console.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message || 'Unknown error'
    });
  }
});

// Initialize default users (public endpoint for first-time setup)
app.post('/api/auth/init', async (req, res) => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);
    
    if (!querySnapshot.empty) {
      return res.json({ message: 'Users already initialized', count: querySnapshot.size });
    }
    
    const defaultUsers = await initializeDefaultUsers();
    res.json({ 
      message: 'Default users created successfully', 
      count: defaultUsers.length,
      users: defaultUsers.map(sanitizeUser)
    });
  } catch (error) {
    console.error('Error initializing users:', error);
    res.status(500).json({ error: 'Failed to initialize users' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const usersRef = collection(db, COLLECTIONS.USERS);
    let q = query(usersRef, where('username', '==', username));
    let querySnapshot = await getDocs(q);

    // If no users found in database, initialize default users
    if (querySnapshot.empty) {
      const allUsersSnapshot = await getDocs(usersRef);
      if (allUsersSnapshot.empty) {
        await initializeDefaultUsers();
        // Try again after initialization
        q = query(usersRef, where('username', '==', username));
        querySnapshot = await getDocs(q);
      }
    }

    if (querySnapshot.empty) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const userDoc = querySnapshot.docs[0];
    const user = docToUser(userDoc);

    // Check password (plain text comparison for now, can be upgraded to bcrypt)
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
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return user data (without password) and token
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

// Get all users (protected - requires authentication)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);
    
    if (querySnapshot.empty) {
      // Initialize with default users if collection is empty
      const defaultUsers = await initializeDefaultUsers();
      return res.json(defaultUsers);
    }
    
    const users = querySnapshot.docs.map(docToUser).map(sanitizeUser);
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    
    // Check if it's a Firebase permission error
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Firestore API')) {
      return res.status(503).json({ 
        error: 'Firebase Firestore API غير مفعّل. يرجى تفعيل Cloud Firestore API من Google Cloud Console.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get users',
      details: error.message || 'Unknown error'
    });
  }
});

// Initialize default users
async function initializeDefaultUsers() {
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      name: 'مدير النظام',
      role: 'admin',
      createdAt: Timestamp.now(),
    },
    {
      username: 'operations',
      password: 'ops123',
      name: 'موظف العمليات',
      role: 'operations',
      createdAt: Timestamp.now(),
    },
    {
      username: 'technician1',
      password: 'tech123',
      name: 'فني 1',
      role: 'technician',
      createdAt: Timestamp.now(),
    },
    {
      username: 'technician2',
      password: 'tech123',
      name: 'فني 2',
      role: 'technician',
      createdAt: Timestamp.now(),
    },
    {
      username: 'customer_service',
      password: 'cs123',
      name: 'خدمة العملاء',
      role: 'customer_service',
      createdAt: Timestamp.now(),
    },
  ];

  const usersRef = collection(db, COLLECTIONS.USERS);
  const createdUsers = [];

  for (const user of defaultUsers) {
    try {
      const docRef = await addDoc(usersRef, user);
      createdUsers.push({ ...user, id: docRef.id, createdAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error creating default user:', error);
    }
  }

  return createdUsers;
}

// Get user by ID (protected)
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, req.params.id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      res.json(sanitizeUser(docToUser(userSnap)));
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user by username (protected)
app.get('/api/users/username/:username', authenticateToken, async (req, res) => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('username', '==', req.params.username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      res.json(sanitizeUser(docToUser(querySnapshot.docs[0])));
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Add new user (protected - admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, createdAt, ...userData } = req.body;
    const usersRef = collection(db, COLLECTIONS.USERS);
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: Timestamp.now(),
    });
    
    const newUser = {
      ...userData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
    };
    res.json(sanitizeUser(newUser));
  } catch (error) {
    console.error('Error adding user:', error);
    
    // Check if it's a Firebase permission error
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Firestore API')) {
      return res.status(503).json({ 
        error: 'Firebase Firestore API غير مفعّل. يرجى تفعيل Cloud Firestore API من Google Cloud Console.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add user',
      details: error.message || 'Unknown error'
    });
  }
});

// Update user (protected - admin only or self)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { id, createdAt, password, ...updates } = req.body;
    const userRef = doc(db, COLLECTIONS.USERS, req.params.id);
    
    // If password is being updated, hash it (optional - can be added later)
    const updateData = { ...updates };
    if (password) {
      updateData.password = password; // In production, hash with bcrypt
    }
    
    await updateDoc(userRef, updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (protected - admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, req.params.id);
    await deleteDoc(userRef);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============ DEVICES ENDPOINTS ============

// Get all devices (protected)
app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(devicesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const devices = querySnapshot.docs.map(docToDevice);
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices:', error);
    
    // Check if it's a Firebase permission error
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Firestore API')) {
      return res.status(503).json({ 
        error: 'Firebase Firestore API غير مفعّل. يرجى تفعيل Cloud Firestore API من Google Cloud Console.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get devices',
      details: error.message || 'Unknown error'
    });
  }
});

// Get device by ID (protected)
app.get('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const deviceRef = doc(db, COLLECTIONS.DEVICES, req.params.id);
    const deviceSnap = await getDoc(deviceRef);
    
    if (deviceSnap.exists()) {
      res.json(docToDevice(deviceSnap));
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).json({ error: 'Failed to get device' });
  }
});

// Get devices by status (protected)
app.get('/api/devices/status/:status', authenticateToken, async (req, res) => {
  try {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(
      devicesRef,
      where('status', '==', req.params.status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const devices = querySnapshot.docs.map(docToDevice);
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices by status:', error);
    res.status(500).json({ error: 'Failed to get devices' });
  }
});

// Get devices by technician ID (protected)
app.get('/api/devices/technician/:technicianId', authenticateToken, async (req, res) => {
  try {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(
      devicesRef,
      where('technicianId', '==', req.params.technicianId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const devices = querySnapshot.docs.map(docToDevice);
    res.json(devices);
  } catch (error) {
    console.error('Error getting devices by technician:', error);
    res.status(500).json({ error: 'Failed to get devices' });
  }
});

// Get device by order number (protected)
app.get('/api/devices/order/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(devicesRef, where('orderNumber', '==', req.params.orderNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      res.json(docToDevice(querySnapshot.docs[0]));
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device by order number:', error);
    res.status(500).json({ error: 'Failed to get device' });
  }
});

// Get device by phone number (protected)
app.get('/api/devices/phone/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(devicesRef, where('phoneNumber', '==', req.params.phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      res.json(docToDevice(querySnapshot.docs[0]));
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('Error getting device by phone number:', error);
    res.status(500).json({ error: 'Failed to get device' });
  }
});

// Add new device (protected)
app.post('/api/devices', authenticateToken, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...deviceData } = req.body;
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const now = Timestamp.now();
    
    const docRef = await addDoc(devicesRef, {
      ...deviceData,
      reports: (deviceData.reports || []).map((r) => ({
        ...r,
        createdAt: isoToTimestamp(r.createdAt),
      })),
      createdAt: now,
      updatedAt: now,
    });
    
    res.json({
      ...deviceData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ error: 'Failed to add device' });
  }
});

// Update device (protected)
app.put('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const { id, createdAt, ...updates } = req.body;
    const deviceRef = doc(db, COLLECTIONS.DEVICES, req.params.id);
    
    const firestoreUpdates = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.reports) {
      firestoreUpdates.reports = updates.reports.map((r) => ({
        ...r,
        createdAt: isoToTimestamp(r.createdAt),
      }));
    }
    
    await updateDoc(deviceRef, firestoreUpdates);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Add report to device (protected)
app.post('/api/devices/:id/reports', authenticateToken, async (req, res) => {
  try {
    const deviceRef = doc(db, COLLECTIONS.DEVICES, req.params.id);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const device = docToDevice(deviceSnap);
    const report = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    
    const updatedReports = [...device.reports, report];
    
    await updateDoc(deviceRef, {
      reports: updatedReports.map((r) => ({
        ...r,
        createdAt: isoToTimestamp(r.createdAt),
      })),
      updatedAt: Timestamp.now(),
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding report:', error);
    res.status(500).json({ error: 'Failed to add report' });
  }
});

// Delete device (protected - admin only)
app.delete('/api/devices/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deviceRef = doc(db, COLLECTIONS.DEVICES, req.params.id);
    await deleteDoc(deviceRef);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔐 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`\n📝 Default Admin Account:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin123`);
  console.log(`\n🔧 Initialize Database (Firebase Collections):`);
  console.log(`   POST http://localhost:${PORT}/api/init`);
  console.log(`   This will create 'users' and 'devices' collections automatically`);
});

