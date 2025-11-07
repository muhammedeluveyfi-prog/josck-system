import { useState } from 'react';
import { X } from 'lucide-react';
import { Device, User } from '../../types';
import { storage } from '../../utils/storage';

interface TransferBackModalProps {
  device: Device;
  technician: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferBackModal({ device, technician, onClose, onSuccess }: TransferBackModalProps) {
  const [report, setReport] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report.trim()) {
      alert('يرجى كتابة تقرير الفني قبل التحويل');
      return;
    }

    try {
      // Add report
      await storage.addReport(device.id, {
        id: Date.now().toString(),
        deviceId: device.id,
        content: report,
        authorId: technician.id,
        authorName: technician.name,
        authorRole: 'technician',
        createdAt: new Date().toISOString(),
      });

      // Transfer back to operations
      await storage.updateDevice(device.id, {
        status: 'received_from_technician',
        location: 'operations',
        technicianId: undefined,
        technicianName: undefined,
      });

      onSuccess();
    } catch (error) {
      console.error('Error transferring device back:', error);
      alert('حدث خطأ أثناء تحويل الجهاز');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">تحويل الجهاز إلى العمليات</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>رقم الطلب:</strong> {device.orderNumber}
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <strong>اسم الجهاز:</strong> {device.deviceName}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ 
                fontWeight: 600,
                color: '#002147',
                fontSize: '0.9375rem',
                marginBottom: '0.75rem'
              }}>
                تقرير الفني *
              </label>
              <p style={{ 
                fontSize: '0.8125rem', 
                color: '#6c757d', 
                marginBottom: '0.75rem',
                marginTop: '-0.5rem'
              }}>
                يرجى كتابة تقرير عن حالة الجهاز والتصليحات التي تمت قبل التحويل
              </p>
              <textarea
                className="form-textarea"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="أدخل تقرير الفني... (مثال: تم إصلاح الشاشة واستبدال البطارية، الجهاز يعمل بشكل طبيعي)"
                required
                rows={6}
                style={{
                  border: '2px solid #e9ecef',
                  fontSize: '0.9375rem'
                }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              تحويل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


