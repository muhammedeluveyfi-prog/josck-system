import { ReactNode } from 'react';
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  title: string;
  user: { name: string; role: string };
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ title, user, onLogout, children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 33, 71, 0.1)',
        padding: '1rem 2rem',
        marginBottom: '2rem',
        borderBottom: '3px solid var(--secondary)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #C7B58D',
              padding: '6px',
              background: 'white',
              boxShadow: '0 4px 12px rgba(0, 33, 71, 0.15)',
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
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: 'var(--primary)',
              margin: 0
            }}>
              {title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--gray-700)',
              padding: '0.5rem 1rem',
              background: 'var(--gray-50)',
              borderRadius: '0.5rem',
              fontWeight: 600
            }}>
              <User size={18} color="var(--primary)" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'var(--secondary)',
                color: 'var(--primary)',
                fontWeight: 600,
                border: 'none'
              }}
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        {children}
      </main>
    </div>
  );
}


