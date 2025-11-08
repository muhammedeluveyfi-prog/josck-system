# 📋 متغيرات البيئة المطلوبة لـ Vercel (Frontend)

## 🔥 متغيرات Firebase (6 متغيرات - مطلوبة)

انسخ هذه المتغيرات وأضفها في Vercel:

```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🌐 متغير API Backend (مطلوب)

**الرابط الفعلي للـ Backend (يعمل على Railway):**

```
VITE_API_URL=https://web-production-83e93.up.railway.app/api
```

✅ **الـ Backend يعمل ويعطي استجابة صحيحة:** [https://web-production-83e93.up.railway.app/](https://web-production-83e93.up.railway.app/)

---

## ✅ القائمة الكاملة (7 متغيرات)

انسخ كل متغير وأضفه في Vercel:

| المتغير | الوصف | مثال |
|---------|-------|------|
| `VITE_FIREBASE_API_KEY` | مفتاح API لـ Firebase | `AIzaSyBxxxxxxxxxxxxx` |
| `VITE_FIREBASE_AUTH_DOMAIN` | نطاق المصادقة | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | معرف المشروع | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | سلة التخزين | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | معرف المرسل | `123456789012` |
| `VITE_FIREBASE_APP_ID` | معرف التطبيق | `1:123:web:abc123` |
| `VITE_API_URL` | رابط Backend API | `https://web-production-83e93.up.railway.app/api` |

---

## 🚀 خطوات الإضافة في Vercel

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع: `josck-system`
3. اضغط: **Settings** → **Environment Variables**
4. اضغط: **Add New**
5. أضف كل متغير من القائمة أعلاه
6. اختر البيئات: ✅ Production, ✅ Preview, ✅ Development
7. احفظ
8. أعد نشر المشروع (Redeploy)

---

## 🔍 أين تجد قيم Firebase؟

1. اذهب إلى: https://console.firebase.google.com/
2. اختر مشروعك
3. اضغط: ⚙️ **Project Settings**
4. تبويب: **General**
5. ابحث عن: **Your apps** → **Web app**
6. انسخ القيم من `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",                    // ← VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",       // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",                        // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",        // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",          // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"                   // ← VITE_FIREBASE_APP_ID
};
```

---

## ⚠️ ملاحظات مهمة

- ✅ جميع متغيرات Vite يجب أن تبدأ بـ `VITE_`
- ✅ بعد إضافة المتغيرات، يجب إعادة نشر المشروع
- ✅ لا ترفع ملف `.env` إلى GitHub
- ✅ تأكد من نسخ القيم بدقة من Firebase Console

---

## 📝 مثال كامل للنسخ (جاهز للاستخدام)

**انسخ هذا القالب وأضف قيم Firebase الفعلية:**

```
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://web-production-83e93.up.railway.app/api
```

**✅ ملاحظة:** رابط الـ Backend (`VITE_API_URL`) جاهز وصحيح - لا حاجة لتغييره!

**⚠️ فقط استبدل قيم Firebase بالقيم الفعلية من Firebase Console!**

