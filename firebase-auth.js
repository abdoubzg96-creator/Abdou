import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const config = window.PRIMEAISION_FIREBASE_CONFIG || {};
const configured = config.apiKey &&
  !String(config.apiKey).includes("YOUR_") &&
  config.authDomain &&
  !String(config.authDomain).includes("YOUR_") &&
  config.projectId &&
  !String(config.projectId).includes("YOUR_");

const styles = `
  .prime-auth-root {
    position: fixed;
    inset: 1rem 1rem auto auto;
    z-index: 1000;
    direction: rtl;
    font-family: Inter, system-ui, sans-serif;
  }
  .prime-auth-button {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    border: 1px solid rgba(148,163,184,.35);
    border-radius: .85rem;
    background: #fff;
    color: #172033;
    padding: .65rem 1rem;
    font-size: .875rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(15,23,42,.12);
  }
  .prime-auth-button:hover { background: #f8fafc; }
  .prime-auth-avatar {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    place-items: center;
    overflow: hidden;
    border-radius: 999px;
    background: #5b61c9;
    color: #fff;
    font-size: .75rem;
  }
  .prime-auth-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .prime-auth-modal {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(15,23,42,.55);
    backdrop-filter: blur(4px);
  }
  .prime-auth-card {
    position: relative;
    width: min(100%, 410px);
    border: 1px solid rgba(148,163,184,.25);
    border-radius: 1.25rem;
    background: #fff;
    padding: 1.5rem;
    color: #172033;
    box-shadow: 0 24px 80px rgba(15,23,42,.28);
  }
  .prime-auth-close {
    position: absolute;
    top: .8rem;
    left: .8rem;
    border: 0;
    background: transparent;
    color: #64748b;
    font-size: 1.4rem;
    cursor: pointer;
  }
  .prime-auth-card h2 { margin: 0 0 .4rem; font-size: 1.35rem; }
  .prime-auth-card p { margin: 0 0 1.15rem; color: #64748b; font-size: .9rem; line-height: 1.7; }
  .prime-auth-field {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: .45rem 0 .85rem;
    border: 1px solid #cbd5e1;
    border-radius: .7rem;
    padding: .75rem .85rem;
    outline: none;
    font: inherit;
  }
  .prime-auth-field:focus { border-color: #5b61c9; box-shadow: 0 0 0 3px rgba(91,97,201,.14); }
  .prime-auth-submit, .prime-auth-google {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: .6rem;
    border-radius: .7rem;
    padding: .75rem 1rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  .prime-auth-submit { border: 0; background: #5b61c9; color: #fff; }
  .prime-auth-submit:hover { background: #4d52b2; }
  .prime-auth-google { border: 1px solid #cbd5e1; background: #fff; color: #172033; }
  .prime-auth-google:hover { background: #f8fafc; }
  .prime-auth-divider {
    display: flex;
    align-items: center;
    gap: .7rem;
    margin: 1rem 0;
    color: #94a3b8;
    font-size: .78rem;
  }
  .prime-auth-divider::before, .prime-auth-divider::after {
    content: ""; height: 1px; flex: 1; background: #e2e8f0;
  }
  .prime-auth-switch {
    display: block;
    margin: 1rem auto 0;
    border: 0;
    background: transparent;
    color: #5b61c9;
    font: inherit;
    font-size: .85rem;
    cursor: pointer;
  }
  .prime-auth-error {
    margin: .8rem 0 0;
    color: #b42318;
    font-size: .82rem;
    line-height: 1.6;
  }
  .prime-auth-menu {
    position: absolute;
    top: calc(100% + .5rem);
    right: 0;
    min-width: 190px;
    border: 1px solid #e2e8f0;
    border-radius: .8rem;
    background: #fff;
    padding: .35rem;
    box-shadow: 0 12px 30px rgba(15,23,42,.14);
  }
  .prime-auth-menu button {
    width: 100%;
    border: 0;
    border-radius: .55rem;
    background: transparent;
    padding: .65rem .75rem;
    text-align: right;
    font: inherit;
    cursor: pointer;
  }
  .prime-auth-menu button:hover { background: #f1f5f9; }
  @media (max-width: 640px) {
    .prime-auth-root { inset: .75rem .75rem auto auto; }
    .prime-auth-button { padding: .55rem .75rem; }
  }
`;

