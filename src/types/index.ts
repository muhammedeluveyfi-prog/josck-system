export type UserRole = 'admin' | 'operations' | 'technician' | 'customer_service';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type DeviceStatus = 
  | 'new' 
  | 'in_repair' 
  | 'completed' 
  | 'awaiting_approval' 
  | 'transferred' 
  | 'received_from_technician';

export type DeviceLocation = 'operations' | 'technician' | 'storage' | 'customer';

export interface Device {
  id: string;
  orderNumber: string;
  deviceName: string;
  imei: string;
  phoneNumber?: string;
  faultType: string;
  expectedDuration: string;
  status: DeviceStatus;
  location: DeviceLocation;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  reports: DeviceReport[];
  finalReport?: string;
  needsApproval: boolean;
  approvalReason?: string;
  isRepairable?: boolean;
  repairReason?: string;
}

export interface DeviceReport {
  id: string;
  deviceId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

export interface TechnicianStats {
  technicianId: string;
  technicianName: string;
  deviceCount: number;
  devices: Device[];
}


