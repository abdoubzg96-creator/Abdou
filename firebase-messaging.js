/*
 * Real push notifications (Firebase Cloud Messaging) for the web app.
 *
 * Setup required before this works (one-time, in Firebase Console):
 *   1. Project settings -> Cloud Messaging -> "Web configuration" ->
 *      generate a "Web Push certificate" (VAPID key).
 *   2. Paste that key into assets/firebase-config.js:
 *        window.PRIMEAISION_FIREBASE_CONFIG.vapidKey = "PASTE_KEY_HERE";
 *   3. Deploy over HTTPS (required by the browser Push API — localhost
 *      also works for testing, file:// does not).
 *
 * To actually SEND a notification to a signed-in person from your own
 * backend/cron job, call the FCM HTTP v1 API with the token that gets
 * saved to your Realtime Database at notificationTokens/{uid}.
 *
 * If this site is later wrapped with Capacitor for Android (see
 * README-ANDROID.md), the native @capacitor/push-notifications plugin
 * takes over automatically on native builds, and this file quietly
 * does nothing there (see the Capacitor check below) so tokens aren't
 * registered twice.
 */
(function () {
  const config = window.PRIMEAISION_FIREBASE_CONFIG || {};
  const configured = config.apiKey && !String(config.apiKey).includes("YOUR_");
  const isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  const copy = {
    enable: "تفعيل الإشعارات",
    enabled: "الإشعارات مفعّلة",
    blocked: "الإشعارات محظورة من إعدادات المتصفح.",
    error: "تعذّر تفعيل الإشعارات الآن.",
    noVapid: "أضف vapidKey في assets/firebase-config.js أولاً.",
  };

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #prime-notif-toggle {
        position: fixed;
        inset: auto auto 1rem 1rem;
        z-index: 1000;
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        border: 1px solid rgba(148,163,184,.35);
        border-radius: .85rem;
        background: #fff;
        color: #172033;
        padding: .55rem .75rem;
        font-size: .8rem;
        font-weight: 700;
        font-family: Inter, system-ui, sans-serif;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(15,23,42,.12);
      }
      #prime-notif-toggle[data-state="enabled"] { color: #16a34a; }
      #prime-notif-toast {
        position: fixed;
        inset: auto 1rem 5rem auto;
        z-index: 1500;
        max-width: 320px;
        background: #172033;
        color: #fff;
        border-radius: .85rem;
        padding: .85rem 1rem;
        font: 600 .85rem/1.5 Inter, system-ui, sans-serif;
        box-shadow: 0 16px 40px rgba(15,23,42,.35);
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(title, body) {
    const toast = document.createElement("div");
    toast.id = "prime-notif-toast";
    toast.innerHTML = `<strong>${title || "PrimeAIsion"}</strong><div style="font-weight:400;margin-top:.25rem">${body || ""}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  }

  async function saveToken(token) {
    if (!config.databaseURL) return;
    const uid = (window.PrimeAIsionAuth && window.PrimeAIsionAuth.getCurrentUser() && window.PrimeAIsionAuth.getCurrentUser().uid)
      || localStorage.getItem("primeaision-anon-id")
      || (() => {
        const id = "anon-" + Math.random().toString(36).slice(2);
        localStorage.setItem("primeaision-anon-id", id);
        return id;
      })();
    try {
      await fetch(`${config.databaseURL}/notificationTokens/${uid}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, updatedAt: Date.now(), platform: "web" }),
      });
    } catch (error) {
      console.warn("PrimeAIsion: could not save notification token", error);
    }
  }

  async function enableNotifications(button) {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      window.alert(copy.error);
      return;
    }
    if (!config.vapidKey) {
      window.alert(copy.noVapid);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      window.alert(copy.blocked);
      return;
    }
    try {
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js");
      const { getMessaging, getToken, onMessage } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js");

      const app = getApps().length ? getApps()[0] : initializeApp(config);
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        await saveToken(token);
        button.dataset.state = "enabled";
        button.querySelector("span:last-child").textContent = copy.enabled;
        localStorage.setItem("primeaision-notifications-enabled", "1");
      }
      onMessage(messaging, (payload) => {
        const notification = payload.notification || {};
        showToast(notification.title, notification.body);
      });
    } catch (error) {
      console.error("PrimeAIsion: notification setup failed", error);
      window.alert(copy.error);
    }
  }

  function buildButton() {
    const button = document.createElement("button");
    button.id = "prime-notif-toggle";
    button.type = "button";
    const enabledAlready = localStorage.getItem("primeaision-notifications-enabled") === "1";
    button.dataset.state = enabledAlready ? "enabled" : "disabled";
    button.innerHTML = `<span aria-hidden="true">🔔</span><span>${enabledAlready ? copy.enabled : copy.enable}</span>`;
    button.addEventListener("click", () => {
      if (button.dataset.state === "enabled") return;
      enableNotifications(button);
    });
    document.body.appendChild(button);
  }

  function init() {
    if (!configured || isNativeApp) return;
    injectStyles();
    buildButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
