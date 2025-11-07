import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Device } from '../../types';
import { storage } from '../../utils/storage';
import NumberInputWithArrows from '../common/NumberInputWithArrows';
import TimePicker from '../common/TimePicker';

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
    scheduledDate: '',
    scheduledHour: 12,
    scheduledMinute: 0,
    scheduledAmpm: 'PM' as 'AM' | 'PM',
    expectedDurationDays: 0,
    expectedDurationHours: 0,
    status: 'new' as const,
    location: 'operations' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من أن هناك على الأقل يوم واحد أو ساعة واحدة
    if (formData.expectedDurationDays === 0 && formData.expectedDurationHours === 0) {
      alert('يرجى تحديد المدة المتوقعة (أيام أو ساعات)');
      return;
    }

    // إنشاء نص المدة المتوقعة للتوافق مع الكود القديم
    const durationParts: string[] = [];
    if (formData.expectedDurationDays > 0) {
      durationParts.push(`${formData.expectedDurationDays} ${formData.expectedDurationDays === 1 ? 'يوم' : 'أيام'}`);
    }
    if (formData.expectedDurationHours > 0) {
      durationParts.push(`${formData.expectedDurationHours} ${formData.expectedDurationHours === 1 ? 'ساعة' : 'ساعات'}`);
    }
    const durationText = durationParts.join(' و ');

    // تحويل التاريخ والوقت إلى ISO string
    let scheduledDate: string;
    if (formData.scheduledDate) {
      // تحويل الوقت من 12 ساعة إلى 24 ساعة
      let hour24 = formData.scheduledHour;
      if (formData.scheduledAmpm === 'PM' && formData.scheduledHour !== 12) {
        hour24 = formData.scheduledHour + 12;
      } else if (formData.scheduledAmpm === 'AM' && formData.scheduledHour === 12) {
        hour24 = 0;
      }
      
      const dateTimeString = `${formData.scheduledDate}T${String(hour24).padStart(2, '0')}:${String(formData.scheduledMinute).padStart(2, '0')}:00`;
      scheduledDate = new Date(dateTimeString).toISOString();
    } else {
      scheduledDate = new Date().toISOString();
    }

    const { scheduledDate: _, scheduledHour: __, scheduledMinute: ___, scheduledAmpm: ____, ...deviceData } = formData;
    
    const newDevice: Device = {
      id: Date.now().toString(),
      ...deviceData,
      expectedDuration: durationText,
      expectedDurationDays: formData.expectedDurationDays > 0 ? formData.expectedDurationDays : undefined,
      expectedDurationHours: formData.expectedDurationHours > 0 ? formData.expectedDurationHours : undefined,
      scheduledStartDate: scheduledDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reports: [],
      needsApproval: false,
    };

    try {
      await storage.addDevice(newDevice);
      onSuccess();
    } catch (error) {
      console.error('Error adding device:', error);
      alert('حدث خطأ أثناء إضافة الجهاز');
    }
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>تاريخ إضافة الجهاز *</label>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    
                    let hour24 = now.getHours();
                    let hour12 = hour24;
                    let ampm: 'AM' | 'PM' = 'AM';
                    
                    if (hour24 === 0) {
                      hour12 = 12;
                      ampm = 'AM';
                    } else if (hour24 === 12) {
                      hour12 = 12;
                      ampm = 'PM';
                    } else if (hour24 > 12) {
                      hour12 = hour24 - 12;
                      ampm = 'PM';
                    } else {
                      hour12 = hour24;
                      ampm = 'AM';
                    }
                    
                    setFormData({
                      ...formData,
                      scheduledDate: dateString,
                      scheduledHour: hour12,
                      scheduledMinute: now.getMinutes(),
                      scheduledAmpm: ampm
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #002147 0%, #003366 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(0, 33, 71, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 33, 71, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 71, 0.2)';
                  }}
                >
                  <Clock size={16} />
                  استخدام الوقت الحالي
                </button>
              </div>
              <input
                type="date"
                className="form-input"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
                style={{ marginBottom: '1rem' }}
              />
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                وقت إضافة الجهاز *
              </label>
              <TimePicker
                hour={formData.scheduledHour}
                minute={formData.scheduledMinute}
                ampm={formData.scheduledAmpm}
                onHourChange={(hour) => setFormData({ ...formData, scheduledHour: hour })}
                onMinuteChange={(minute) => setFormData({ ...formData, scheduledMinute: minute })}
                onAmpmChange={(ampm) => setFormData({ ...formData, scheduledAmpm: ampm })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">المدة المتوقعة *</label>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-end'
              }}>
                <NumberInputWithArrows
                  value={formData.expectedDurationDays}
                  onChange={(value) => setFormData({ ...formData, expectedDurationDays: value })}
                  min={0}
                  max={50}
                  label="الأيام"
                  placeholder="عدد الأيام"
                />
                <NumberInputWithArrows
                  value={formData.expectedDurationHours}
                  onChange={(value) => setFormData({ ...formData, expectedDurationHours: value })}
                  min={0}
                  max={50}
                  label="الساعات"
                  placeholder="عدد الساعات"
                />
              </div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'rgba(0, 33, 71, 0.05)', 
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 33, 71, 0.1)',
              marginTop: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#002147', fontWeight: 600, marginBottom: '0.5rem' }}>
                معلومات تلقائية من النظام:
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#6c757d' }}>
                <div>
                  <strong>حالة الجهاز:</strong> جديد (سيتم تعيينها تلقائياً)
                </div>
              </div>
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


