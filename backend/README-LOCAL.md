# تشغيل السيرفر محلياً بدون Firebase

هذا الدليل يوضح كيفية تشغيل السيرفر محلياً باستخدام ملفات JSON بدلاً من Firebase.

## المميزات

- ✅ لا يحتاج Firebase أو أي خدمات خارجية
- ✅ البيانات تُحفظ في ملفات JSON محلية
- ✅ مناسب للاختبار والتطوير
- ✅ نفس API endpoints تماماً

## التثبيت

1. تأكد من تثبيت المكتبات:
```bash
cd backend
npm install
```

## التشغيل

### الطريقة 1: استخدام npm script

```bash
npm run start:local
```

أو للتطوير مع auto-reload:
```bash
npm run dev:local
```

### الطريقة 2: مباشرة

```bash
node server-local.js
```

## البيانات

- البيانات تُحفظ في مجلد `backend/data/`
- ملف `users.json` - يحتوي على المستخدمين
- ملف `devices.json` - يحتوي على الأجهزة

## المستخدمين الافتراضيين

عند أول تشغيل، سيتم إنشاء المستخدمين التالية تلقائياً:

- **Admin**: `admin` / `admin123`
- **Operations**: `operations` / `ops123`
- **Technician 1**: `technician1` / `tech123`
- **Technician 2**: `technician2` / `tech123`
- **Customer Service**: `customer_service` / `cs123`

## ملاحظات

1. **البيانات محلية**: جميع البيانات تُحفظ في ملفات JSON في مجلد `data/`
2. **لا حاجة لـ Firebase**: لا تحتاج أي إعدادات Firebase
3. **للإنتاج**: استخدم `server.js` مع Firebase عند الرفع للإنتاج
4. **النسخ الاحتياطي**: يمكنك نسخ مجلد `data/` كنسخة احتياطية

## الانتقال من المحلي إلى Firebase

عندما تريد الانتقال إلى Firebase:

1. استخدم `server.js` بدلاً من `server-local.js`
2. أضف ملف `.env` مع بيانات Firebase
3. فعّل Cloud Firestore API في Google Cloud Console
4. البيانات المحلية لن تُنقل تلقائياً - ستحتاج لنسخها يدوياً أو كتابة script للتحويل

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. تأكد من أن مجلد `data/` موجود ويمكن الكتابة فيه
2. تحقق من أن الملفات `users.json` و `devices.json` موجودة
3. إذا كانت الملفات تالفة، احذفها وستُعاد إنشاؤها تلقائياً

