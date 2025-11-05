import { useState } from 'react';
import { X } from 'lucide-react';
import { Device } from '../../types';
import { storage } from '../../utils/storage';

interface EditDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDeviceModal({ device, onClose, onSuccess }: EditDeviceModalProps) {
  const [formData, setFormData] = useState({
    orderNumber: device.orderNumber,
    deviceName: device.deviceName,
    imei: device.imei,
    phoneNumber: device.phoneNumber || '',
    faultType: device.faultType,
    expectedDuration: device.expectedDuration,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateDevice(device.id, formData);
    onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">تحرير الجهاز</h2>
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
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