const copy = {
  login: "تسجيل الدخول",
  signup: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  google: "الدخول باستخدام Google",
  divider: "أو",
  noAccount: "ليس لديك حساب؟ أنشئ حساباً",
  haveAccount: "لديك حساب؟ سجّل الدخول",
  logout: "تسجيل الخروج",
  account: "الحساب",
  unavailable: "أضف إعدادات Firebase في assets/firebase-config.js أولاً.",
  invalid: "تحقق من البريد الإلكتروني وكلمة المرور.",
  popupClosed: "تم إغلاق نافذة Google قبل إكمال الدخول.",
  generic: "تعذر تسجيل الدخول حالياً. تحقق من إعدادات Firebase وحاول مرة أخرى.",
};

function addStyles() {
  const style = document.createElement("style");
  style.textContent = styles;
  document.head.appendChild(style);
}

function getErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("auth/invalid-credential") ||
      code.includes("auth/invalid-email") ||
      code.includes("auth/wrong-password")) {
    return copy.invalid;
  }
  if (code.includes("auth/popup-closed-by-user")) return copy.popupClosed;
  if (code.includes("auth/email-already-in-use")) {
    return "هذا البريد مستخدم مسبقاً. جرّب تسجيل الدخول.";
  }
  if (code.includes("auth/weak-password")) {
    return "اجعل كلمة المرور مكوّنة من 6 أحرف على الأقل.";
  }
  return error?.message || copy.generic;
}

