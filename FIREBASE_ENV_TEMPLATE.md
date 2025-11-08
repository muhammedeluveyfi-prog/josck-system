# 🔥 قالب متغيرات Firebase

## للـ Backend (في Render.com):

أضف هذه المتغيرات في Render.com > Settings > Environment:

```
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

## للـ Frontend (في Vercel/Netlify):

أضف هذه المتغيرات في Vercel/Netlify > Settings > Environment Variables:

```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://your-backend.onrender.com/api
```

## أين تجد هذه القيم؟

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. اضغط على ⚙️ **Project Settings**
4. اذهب إلى **General** tab
5. ابحث عن **Your apps** > **Web app**
6. انسخ القيم من `firebaseConfig`

---

**ملاحظة:** استبدل `your-xxx-here` بالقيم الفعلية من Firebase Console!


