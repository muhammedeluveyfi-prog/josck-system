import { Device } from '../types';

export interface TimeRemaining {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
}

/**
 * حساب الوقت المتبقي لإتمام إصلاح الجهاز
 */
export function calculateTimeRemaining(device: Device): TimeRemaining | null {
  // التحقق من وجود البيانات المطلوبة
  if (!device.scheduledStartDate) {
    return null;
  }

  // استخدام الحقول الجديدة (expectedDurationDays و expectedDurationHours) أو القديمة
  const days = device.expectedDurationDays || 0;
  const hours = device.expectedDurationHours || 0;
  
  // إذا لم تكن هناك مدة محددة، جرب الحقول القديمة
  if (days === 0 && hours === 0) {
    if (device.expectedDurationValue && device.expectedDurationUnit) {
      if (device.expectedDurationUnit === 'days') {
        const totalHours = device.expectedDurationValue * 24;
        const newDays = Math.floor(totalHours / 24);
        const newHours = totalHours % 24;
        return calculateFromValues(device.scheduledStartDate, newDays, newHours);
      } else {
        return calculateFromValues(device.scheduledStartDate, 0, device.expectedDurationValue);
      }
    }
    return null;
  }

  return calculateFromValues(device.scheduledStartDate, days, hours);
}

function calculateFromValues(scheduledStartDate: string, days: number, hours: number): TimeRemaining | null {
  const startDate = new Date(scheduledStartDate);
  const now = new Date();

  // حساب تاريخ الانتهاء المتوقع
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(endDate.getHours() + hours);

  // حساب الفرق بالمللي ثانية
  const diffMs = endDate.getTime() - now.getTime();
  const isExpired = diffMs < 0;

  // حساب الأيام والساعات والدقائق المتبقية
  const absDiffMs = Math.abs(diffMs);
  const remainingDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

  // تنسيق النص
  let formatted = '';
  if (isExpired) {
    formatted = 'انتهت المدة المتوقعة';
  } else {
    const parts: string[] = [];
    if (remainingDays > 0) {
      parts.push(`${remainingDays} ${remainingDays === 1 ? 'يوم' : 'يوم'}`);
    }
    if (remainingHours > 0) {
      parts.push(`${remainingHours} ${remainingHours === 1 ? 'ساعة' : 'ساعة'}`);
    }
    if (remainingMinutes > 0 && remainingDays === 0) {
      parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'دقيقة' : 'دقيقة'}`);
    }
    formatted = parts.length > 0 ? parts.join(' و ') : 'أقل من دقيقة';
  }

  return {
    isExpired,
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    formatted,
  };
}

/**
 * الحصول على جميع الأجهزة التي تحتاج إشعارات
 */
export function getDevicesWithNotifications(devices: Device[]): Device[] {
  return devices.filter(device => {
    // فقط الأجهزة النشطة (غير المكتملة)
    if (device.status === 'completed') {
      return false;
    }

    // يجب أن يكون لديها تاريخ بدء
    if (!device.scheduledStartDate) {
      return false;
    }

    // يجب أن يكون لديها مدة محددة (أيام أو ساعات)
    const hasNewFormat = (device.expectedDurationDays && device.expectedDurationDays > 0) || 
                         (device.expectedDurationHours && device.expectedDurationHours > 0);
    const hasOldFormat = device.expectedDurationValue && device.expectedDurationUnit;
    
    if (!hasNewFormat && !hasOldFormat) {
      return false;
    }

    return true;
  });
}

