# JOSCK System - Backend API Server

سيرفر API منفصل لنظام إدارة العمليات JOSCK System.

## المميزات

- ✅ RESTful API كامل
- ✅ اتصال مع Firebase Firestore
- ✅ CORS مفعّل للاتصال من Frontend
- ✅ جميع عمليات CRUD للمستخدمين والأجهزة
- ✅ دعم البحث بعدة معايير

## التثبيت

1. تثبيت المكتبات:
```bash
cd backend
npm install
```

2. إعداد متغيرات البيئة:
- تأكد من أن ملف `.env` موجود ويحتوي على بيانات Firebase الصحيحة

3. تشغيل السيرفر:
```bash
npm start
```

أو للتطوير مع auto-reload:
```bash
npm run dev
```

السيرفر سيعمل على: `http://localhost:3000`

## Authentication (المصادقة)

### تسجيل الدخول

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "admin",
    "name": "مدير النظام",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### استخدام Token

أرسل الـ token في header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### التحقق من Token

**Endpoint:** `GET /api/auth/verify`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## API Endpoints

### Users (المستخدمين)

- `GET /api/users` - جلب جميع المستخدمين
- `GET /api/users/:id` - جلب مستخدم بالـ ID
- `GET /api/users/username/:username` - جلب مستخدم بالاسم
- `POST /api/users` - إضافة مستخدم جديد
- `PUT /api/users/:id` - تحديث مستخدم
- `DELETE /api/users/:id` - حذف مستخدم

### Devices (الأجهزة)

- `GET /api/devices` - جلب جميع الأجهزة
- `GET /api/devices/:id` - جلب جهاز بالـ ID
- `GET /api/devices/status/:status` - جلب أجهزة بحالة معينة
- `GET /api/devices/technician/:technicianId` - جلب أجهزة لفني معين
- `GET /api/devices/order/:orderNumber` - جلب جهاز برقم الطلب
- `GET /api/devices/phone/:phoneNumber` - جلب جهاز برقم الهاتف
- `POST /api/devices` - إضافة جهاز جديد
- `PUT /api/devices/:id` - تحديث جهاز
- `POST /api/devices/:id/reports` - إضافة تقرير لجهاز
- `DELETE /api/devices/:id` - حذف جهاز

### Health Check

- `GET /api/health` - فحص حالة السيرفر

## مثال على الاستخدام

### جلب جميع الأجهزة:
```bash
curl http://localhost:3000/api/devices
```

### إضافة جهاز جديد:
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD001",
    "deviceName": "iPhone 12",
    "imei": "123456789",
    "faultType": "شاشة مكسورة",
    "status": "new",
    "location": "operations"
  }'
```

## ملاحظات

- السيرفر يستخدم Firebase Firestore كقاعدة بيانات
- يجب إعداد Firebase قبل تشغيل السيرفر
- CORS مفعّل للسماح بالاتصال من Frontend على `http://localhost:5173`

