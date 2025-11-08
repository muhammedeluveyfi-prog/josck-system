import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Device, User } from '../../types';
import { storage } from '../../utils/storage';

interface TransferDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferDeviceModal({ device, onClose, onSuccess }: TransferDeviceModalProps) {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [technicians, setTechnicians] = useState<User[]>([]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const allUsers = await storage.getUsers();
        setTechnicians(allUsers.filter(u => u.role === 'technician'));
      } catch (error) {
        console.error('Error loading technicians:', error);
      }
    };
    loadTechnicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (needsApproval) {
        await storage.updateDevice(device.id, {
          status: 'awaiting_approval',
          needsApproval: true,
          approvalReason: approvalReason,
        });
      } else if (selectedTechnician) {
        const technician = technicians.find(t => t.id === selectedTechnician);
        await storage.updateDevice(device.id, {
          status: 'transferred',
          location: 'technician',
          technicianId: selectedTechnician,
          technicianName: technician?.name,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error transferring device:', error);
      alert('حدث خطأ أثناء تحويل الجهاز');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">تحويل الجهاز</h2>
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
              <label className="form-label">تحويل إلى فني</label>
              <select
                className="form-select"
                value={selectedTechnician}
                onChange={(e) => {
                  setSelectedTechnician(e.target.value);
                  setNeedsApproval(false);
                }}
              >
                <option value="">اختر الفني</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>

            <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#6b7280' }}>أو</div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={needsApproval}
                  onChange={(e) => {
                    setNeedsApproval(e.target.checked);
                    if (e.target.checked) {
                      setSelectedTechnician('');
                    }
                  }}
                />
                <span className="form-label" style={{ margin: 0 }}>تحويل إلى انتظار الموافقة</span>
              </label>
            </div>

            {needsApproval && (
              <div className="form-group">
                <label className="form-label">سبب الموافقة</label>
                <textarea
                  className="form-textarea"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="أدخل سبب الموافقة..."
                  required={needsApproval}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedTechnician && !needsApproval}
            >
              تحويل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



