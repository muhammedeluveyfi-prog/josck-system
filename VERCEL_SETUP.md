# 🚀 دليل إعداد Vercel - JOSCK System

## ✅ الخطوات الأساسية لإعداد المشروع على Vercel

### 1️⃣ ربط المشروع مع GitHub (تم بالفعل)

المشروع مرتبط بالفعل مع Vercel. يمكنك التحقق من:
- Vercel Dashboard: https://vercel.com/dashboard
- المشروع: `josck-system`

### 2️⃣ إضافة متغيرات البيئة في Vercel

**هذه الخطوة مهمة جداً!** بدونها لن يعمل Firebase بشكل صحيح.

#### خطوات الإضافة:

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع `josck-system`
3. اضغط على **Settings** من القائمة العلوية
4. اضغط على **Environment Variables** من القائمة الجانبية
5. أضف المتغيرات التالية واحدة تلو الأخرى:

#### متغيرات Firebase (مطلوبة):

```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### متغير API Backend (إذا كان لديك backend):

```
VITE_API_URL=https://your-backend-url.com/api
```

**مثال:**
```
VITE_API_URL=https://web-production-83e93.up.railway.app/api
```

### 3️⃣ أين تجد قيم Firebase؟

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. اضغط على ⚙️ **Project Settings** (إعدادات المشروع)
4. اذهب إلى تبويب **General**
5. ابحث عن **Your apps** > **Web app** (أو أنشئ واحداً جديداً)
6. انسخ القيم من `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",           // ← VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",                // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com", // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"          // ← VITE_FIREBASE_APP_ID
};
```

### 4️⃣ إعداد Environment لكل بيئة

في Vercel، يمكنك إضافة متغيرات لبيئات مختلفة:

- **Production**: للنسخة النهائية المنشورة
- **Preview**: للنسخ التجريبية (من Pull Requests)
- **Development**: للتطوير المحلي

**نصيحة:** أضف المتغيرات لجميع البيئات (Production, Preview, Development)

### 5️⃣ إعادة النشر بعد إضافة المتغيرات

بعد إضافة جميع المتغيرات:

1. اذهب إلى **Deployments** في Vercel Dashboard
2. اضغط على **Redeploy** على آخر deployment
3. أو ادفع تغيير جديد إلى GitHub (سيتم النشر تلقائياً)

### 6️⃣ التحقق من النشر

بعد النشر:

1. افتح رابط المشروع من Vercel (مثل: `https://josck-system.vercel.app`)
2. افتح Developer Tools (F12)
3. اذهب إلى Console
4. يجب ألا ترى أخطاء Firebase
5. جرب تسجيل الدخول

### 7️⃣ إعدادات Build في Vercel

Vercel يكتشف تلقائياً أن المشروع يستخدم Vite، لكن يمكنك التحقق من:

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

هذه الإعدادات موجودة في `vercel.json` بالفعل ✅

---

## 📋 قائمة التحقق (Checklist)

- [ ] إضافة `VITE_FIREBASE_API_KEY` في Vercel
- [ ] إضافة `VITE_FIREBASE_AUTH_DOMAIN` في Vercel
- [ ] إضافة `VITE_FIREBASE_PROJECT_ID` في Vercel
- [ ] إضافة `VITE_FIREBASE_STORAGE_BUCKET` في Vercel
- [ ] إضافة `VITE_FIREBASE_MESSAGING_SENDER_ID` في Vercel
- [ ] إضافة `VITE_FIREBASE_APP_ID` في Vercel
- [ ] إضافة `VITE_API_URL` (إذا كان لديك backend)
- [ ] إعادة نشر المشروع
- [ ] التحقق من أن الموقع يعمل بشكل صحيح

---

## 🔧 استكشاف الأخطاء

### المشكلة: Firebase لا يعمل
**الحل:** تأكد من إضافة جميع متغيرات `VITE_FIREBASE_*` في Vercel

### المشكلة: الموقع يعرض صفحة بيضاء
**الحل:** 
1. افتح Console في المتصفح (F12)
2. تحقق من الأخطاء
3. تأكد من أن جميع المتغيرات موجودة

### المشكلة: Backend لا يعمل
**الحل:** تأكد من إضافة `VITE_API_URL` بالقيمة الصحيحة

---

## 📞 روابط مفيدة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

## ✅ ملاحظات مهمة

1. **VITE_**: جميع متغيرات البيئة في Vite يجب أن تبدأ بـ `VITE_`
2. **لا ترفع `.env`**: لا ترفع ملف `.env` إلى GitHub (يجب أن يكون في `.gitignore`)
3. **إعادة النشر**: بعد إضافة متغيرات جديدة، يجب إعادة نشر المشروع
4. **الأمان**: لا تشارك قيم Firebase مع أحد

---

**تم إنشاء هذا الدليل في:** $(date)

