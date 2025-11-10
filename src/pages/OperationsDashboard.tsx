import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Device, User, TechnicianStats } from '../types';
import { storage } from '../utils/storage';
import { format } from 'date-fns';
import {
  Plus, CheckCircle,
  Search, Edit, Eye, Send, Trash2, ClipboardCheck
} from 'lucide-react';
import AddDeviceModal from '../components/operations/AddDeviceModal';
import EditDeviceModal from '../components/operations/EditDeviceModal';
import DeviceDetailsModal from '../components/operations/DeviceDetailsModal';
import TransferDeviceModal from '../components/operations/TransferDeviceModal';
import CompleteDeviceModal from '../components/operations/CompleteDeviceModal';
import ApproveDeviceModal from '../components/operations/ApproveDeviceModal';

interface OperationsDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function OperationsDashboard({ user, onLogout }: OperationsDashboardProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [allDevices, allUsers] = await Promise.all([
        storage.getDevices(),
        storage.getUsers(),
      ]);
      setDevices(allDevices);
      setUsers(allUsers);
    } catch (error: any) {
      console.error('Error loading data:', error);
      // Show user-friendly error message
      const errorMessage = error?.message || 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  const loadDevices = async () => {
    try {
      const allDevices = await storage.getDevices();
      setDevices(allDevices);
    } catch (error: any) {
      console.error('Error loading devices:', error);
      // Show user-friendly error message
      const errorMessage = error?.message || 'حدث خطأ أثناء تحميل الأجهزة. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  const getTechnicianStats = (): TechnicianStats[] => {
    const technicians = users.filter(u => u.role === 'technician');
    return technicians.map(tech => {
      const techDevices = devices.filter(d => d.technicianId === tech.id && (d.status === 'in_repair' || d.status === 'transferred'));
      return {
        technicianId: tech.id,
        technicianName: tech.name,
        deviceCount: techDevices.length,
        devices: techDevices,
      };
    });
  };

  const getStats = () => {
    return {
      inRepair: devices.filter(d => d.status === 'in_repair' || d.status === 'transferred').length,
      completed: devices.filter(d => d.status === 'completed').length,
      transferred: devices.filter(d => d.status === 'transferred').length,
      awaitingApproval: devices.filter(d => d.status === 'awaiting_approval').length,
      new: devices.filter(d => d.status === 'new' || d.status === 'received_from_technician').length,
    };
  };

  const stats = getStats();

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.imei.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const newDevices = filteredDevices.filter(d => 
    d.status === 'new' || d.status === 'received_from_technician'
  );

  const handleAddDevice = () => {
    setShowAddModal(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const handleTransferDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowTransferModal(true);
  };

  const handleCompleteDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowCompleteModal(true);
  };

  const handleReceiveFromTechnician = async (device: Device) => {
    try {
      await storage.updateDevice(device.id, {
        status: 'received_from_technician',
        location: 'operations',
        technicianId: undefined,
        technicianName: undefined,
      });
      await loadDevices();
    } catch (error: any) {
      console.error('Error receiving device from technician:', error);
      const errorMessage = error?.message || 'حدث خطأ أثناء استلام الجهاز من الفني. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    const deviceName = device.deviceName || device.orderNumber;
    if (window.confirm(`هل أنت متأكد من حذف الجهاز "${deviceName}"؟\n\nهذه العملية لا يمكن التراجع عنها.`)) {
      try {
        const success = await storage.deleteDevice(device.id);
        if (success) {
          await loadDevices();
        } else {
          alert('حدث خطأ أثناء حذف الجهاز');
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('حدث خطأ أثناء حذف الجهاز');
      }
    }
  };

  const handleApproveDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowApproveModal(true);
  };

  const inRepairDevices = devices.filter(d => d.status === 'in_repair' || d.status === 'transferred');
  const completedDevices = devices.filter(d => d.status === 'completed');
  const awaitingApprovalDevices = devices.filter(d => d.status === 'awaiting_approval');
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);

  const handleViewTechnicianDevices = (technicianId: string, technicianName: string) => {
    setSelectedTechnician(technicianId);
    setFilterStatus('in_repair');
    setSearchTerm(technicianName);
    // Scroll to in repair section
    setTimeout(() => {
      const element = document.getElementById('in-repair-devices');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter in repair devices by selected technician
  const filteredInRepairDevices = selectedTechnician 
    ? inRepairDevices.filter(d => d.technicianId === selectedTechnician)
    : inRepairDevices;

  return (
    <Layout title="واجهة موظف إدارة العمليات" user={user} onLogout={onLogout}>
      {/* Statistics Cards - Clickable */}
      <div className="stats-grid">
        <div 
          className="stat-card" 
          style={{ 
            cursor: 'pointer',
            border: stats.inRepair > 0 ? '2px solid #002147' : '2px solid transparent',
            background: stats.inRepair > 0 ? 'rgba(0, 33, 71, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            const element = document.getElementById('in-repair-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (stats.inRepair > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 33, 71, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#002147', fontSize: '2.5rem' }}>{stats.inRepair}</div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>قيد التصليح</div>
          {stats.inRepair > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
              اضغط للدخول
            </div>
          )}
        </div>
        <div 
          className="stat-card"
          style={{ 
            cursor: 'pointer',
            border: stats.completed > 0 ? '2px solid #059669' : '2px solid transparent',
            background: stats.completed > 0 ? 'rgba(5, 150, 105, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            const element = document.getElementById('completed-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (stats.completed > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#059669', fontSize: '2.5rem' }}>{stats.completed}</div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>مكتملة</div>
          {stats.completed > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
              اضغط للدخول
            </div>
          )}
        </div>
        <div 
          className="stat-card"
          style={{ 
            cursor: 'pointer',
            border: stats.transferred > 0 ? '2px solid #C7B58D' : '2px solid transparent',
            background: stats.transferred > 0 ? 'rgba(199, 181, 141, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            setFilterStatus('transferred');
            const element = document.getElementById('all-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (stats.transferred > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(199, 181, 141, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#C7B58D', fontSize: '2.5rem' }}>{stats.transferred}</div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>متحولة - يجب استلامها</div>
          {stats.transferred > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
              اضغط للدخول
            </div>
          )}
        </div>
        <div 
          className="stat-card"
          style={{ 
            cursor: 'pointer',
            border: stats.awaitingApproval > 0 ? '2px solid #dc2626' : '2px solid transparent',
            background: stats.awaitingApproval > 0 ? 'rgba(220, 38, 38, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            const element = document.getElementById('awaiting-approval-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (stats.awaitingApproval > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#dc2626', fontSize: '2.5rem' }}>{stats.awaitingApproval}</div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>انتظار موافقة</div>
          {stats.awaitingApproval > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
              اضغط للدخول
            </div>
          )}
        </div>
        <div 
          className="stat-card"
          style={{ 
            cursor: 'pointer',
            border: stats.new > 0 ? '2px solid #002147' : '2px solid transparent',
            background: stats.new > 0 ? 'rgba(0, 33, 71, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
          onClick={() => {
            const element = document.getElementById('new-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (stats.new > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 33, 71, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#002147', fontSize: '2.5rem' }}>{stats.new}</div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>جديدة/مستلمة من الفني</div>
          {stats.new > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
              اضغط للدخول
            </div>
          )}
        </div>
      </div>

      {/* Technician Stats */}
      {getTechnicianStats().filter(s => s.deviceCount > 0).length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #002147' }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid #002147',
            background: 'rgba(0, 33, 71, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 className="card-title" style={{ color: '#002147', margin: 0 }}>
              الفنيين والأجهزة قيد التصليح
            </h2>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: '#495057' }}>
              اضغط على أي فني لعرض أجهزته وتفاصيلها
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
            {getTechnicianStats().filter(s => s.deviceCount > 0).map(stat => (
              <div
                key={stat.technicianId}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(0, 33, 71, 0.05)',
                  borderRadius: '0.75rem',
                  border: '2px solid #C7B58D',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onClick={() => handleViewTechnicianDevices(stat.technicianId, stat.technicianName)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 33, 71, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 33, 71, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 33, 71, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.75rem', 
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #002147 0%, #003366 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                  }}>
                    {stat.technicianName.charAt(0)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#002147', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {stat.technicianName}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#002147', marginBottom: '0.25rem' }}>
                  {stat.deviceCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 500 }}>
                  جهاز قيد التصليح
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={handleAddDevice} className="btn btn-primary">
            <Plus size={18} />
            إضافة جهاز جديد
          </button>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                className="form-input"
                placeholder="البحث برقم الطلب، اسم الجهاز، أو IMEI"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
            </div>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="all">جميع الحالات</option>
              <option value="new">جديدة</option>
              <option value="in_repair">قيد التصليح</option>
              <option value="completed">مكتملة</option>
              <option value="transferred">متحولة</option>
              <option value="awaiting_approval">انتظار موافقة</option>
              <option value="received_from_technician">مستلمة من الفني</option>
            </select>
          </div>
        </div>
      </div>

      {/* New/Received Devices */}
      {newDevices.length > 0 && (
        <div id="new-devices" className="card" style={{ 
          marginBottom: '2rem',
          border: '2px solid #002147',
          background: 'rgba(0, 33, 71, 0.02)'
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid #002147',
            background: 'rgba(0, 33, 71, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 className="card-title" style={{ color: '#002147', margin: 0 }}>
              الأجهزة الجديدة/المستلمة من الفني ({newDevices.length})
            </h2>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: '#495057' }}>
              الأجهزة التي تم إضافتها حديثاً أو استلامها من الفني
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>نوع العطل</th>
                  <th>تاريخ الإضافة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {newDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>{device.faultType}</td>
                    <td>{format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <span className="badge badge-primary">جديد</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-primary btn-sm"
                          title="فحص"
                          style={{
                            background: '#002147',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600
                          }}
                        >
                          <ClipboardCheck size={16} />
                          فحص
                        </button>
                        <button
                          onClick={() => handleEditDevice(device)}
                          className="btn btn-secondary btn-sm"
                          title="تحرير"
                          style={{
                            background: 'var(--gray-200)',
                            color: 'var(--gray-900)',
                            border: '1px solid var(--gray-300)'
                          }}
                        >
                          <Edit size={16} />
                          تحرير
                        </button>
                        <button
                          onClick={() => handleTransferDevice(device)}
                          className="btn btn-primary btn-sm"
                          title="تحويل"
                          style={{
                            background: '#002147',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          <Send size={16} />
                          تحويل
                        </button>
                        <button
                          onClick={() => handleCompleteDevice(device)}
                          className="btn btn-success btn-sm"
                          title="إنهاء التقرير"
                          style={{
                            background: '#059669',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          <CheckCircle size={16} />
                          إنهاء التقرير
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Awaiting Approval */}
      {awaitingApprovalDevices.length > 0 && (
        <div id="awaiting-approval-devices" className="card" style={{ 
          marginBottom: '2rem',
          border: '2px solid #dc2626',
          background: 'rgba(220, 38, 38, 0.02)'
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid #dc2626',
            background: 'rgba(220, 38, 38, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 className="card-title" style={{ color: '#dc2626', margin: 0 }}>
              الأجهزة قيد انتظار الموافقة ({awaitingApprovalDevices.length})
            </h2>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: '#495057' }}>
              الأجهزة التي تحتاج موافقة - يمكنك عرض التفاصيل والموافقة على التقرير
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>سبب الموافقة</th>
                  <th>الموقع</th>
                  <th>تاريخ الإضافة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {awaitingApprovalDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>{device.approvalReason || 'غير محدد'}</td>
                    <td>
                      {device.location === 'operations' && 'العمليات'}
                      {device.location === 'technician' && 'الفني'}
                      {device.location === 'storage' && 'المخزن'}
                      {device.location === 'customer' && 'الزبون'}
                    </td>
                    <td>{format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            background: 'var(--gray-200)',
                            color: 'var(--gray-900)',
                            border: '1px solid var(--gray-300)'
                          }}
                        >
                          <Eye size={16} />
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleApproveDevice(device)}
                          className="btn btn-success btn-sm"
                          style={{
                            background: '#059669',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#047857';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#059669';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <CheckCircle size={16} />
                          موافقة
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In Repair Devices */}
      {inRepairDevices.length > 0 && (
        <div id="in-repair-devices" className="card" style={{ 
          marginBottom: '2rem',
          border: '2px solid #002147',
          background: 'rgba(0, 33, 71, 0.02)'
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid #002147',
            background: 'rgba(0, 33, 71, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 className="card-title" style={{ color: '#002147', margin: 0 }}>
              الأجهزة قيد التصليح ({inRepairDevices.length})
            </h2>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: '#495057' }}>
              جميع الأجهزة قيد التصليح مع موقعها وحالتها والتقارير المضافة
              {selectedTechnician && (
                <span style={{ 
                  marginRight: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: '#C7B58D',
                  color: '#002147',
                  borderRadius: '20px',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}>
                  فلترة: {getTechnicianStats().find(s => s.technicianId === selectedTechnician)?.technicianName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTechnician(null);
                      setSearchTerm('');
                    }}
                    style={{
                      marginRight: '0.5rem',
                      background: 'none',
                      border: 'none',
                      color: '#002147',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 700
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>نوع العطل</th>
                  <th>الموقع</th>
                  <th>الفني</th>
                  <th>عدد التقارير</th>
                  <th>تاريخ الإضافة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInRepairDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>{device.faultType}</td>
                    <td>
                      {device.location === 'operations' && 'العمليات'}
                      {device.location === 'technician' && 'الفني'}
                      {device.location === 'storage' && 'المخزن'}
                      {device.location === 'customer' && 'الزبون'}
                    </td>
                    <td>{device.technicianName || '-'}</td>
                    <td>
                      <span className="badge badge-primary">
                        {device.reports?.length || 0} تقرير
                      </span>
                    </td>
                    <td>{format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            background: 'var(--gray-200)',
                            color: 'var(--gray-900)',
                            border: '1px solid var(--gray-300)'
                          }}
                        >
                          <Eye size={16} />
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleTransferDevice(device)}
                          className="btn btn-primary btn-sm"
                          style={{
                            background: '#002147',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          <Send size={16} />
                          تحويل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Devices */}
      {completedDevices.length > 0 && (
        <div id="completed-devices" className="card" style={{ 
          marginBottom: '2rem',
          border: '2px solid #059669',
          background: 'rgba(5, 150, 105, 0.02)'
        }}>
          <div className="card-header" style={{ 
            borderBottom: '2px solid #059669',
            background: 'rgba(5, 150, 105, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 className="card-title" style={{ color: '#059669', margin: 0 }}>
              الأجهزة المكتملة ({completedDevices.length})
            </h2>
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem', color: '#495057' }}>
              الأجهزة التي تم إنهاء تقريرها (تم التصليح - لا يصلح مع السبب) وموقعها
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>حالة التصليح</th>
                  <th>سبب عدم الإصلاح</th>
                  <th>الموقع</th>
                  <th>تاريخ الإكمال</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {completedDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>
                      {device.isRepairable === true && (
                        <span className="badge badge-success">تم التصليح</span>
                      )}
                      {device.isRepairable === false && (
                        <span className="badge badge-danger">لا يصلح</span>
                      )}
                    </td>
                    <td>{device.repairReason || '-'}</td>
                    <td>
                      {device.location === 'operations' && 'العمليات'}
                      {device.location === 'technician' && 'الفني'}
                      {device.location === 'storage' && 'المخزن'}
                      {device.location === 'customer' && 'الزبون'}
                    </td>
                    <td>{format(new Date(device.updatedAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <button
                        onClick={() => handleViewDevice(device)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          background: 'var(--gray-200)',
                          color: 'var(--gray-900)',
                          border: '1px solid var(--gray-300)',
                          fontWeight: 600
                        }}
                      >
                        <Eye size={16} />
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Devices Table */}
      <div id="all-devices" className="card">
        <div className="card-header">
          <h2 className="card-title">جميع الأجهزة</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم الجهاز</th>
                <th>IMEI</th>
                <th>نوع العطل</th>
                <th>الحالة</th>
                <th>الموقع</th>
                <th>الفني</th>
                <th>تاريخ الإضافة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(device => (
                <tr key={device.id}>
                  <td>{device.orderNumber}</td>
                  <td>{device.deviceName}</td>
                  <td>{device.imei}</td>
                  <td>{device.faultType}</td>
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
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(device.status === 'new' || device.status === 'received_from_technician') && (
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-primary btn-sm"
                          style={{
                            background: '#002147',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600
                          }}
                        >
                          <ClipboardCheck size={16} />
                          فحص
                        </button>
                      )}
                      {device.status === 'transferred' && device.location === 'technician' && (
                        <button
                          onClick={() => handleReceiveFromTechnician(device)}
                          className="btn btn-success btn-sm"
                        >
                          استلام من الفني
                        </button>
                      )}
                      {device.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => handleEditDevice(device)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleTransferDevice(device)}
                            className="btn btn-primary btn-sm"
                          >
                            <Send size={14} />
                          </button>
                        </>
                      )}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadDevices();
          }}
        />
      )}

      {showEditModal && selectedDevice && (
        <EditDeviceModal
          device={selectedDevice}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDevice(null);
            loadDevices();
          }}
        />
      )}

      {showDetailsModal && selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          user={user}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={async () => {
            await loadDevices();
            // Reload device to show new report
            const allDevices = await storage.getDevices();
            const updatedDevice = allDevices.find(d => d.id === selectedDevice.id);
            if (updatedDevice) {
              setSelectedDevice(updatedDevice);
            }
          }}
        />
      )}

      {showTransferModal && selectedDevice && (
        <TransferDeviceModal
          device={selectedDevice}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowTransferModal(false);
            setSelectedDevice(null);
            loadDevices();
          }}
        />
      )}

      {showCompleteModal && selectedDevice && (
        <CompleteDeviceModal
          device={selectedDevice}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowCompleteModal(false);
            setSelectedDevice(null);
            loadDevices();
          }}
        />
      )}

      {showApproveModal && selectedDevice && (
        <ApproveDeviceModal
          device={selectedDevice}
          user={user}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowApproveModal(false);
            setSelectedDevice(null);
            loadDevices();
          }}
        />
      )}
    </Layout>
  );
}

