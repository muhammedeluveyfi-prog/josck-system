import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Device, User } from '../types';
import { storage } from '../utils/storage';
import { format } from 'date-fns';
import { CheckCircle, Send, Eye, FileText } from 'lucide-react';
import DeviceDetailsModal from '../components/operations/DeviceDetailsModal';
import TransferBackModal from '../components/technician/TransferBackModal';
import AddReportModal from '../components/technician/AddReportModal';

interface TechnicianDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TechnicianDashboard({ user, onLogout }: TechnicianDashboardProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    const allDevices = storage.getDevices();
    setDevices(allDevices);
  };

  const transferredDevices = devices.filter(
    d => d.status === 'transferred' && d.technicianId === user.id
  );

  const inRepairDevices = devices.filter(
    d => d.status === 'in_repair' && d.technicianId === user.id
  );

  const handleReceiveDevice = (device: Device) => {
    storage.updateDevice(device.id, {
      status: 'in_repair',
      location: 'technician',
    });
    loadDevices();
  };

  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const handleTransferBack = (device: Device) => {
    setSelectedDevice(device);
    setShowTransferModal(true);
  };

  const handleAddReport = (device: Device) => {
    setSelectedDevice(device);
    setShowReportModal(true);
  };

  return (
    <Layout title="واجهة الفني" user={user} onLogout={onLogout}>
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => {
          const element = document.getElementById('transferred-devices');
          element?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <div className="stat-value" style={{ color: '#C7B58D' }}>{transferredDevices.length}</div>
          <div className="stat-label">الأجهزة المحولة</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => {
          const element = document.getElementById('in-repair-devices');
          element?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <div className="stat-value" style={{ color: '#002147' }}>{inRepairDevices.length}</div>
          <div className="stat-label">الأجهزة قيد التصليح</div>
        </div>
      </div>

      {/* Transferred Devices */}
      <div id="transferred-devices" className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            الأجهزة المحولة ({transferredDevices.length})
          </h2>
          <span className="badge badge-warning">يجب استلامها</span>
        </div>
        {transferredDevices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>نوع العطل</th>
                  <th>المدة المتوقعة</th>
                  <th>تاريخ التحويل</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transferredDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>{device.faultType}</td>
                    <td>{device.expectedDuration}</td>
                    <td>{format(new Date(device.updatedAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} />
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleReceiveDevice(device)}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={14} />
                          استلام الجهاز
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            لا توجد أجهزة محولة
          </div>
        )}
      </div>

      {/* In Repair Devices */}
      <div id="in-repair-devices" className="card">
        <div className="card-header">
          <h2 className="card-title">
            الأجهزة قيد التصليح ({inRepairDevices.length})
          </h2>
        </div>
        {inRepairDevices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>اسم الجهاز</th>
                  <th>IMEI</th>
                  <th>نوع العطل</th>
                  <th>المدة المتوقعة</th>
                  <th>عدد التقارير</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {inRepairDevices.map(device => (
                  <tr key={device.id}>
                    <td>{device.orderNumber}</td>
                    <td>{device.deviceName}</td>
                    <td>{device.imei}</td>
                    <td>{device.faultType}</td>
                    <td>{device.expectedDuration}</td>
                    <td>{device.reports?.length || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDevice(device)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} />
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={() => handleAddReport(device)}
                          className="btn btn-primary btn-sm"
                        >
                          <FileText size={14} />
                          إضافة تقرير
                        </button>
                        <button
                          onClick={() => handleTransferBack(device)}
                          className="btn btn-success btn-sm"
                        >
                          <Send size={14} />
                          تحويل إلى العمليات
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            لا توجد أجهزة قيد التصليح
          </div>
        )}
      </div>

      {/* Modals */}
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
        <TransferBackModal
          device={selectedDevice}
          technician={user}
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

      {showReportModal && selectedDevice && (
        <AddReportModal
          device={selectedDevice}
          technician={user}
          onClose={() => {
            setShowReportModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={() => {
            setShowReportModal(false);
            setSelectedDevice(null);
            loadDevices();
          }}
        />
      )}
    </Layout>
  );
}

