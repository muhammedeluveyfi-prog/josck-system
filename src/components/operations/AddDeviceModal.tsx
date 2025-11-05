import { useState } from 'react';
import { X } from 'lucide-react';
import { Device } from '../../types';
import { storage } from '../../utils/storage';

interface AddDeviceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDeviceModal({ onClose, onSuccess }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    orderNumber: '',
    deviceName: '',
    imei: '',
    phoneNumber: '',
    faultType: '',
    expectedDuration: '',
    status: 'new' as const,
    location: 'operations' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDevice: Device = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reports: [],
      needsApproval: false,
    };

    storage.addDevice(newDevice);
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">إضافة جهاز جديد</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">رقم الطلب *</label>
              <input
                type="text"
                className="form-input"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">اسم الجهاز *</label>
              <input
                type="text"
                className="form-input"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">IMEI *</label>
              <input
                type="text"
                className="form-input"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <input
                type="text"
                className="form-input"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">نوع العطل *</label>
              <input
                type="text"
                className="form-input"
                value={formData.faultType}
                onChange={(e) => setFormData({ ...formData, faultType: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">المدة المتوقعة *</label>
              <input
                type="text"
                className="form-input"
                value={formData.expectedDuration}
                onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                placeholder="مثال: 3 أيام"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


