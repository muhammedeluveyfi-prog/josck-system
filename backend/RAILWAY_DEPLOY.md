# دليل رفع السيرفر على Railway

## الخطوات السريعة

### 1. رفع المشروع على GitHub (إذا لم يكن مرفوعاً)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/josck-system.git
git push -u origin main
```

### 2. ربط المشروع مع Railway

1. اذهب إلى [Railway.app](https://railway.app)
2. اضغط على **New Project**
3. اختر **Deploy from GitHub repo**
4. اختر repository المشروع
5. Railway سيكتشف المشروع تلقائياً

### 3. إعدادات المشروع في Railway

#### أ. تحديد مجلد Backend:
- اضغط على المشروع
- اذهب إلى **Settings** → **Root Directory**
- أدخل: `backend`

#### ب. إعداد Start Command:
- اذهب إلى **Settings** → **Deploy**
- Start Command: `npm start`
- أو اتركه فارغاً (سيستخدم `npm start` تلقائياً)

#### ج. إعداد Port:
- Railway يحدد المنفذ تلقائياً
- لا حاجة لإعداد PORT يدوياً

#### د. متغيرات البيئة (Environment Variables):
- اذهب إلى **Variables**
- أضف المتغيرات التالية (اختياري):
  ```
  NODE_ENV=production
  PORT=3000
  JWT_SECRET=your-secret-key-here-change-this
  ```

### 4. النشر (Deploy)

- Railway سيبدأ النشر تلقائياً
- انتظر حتى يكتمل البناء (Build)
- ستحصل على رابط مثل: `https://your-app-name.up.railway.app`

### 5. الحصول على رابط السيرفر

- بعد النشر، اذهب إلى **Settings** → **Networking**
- اضغط على **Generate Domain**
- ستحصل على رابط مثل: `https://josck-backend.up.railway.app`
- **احفظ هذا الرابط** - ستحتاجه للـ Frontend

### 6. اختبار السيرفر

افتح المتصفح واذهب إلى:
```
https://your-app-name.up.railway.app/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## إعداد Frontend للاتصال بالسيرفر

### 1. في Vercel/Netlify:

أضف متغير البيئة:
```
VITE_API_URL=https://your-app-name.up.railway.app/api
```

### 2. أو عدّل ملف `.env` محلياً:
```
VITE_API_URL=https://your-app-name.up.railway.app/api
```

## ملاحظات مهمة

1. **البيانات**: البيانات ستُحفظ في ملفات JSON على السيرفر في Railway
2. **النسخ الاحتياطي**: يمكنك نسخ مجلد `data/` قبل الرفع
3. **CORS**: تم إعداد CORS للسماح بجميع النطاقات (يمكنك تقييدها لاحقاً)
4. **المنفذ**: Railway يحدد المنفذ تلقائياً - لا حاجة لإعداد PORT

## استكشاف الأخطاء

### المشكلة: السيرفر لا يعمل
- تحقق من **Logs** في Railway
- تأكد من أن `npm start` يعمل محلياً
- تحقق من أن جميع المكتبات مثبتة

### المشكلة: CORS Error
- تأكد من أن CORS في `server-local.js` يسمح بنطاق Frontend
- يمكنك تعديل `allowedOrigins` في `server-local.js`

### المشكلة: البيانات لا تظهر
- تحقق من أن مجلد `data/` موجود
- تحقق من صلاحيات الكتابة في Railway

## الخطوات التالية

1. ✅ رفع Backend على Railway
2. ⏭️ رفع Frontend على Vercel/Netlify
3. ⏭️ إضافة رابط Backend في Frontend
4. ⏭️ اختبار التطبيق الكامل

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من **Logs** في Railway
2. تأكد من أن جميع الخطوات تمت بشكل صحيح
3. راجع ملف `README-LOCAL.md` للتفاصيل

