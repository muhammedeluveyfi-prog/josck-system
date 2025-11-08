import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Device } from '../types';
import { storage } from '../utils/storage';
import { format } from 'date-fns';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddUserModal from '../components/admin/AddUserModal';
import EditUserModal from '../components/admin/EditUserModal';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allUsers, allDevices] = await Promise.all([
        storage.getUsers(),
        storage.getDevices(),
      ]);
      setUsers(allUsers);
      setDevices(allDevices);
    } catch (error: any) {
      console.error('Error loading data:', error);
      // Show user-friendly error message
      const errorMessage = error?.message || 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    const userName = userToDelete?.name || 'هذا المستخدم';
    
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟\n\nهذه العملية لا يمكن التراجع عنها.`)) {
      try {
        const success = await storage.deleteUser(userId);
        if (success) {
          alert(`✓ تم حذف المستخدم "${userName}" بنجاح`);
          await loadData();
        } else {
          alert('حدث خطأ أثناء حذف المستخدم');
        }
      } catch (error: any) {
        console.error('Error deleting user:', error);
        let errorMessage = 'حدث خطأ أثناء حذف المستخدم';
        
        if (error?.message) {
          if (error.message.includes('Access token required') || error.message.includes('Invalid or expired token')) {
            errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
          } else if (error.message.includes('Admin access required')) {
            errorMessage = 'ليس لديك صلاحية لحذف المستخدمين. يجب أن تكون مدير.';
          } else {
            errorMessage = error.message;
          }
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    const deviceName = device.deviceName || device.orderNumber;
    if (window.confirm(`هل أنت متأكد من حذف الجهاز "${deviceName}"؟\n\nهذه العملية لا يمكن التراجع عنها.`)) {
      try {
        const success = await storage.deleteDevice(device.id);
        if (success) {
          await loadData();
        } else {
          alert('حدث خطأ أثناء حذف الجهاز');
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('حدث خطأ أثناء حذف الجهاز');
      }
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const totalDevices = devices.length;
    const completedDevices = devices.filter(d => d.status === 'completed').length;
    const inRepairDevices = devices.filter(d => d.status === 'in_repair').length;
    const operationsUsers = users.filter(u => u.role === 'operations').length;
    const technicians = users.filter(u => u.role === 'technician').length;

    return {
      totalUsers,
      totalDevices,
      completedDevices,
      inRepairDevices,
      operationsUsers,
      technicians,
    };
  };

  const stats = getStats();

  return (
    <Layout title="واجهة المدير" user={user} onLogout={onLogout}>
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#002147' }}>{stats.totalUsers}</div>
          <div className="stat-label">إجمالي المستخدمين</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#C7B58D' }}>{stats.totalDevices}</div>
          <div className="stat-label">إجمالي الأجهزة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#059669' }}>{stats.completedDevices}</div>
          <div className="stat-label">الأجهزة المكتملة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#d97706' }}>{stats.inRepairDevices}</div>
          <div className="stat-label">الأجهزة قيد التصليح</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#002147' }}>{stats.operationsUsers}</div>
          <div className="stat-label">موظفي العمليات</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#C7B58D' }}>{stats.technicians}</div>
          <div className="stat-label">الفنيين</div>
        </div>
      </div>

      {/* Users Management */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">إدارة المستخدمين</h2>
          <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary">
            <Plus size={18} />
            إضافة مستخدم جديد
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>اسم المستخدم</th>
                <th>نوع المستخدم</th>
                <th>تاريخ الإنشاء</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(userItem => (
                <tr key={userItem.id}>
                  <td>{userItem.name}</td>
                  <td>{userItem.username}</td>
                  <td>
                    {userItem.role === 'admin' && <span className="badge badge-danger">مدير</span>}
                    {userItem.role === 'operations' && <span className="badge badge-primary">موظف العمليات</span>}
                    {userItem.role === 'technician' && <span className="badge badge-warning">فني</span>}
                    {userItem.role === 'customer_service' && <span className="badge badge-success">خدمة العملاء</span>}
                  </td>
                  <td>{format(new Date(userItem.createdAt), 'yyyy-MM-dd')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit size={14} />
                      </button>
                      {userItem.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Devices Report */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">تقرير الأجهزة الأخيرة</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم الجهاز</th>
                <th>الحالة</th>
                <th>الموقع</th>
                <th>الفني</th>
                <th>تاريخ الإضافة</th>
                <th>آخر تحديث</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {devices
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 20)
                .map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>
                      {device.status === 'in_repair' && <span className="badge badge-primary">قيد التصليح</span>}
                      {device.status === 'completed' && <span className="badge badge-success">مكتمل</span>}
                      {device.status === 'transferred' && <span className="badge badge-warning">متحول</span>}
                      {device.status === 'awaiting_approval' && <span className="badge badge-danger">انتظار موافقة</span>}
                      {device.status === 'new' && <span className="badge badge-gray">جديد</span>}
                      {device.status === 'received_from_technician' && <span className="badge badge-primary">مستلم من الفني</span>}
                    </td>
                    <td>
                      {device.location === 'operations' && 'العمليات'}
                      {device.location === 'technician' && 'الفني'}
                      {device.location === 'storage' && 'المخزن'}
                      {device.location === 'customer' && 'الزبون'}
                    </td>
                    <td>{device.technicianName || '-'}</td>
                    <td>{format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>{format(new Date(device.updatedAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteDevice(device)}
                        className="btn btn-danger btn-sm"
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.375rem 0.5rem'
                        }}
                        title="حذف الجهاز"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => {
            setShowAddUserModal(false);
          }}
          onSuccess={async () => {
            setShowAddUserModal(false);
            // إعادة تحميل البيانات للتأكد من ظهور المستخدم الجديد
            await loadData();
          }}
        />
      )}

      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
            loadData();
          }}
        />
      )}
    </Layout>
  );
}

