import { useState } from 'react';
import { X } from 'lucide-react';
import { User, UserRole } from '../../types';
import { storage } from '../../utils/storage';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operations' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addedUserName, setAddedUserName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // التحقق من أن جميع الحقول مملوءة
      if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // التحقق من طول كلمة المرور
      if (formData.password.length < 4) {
        setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
        setLoading(false);
        return;
      }

      // التحقق من أن اسم المستخدم غير موجود
      let users: User[];
      try {
        users = await storage.getUsers();
      } catch (getUsersError: any) {
        console.error('Error getting users:', getUsersError);
        let errorMessage = 'فشل في جلب قائمة المستخدمين. ';
        if (getUsersError?.message) {
          errorMessage += getUsersError.message;
        } else {
          errorMessage += 'تأكد من أن السيرفر يعمل على http://localhost:3000';
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase().trim())) {
        setError('اسم المستخدم موجود بالفعل');
        setLoading(false);
        return;
      }

      // إضافة المستخدم
      const userNameToShow = formData.name.trim();
      let newUser: User | null;
      try {
        newUser = await storage.addUser({
          username: formData.username.trim(),
          password: formData.password,
          name: userNameToShow,
          role: formData.role,
        });
      } catch (addUserError: any) {
        console.error('Error adding user:', addUserError);
        throw addUserError; // Re-throw to be caught by outer catch
      }

      if (newUser && newUser.id) {
        setAddedUserName(userNameToShow);
        setSuccess(true);
        setLoading(false);
        
        // إغلاق النافذة وإعادة تحميل البيانات بعد ثانية ونصف
        setTimeout(() => {
          // إعادة تعيين النموذج
          setFormData({
            username: '',
            password: '',
            name: '',
            role: 'operations',
          });
          setSuccess(false);
          setAddedUserName('');
          setError('');
          onSuccess();
        }, 1500);
      } else {
        setError('حدث خطأ أثناء إضافة المستخدم. يرجى التحقق من أنك مسجل دخول كمدير.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      let errorMessage = 'حدث خطأ أثناء إضافة المستخدم';
      
      if (error?.message) {
        if (error.message.includes('Access token required') || error.message.includes('Invalid or expired token')) {
          errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
        } else if (error.message.includes('Admin access required')) {
          errorMessage = 'ليس لديك صلاحية لإضافة مستخدمين. يجب أن تكون مدير.';
        } else if (error.message.includes('لا يمكن الاتصال بالسيرفر') || error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'لا يمكن الاتصال بالسيرفر. تأكد من أن السيرفر يعمل على http://localhost:3000';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">إضافة مستخدم جديد</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                padding: '0.875rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{
                padding: '0.875rem',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span>تم إضافة المستخدم "{addedUserName || 'الجديد'}" بنجاح!</span>
              </div>
            )}

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
              <label className="form-label">كلمة المرور *</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
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
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || success}
            >
              {loading ? 'جاري الإضافة...' : success ? 'تمت الإضافة ✓' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



