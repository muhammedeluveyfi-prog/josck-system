import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';
import { User } from './types';
import { storage } from './utils/storage';
import { apiService } from './services/apiService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = storage.getCurrentUser();
        const token = localStorage.getItem('josck_auth_token');
        
        // Only verify token if both user and token exist
        if (user && token) {
          try {
            await apiService.verifyToken();
            setCurrentUser(user);
          } catch (error) {
            // Token invalid or expired, silently clear user data
            // Don't show error message - just redirect to login
            console.log('Token invalid or expired, clearing session');
            storage.setCurrentUser(null);
            apiService.logout();
            setCurrentUser(null);
          }
        } else {
          // No user or token, ensure clean state
          if (!token && user) {
            storage.setCurrentUser(null);
            apiService.logout();
          }
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // On any error, clear user data
        storage.setCurrentUser(null);
        apiService.logout();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    apiService.logout();
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={`/${currentUser.role}`} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            currentUser?.role === 'admin' ? (
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/operations"
          element={
            currentUser?.role === 'operations' ? (
              <OperationsDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/technician"
          element={
            currentUser?.role === 'technician' ? (
              <TechnicianDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customer_service"
          element={
            currentUser?.role === 'customer_service' ? (
              <CustomerServiceDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



