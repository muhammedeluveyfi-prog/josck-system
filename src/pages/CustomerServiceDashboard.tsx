import { useState } from 'react';
import Layout from '../components/Layout';
import { Device, User } from '../types';
import { storage } from '../utils/storage';
import { format } from 'date-fns';
import { Search, Eye } from 'lucide-react';
import DeviceDetailsModal from '../components/operations/DeviceDetailsModal';

interface CustomerServiceDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function CustomerServiceDashboard({ user, onLogout }: CustomerServiceDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'order' | 'phone'>('order');
  const [device, setDevice] = useState<Device | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setDevice(null);

    if (!searchTerm.trim()) {
      setError('الرجاء إدخال رقم الطلب أو رقم الهاتف');
      return;
    }

    try {
      const devices = await storage.getDevices();
      let foundDevice: Device | undefined;

      if (searchType === 'order') {
        foundDevice = devices.find(d => d.orderNumber === searchTerm);
      } else {
        foundDevice = devices.find(d => d.phoneNumber === searchTerm);
      }

      if (foundDevice) {
        setDevice(foundDevice);
      } else {
        setError('لم يتم العثور على الجهاز');
      }
    } catch (error) {
      console.error('Error searching for device:', error);
      setError('حدث خطأ أثناء البحث');
    }
  };

  const handleViewDetails = () => {
    if (device) {
      setShowDetailsModal(true);
    }
  };

  return (
    <Layout title="واجهة الاستعلام عن جهاز" user={user} onLogout={onLogout} showNotifications={false}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="card-title">البحث عن جهاز</h2>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">نوع البحث</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'order'}
                  onChange={() => setSearchType('order')}
                />
                <span>رقم الطلب</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'phone'}
                  onChange={() => setSearchType('phone')}
                />
                <span>رقم الهاتف</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {searchType === 'order' ? 'رقم الطلب' : 'رقم الهاتف'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder={searchType === 'order' ? 'أدخل رقم الطلب' : 'أدخل رقم الهاتف'}
                style={{ flex: 1 }}
              />
              <button onClick={handleSearch} className="btn btn-primary">
                <Search size={18} />
                بحث
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {device && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: '#f3f4f6',
              borderRadius: '0.5rem',
              border: '2px solid #002147'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    تم العثور على الجهاز
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    رقم الطلب: <strong>{device.orderNumber}</strong>
                  </div>
                </div>
                <button onClick={handleViewDetails} className="btn btn-primary btn-sm">
                  <Eye size={16} />
                  عرض التفاصيل الكاملة
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>اسم الجهاز</label>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {device.deviceName}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الحالة</label>
                  <div style={{ marginTop: '0.25rem' }}>
                    {device.status === 'in_repair' && <span className="badge badge-primary">قيد التصليح</span>}
                    {device.status === 'completed' && <span className="badge badge-success">مكتمل</span>}
                    {device.status === 'transferred' && <span className="badge badge-warning">متحول</span>}
                    {device.status === 'awaiting_approval' && <span className="badge badge-danger">انتظار موافقة</span>}
                    {device.status === 'new' && <span className="badge badge-gray">جديد</span>}
                    {device.status === 'received_from_technician' && <span className="badge badge-primary">مستلم من الفني</span>}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الموقع</label>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {device.location === 'operations' && 'العمليات'}
                    {device.location === 'technician' && 'الفني'}
                    {device.location === 'storage' && 'المخزن'}
                    {device.location === 'customer' && 'الزبون'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الفني</label>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {device.technicianName || '-'}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>عدد التقارير</label>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {device.reports?.length || 0} تقرير
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>تاريخ الإضافة</label>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              </div>

              {device.finalReport && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    التقرير النهائي
                  </label>
                  <div style={{ fontSize: '0.875rem' }}>{device.finalReport}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && device && (
        <DeviceDetailsModal
          device={device}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </Layout>
  );
}

