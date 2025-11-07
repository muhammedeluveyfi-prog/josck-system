import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Device } from '../../types';
import { storage } from '../../utils/storage';
import NumberInputWithArrows from '../common/NumberInputWithArrows';
import TimePicker from '../common/TimePicker';

interface EditDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDeviceModal({ device, onClose, onSuccess }: EditDeviceModalProps) {
  // تحويل التاريخ والوقت من ISO إلى تاريخ منفصل + وقت (12 ساعة)
  const parseDateTime = (dateString: string | undefined) => {
    if (!dateString) {
      return {
        date: '',
        hour: 12,
        minute: 0,
        ampm: 'PM' as 'AM' | 'PM'
      };
    }
    
    const date = new Date(dateString);
    let hour24 = date.getHours();
    const minute = date.getMinutes();
    
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
    
    return {
      date: date.toISOString().slice(0, 10),
      hour: hour12,
      minute,
      ampm
    };
  };

  const dateTime = parseDateTime(device.scheduledStartDate);

  const [formData, setFormData] = useState({
    orderNumber: device.orderNumber,
    deviceName: device.deviceName,
    imei: device.imei,
    phoneNumber: device.phoneNumber || '',
    faultType: device.faultType,
    scheduledDate: dateTime.date,
    scheduledHour: dateTime.hour,
    scheduledMinute: dateTime.minute,
    scheduledAmpm: dateTime.ampm,
    expectedDurationDays: device.expectedDurationDays || 0,
    expectedDurationHours: device.expectedDurationHours || 0,
    expectedDuration: device.expectedDuration,
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
    const durationText = durationParts.length > 0 ? durationParts.join(' و ') : formData.expectedDuration;

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
      scheduledDate = device.scheduledStartDate || device.createdAt;
    }

    const { scheduledDate: _, scheduledHour: __, scheduledMinute: ___, scheduledAmpm: ____, ...deviceData } = formData;
    
    const updateData = {
      ...deviceData,
      expectedDuration: durationText,
      expectedDurationDays: formData.expectedDurationDays > 0 ? formData.expectedDurationDays : undefined,
      expectedDurationHours: formData.expectedDurationHours > 0 ? formData.expectedDurationHours : undefined,
      scheduledStartDate: scheduledDate,
    };

    try {
      await storage.updateDevice(device.id, updateData);
      onSuccess();
    } catch (error) {
      console.error('Error updating device:', error);
      alert('حدث خطأ أثناء تحديث الجهاز');
    }
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>تاريخ إضافة الجهاز</label>
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
                style={{ marginBottom: '1rem' }}
              />
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                وقت إضافة الجهاز
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


