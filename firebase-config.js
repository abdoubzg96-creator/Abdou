/*
 * Firebase Web configuration
 *
 * Replace the placeholder values with the Web app configuration from:
 * Firebase Console -> Project settings -> Your apps -> Web app.
 *
 * This client configuration is normally safe to expose in a web app.
 * Security is enforced by Firebase Authentication and your Firestore/Storage
 * security rules, not by hiding this object.
 */
window.PRIMEAISION_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDeja2hzGtRXafKzACUFFw-g3joWmlzGTU",
  authDomain: "mohtal-9b1d3.firebaseapp.com",
  databaseURL: "https://mohtal-9b1d3-default-rtdb.firebaseio.com",
  projectId: "mohtal-9b1d3",
  storageBucket: "mohtal-9b1d3.firebasestorage.app",
  messagingSenderId: "282432971728",
  appId: "1:282432971728:web:9beddfabd896ede44ecfd5",
  measurementId: "G-S41HL0Q50J",
  // Firebase Console -> Project settings -> Cloud Messaging -> Web Push
  // certificates -> generate a key pair, then paste it here to enable
  // real push notifications (assets/firebase-messaging.js).
  vapidKey: "PASTE_YOUR_WEB_PUSH_VAPID_KEY_HERE",
};