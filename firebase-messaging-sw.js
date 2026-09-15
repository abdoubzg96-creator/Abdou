/*
 * Background push notification handler.
 * Must be served from the SITE ROOT (e.g. https://yourdomain.com/firebase-messaging-sw.js)
 * so its default scope covers the whole site.
 *
 * Service workers run in their own global scope and cannot read
 * window.PRIMEAISION_FIREBASE_CONFIG from the page, so the same
 * (public, safe-to-expose) config is duplicated here. Keep the two
 * files in sync if you ever rotate the Firebase project.
 */
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDeja2hzGtRXafKzACUFFw-g3joWmlzGTU",
  authDomain: "mohtal-9b1d3.firebaseapp.com",
  databaseURL: "https://mohtal-9b1d3-default-rtdb.firebaseio.com",
  projectId: "mohtal-9b1d3",
  storageBucket: "mohtal-9b1d3.firebasestorage.app",
  messagingSenderId: "282432971728",
  appId: "1:282432971728:web:9beddfabd896ede44ecfd5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const title = notification.title || "PrimeAIsion";
  const options = {
    body: notification.body || "",
    icon: "/assets/brand-splash.jpg",
    badge: "/favicon.svg",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
