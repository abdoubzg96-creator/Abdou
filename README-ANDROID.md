# PrimeAIsion → Android app (Capacitor)

This folder wraps your existing, already-live website (`www/`) into a real
Android app using [Capacitor](https://capacitorjs.com/). Capacitor does not
rebuild your site — it just packages the same `www/` folder you already
deploy online inside a native Android shell, with real push notifications
and app-store packaging on top.

I can prepare all of this code, but **building the actual signed
`.aab`/`.apk` requires Android Studio on your own computer** — that step
can't be done inside this chat. Everything below is copy-paste-able.

## 0. Before you start

- Install [Node.js](https://nodejs.org) (LTS) and [Android Studio](https://developer.android.com/studio).
- Decide your app's permanent package name (the `appId`). It's currently set
  to `com.primeaision.app` in `capacitor.config.json` — **change this now if
  you want something else**, because you cannot change it after publishing
  to Google Play.

## 1. Install dependencies and add the Android project

```bash
npm install
npx cap add android
```

## 2. Connect Firebase to the Android app (for real push notifications + login)

1. In the [Firebase Console](https://console.firebase.google.com) → your
   `mohtal-9b1d3` project → **Add app → Android**.
2. Package name: exactly the same as `appId` in `capacitor.config.json`.
3. Download `google-services.json` and place it at `android/app/google-services.json`.
4. In Firebase Console → **Authentication → Sign-in method**, confirm
   **Email/Password** and **Google** are enabled (this fixes the "account
   creation doesn't work" issue for the web version too).
5. In Firebase Console → **Project settings → Cloud Messaging**, generate a
   **Web Push certificate (VAPID key)** and paste it into
   `www/assets/firebase-config.js` (`vapidKey: "..."`).

## 3. Generate app icon & splash screen from your logo

Your uploaded logo is already prepared at `resources/icon.png` and
`resources/splash.png`.

```bash
npx @capacitor/assets generate --android
npx cap sync android
```

## 4. Open in Android Studio and set the version

```bash
npx cap open android
```

In `android/app/build.gradle`, bump these for every release you submit:

```gradle
versionCode 1        // integer, +1 every release
versionName "1.0.0"  // human-readable
```

## 5. Create a signing key (one time, keep it forever)

```bash
keytool -genkey -v -keystore primeaision-release.keystore \
  -alias primeaision -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **Back up this keystore file and its passwords somewhere safe.** If you
lose it, you can never update the app again under the same listing.

## 6. Build the release files

In Android Studio: **Build → Generate Signed Bundle / APK**

- Choose **Android App Bundle (.aab)** → this is what you upload to **Google Play**.
- Also choose **APK** → this signed `.apk` is what you upload to **Uptodown**
  (Uptodown does not accept `.aab`).

## 7. Submit to Google Play

In [Play Console](https://play.google.com/console):

- Create the app, upload the `.aab` to a testing track first, then Production.
- **Privacy policy URL**: use your deployed `https://yourdomain.com/privacy.html`
  (already included in `www/`, fill in the two placeholders inside it first).
- **Data safety form**: declare email address, and (if enabled) approximate
  usage analytics and push notification tokens — matching `privacy.html`.
- **Content rating questionnaire**: answer honestly (educational content,
  no violence/gambling/etc.).
- Store listing needs: app icon 512×512, feature graphic 1024×500, at least
  2 phone screenshots, short + full description.
- Target API level: Google Play requires targeting a recent Android API
  level (check the current requirement on the Play Console page when you
  upload — it's enforced automatically and updates yearly).

There's no single toggle that guarantees "100% acceptance" — Play's review
checks that the app works as described, the privacy policy matches what's
collected, and no policy-violating content/permissions exist. The steps
above cover the real requirements; the rest is normal review time.

## 8. Submit to Uptodown

Use Uptodown's [developer upload form](https://developer.uptodown.com/) to
submit the signed `.apk` from step 6, your app icon, screenshots, and the
same privacy policy link. Uptodown's review is manual but generally faster
than Play; a working signed APK + privacy policy is what most submissions
are missing.

## 9. Re-publishing updates later

Every time you change `www/` (site content) or native config:

```bash
npx cap sync android
```

Then repeat step 6 (bump `versionCode`, generate a new signed `.aab`/`.apk`
with the **same keystore**).
