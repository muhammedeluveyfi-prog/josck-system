import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { storage } from '../utils/storage';
import { LogIn, AlertCircle, Smartphone, CircuitBoard, Wrench, Shield, User as UserIcon, UserPlus, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'operations' as UserRole,
  });
  const [signupError, setSignupError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.getUsers();
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user);
      navigate(`/${user.role}`);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('كلمة المرور غير متطابقة');
      return;
    }

    if (signupData.password.length < 4) {
      setSignupError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }

    const users = storage.getUsers();
    if (users.some(u => u.username === signupData.username)) {
      setSignupError('اسم المستخدم موجود بالفعل');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: signupData.name,
      username: signupData.username,
      password: signupData.password,
      role: signupData.role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    storage.saveUsers(users);
    
    // تسجيل الدخول تلقائياً بعد إنشاء الحساب
    onLogin(newUser);
    navigate(`/${newUser.role}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #002147 0%, #003366 50%, #002147 100%)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s infinite linear',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        opacity: 0.1,
        transform: 'rotate(45deg)'
      }}>
        <CircuitBoard size={200} color="white" />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        opacity: 0.1,
        transform: 'rotate(-45deg)'
      }}>
        <Smartphone size={150} color="white" />
      </div>

      <div className="card" style={{ 
        maxWidth: '450px', 
        width: '100%',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        border: `2px solid #C7B58D`,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header with logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2.5rem',
          paddingTop: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #C7B58D',
              padding: '10px',
              background: 'white',
              boxShadow: '0 8px 24px rgba(0, 33, 71, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo.png" 
                alt="JOSCK Logo" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%'
                }} 
              />
            </div>
          </div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '0.5rem',
            color: '#002147'
          }}>
            نظام إدارة الأجهزة
          </h1>
          
          <p style={{ 
            color: '#6c757d', 
            fontSize: '0.9375rem',
            fontWeight: 500
          }}>
            JOSCK Electronics Management System
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#002147',
              padding: '0.25rem 0.75rem',
              background: 'rgba(199, 181, 141, 0.2)',
              borderRadius: '20px',
              border: '1px solid rgba(199, 181, 141, 0.3)'
            }}>
              <Smartphone size={14} color="#002147" />
              <span>إدارة الأجهزة</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#002147',
              padding: '0.25rem 0.75rem',
              background: 'rgba(199, 181, 141, 0.2)',
              borderRadius: '20px',
              border: '1px solid rgba(199, 181, 141, 0.3)'
            }}>
              <Wrench size={14} color="#002147" />
              <span>تتبع الصيانة</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.875rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <UserIcon size={16} color="#64748b" />
              اسم المستخدم
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="أدخل اسم المستخدم"
              style={{
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                border: '2px solid #e9ecef',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#002147';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 33, 71, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <Shield size={16} color="#64748b" />
              كلمة المرور
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
              style={{
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                border: '2px solid #e9ecef',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#002147';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 33, 71, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #002147 0%, #003366 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 33, 71, 0.4)',
              transition: 'all 0.3s',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 33, 71, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 33, 71, 0.4)';
            }}
          >
            <LogIn size={20} style={{ marginLeft: '0.5rem' }} />
            تسجيل الدخول
          </button>
        </form>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '1.5rem 0',
          gap: '1rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e9ecef' }}></div>
          <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>أو</span>
          <div style={{ flex: 1, height: '1px', background: '#e9ecef' }}></div>
        </div>

        {/* Signup Button */}
        {!showSignup && (
          <button 
            type="button"
            onClick={() => setShowSignup(true)}
            className="btn btn-accent" 
            style={{ 
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#C7B58D',
              color: '#002147',
              border: '2px solid #C7B58D',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(199, 181, 141, 0.3)';
              e.currentTarget.style.background = '#d4c4a0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = '#C7B58D';
            }}
          >
            <UserPlus size={20} style={{ marginLeft: '0.5rem' }} />
            إنشاء حساب جديد
          </button>
        )}

        {/* Signup Form */}
        {showSignup && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(199, 181, 141, 0.05)',
            borderRadius: '0.75rem',
            border: '2px solid rgba(199, 181, 141, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: '#002147',
                margin: 0
              }}>
                إنشاء حساب جديد
              </h3>
              <button
                onClick={() => {
                  setShowSignup(false);
                  setSignupError('');
                  setSignupData({
                    name: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    role: 'operations',
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSignup}>
              {signupError && (
                <div style={{
                  padding: '0.875rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <AlertCircle size={18} />
                  {signupError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input
                  type="text"
                  className="form-input"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div className="form-group">
                <label className="form-label">اسم المستخدم *</label>
                <input
                  type="text"
                  className="form-input"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  required
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور *</label>
                <input
                  type="password"
                  className="form-input"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={4}
                  placeholder="أدخل كلمة المرور (4 أحرف على الأقل)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور *</label>
                <input
                  type="password"
                  className="form-input"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع المستخدم *</label>
                <select
                  className="form-select"
                  value={signupData.role}
                  onChange={(e) => setSignupData({ ...signupData, role: e.target.value as UserRole })}
                  required
                >
                  <option value="operations">موظف العمليات</option>
                  <option value="technician">فني</option>
                  <option value="customer_service">خدمة العملاء</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #002147 0%, #003366 100%)',
                  border: 'none',
                  marginTop: '0.5rem'
                }}
              >
                <UserPlus size={18} style={{ marginLeft: '0.5rem' }} />
                إنشاء الحساب
              </button>
            </form>
          </div>
        )}

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.25rem', 
          background: 'rgba(199, 181, 141, 0.1)',
          borderRadius: '0.75rem', 
          fontSize: '0.8125rem', 
          color: '#495057',
          border: `2px solid rgba(199, 181, 141, 0.3)`
        }}>
          <p style={{ 
            fontWeight: 700, 
            marginBottom: '1rem',
            color: '#002147',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Shield size={16} color="#002147" />
            حسابات تجريبية:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.75rem',
            fontSize: '0.75rem'
          }}>
            <div style={{ 
              padding: '0.5rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              border: '1px solid rgba(199, 181, 141, 0.2)'
            }}>
              <strong style={{ color: '#002147' }}>مدير:</strong> admin / admin123
            </div>
            <div style={{ 
              padding: '0.5rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              border: '1px solid rgba(199, 181, 141, 0.2)'
            }}>
              <strong style={{ color: '#002147' }}>عمليات:</strong> operations / ops123
            </div>
            <div style={{ 
              padding: '0.5rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              border: '1px solid rgba(199, 181, 141, 0.2)'
            }}>
              <strong style={{ color: '#002147' }}>فني:</strong> technician1 / tech123
            </div>
            <div style={{ 
              padding: '0.5rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              border: '1px solid rgba(199, 181, 141, 0.2)'
            }}>
              <strong style={{ color: '#002147' }}>خدمة عملاء:</strong> cs / cs123
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-50px, -50px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

