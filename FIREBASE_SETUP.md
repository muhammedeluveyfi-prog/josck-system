# دليل إعداد Firebase

هذا الدليل يوضح كيفية إعداد Firebase لمشروع JOSCK System.

## الخطوات:

### 1. إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "Add project" أو "إضافة مشروع"
3. أدخل اسم المشروع (مثلاً: `josck-system`)
4. اتبع التعليمات لإكمال إنشاء المشروع

### 2. إنشاء تطبيق ويب (Web App)

1. في Firebase Console، انقر على أيقونة الويب `</>`
2. سجل اسم التطبيق (مثلاً: `josck-system-web`)
3. انسخ معلومات التكوين (config) التي ستظهر

### 3. تفعيل Cloud Firestore API

**مهم جداً:** يجب تفعيل Cloud Firestore API قبل استخدام قاعدة البيانات.

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروع Firebase الخاص بك (أو أنشئ مشروع جديد)
3. اذهب إلى **APIs & Services** > **Library**
4. ابحث عن **Cloud Firestore API**
5. انقر على **Enable** لتفعيل الـ API
6. انتظر بضع دقائق حتى يتم تفعيل الـ API

**أو مباشرة من الرابط:**
- افتح الرابط الذي يظهر في رسالة الخطأ في Terminal
- أو اذهب إلى: `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=YOUR_PROJECT_ID`
- انقر على **Enable**

### 4. إعداد Firestore Database

1. في Firebase Console، اذهب إلى **Firestore Database**
2. انقر على **Create database**
3. اختر **Start in test mode** (للبداية - يمكن تغيير القواعد لاحقاً)
4. اختر موقع قاعدة البيانات (اختر الأقرب لمنطقتك)

### 5. إعداد متغيرات البيئة (Environment Variables)

1. أنشئ ملف `.env` في المجلد الرئيسي للمشروع
2. أضف المتغيرات التالية مع القيم من Firebase Console:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**ملاحظة:** يمكنك الحصول على هذه القيم من:
- Firebase Console > Project Settings > General > Your apps > Web app

### 6. قواعد الأمان في Firestore (Security Rules)

في Firebase Console > Firestore Database > Rules، استبدل القواعد الحالية بـ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         resource.data.id == request.auth.uid);
    }
    
    // Devices collection
    match /devices/{deviceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

**ملاحظة:** هذه القواعد للبداية. في الإنتاج، يجب تحسينها حسب احتياجاتك.

### 7. إنشاء الفهارس (Indexes)

Firestore قد يطلب منك إنشاء فهارس تلقائياً عند استخدام queries معقدة. اتبع التعليمات التي تظهر في Console.

### 8. إعداد متغيرات البيئة للـ Backend

في مجلد `backend`، أنشئ ملف `.env` مع المتغيرات التالية:

```env
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
JWT_SECRET=your-secret-key-change-in-production
```

### 9. تشغيل المشروع

```bash
npm install
npm run dev
```

## الميزات المتاحة:

- ✅ تخزين المستخدمين في Firestore
- ✅ تخزين الأجهزة في Firestore
- ✅ تحديثات فورية (Real-time updates)
- ✅ دعم جميع العمليات (CRUD)
- ✅ حفظ الجلسة محلياً (localStorage)

## ملاحظات مهمة:

1. **الأمان:** في الإنتاج، يجب:
   - استخدام Firebase Authentication بدلاً من كلمات المرور النصية
   - تحسين قواعد الأمان في Firestore
   - تشفير البيانات الحساسة

2. **الأداء:** 
   - البيانات يتم تخزينها مؤقتاً (cache) لتقليل استدعاءات Firebase
   - يمكن استخدام Real-time listeners للتحديثات التلقائية

3. **النسخ الاحتياطي:**
   - Firebase يوفر نسخ احتياطي تلقائي
   - يمكنك تصدير البيانات من Firebase Console

## الدعم:

إذا واجهت أي مشاكل، تأكد من:
- أن جميع المتغيرات في `.env` صحيحة
- أن **Cloud Firestore API مفعّل** في Google Cloud Console (هذا مهم جداً!)
- أن Firestore Database تم إنشاؤه
- أن القواعد الأمنية تسمح بالقراءة والكتابة

**خطأ شائع:** إذا رأيت رسالة `PERMISSION_DENIED: Cloud Firestore API has not been used`:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك
3. فعّل **Cloud Firestore API** من **APIs & Services** > **Library**
4. انتظر بضع دقائق ثم أعد تشغيل السيرفر