function googleIcon() {
  return `<span aria-hidden="true" style="font-weight:800;color:#4285f4">G</span>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character]));
}

function createAuthUi(auth) {
  const root = document.createElement("div");
  root.className = "prime-auth-root";
  root.innerHTML = `
    <button class="prime-auth-button" type="button" data-prime-auth-open>
      <span aria-hidden="true">◉</span>${copy.login}
    </button>
  `;
  document.body.appendChild(root);

  let modal = null;
  let isSignup = false;
  let currentUser = null;

  function closeModal() {
    modal?.remove();
    modal = null;
  }

  function renderSignedOutButton() {
    root.innerHTML = `
      <button class="prime-auth-button" type="button" data-prime-auth-open>
        <span aria-hidden="true">◉</span>${copy.login}
      </button>
    `;
  }

  function renderSignedInButton(user) {
    const label = user.displayName || user.email || copy.account;
    const avatar = user.photoURL
      ? `<img src="${escapeHtml(user.photoURL)}" alt="" />`
      : escapeHtml(label.slice(0, 1).toUpperCase());
    root.innerHTML = `
      <button class="prime-auth-button" type="button" data-prime-auth-menu aria-expanded="false">
        <span class="prime-auth-avatar">${avatar}</span>
        <span>${escapeHtml(label)}</span>
      </button>
    `;
  }

  function openModal(mode) {
    if (mode === "login") isSignup = false;
    if (mode === "signup") isSignup = true;
    closeModal();
    modal = document.createElement("div");
    modal.className = "prime-auth-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <section class="prime-auth-card" dir="rtl">
        <button class="prime-auth-close" type="button" aria-label="إغلاق">×</button>
        <h2>${isSignup ? copy.signup : copy.login}</h2>
        <p>${isSignup ? "أنشئ حسابك للمتابعة." : "تابع تعلّمك من حيث توقفت."}</p>
        <form data-prime-auth-form>
          <label>${copy.email}
            <input class="prime-auth-field" type="email" name="email" autocomplete="email" required />
          </label>
          <label>${copy.password}
            <input class="prime-auth-field" type="password" name="password" minlength="6" autocomplete="${isSignup ? "new-password" : "current-password"}" required />
          </label>
          <button class="prime-auth-submit" type="submit">${isSignup ? copy.signup : copy.login}</button>
        </form>
        <div class="prime-auth-divider">${copy.divider}</div>
        <button class="prime-auth-google" type="button" data-prime-auth-google>${googleIcon()}${copy.google}</button>
        <div class="prime-auth-error" role="alert" hidden></div>
        <button class="prime-auth-switch" type="button" data-prime-auth-switch>
          ${isSignup ? copy.haveAccount : copy.noAccount}
        </button>
      </section>
    `;
    document.body.appendChild(modal);

    const errorBox = modal.querySelector(".prime-auth-error");
    const form = modal.querySelector("[data-prime-auth-form]");
    const setError = (error) => {
      errorBox.textContent = getErrorMessage(error);
      errorBox.hidden = false;
    };
    const setBusy = (busy) => {
      modal.querySelectorAll("button, input").forEach((element) => {
        element.disabled = busy;
      });
    };

    modal.querySelector(".prime-auth-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    modal.querySelector("[data-prime-auth-switch]").addEventListener("click", () => {
      isSignup = !isSignup;
      openModal();
    });
    modal.querySelector("[data-prime-auth-google]").addEventListener("click", async () => {
      setBusy(true);
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        closeModal();
      } catch (error) {
        setBusy(false);
        setError(error);
      }
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setBusy(true);
      const data = new FormData(form);
      try {
        if (isSignup) {
          await createUserWithEmailAndPassword(auth, data.get("email"), data.get("password"));
        } else {
          await signInWithEmailAndPassword(auth, data.get("email"), data.get("password"));
        }
        closeModal();
      } catch (error) {
        setBusy(false);
        setError(error);
      }
    });
  }

  root.addEventListener("click", async (event) => {
    const openButton = event.target.closest("[data-prime-auth-open]");
    if (openButton) {
      if (!configured) {
        window.alert(copy.unavailable);
        return;
      }
      openModal();
      return;
    }

    const menuButton = event.target.closest("[data-prime-auth-menu]");
    if (!menuButton) return;

    const existingMenu = root.querySelector(".prime-auth-menu");
    if (existingMenu) {
      existingMenu.remove();
      return;
    }
    const menu = document.createElement("div");
    menu.className = "prime-auth-menu";
    menu.innerHTML = `<button type="button" data-prime-auth-logout>${copy.logout}</button>`;
    root.appendChild(menu);
    menu.querySelector("[data-prime-auth-logout]").addEventListener("click", async () => {
      await signOut(auth);
      menu.remove();
    });
  });

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) renderSignedInButton(user);
    else renderSignedOutButton();
    window.dispatchEvent(new CustomEvent("primeaision:auth-state", {
      detail: { user },
    }));
  });

  window.PrimeAIsionAuth = {
    getCurrentUser: () => currentUser,
    open: (mode) => openModal(mode),
    logout: () => signOut(auth),
  };
}

addStyles();

if (configured) {
  const app = initializeApp(config);
  if (config.measurementId) {
    analyticsIsSupported()
      .then((supported) => {
        if (supported) getAnalytics(app);
      })
      .catch(() => {
        // Analytics is optional and must never prevent authentication.
      });
  }
  createAuthUi(getAuth(app));
} else {
  // The button is still visible so setup is obvious, but the existing app
  // remains fully usable until the Firebase config is filled in.
  const root = document.createElement("div");
  root.className = "prime-auth-root";
  root.innerHTML = `<button class="prime-auth-button" type="button" data-prime-auth-not-configured>◉ ${copy.login}</button>`;
  document.body.appendChild(root);
  root.querySelector("button").addEventListener("click", () => window.alert(copy.unavailable));
}