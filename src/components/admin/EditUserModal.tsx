import { useState } from 'react';
import { X } from 'lucide-react';
import { User, UserRole } from '../../types';
import { storage } from '../../utils/storage';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    password: '',
    name: user.name,
    role: user.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { firebaseService } = await import('../../services/firebaseService');
      const updates: any = {
        name: formData.name,
        role: formData.role,
        username: formData.username,
      };
      
      if (formData.password) {
        updates.password = formData.password;
      }

      const success = await firebaseService.updateUser(user.id, updates);
      if (success) {
        await storage.refreshUsers();
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('حدث خطأ أثناء تحديث المستخدم');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">تحرير المستخدم</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">الاسم الكامل *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">اسم المستخدم *</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">كلمة المرور الجديدة (اتركه فارغاً للحفاظ على القديمة)</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">نوع المستخدم *</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                required
              >
                <option value="operations">موظف العمليات</option>
                <option value="technician">فني</option>
                <option value="customer_service">خدمة العملاء</option>
                <option value="admin">مدير</option>
              </select>
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



