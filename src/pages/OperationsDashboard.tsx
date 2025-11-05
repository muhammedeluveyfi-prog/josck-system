import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Device, User, TechnicianStats } from '../types';
import { storage } from '../utils/storage';
import { format } from 'date-fns';
import {
  Plus, CheckCircle, User as UserIcon,
  Search, Edit, Eye, Send, FileText
} from 'lucide-react';
import AddDeviceModal from '../components/operations/AddDeviceModal';
import EditDeviceModal from '../components/operations/EditDeviceModal';
import DeviceDetailsModal from '../components/operations/DeviceDetailsModal';
import TransferDeviceModal from '../components/operations/TransferDeviceModal';
import CompleteDeviceModal from '../components/operations/CompleteDeviceModal';

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
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    const allDevices = storage.getDevices();
    setDevices(allDevices);
  };

  const getTechnicianStats = (): TechnicianStats[] => {
    const technicians = storage.getUsers().filter(u => u.role === 'technician');
    return technicians.map(tech => {
      const techDevices = devices.filter(d => d.technicianId === tech.id && d.status === 'in_repair');
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
      inRepair: devices.filter(d => d.status === 'in_repair').length,
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

  const handleInspectDevice = (device: Device) => {
    storage.updateDevice(device.id, {
      status: 'in_repair',
      location: 'operations',
    });
    loadDevices();
  };

  const handleReceiveFromTechnician = (device: Device) => {
    storage.updateDevice(device.id, {
      status: 'received_from_technician',
      location: 'operations',
      technicianId: undefined,
      technicianName: undefined,
    });
    loadDevices();
  };

  return (
    <Layout title="واجهة موظف إدارة العمليات" user={user} onLogout={onLogout}>
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#002147' }}>{stats.inRepair}</div>
          <div className="stat-label">قيد التصليح</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#059669' }}>{stats.completed}</div>
          <div className="stat-label">مكتملة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#C7B58D' }}>{stats.transferred}</div>
          <div className="stat-label">متحولة - يجب استلامها</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc2626' }}>{stats.awaitingApproval}</div>
          <div className="stat-label">انتظار موافقة</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#002147' }}>{stats.new}</div>
          <div className="stat-label">جديدة/مستلمة من الفني</div>
        </div>
      </div>

      {/* Technician Stats */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">الفنيين والأجهزة</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {getTechnicianStats().map(stat => (
            <div
              key={stat.technicianId}
              style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setFilterStatus('in_repair');
                setSearchTerm(stat.technicianName);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <UserIcon size={20} color="#002147" />
                <span style={{ fontWeight: 600 }}>{stat.technicianName}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                {stat.deviceCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>جهاز</div>
            </div>
          ))}
        </div>
      </div>

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
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">الأجهزة الجديدة/المستلمة من الفني</h2>
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
                          className="btn btn-secondary btn-sm"
                          title="فحص"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleInspectDevice(device)}
                          className="btn btn-success btn-sm"
                          title="فحص"
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleTransferDevice(device)}
                          className="btn btn-primary btn-sm"
                          title="تحويل"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => handleEditDevice(device)}
                          className="btn btn-secondary btn-sm"
                          title="تحرير"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleCompleteDevice(device)}
                          className="btn btn-success btn-sm"
                          title="إنهاء التقرير"
                        >
                          <CheckCircle size={14} />
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
      {devices.filter(d => d.status === 'awaiting_approval').length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">الأجهزة قيد انتظار الموافقة</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>سبب الموافقة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {devices.filter(d => d.status === 'awaiting_approval').map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.approvalReason || 'غير محدد'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} />
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleTransferDevice(device)}
                          className="btn btn-primary btn-sm"
                        >
                          <Send size={14} />
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

      {/* All Devices Table */}
      <div className="card">
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
                      <button
                        onClick={() => handleViewDevice(device)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} />
                      </button>
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
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDevice(null);
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
    </Layout>
  );
}

