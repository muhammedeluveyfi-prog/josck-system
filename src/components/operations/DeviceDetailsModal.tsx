import { useState, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { Device, User } from '../../types';
import { format } from 'date-fns';
import { storage } from '../../utils/storage';
import { calculateTimeRemaining } from '../../utils/timeUtils';

interface DeviceDetailsModalProps {
  device: Device;
  user?: User;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeviceDetailsModal({ device, user, onClose, onSuccess }: DeviceDetailsModalProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [currentDevice, setCurrentDevice] = useState<Device>(device);

  // Load updated device data when modal opens
  useEffect(() => {
    const loadDeviceData = async () => {
      try {
        const allDevices = await storage.getDevices();
        const updatedDevice = allDevices.find(d => d.id === device.id);
        if (updatedDevice) {
          setCurrentDevice(updatedDevice);
        }
      } catch (error: any) {
        console.error('Error loading device data:', error);
        // Show error but don't block the modal
        alert('حدث خطأ أثناء تحميل بيانات الجهاز. يرجى المحاولة مرة أخرى.');
      }
    };

    loadDeviceData();
  }, [device.id]);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    try {
      await storage.addReport(currentDevice.id, {
        id: Date.now().toString(),
        deviceId: currentDevice.id,
        content: replyContent,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        createdAt: new Date().toISOString(),
      });

      // Reload device data to show the new report
      const allDevices = await storage.getDevices();
      const updatedDevice = allDevices.find(d => d.id === currentDevice.id);
      if (updatedDevice) {
        setCurrentDevice(updatedDevice);
      }

      setReplyContent('');
      setShowReplyForm(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding reply:', error);
      const errorMessage = error?.message || 'حدث خطأ أثناء إضافة الرد. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  const hasTechnicianReports = currentDevice.reports?.some(r => r.authorRole === 'technician') || false;
  const timeRemaining = calculateTimeRemaining(currentDevice);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">تفاصيل الجهاز</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>رقم الطلب</label>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{currentDevice.orderNumber}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>اسم الجهاز</label>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{currentDevice.deviceName}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>IMEI</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{currentDevice.imei}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>رقم الهاتف</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{currentDevice.phoneNumber || '-'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>نوع العطل</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{currentDevice.faultType}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>تاريخ وساعة الإضافة</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {currentDevice.scheduledStartDate 
                  ? format(new Date(currentDevice.scheduledStartDate), 'yyyy-MM-dd HH:mm')
                  : format(new Date(currentDevice.createdAt), 'yyyy-MM-dd HH:mm')
                }
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>المدة المتوقعة</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {(() => {
                  // استخدام الحقول الجديدة أولاً
                  if (currentDevice.expectedDurationDays || currentDevice.expectedDurationHours) {
                    const parts: string[] = [];
                    if (currentDevice.expectedDurationDays && currentDevice.expectedDurationDays > 0) {
                      parts.push(`${currentDevice.expectedDurationDays} ${currentDevice.expectedDurationDays === 1 ? 'يوم' : 'أيام'}`);
                    }
                    if (currentDevice.expectedDurationHours && currentDevice.expectedDurationHours > 0) {
                      parts.push(`${currentDevice.expectedDurationHours} ${currentDevice.expectedDurationHours === 1 ? 'ساعة' : 'ساعات'}`);
                    }
                    return parts.length > 0 ? parts.join(' و ') : '-';
                  }
                  // استخدام الحقول القديمة
                  if (currentDevice.expectedDuration) {
                    return currentDevice.expectedDuration;
                  }
                  if (currentDevice.expectedDurationValue && currentDevice.expectedDurationUnit) {
                    return `${currentDevice.expectedDurationValue} ${currentDevice.expectedDurationUnit === 'days' ? 'أيام' : 'ساعات'}`;
                  }
                  return '-';
                })()}
              </div>
            </div>
            {timeRemaining && (
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الوقت المتبقي</label>
                <div style={{ 
                  fontSize: '1rem', 
                  marginTop: '0.25rem',
                  color: timeRemaining.isExpired ? '#dc2626' : '#f59e0b',
                  fontWeight: 600
                }}>
                  {timeRemaining.isExpired ? 'انتهت المدة المتوقعة' : `متبقي: ${timeRemaining.formatted}`}
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الحالة</label>
              <div style={{ marginTop: '0.25rem' }}>
                {currentDevice.status === 'in_repair' && <span className="badge badge-primary">قيد التصليح</span>}
                {currentDevice.status === 'completed' && <span className="badge badge-success">مكتمل</span>}
                {currentDevice.status === 'transferred' && <span className="badge badge-warning">متحول</span>}
                {currentDevice.status === 'awaiting_approval' && <span className="badge badge-danger">انتظار موافقة</span>}
                {currentDevice.status === 'new' && <span className="badge badge-gray">جديد</span>}
                {currentDevice.status === 'received_from_technician' && <span className="badge badge-primary">مستلم من الفني</span>}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الموقع</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {currentDevice.location === 'operations' && 'العمليات'}
                {currentDevice.location === 'technician' && 'الفني'}
                {currentDevice.location === 'storage' && 'المخزن'}
                {currentDevice.location === 'customer' && 'الزبون'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الفني</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{currentDevice.technicianName || '-'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>تاريخ الإضافة</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {format(new Date(currentDevice.createdAt), 'yyyy-MM-dd HH:mm')}
              </div>
            </div>
          </div>

          {currentDevice.finalReport && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>التقرير النهائي</label>
              <div style={{ fontSize: '0.875rem' }}>{currentDevice.finalReport}</div>
              {currentDevice.isRepairable !== undefined && (
                <div style={{ marginTop: '0.5rem' }}>
                  {currentDevice.isRepairable ? (
                    <span className="badge badge-success">تم التصليح</span>
                  ) : (
                    <span className="badge badge-danger">لا يصلح</span>
                  )}
                  {currentDevice.repairReason && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>السبب: {currentDevice.repairReason}</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #C7B58D'
            }}>
              <label style={{ 
                fontSize: '1rem', 
                color: '#002147', 
                fontWeight: 700, 
                margin: 0
              }}>
                تقارير الفني والأجهزة ({currentDevice.reports?.length || 0})
              </label>
              {user && hasTechnicianReports && !showReplyForm && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: '#002147',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MessageSquare size={16} />
                  إضافة رد على التقرير
                </button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && user && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1.5rem',
                background: 'rgba(199, 181, 141, 0.1)',
                borderRadius: '0.75rem',
                border: '2px solid #C7B58D'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: '#002147',
                    margin: 0
                  }}>
                    إضافة رد على تقرير الفني
                  </h4>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '0.25rem'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddReply}>
                  <textarea
                    className="form-textarea"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="اكتب ردك على تقرير الفني..."
                    required
                    rows={4}
                    style={{
                      border: '2px solid #002147',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent('');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{
                        background: '#002147',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      <Send size={16} />
                      إرسال الرد
                    </button>
                  </div>
                </form>
              </div>
            )}
            {currentDevice.reports && currentDevice.reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentDevice.reports.map((report) => {
                  const isTechnicianReport = report.authorRole === 'technician';
                  return (
                    <div 
                      key={report.id} 
                      style={{ 
                        padding: '1.25rem', 
                        background: isTechnicianReport ? 'rgba(0, 33, 71, 0.05)' : '#f9fafb',
                        borderRadius: '0.75rem', 
                        border: isTechnicianReport ? '2px solid #002147' : '1px solid #e5e7eb',
                        boxShadow: isTechnicianReport ? '0 2px 8px rgba(0, 33, 71, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isTechnicianReport && (
                            <span style={{
                              background: '#002147',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              تقرير فني
                            </span>
                          )}
                          <span style={{ fontWeight: 700, color: isTechnicianReport ? '#002147' : '#1f2937' }}>
                            {report.authorName}
                          </span>
                          <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                            ({report.authorRole === 'operations' && 'موظف العمليات'}
                            {report.authorRole === 'technician' && 'فني'}
                            {report.authorRole === 'admin' && 'مدير'}
                            {report.authorRole === 'customer_service' && 'خدمة العملاء'})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: '#6c757d', fontWeight: 500 }}>
                          {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.9375rem', 
                        color: '#374151',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e9ecef'
                      }}>
                        {report.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#9ca3af',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px dashed #e5e7eb'
              }}>
                لا توجد تقارير حتى الآن
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

