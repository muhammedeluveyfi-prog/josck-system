import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Device, User, DeviceReport } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  DEVICES: 'devices',
};

// Helper function to convert Firestore timestamp to ISO string
const timestampToISO = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to convert ISO string to Firestore timestamp
const isoToTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString));
};

// Convert Firestore document to User
const docToUser = (docData: DocumentData): User => {
  const data = docData.data();
  return {
    id: docData.id,
    username: data.username || '',
    password: data.password || '', // في الإنتاج، يجب تشفير كلمات المرور
    name: data.name || '',
    role: data.role || 'technician',
    createdAt: timestampToISO(data.createdAt),
  };
};

// Convert Firestore document to Device
const docToDevice = (docData: DocumentData): Device => {
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
    reports: (data.reports || []).map((r: any) => ({
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

// Firebase Service
export const firebaseService = {
  // ============ Users ============
  
  /**
   * Get all users
   */
  getUsers: async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const querySnapshot = await getDocs(usersRef);
      
      if (querySnapshot.empty) {
        // Initialize with default users if collection is empty
        const defaultUsers = await firebaseService.initializeDefaultUsers();
        return defaultUsers;
      }
      
      return querySnapshot.docs.map(docToUser);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  /**
   * Initialize default users (only called if collection is empty)
   */
  initializeDefaultUsers: async (): Promise<User[]> => {
    const defaultUsers: Omit<User, 'id'>[] = [
      {
        username: 'admin',
        password: 'admin123',
        name: 'مدير النظام',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        username: 'operations',
        password: 'ops123',
        name: 'موظف العمليات',
        role: 'operations',
        createdAt: new Date().toISOString(),
      },
      {
        username: 'technician1',
        password: 'tech123',
        name: 'فني 1',
        role: 'technician',
        createdAt: new Date().toISOString(),
      },
      {
        username: 'technician2',
        password: 'tech123',
        name: 'فني 2',
        role: 'technician',
        createdAt: new Date().toISOString(),
      },
      {
        username: 'customer_service',
        password: 'cs123',
        name: 'خدمة العملاء',
        role: 'customer_service',
        createdAt: new Date().toISOString(),
      },
    ];

    const usersRef = collection(db, COLLECTIONS.USERS);
    const createdUsers: User[] = [];

    for (const user of defaultUsers) {
      try {
        const docRef = await addDoc(usersRef, {
          ...user,
          createdAt: Timestamp.fromDate(new Date(user.createdAt)),
        });
        createdUsers.push({ ...user, id: docRef.id });
      } catch (error) {
        console.error('Error creating default user:', error);
      }
    }

    return createdUsers;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return docToUser(userSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return docToUser(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  },

  /**
   * Add new user
   */
  addUser: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const docRef = await addDoc(usersRef, {
        ...user,
        createdAt: Timestamp.now(),
      });
      
      return {
        ...user,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding user:', error);
      return null;
    }
  },

  /**
   * Update user
   */
  updateUser: async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, updates as any);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // ============ Devices ============

  /**
   * Get all devices
   */
  getDevices: async (): Promise<Device[]> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const q = query(devicesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docToDevice);
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  },

  /**
   * Get device by ID
   */
  getDeviceById: async (deviceId: string): Promise<Device | null> => {
    try {
      const deviceRef = doc(db, COLLECTIONS.DEVICES, deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (deviceSnap.exists()) {
        return docToDevice(deviceSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting device:', error);
      return null;
    }
  },

  /**
   * Get devices by status
   */
  getDevicesByStatus: async (status: string): Promise<Device[]> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const q = query(
        devicesRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docToDevice);
    } catch (error) {
      console.error('Error getting devices by status:', error);
      return [];
    }
  },

  /**
   * Get devices by technician ID
   */
  getDevicesByTechnician: async (technicianId: string): Promise<Device[]> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const q = query(
        devicesRef,
        where('technicianId', '==', technicianId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(docToDevice);
    } catch (error) {
      console.error('Error getting devices by technician:', error);
      return [];
    }
  },

  /**
   * Get device by order number
   */
  getDeviceByOrderNumber: async (orderNumber: string): Promise<Device | null> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const q = query(devicesRef, where('orderNumber', '==', orderNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return docToDevice(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting device by order number:', error);
      return null;
    }
  },

  /**
   * Get device by phone number
   */
  getDeviceByPhoneNumber: async (phoneNumber: string): Promise<Device | null> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const q = query(devicesRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return docToDevice(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting device by phone number:', error);
      return null;
    }
  },

  /**
   * Add new device
   */
  addDevice: async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device | null> => {
    try {
      const devicesRef = collection(db, COLLECTIONS.DEVICES);
      const now = Timestamp.now();
      
      const docRef = await addDoc(devicesRef, {
        ...device,
        reports: (device.reports || []).map((r) => ({
          ...r,
          createdAt: isoToTimestamp(r.createdAt),
        })),
        createdAt: now,
        updatedAt: now,
      });
      
      return {
        ...device,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding device:', error);
      return null;
    }
  },

  /**
   * Update device
   */
  updateDevice: async (deviceId: string, updates: Partial<Omit<Device, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
      const deviceRef = doc(db, COLLECTIONS.DEVICES, deviceId);
      
      // Convert any ISO strings in updates to Timestamps
      const firestoreUpdates: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Handle reports array if present
      if (updates.reports) {
        firestoreUpdates.reports = updates.reports.map((r) => ({
          ...r,
          createdAt: isoToTimestamp(r.createdAt),
        }));
      }
      
      await updateDoc(deviceRef, firestoreUpdates);
      return true;
    } catch (error) {
      console.error('Error updating device:', error);
      return false;
    }
  },

  /**
   * Add report to device
   */
  addReport: async (deviceId: string, report: DeviceReport): Promise<boolean> => {
    try {
      const deviceRef = doc(db, COLLECTIONS.DEVICES, deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {
        return false;
      }
      
      const device = docToDevice(deviceSnap);
      const updatedReports = [
        ...device.reports,
        {
          ...report,
          createdAt: new Date().toISOString(),
        },
      ];
      
      await updateDoc(deviceRef, {
        reports: updatedReports.map((r) => ({
          ...r,
          createdAt: isoToTimestamp(r.createdAt),
        })),
        updatedAt: Timestamp.now(),
      });
      
      return true;
    } catch (error) {
      console.error('Error adding report:', error);
      return false;
    }
  },

  /**
   * Delete device
   */
  deleteDevice: async (deviceId: string): Promise<boolean> => {
    try {
      const deviceRef = doc(db, COLLECTIONS.DEVICES, deviceId);
      await deleteDoc(deviceRef);
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      return false;
    }
  },

  // ============ Real-time Listeners ============

  /**
   * Subscribe to devices changes (real-time)
   */
  subscribeToDevices: (
    callback: (devices: Device[]) => void
  ): (() => void) => {
    const devicesRef = collection(db, COLLECTIONS.DEVICES);
    const q = query(devicesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const devices = snapshot.docs.map(docToDevice);
        callback(devices);
      },
      (error) => {
        console.error('Error listening to devices:', error);
        callback([]);
      }
    );
    
    return unsubscribe;
  },

  /**
   * Subscribe to users changes (real-time)
   */
  subscribeToUsers: (
    callback: (users: User[]) => void
  ): (() => void) => {
    const usersRef = collection(db, COLLECTIONS.USERS);
    
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const users = snapshot.docs.map(docToUser);
        callback(users);
      },
      (error) => {
        console.error('Error listening to users:', error);
        callback([]);
      }
    );
    
    return unsubscribe;
  },
};



