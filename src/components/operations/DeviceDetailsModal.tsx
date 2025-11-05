import { X } from 'lucide-react';
import { Device } from '../../types';
import { format } from 'date-fns';

interface DeviceDetailsModalProps {
  device: Device;
  onClose: () => void;
}

export default function DeviceDetailsModal({ device, onClose }: DeviceDetailsModalProps) {
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
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{device.orderNumber}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>اسم الجهاز</label>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{device.deviceName}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>IMEI</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{device.imei}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>رقم الهاتف</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{device.phoneNumber || '-'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>نوع العطل</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{device.faultType}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>المدة المتوقعة</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{device.expectedDuration}</div>
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
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {device.location === 'operations' && 'العمليات'}
                {device.location === 'technician' && 'الفني'}
                {device.location === 'storage' && 'المخزن'}
                {device.location === 'customer' && 'الزبون'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>الفني</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{device.technicianName || '-'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>تاريخ الإضافة</label>
              <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                {format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm')}
              </div>
            </div>
          </div>

          {device.finalReport && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>التقرير النهائي</label>
              <div style={{ fontSize: '0.875rem' }}>{device.finalReport}</div>
              {device.isRepairable !== undefined && (
                <div style={{ marginTop: '0.5rem' }}>
                  {device.isRepairable ? (
                    <span className="badge badge-success">تم التصليح</span>
                  ) : (
                    <span className="badge badge-danger">لا يصلح</span>
                  )}
                  {device.repairReason && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>السبب: {device.repairReason}</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>
              التقارير ({device.reports?.length || 0})
            </label>
            {device.reports && device.reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {device.reports.map((report) => (
                  <div key={report.id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{report.authorName}</span>
                        <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>
                          ({report.authorRole === 'operations' && 'موظف العمليات'}
                          {report.authorRole === 'technician' && 'فني'}
                          {report.authorRole === 'admin' && 'مدير'}
                          {report.authorRole === 'customer_service' && 'خدمة العملاء'})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>{report.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                لا توجد تقارير
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

