import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { storage } from '../utils/storage';
import { apiService } from '../services/apiService';
import { LogIn, AlertCircle, Smartphone, CircuitBoard, Wrench, Shield, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing error when component mounts
  useEffect(() => {
    setError('');
    // Clear any invalid tokens
    const token = localStorage.getItem('josck_auth_token');
    if (token) {
      // Token exists, but if we're on login page, it might be invalid
      // We'll let the login attempt verify it
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!username.trim() || !password.trim()) {
        setError('يرجى إدخال اسم المستخدم وكلمة المرور');
        setLoading(false);
        return;
      }

      // Use Backend API for login
      const response = await apiService.login(username.trim(), password);
      
      if (response.token && response.user) {
        // Save user to localStorage
        storage.setCurrentUser(response.user);
        onLogin(response.user);
        navigate(`/${response.user.role}`);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
      
      if (error?.message) {
        if (error.message.includes('Invalid username or password')) {
          errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
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
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #002147 0%, #003366 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 33, 71, 0.4)',
              transition: 'all 0.3s',
              marginTop: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 33, 71, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 33, 71, 0.4)';
              }
            }}
          >
            <LogIn size={20} style={{ marginLeft: '0.5rem' }} />
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

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

