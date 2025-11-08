# 🚀 دليل تهيئة Firebase Collections

## ✅ تم إضافة Endpoint لإنشاء Collections تلقائياً!

لا حاجة لإنشاء Collections يدوياً في Firebase Console. السيرفر سينشئها تلقائياً!

---

## 📋 كيفية الاستخدام:

### الطريقة 1: استخدام Endpoint الشامل (مُوصى به)

بعد رفع السيرفر على Railway، استدعي هذا الـ endpoint:

```bash
POST https://your-app-name.up.railway.app/api/init
```

**أو محلياً:**
```bash
POST http://localhost:3000/api/init
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "results": {
    "users": {
      "created": 5,
      "exists": false
    },
    "devices": {
      "created": 0,
      "exists": false
    },
    "collections": ["users", "devices"]
  },
  "collections": "Created collections: users, devices"
}
```

**ماذا يفعل هذا الـ Endpoint:**
- ✅ ينشئ Collection `users` مع المستخدمين الافتراضيين
- ✅ ينشئ Collection `devices` (فارغة)
- ✅ يتحقق من وجود البيانات قبل الإنشاء
- ✅ يعيد معلومات مفصلة عن ما تم إنشاؤه

---

### الطريقة 2: استخدام Endpoint المستخدمين فقط

إذا أردت إنشاء المستخدمين فقط:

```bash
POST https://your-app-name.up.railway.app/api/auth/init
```

**الاستجابة:**
```json
{
  "message": "Default users created successfully",
  "count": 5,
  "users": [
    {
      "id": "...",
      "username": "admin",
      "name": "مدير النظام",
      "role": "admin"
    },
    ...
  ]
}
```

---

## 👥 المستخدمين الافتراضيين:

بعد استدعاء `/api/init`، سيتم إنشاء المستخدمين التالية:

| Username | Password | Role | Name |
|----------|----------|------|------|
| `admin` | `admin123` | admin | مدير النظام |
| `operations` | `ops123` | operations | موظف العمليات |
| `technician1` | `tech123` | technician | فني 1 |
| `technician2` | `tech123` | technician | فني 2 |
| `customer_service` | `cs123` | customer_service | خدمة العملاء |

---

## 🔧 خطوات الاستخدام:

### 1. بعد رفع السيرفر على Railway:

1. احصل على رابط السيرفر من Railway
2. افتح المتصفح أو استخدم Postman/curl
3. استدعي:
   ```
   POST https://your-app-name.up.railway.app/api/init
   ```

### 2. التحقق من Firebase Console:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `josck-system`
3. اذهب إلى **Firestore Database** > **Data**
4. يجب أن ترى:
   - Collection: `users` (5 مستخدمين)
   - Collection: `devices` (فارغة)

### 3. اختبار تسجيل الدخول:

```bash
POST https://your-app-name.up.railway.app/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## 📝 ملاحظات مهمة:

1. **الاستدعاء مرة واحدة**: 
   - يمكنك استدعاء `/api/init` عدة مرات بأمان
   - لن ينشئ بيانات مكررة إذا كانت موجودة

2. **الأمان**:
   - هذا الـ endpoint مفتوح (لا يحتاج authentication)
   - في الإنتاج، يمكنك إضافة حماية إذا أردت

3. **البيانات**:
   - المستخدمين تُنشأ تلقائياً
   - Collection `devices` تُنشأ فارغة (ستُملأ عند إضافة أجهزة)

---

## 🧪 اختبار محلي:

### باستخدام curl:
```bash
curl -X POST http://localhost:3000/api/init
```

### باستخدام PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/init" -Method POST
```

### باستخدام Postman:
1. اختر **POST**
2. أدخل: `http://localhost:3000/api/init`
3. اضغط **Send**

---

## ✅ قائمة التحقق:

- [ ] تم رفع السيرفر على Railway
- [ ] تم إضافة متغيرات البيئة Firebase في Railway
- [ ] تم استدعاء `/api/init` بنجاح
- [ ] تم التحقق من Collections في Firebase Console
- [ ] تم اختبار تسجيل الدخول

---

## 🎯 الخطوات التالية:

بعد تهيئة Collections:
1. ✅ ابدأ استخدام التطبيق
2. ✅ أضف أجهزة جديدة (ستُنشأ في Collection `devices`)
3. ✅ أضف مستخدمين جدد (ستُنشأ في Collection `users`)

---

**جاهز للاستخدام! 🚀**


