/*
 * Login/splash screen shown when the app opens, using the brand image
 * (assets/brand-splash.jpg). It reuses the real Firebase auth module
 * (assets/firebase-auth.js) — it does not create a second login system.
 *
 * Behaviour:
 * - Shown once per browser/device until the person signs in OR chooses
 *   "continue as guest".
 * - Auto-hides immediately if Firebase reports an already-signed-in user.
 * - "Login" / "Create account" open the real Firebase modal.
 * - "Continue as guest" just dismisses the splash for this device.
 */
(function () {
  const SEEN_KEY = "primeaision-splash-seen";

  function alreadyHandled() {
    return localStorage.getItem(SEEN_KEY) === "1";
  }

  function markHandled() {
    localStorage.setItem(SEEN_KEY, "1");
  }

  function t(key) {
    return (window.PrimeAIsionI18n && window.PrimeAIsionI18n.t(key)) || key;
  }

  function buildSplash() {
    const splash = document.createElement("div");
    splash.className = "prime-splash";
    splash.id = "prime-splash";
    splash.innerHTML = `
      <div class="prime-splash-overlay"></div>
      <div class="prime-splash-content">
        <p class="prime-splash-tagline" data-i18n="splash.tagline">${t("splash.tagline")}</p>
        <div class="prime-splash-actions">
          <button class="prime-splash-btn prime-splash-primary" type="button" data-splash-login>
            ${t("splash.login")}
          </button>
          <button class="prime-splash-btn prime-splash-secondary" type="button" data-splash-signup>
            ${t("splash.signup")}
          </button>
          <button class="prime-splash-btn prime-splash-guest" type="button" data-splash-guest>
            ${t("splash.guest")}
          </button>
        </div>
        <p class="prime-splash-legal">
          <a href="/privacy.html" data-i18n="splash.privacy">${t("splash.privacy")}</a>
        </p>
      </div>
    `;
    document.body.appendChild(splash);

    function close() {
      splash.classList.add("prime-splash-hide");
      setTimeout(() => splash.remove(), 320);
    }

    splash.querySelector("[data-splash-login]").addEventListener("click", () => {
      if (window.PrimeAIsionAuth) window.PrimeAIsionAuth.open("login");
      else window.alert(t("splash.authUnavailable"));
    });
    splash.querySelector("[data-splash-signup]").addEventListener("click", () => {
      if (window.PrimeAIsionAuth) window.PrimeAIsionAuth.open("signup");
      else window.alert(t("splash.authUnavailable"));
    });
    splash.querySelector("[data-splash-guest]").addEventListener("click", () => {
      markHandled();
      close();
    });

    window.addEventListener("primeaision:auth-state", (event) => {
      if (event.detail && event.detail.user) {
        markHandled();
        close();
      }
    });

    return splash;
  }

  function init() {
    if (alreadyHandled()) return;
    // Give firebase-auth.js a brief moment to report an existing session
    // before we decide to show the splash at all.
    let resolved = false;
    const onAuthState = (event) => {
      resolved = true;
      window.removeEventListener("primeaision:auth-state", onAuthState);
      if (event.detail && event.detail.user) {
        markHandled();
      } else {
        buildSplash();
      }
    };
    window.addEventListener("primeaision:auth-state", onAuthState);
    setTimeout(() => {
      if (!resolved) buildSplash();
    }, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
