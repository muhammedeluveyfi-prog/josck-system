import { ReactNode, useState, useEffect } from 'react';
import { LogOut, User, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { storage } from '../utils/storage';
import { Device } from '../types';
import { getDevicesWithNotifications, calculateTimeRemaining, TimeRemaining } from '../utils/timeUtils';

// دالة مساعدة لحساب الوقت المتبقي مع وقت محدد
function calculateTimeRemainingWithDate(
  scheduledStartDate: string, 
  days: number, 
  hours: number, 
  currentTime: Date
): TimeRemaining | null {
  const startDate = new Date(scheduledStartDate);
  const now = currentTime;

  // حساب تاريخ الانتهاء المتوقع (من تاريخ البدء + المدة المتوقعة)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(endDate.getHours() + hours);

  // حساب الفرق بالمللي ثانية
  const diffMs = endDate.getTime() - now.getTime();
  const isExpired = diffMs < 0;

  // حساب الأيام والساعات والدقائق والثواني المتبقية
  const absDiffMs = Math.abs(diffMs);
  const remainingDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((absDiffMs % (1000 * 60)) / 1000);

  // حساب إجمالي الساعات (بما في ذلك الأيام)
  const totalHours = remainingDays * 24 + remainingHours;

  return {
    isExpired,
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    formatted: '', // لن نستخدم formatted في العرض الحي
    // إضافة الثواني وإجمالي الساعات
    seconds: remainingSeconds,
    totalHours: totalHours,
  } as TimeRemaining & { seconds: number; totalHours: number };
}

interface LayoutProps {
  title: string;
  user: { name: string; role: string };
  onLogout: () => void;
  children: ReactNode;
  showNotifications?: boolean; // إخفاء الإشعارات إذا كان false
}

export default function Layout({ title, user, onLogout, children, showNotifications = true }: LayoutProps) {
  const [notifications, setNotifications] = useState<Array<{ device: Device; timeRemaining: ReturnType<typeof calculateTimeRemaining> }>>([]);
  const [showExpiredDetails, setShowExpiredDetails] = useState(false);
  const [hiddenExpiredDevices, setHiddenExpiredDevices] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showOtherDevices, setShowOtherDevices] = useState(false);

  useEffect(() => {
    const updateNotifications = async () => {
      try {
        const allDevices = await storage.getDevices();
        const devicesWithNotifications = getDevicesWithNotifications(allDevices);
        
        const notificationsData = devicesWithNotifications
          .map(device => {
            const timeRemaining = calculateTimeRemaining(device);
            return timeRemaining ? { device, timeRemaining } : null;
          })
          .filter((item): item is { device: Device; timeRemaining: TimeRemaining } => item !== null);

        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error updating notifications:', error);
      }
    };

    // تحديث فوري
    updateNotifications();

    // تحديث كل دقيقة
    const interval = setInterval(updateNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  // عداد تنازلي حي - تحديث كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExpiredDetails && !target.closest('[data-notification-dropdown]')) {
        setShowExpiredDetails(false);
      }
      if (showOtherDevices && !target.closest('[data-other-devices-dropdown]')) {
        setShowOtherDevices(false);
      }
    };

    if (showExpiredDetails || showOtherDevices) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExpiredDetails, showOtherDevices]);

  const activeNotifications = notifications.filter(n => n.timeRemaining && !n.timeRemaining.isExpired);
  const expiredNotifications = notifications.filter(n => n.timeRemaining && n.timeRemaining.isExpired && !hiddenExpiredDevices.has(n.device.id));
  
  // حساب الوقت المتبقي الحالي للجهاز الأول (للعرض الحي) - يتم تحديثه كل ثانية
  const firstActiveNotification = activeNotifications[0];
  // استخدام currentTime لضمان التحديث كل ثانية
  const liveTimeRemaining = firstActiveNotification 
    ? (() => {
        const device = firstActiveNotification.device;
        if (!device.scheduledStartDate) return null;
        
        const days = device.expectedDurationDays || 0;
        const hours = device.expectedDurationHours || 0;
        
        if (days === 0 && hours === 0) {
          if (device.expectedDurationValue && device.expectedDurationUnit) {
            if (device.expectedDurationUnit === 'days') {
              const totalHours = device.expectedDurationValue * 24;
              const newDays = Math.floor(totalHours / 24);
              const newHours = totalHours % 24;
              return calculateTimeRemainingWithDate(device.scheduledStartDate, newDays, newHours, currentTime);
            } else {
              return calculateTimeRemainingWithDate(device.scheduledStartDate, 0, device.expectedDurationValue, currentTime);
            }
          }
          return null;
        }
        
        return calculateTimeRemainingWithDate(device.scheduledStartDate, days, hours, currentTime);
      })()
    : null;

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
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header Row 1: Logo, Title, User, Logout */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: activeNotifications.length > 0 || expiredNotifications.length > 0 ? '1rem' : '0'
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

          {/* Header Row 2: Notifications */}
          {showNotifications && (activeNotifications.length > 0 || expiredNotifications.length > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              {/* Red Notifications - Left Side */}
              {expiredNotifications.length > 0 && (
                <div 
                  data-notification-dropdown
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                >
                  {expiredNotifications.slice(0, 1).map(({ device }) => (
                    <div
                      key={device.id}
                      style={{
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        border: '1.5px solid #dc2626',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                        position: 'relative',
                        minWidth: '150px',
                        width: 'auto',
                        maxWidth: '190px',
                        transition: 'all 0.3s ease',
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          background: 'rgba(220, 38, 38, 0.2)',
                          borderRadius: '50%',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <AlertTriangle size={12} color="#dc2626" />
                        </div>
                        <div style={{ flex: 1, minWidth: '70px' }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#dc2626',
                            marginBottom: '0.125rem',
                            lineHeight: '1.2'
                          }}>
                            {device.deviceName}
                          </div>
                          <div style={{
                            fontSize: '0.6875rem',
                            color: '#991b1b',
                            fontWeight: 600
                          }}>
                            <span style={{
                              background: 'rgba(220, 38, 38, 0.15)',
                              padding: '0.0625rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 700
                            }}>
                              انتهت المدة
                            </span>
                          </div>
                        </div>
                        {expiredNotifications.length > 1 && (
                          <button
                            onClick={() => setShowExpiredDetails(!showExpiredDetails)}
                            style={{
                              background: 'rgba(220, 38, 38, 0.25)',
                              border: '1px solid #dc2626',
                              borderRadius: '0.375rem',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 3px rgba(220, 38, 38, 0.2)',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.35)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.25)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(220, 38, 38, 0.2)';
                            }}
                          >
                            رؤية جميع الأجهزة
                            <ChevronDown 
                              size={12} 
                              style={{ 
                                transform: showExpiredDetails ? 'rotate(180deg)' : 'rotate(0deg)', 
                                transition: 'transform 0.3s ease' 
                              }} 
                            />
                          </button>
                        )}
                        <button
                          onClick={() => setHiddenExpiredDevices(prev => new Set([...prev, device.id]))}
                          style={{
                            background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid #dc2626',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                          }}
                        >
                          <X size={12} color="#dc2626" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Expired Details Dropdown - Positioned absolutely above content */}
                  {showExpiredDetails && expiredNotifications.length > 1 && (
                    <div 
                      data-notification-dropdown
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        border: '2px solid #dc2626',
                        borderRadius: '0.75rem',
                        padding: '0.75rem',
                        boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                        minWidth: '280px',
                        maxWidth: '380px',
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        zIndex: 1000,
                        animation: 'slideDown 0.3s ease'
                      }}
                    >
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        marginBottom: '0.75rem',
                        textAlign: 'right',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(220, 38, 38, 0.3)'
                      }}>
                        جميع الأجهزة ({expiredNotifications.length})
                      </div>
                      {expiredNotifications.map(({ device: expiredDevice }, index) => (
                        <div
                          key={expiredDevice.id}
                          style={{
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.6)',
                            borderRadius: '0.5rem',
                            marginBottom: index < expiredNotifications.length - 1 ? '0.625rem' : '0',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              color: '#dc2626',
                              marginBottom: '0.25rem'
                            }}>
                              {expiredDevice.deviceName}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#991b1b',
                              fontWeight: 500
                            }}>
                              انتهت المدة المتوقعة
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              background: 'rgba(220, 38, 38, 0.15)',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <AlertTriangle size={16} color="#dc2626" />
                            </div>
                            <button
                              onClick={() => setHiddenExpiredDevices(prev => new Set([...prev, expiredDevice.id]))}
                              style={{
                                background: 'rgba(220, 38, 38, 0.2)',
                                border: '1px solid #dc2626',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                flexShrink: 0
                              }}
                            >
                              <X size={12} color="#dc2626" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Yellow Notifications - Right Side - مربع واحد فقط */}
              {firstActiveNotification && liveTimeRemaining && !liveTimeRemaining.isExpired && (
                <div 
                  data-other-devices-dropdown
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                      minWidth: '160px',
                      maxWidth: '200px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.375rem'
                    }}>
                      {/* اسم الجهاز */}
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#92400e',
                        textAlign: 'right',
                        marginBottom: '0.125rem'
                      }}>
                        {firstActiveNotification.device.deviceName}
                      </div>
                      
                      {/* العد التنازلي بصيغة ساعة:دقيقة:ثانية */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          fontSize: '1.125rem',
                          color: '#78350f',
                          fontWeight: 700,
                          background: 'rgba(245, 158, 11, 0.15)',
                          padding: '0.375rem 0.625rem',
                          borderRadius: '0.375rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          textAlign: 'center',
                          minWidth: '90px'
                        }}>
                          {(() => {
                            const totalHours = (liveTimeRemaining as any).totalHours || liveTimeRemaining.hours;
                            const minutes = liveTimeRemaining.minutes;
                            const seconds = (liveTimeRemaining as any).seconds || 0;
                            return `${totalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                          })()}
                        </div>
                      </div>

                      {/* زر باقي الأجهزة */}
                      {activeNotifications.length > 1 && (
                        <button
                          onClick={() => setShowOtherDevices(!showOtherDevices)}
                          style={{
                            background: 'rgba(245, 158, 11, 0.25)',
                            border: '1px solid #f59e0b',
                            borderRadius: '0.375rem',
                            padding: '0.375rem 0.5rem',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#92400e',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s',
                            marginTop: '0.375rem',
                            width: '100%'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.35)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          باقي الأجهزة ({activeNotifications.length - 1})
                          <ChevronDown 
                            size={12} 
                            style={{ 
                              transform: showOtherDevices ? 'rotate(180deg)' : 'rotate(0deg)', 
                              transition: 'transform 0.3s ease' 
                            }} 
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* قائمة باقي الأجهزة */}
                  {showOtherDevices && activeNotifications.length > 1 && (
                    <div 
                      data-other-devices-dropdown
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        border: '2px solid #f59e0b',
                        borderRadius: '0.75rem',
                        padding: '0.75rem',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                        minWidth: '300px',
                        maxWidth: '400px',
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        zIndex: 1000,
                        animation: 'slideDown 0.3s ease'
                      }}
                    >
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#92400e',
                        marginBottom: '0.75rem',
                        textAlign: 'right',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
                        باقي الأجهزة ({activeNotifications.length - 1})
                      </div>
                      {activeNotifications.slice(1).map(({ device }, index) => {
                        const deviceTimeRemaining = (() => {
                          if (!device.scheduledStartDate) return null;
                          const days = device.expectedDurationDays || 0;
                          const hours = device.expectedDurationHours || 0;
                          if (days === 0 && hours === 0) {
                            if (device.expectedDurationValue && device.expectedDurationUnit) {
                              if (device.expectedDurationUnit === 'days') {
                                const totalHours = device.expectedDurationValue * 24;
                                const newDays = Math.floor(totalHours / 24);
                                const newHours = totalHours % 24;
                                return calculateTimeRemainingWithDate(device.scheduledStartDate, newDays, newHours, currentTime);
                              } else {
                                return calculateTimeRemainingWithDate(device.scheduledStartDate, 0, device.expectedDurationValue, currentTime);
                              }
                            }
                            return null;
                          }
                          return calculateTimeRemainingWithDate(device.scheduledStartDate, days, hours, currentTime);
                        })();

                        if (!deviceTimeRemaining || deviceTimeRemaining.isExpired) return null;

                        return (
                          <div
                            key={device.id}
                            style={{
                              padding: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.6)',
                              borderRadius: '0.5rem',
                              marginBottom: index < activeNotifications.length - 2 ? '0.625rem' : '0',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                            }}
                          >
                            <div>
                              <div style={{
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                color: '#92400e',
                                marginBottom: '0.375rem',
                                textAlign: 'right'
                              }}>
                                {device.deviceName}
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}>
                                <div style={{
                                  fontSize: '0.9375rem',
                                  color: '#78350f',
                                  fontWeight: 700,
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.05em',
                                  textAlign: 'center',
                                  minWidth: '75px'
                                }}>
                                  {(() => {
                                    const totalHours = (deviceTimeRemaining as any).totalHours || deviceTimeRemaining.hours;
                                    const minutes = deviceTimeRemaining.minutes;
                                    const seconds = (deviceTimeRemaining as any).seconds || 0;
                                    return `${totalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 2rem' }}>
        {children}
      </main>
    </div>
  );
}


