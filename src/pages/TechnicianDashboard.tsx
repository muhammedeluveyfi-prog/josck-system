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
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  useEffect(() => {
    loadDevices();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadDevices();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      // Clear cache to force fresh data from server
      storage.clearCache();
      const allDevices = await storage.getDevices();
      setDevices(allDevices);
    } catch (error: any) {
      console.error('Error loading devices:', error);
      // Don't show alert on auto-refresh to avoid annoying users
      // Only log the error
    }
  };

  const transferredDevices = devices.filter(
    d => d.status === 'transferred' && d.technicianId === user.id
  );

  const inRepairDevices = devices.filter(
    d => d.status === 'in_repair' && d.technicianId === user.id
  );

  const handleReceiveDevice = async (device: Device) => {
    try {
      await storage.updateDevice(device.id, {
        status: 'in_repair',
        location: 'technician',
      });
      await loadDevices();
      // Scroll to in-repair devices section automatically
      setTimeout(() => {
        const element = document.getElementById('in-repair-devices');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error receiving device:', error);
      alert('حدث خطأ أثناء استلام الجهاز. يرجى المحاولة مرة أخرى.');
    }
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
      {/* Quick Actions - Add Report Button */}
      <>
        {/* Click outside to close dropdown */}
        {showDeviceSelector && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowDeviceSelector(false)}
          />
        )}
        <div className="card" style={{ 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(0, 33, 71, 0.05) 0%, rgba(199, 181, 141, 0.05) 100%)',
          border: '2px solid #C7B58D',
          borderRadius: '1rem',
          padding: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: '#002147',
                marginBottom: '0.5rem'
              }}>
                إضافة تقرير
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6c757d',
                margin: 0
              }}>
                {inRepairDevices.length > 0 
                  ? 'يمكنك إضافة تقرير جديد لأي جهاز قيد التصليح لديك'
                  : 'لا توجد أجهزة قيد التصليح حالياً لإضافة تقرير'
                }
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (inRepairDevices.length === 0) {
                    alert('لا توجد أجهزة قيد التصليح لإضافة تقرير');
                    return;
                  }
                  if (inRepairDevices.length === 1) {
                    // إذا كان هناك جهاز واحد فقط، افتح مباشرة
                    handleAddReport(inRepairDevices[0]);
                  } else {
                    // إذا كان هناك أكثر من جهاز، اعرض القائمة
                    setShowDeviceSelector(!showDeviceSelector);
                  }
                }}
                disabled={inRepairDevices.length === 0}
                className="btn btn-primary"
                style={{
                  background: inRepairDevices.length > 0 
                    ? 'linear-gradient(135deg, #002147 0%, #003366 100%)'
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '1rem 2rem',
                  border: 'none',
                  borderRadius: '0.75rem',
                  boxShadow: inRepairDevices.length > 0 
                    ? '0 4px 15px rgba(0, 33, 71, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  cursor: inRepairDevices.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: inRepairDevices.length > 0 ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (inRepairDevices.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 33, 71, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (inRepairDevices.length > 0) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 33, 71, 0.3)';
                  }
                }}
              >
                <FileText size={24} />
                إضافة تقرير
              </button>

              {/* Device Selector Dropdown */}
              {showDeviceSelector && inRepairDevices.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 24px rgba(0, 33, 71, 0.2)',
                  border: '2px solid #C7B58D',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      color: '#002147',
                      borderBottom: '1px solid #e9ecef',
                      marginBottom: '0.5rem'
                    }}>
                      اختر الجهاز:
                    </div>
                    {inRepairDevices.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => {
                          handleAddReport(device);
                          setShowDeviceSelector(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          textAlign: 'right',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 33, 71, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#002147', fontSize: '0.9375rem' }}>
                          {device.deviceName}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: '#6c757d' }}>
                          رقم الطلب: {device.orderNumber}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>

      {/* Statistics */}
      <div className="stats-grid">
        <div 
          className="stat-card" 
          style={{ 
            cursor: 'pointer',
            border: transferredDevices.length > 0 ? '2px solid #C7B58D' : '2px solid transparent',
            transition: 'all 0.3s',
            background: transferredDevices.length > 0 ? 'rgba(199, 181, 141, 0.05)' : 'white'
          }} 
          onClick={() => {
            const element = document.getElementById('transferred-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (transferredDevices.length > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(199, 181, 141, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#C7B58D', fontSize: '2.5rem' }}>
            {transferredDevices.length}
          </div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>
            الأجهزة المحولة
          </div>
          {transferredDevices.length > 0 && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.75rem', 
              color: '#6c757d',
              fontWeight: 500
            }}>
              اضغط للدخول واستلام الأجهزة
            </div>
          )}
        </div>
        <div 
          className="stat-card" 
          style={{ 
            cursor: 'pointer',
            border: inRepairDevices.length > 0 ? '2px solid #002147' : '2px solid transparent',
            transition: 'all 0.3s',
            background: inRepairDevices.length > 0 ? 'rgba(0, 33, 71, 0.05)' : 'white'
          }} 
          onClick={() => {
            const element = document.getElementById('in-repair-devices');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          onMouseEnter={(e) => {
            if (inRepairDevices.length > 0) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 33, 71, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div className="stat-value" style={{ color: '#002147', fontSize: '2.5rem' }}>
            {inRepairDevices.length}
          </div>
          <div className="stat-label" style={{ fontSize: '1rem', fontWeight: 600 }}>
            الأجهزة قيد التصليح
          </div>
          {inRepairDevices.length > 0 && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.75rem', 
              color: '#6c757d',
              fontWeight: 500
            }}>
              اضغط للدخول وعرض التفاصيل
            </div>
          )}
        </div>
      </div>

      {/* Transferred Devices */}
      <div id="transferred-devices" className="card" style={{ 
        marginBottom: '2rem',
        border: '2px solid #C7B58D',
        background: transferredDevices.length > 0 ? 'rgba(199, 181, 141, 0.02)' : 'white'
      }}>
        <div className="card-header" style={{ 
          borderBottom: '2px solid #C7B58D',
          background: 'rgba(199, 181, 141, 0.1)',
          padding: '1.5rem',
          borderRadius: '0.75rem 0.75rem 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ color: '#002147', margin: 0 }}>
              الأجهزة المحولة ({transferredDevices.length})
            </h2>
            <span className="badge badge-warning" style={{ 
              background: '#C7B58D', 
              color: '#002147',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              fontSize: '0.875rem'
            }}>
              يجب استلامها
            </span>
          </div>
          {transferredDevices.length > 0 && (
            <p style={{ 
              marginTop: '0.75rem', 
              marginBottom: 0,
              color: '#495057',
              fontSize: '0.875rem'
            }}>
              تم تحويل هذه الأجهزة إليك. يرجى استلامها للبدء في عملية التصليح.
            </p>
          )}
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
                          onClick={() => handleReceiveDevice(device)}
                          className="btn btn-success btn-sm"
                          style={{
                            background: '#059669',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
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
      <div id="in-repair-devices" className="card" style={{
        border: '2px solid #002147',
        background: inRepairDevices.length > 0 ? 'rgba(0, 33, 71, 0.02)' : 'white'
      }}>
        <div className="card-header" style={{ 
          borderBottom: '2px solid #002147',
          background: 'rgba(0, 33, 71, 0.1)',
          padding: '1.5rem',
          borderRadius: '0.75rem 0.75rem 0 0'
        }}>
          <div>
            <h2 className="card-title" style={{ color: '#002147', margin: 0 }}>
              الأجهزة قيد التصليح ({inRepairDevices.length})
            </h2>
            {inRepairDevices.length > 0 && (
              <p style={{ 
                marginTop: '0.75rem', 
                marginBottom: 0,
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                يمكنك عرض تفاصيل الأجهزة، إضافة تقارير، أو تحويلها إلى موظف إدارة العمليات بعد إكمال التصليح.
              </p>
            )}
          </div>
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
                          onClick={() => handleTransferBack(device)}
                          className="btn btn-success btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #002147 0%, #003366 100%)',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(0, 33, 71, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 33, 71, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 71, 0.3)';
                          }}
                        >
                          <Send size={16} />
                          تحويل مع تقرير
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
          user={user}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDevice(null);
          }}
          onSuccess={async () => {
            // Reload devices and update selected device
            await loadDevices();
            const allDevices = await storage.getDevices();
            const updatedDevice = allDevices.find(d => d.id === selectedDevice.id);
            if (updatedDevice) {
              setSelectedDevice(updatedDevice);
            }
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

