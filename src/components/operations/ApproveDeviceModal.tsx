import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Device, User } from '../../types';
import { storage } from '../../utils/storage';

interface ApproveDeviceModalProps {
  device: Device;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveDeviceModal({ device, user, onClose, onSuccess }: ApproveDeviceModalProps) {
  const [reportContent, setReportContent] = useState('');
  const [addReport, setAddReport] = useState(false);
  const [transferToTechnician, setTransferToTechnician] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [technicians, setTechnicians] = useState<User[]>([]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const allUsers = await storage.getUsers();
        setTechnicians(allUsers.filter(u => u.role === 'technician'));
      } catch (error: any) {
        console.error('Error loading technicians:', error);
        alert('حدث خطأ أثناء تحميل قائمة الفنيين. يرجى المحاولة مرة أخرى.');
      }
    };
    loadTechnicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updates: any = {
        updatedAt: new Date().toISOString(),
      };

      // Add report if provided
      if (addReport && reportContent.trim()) {
        await storage.addReport(device.id, {
          id: Date.now().toString(),
          deviceId: device.id,
          content: reportContent,
          authorId: user.id,
          authorName: user.name,
          authorRole: user.role,
          createdAt: new Date().toISOString(),
        });
      }

      // Transfer to technician if selected
      if (transferToTechnician && selectedTechnician) {
        const technician = technicians.find(t => t.id === selectedTechnician);
        updates.status = 'transferred';
        updates.location = 'technician';
        updates.technicianId = selectedTechnician;
        updates.technicianName = technician?.name;
        updates.needsApproval = false;
        updates.approvalReason = undefined;
      } else {
        // If not transferring, change status to received_from_technician and keep in operations
        updates.status = 'received_from_technician';
        updates.location = 'operations';
        updates.needsApproval = false;
        updates.approvalReason = undefined;
      }

      // Update device
      await storage.updateDevice(device.id, updates);

      onSuccess();
    } catch (error: any) {
      console.error('Error processing approval:', error);
      const errorMessage = error?.message || 'حدث خطأ أثناء معالجة الموافقة. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">موافقة على الجهاز</h2>
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
              {device.approvalReason && (
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#dc2626' }}>
                  <strong>سبب الموافقة:</strong> {device.approvalReason}
                </div>
              )}
            </div>

            {/* Add Report Option */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={addReport}
                  onChange={(e) => setAddReport(e.target.checked)}
                />
                <span className="form-label" style={{ margin: 0 }}>إضافة تقرير</span>
              </label>
              {addReport && (
                <textarea
                  className="form-textarea"
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="اكتب التقرير..."
                  rows={4}
                  style={{
                    marginTop: '0.5rem',
                    border: '2px solid #002147',
                    fontSize: '0.9375rem'
                  }}
                />
              )}
            </div>

            {/* Transfer to Technician Option */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={transferToTechnician}
                  onChange={(e) => {
                    setTransferToTechnician(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedTechnician('');
                    }
                  }}
                />
                <span className="form-label" style={{ margin: 0 }}>تحويل الجهاز إلى فني مرة أخرى</span>
              </label>
              {transferToTechnician && (
                <select
                  className="form-select"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  required={transferToTechnician}
                  style={{
                    marginTop: '0.5rem',
                    border: '2px solid #002147'
                  }}
                >
                  <option value="">اختر الفني</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(5, 150, 105, 0.1)', 
              borderRadius: '0.5rem',
              border: '1px solid #059669'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#047857', fontWeight: 600 }}>
                ملاحظة: الجهاز لن ينتقل تلقائياً إلى قسم المكتملة. يمكنك إضافة تقرير و/أو تحويله للفني.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={transferToTechnician && !selectedTechnician}
              style={{
                background: '#059669',
                color: 'white',
                fontWeight: 600
              }}
            >
              <Send size={16} />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

