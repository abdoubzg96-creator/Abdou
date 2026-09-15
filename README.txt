PrimeAIsion - Arabic AI learning website

Upload the contents of this folder to the root of a static hosting service.

Changes in this fixed package:
- Improved Arabic SEO metadata, canonical link, Open Graph tags, Twitter Card
  tags, theme color, and a 1200x630 social preview image.
- assets/index-BIAuf08k.js is unchanged to protect the existing compiled app.
- assets/form-handler.js saves profile/feedback submissions locally and can
  POST them to an HTTPS webhook.
- assets/firebase-auth.js adds real Firebase email/password login, account
  creation, Google sign-in, auth state, sign-out, and optional Analytics.
- assets/firebase-config.js contains the supplied Firebase Web configuration.
- assets/form-config.js is the only file you need to edit to set the webhook:
  window.PRIMEAISION_FORM_CONFIG.webhookUrl = "https://your-domain.example/webhook";
- CONTENT-GUIDE.md lists the main Arabic text, headings, and CTA labels.

Important:
- Replace "/" in the canonical, og:url, and image URLs in index.html with
  absolute production URLs if your hosting setup requires absolute metadata.
- The webhook must accept browser CORS requests. Do not place secrets in the
  public JavaScript files; use a server-side proxy when authentication is
  required.
- In Firebase Console, enable Authentication -> Sign-in method -> Email/Password
  and Google, then add the deployed domain under Authentication ->
  Settings -> Authorized domains.
