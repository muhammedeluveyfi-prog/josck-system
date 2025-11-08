# ربط Frontend بالـ Backend API

تم ربط Frontend بالـ Backend API بنجاح! 🎉

## ما تم إنجازه:

1. ✅ إنشاء `src/services/apiService.ts` - Service للاتصال بالـ Backend API
2. ✅ تحديث `src/utils/storage.ts` - استخدام Backend API بدلاً من Firebase مباشرة
3. ✅ تحديث `src/pages/Login.tsx` - استخدام Backend API لتسجيل الدخول
4. ✅ تحديث `src/App.tsx` - إضافة logout function

## الإعداد:

### 1. متغير البيئة (اختياري)

يمكنك إضافة متغير البيئة في ملف `.env` في المجلد الرئيسي:

```env
VITE_API_URL=http://localhost:3000/api
```

**ملاحظة:** إذا لم تضيف هذا المتغير، سيستخدم النظام القيمة الافتراضية: `http://localhost:3000/api`

### 2. تشغيل السيرفر:

```bash
cd backend
npm start
```

### 3. تشغيل Frontend:

```bash
npm run dev
```

## كيفية العمل:

1. **تسجيل الدخول**: عند تسجيل الدخول، يتم إرسال الطلب إلى `POST /api/auth/login`
2. **Token**: يتم حفظ الـ JWT token في `localStorage` تلقائياً
3. **الطلبات**: جميع الطلبات التالية ترسل الـ token في header `Authorization: Bearer TOKEN`
4. **Logout**: عند تسجيل الخروج، يتم حذف الـ token من `localStorage`

## الحسابات الافتراضية:

- **Admin**: `admin` / `admin123`
- **Operations**: `operations` / `ops123`
- **Technician 1**: `technician1` / `tech123`
- **Technician 2**: `technician2` / `tech123`
- **Customer Service**: `customer_service` / `cs123`

## ملاحظات:

- جميع البيانات الآن تأتي من Backend API
- Firebase لا يزال مستخدم في Backend فقط
- Token صالح لمدة 7 أيام
- جميع endpoints محمية وتتطلب authentication



