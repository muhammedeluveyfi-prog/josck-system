# إعداد متغيرات البيئة للـ Frontend

## 📋 المتغيرات المطلوبة

Frontend يحتاج إلى متغيرين فقط:

### 1. API URL (للاتصال بالـ Backend)
```env
VITE_API_URL=https://web-production-83e93.up.railway.app/api
```

### 2. Firebase Config (اختياري - إذا كان Frontend يستخدم Firebase مباشرة)
```env
VITE_FIREBASE_API_KEY=AIzaSyAcLuRQoL-6H-4LQBRqxMcypsrqAmpAkYM
VITE_FIREBASE_AUTH_DOMAIN=josck-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=josck-system
VITE_FIREBASE_STORAGE_BUCKET=josck-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=668885365211
VITE_FIREBASE_APP_ID=1:668885365211:web:fd5fffa67794cabb13f7fe
```

---

## ✅ التحقق من الإعداد

### Frontend يستخدم Backend API
- ✅ Frontend يتصل بالـ Backend على Railway
- ✅ Backend متصل بـ Firebase
- ✅ البيانات تتدفق: Frontend → Backend → Firebase

### إذا كان Frontend يستخدم Firebase مباشرة
- ⚠️ يحتاج متغيرات Firebase في Frontend
- ⚠️ يحتاج Firebase Security Rules للسماح بالوصول

---

## 📝 إنشاء ملف .env.local

في مجلد المشروع الرئيسي (ليس backend)، أنشئ ملف `.env.local`:

```env
# Backend API URL
VITE_API_URL=https://web-production-83e93.up.railway.app/api

# Firebase Config (إذا كان Frontend يستخدم Firebase مباشرة)
VITE_FIREBASE_API_KEY=AIzaSyAcLuRQoL-6H-4LQBRqxMcypsrqAmpAkYM
VITE_FIREBASE_AUTH_DOMAIN=josck-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=josck-system
VITE_FIREBASE_STORAGE_BUCKET=josck-system.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=668885365211
VITE_FIREBASE_APP_ID=1:668885365211:web:fd5fffa67794cabb13f7fe
```

---

## 🔍 التحقق من الاتصال

### 1. تحقق من أن Frontend يتصل بالـ Backend:
- افتح Developer Tools (F12)
- اذهب إلى Network tab
- جرب تسجيل الدخول
- يجب أن ترى طلبات إلى: `https://web-production-83e93.up.railway.app/api/auth/login`

### 2. تحقق من أن Backend متصل بـ Firebase:
- تحقق من سجلات Railway
- يجب أن ترى: `✅ Firebase initialized successfully`

---

## ⚠️ ملاحظات مهمة

1. **VITE_**: جميع متغيرات البيئة في Vite يجب أن تبدأ بـ `VITE_`
2. **إعادة التشغيل**: بعد إضافة `.env.local`، أعد تشغيل dev server
3. **Git**: لا ترفع ملف `.env.local` إلى GitHub (يجب أن يكون في `.gitignore`)

---

## 🚀 للـ Production (Vercel/Netlify)

إذا كنت تنشر Frontend على Vercel أو Netlify:

1. اذهب إلى Project Settings > Environment Variables
2. أضف نفس المتغيرات هناك
3. أعد نشر المشروع

