# PrimeAIsion content guide

## Important

`assets/index-BIAuf08k.js` is a production/minified React bundle. It has been
left byte-for-byte unchanged so the existing application behavior is not
altered. Do not edit it directly for normal content changes: a future build
will overwrite manual edits and a missing quote can break the entire app.

The original source files were not included in the ZIP, so this guide exposes
the current content and the stable UI identifiers that can be used when
reconnecting the project to its source repository.

## Main content currently in the bundle

### Brand and navigation

- Brand: `PrimeAIsion`
- Navigation: `الرئيسية` / `المسارات` / `مختبر الصوت` / `ملفي`
- Sidebar label: `مساحتك التعليمية`
- Help CTA: `تحتاج مساعدة؟`

### Learning paths

- `مدخل إلى الذكاء الاصطناعي`
  - `افهم الصورة الكبيرة والمفاهيم التي ستبني عليها كل خطوة لاحقة.`
- `بايثون من الصفر`
  - `اكتب أول برامجك بثقة، من المتغيرات حتى مشروع صغير قابل للتشغيل.`
- `مختبر الأوامر الذكية`
  - `حوّل أفكارك إلى أوامر واضحة تعطي نماذج الذكاء الاصطناعي نتائج أفضل.`

### Important CTA labels

- `ابدأ درس اليوم`
- `تعلّم بالاستماع`
- `استمع الآن`
- `أكملت هذا الدرس`
- `أنهيت الدرس`
- `حفظ التغيير`
- `حفظ الاسم`
- `إرسال الملاحظة`
- `افتح المسارات`
- `شارك المساحة`

### Form-related UI

The current compiled app has two useful data-entry areas:

- Profile name input:
  - `data-testid="input-profile-name"` or `data-testid="input-display-name"`
  - save buttons: `button-save-profile` and `button-save-name`
- Feedback dialog:
  - `data-testid="textarea-report"`
  - submit button: `button-submit-report`

`assets/form-handler.js` listens to these identifiers without changing the
compiled bundle. It saves a local copy in
`localStorage["primeaision-form-submissions"]` and optionally POSTs the same
payload to the webhook configured in `assets/form-config.js`.

## Firebase authentication

The ZIP now includes a separate real Firebase Authentication layer:

- `assets/firebase-config.js`: paste the Firebase Web app config here.
- `assets/firebase-auth.js`: email/password login, account creation, Google
  sign-in, auth state, and sign-out.
- The compiled React bundle remains untouched.

Before deploying, enable **Email/Password** and **Google** under Firebase
Authentication, and add the production domain to Firebase Authorized domains.

## Recommended source structure for future edits

When the source project is available again, move copy into a normal data file:

```js
export const siteCopy = {
  brand: "PrimeAIsion",
  nav: {
    home: "الرئيسية",
    courses: "المسارات",
    audio: "مختبر الصوت",
    profile: "ملفي",
  },
  cta: {
    startLesson: "ابدأ درس اليوم",
    listen: "تعلّم بالاستماع",
    sendFeedback: "إرسال الملاحظة",
  },
};
```

Then reference `siteCopy` from React components rather than placing long
Arabic strings directly inside the built output.