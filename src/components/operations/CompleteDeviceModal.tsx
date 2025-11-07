import { useState } from 'react';
import { X } from 'lucide-react';
import { Device } from '../../types';
import { storage } from '../../utils/storage';

interface CompleteDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteDeviceModal({ device, onClose, onSuccess }: CompleteDeviceModalProps) {
  const [isRepairable, setIsRepairable] = useState<boolean | undefined>(undefined);
  const [finalReport, setFinalReport] = useState('');
  const [repairReason, setRepairReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await storage.updateDevice(device.id, {
        status: 'completed',
        location: 'storage',
        isRepairable: isRepairable,
        finalReport: finalReport,
        repairReason: isRepairable === false ? repairReason : undefined,
      });

      onSuccess();
    } catch (error) {
      console.error('Error completing device:', error);
      alert('حدث خطأ أثناء إنهاء التقرير');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">إنهاء التقرير</h2>
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
              <label className="form-label">حالة الجهاز *</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="repairable"
                    checked={isRepairable === true}
                    onChange={() => setIsRepairable(true)}
                    required
                  />
                  <span>تم التصليح</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="repairable"
                    checked={isRepairable === false}
                    onChange={() => setIsRepairable(false)}
                    required
                  />
                  <span>لا يصلح</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">التقرير النهائي *</label>
              <textarea
                className="form-textarea"
                value={finalReport}
                onChange={(e) => setFinalReport(e.target.value)}
                placeholder="أدخل التقرير النهائي..."
                required
                rows={5}
              />
            </div>

            {isRepairable === false && (
              <div className="form-group">
                <label className="form-label">سبب عدم إصلاح الجهاز *</label>
                <textarea
                  className="form-textarea"
                  value={repairReason}
                  onChange={(e) => setRepairReason(e.target.value)}
                  placeholder="أدخل سبب عدم إصلاح الجهاز..."
                  required={isRepairable === false}
                  rows={3}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              إنهاء التقرير
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



