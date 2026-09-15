/*
 * PrimeAIsion language switcher.
 *
 * IMPORTANT / HONEST LIMITATION:
 * The main app UI (assets/index-BIAuf08k.js) is a compiled, minified React
 * bundle. Its Arabic text is baked into the JavaScript, and its layout was
 * built for RTL only. Without the original source project, this file
 * cannot rebuild the app in another language the "correct" way (i18next,
 * separate locale bundles, mirrored LTR layout, translated screen-reader
 * labels, etc). What it CAN do reliably:
 *
 *   1. Translate every string listed in the dictionary below, wherever it
 *      appears in the page (nav, buttons, learning-path titles, the auth
 *      modal, the splash screen, the privacy page banner).
 *   2. Re-apply that translation automatically whenever React re-renders
 *      (via MutationObserver), so navigating the app doesn't reset the
 *      language back to Arabic.
 *   3. Remember the chosen language for next time (localStorage).
 *
 * The layout direction stays RTL in every language for now, because the
 * compiled CSS was authored for RTL and flipping `dir` without the source
 * would visually break spacing/icons. If full LTR mirroring is needed,
 * it has to happen in the original source project, not this compiled build.
 */
(function () {
  const LANG_KEY = "primeaision-lang";
  const SUPPORTED = ["ar", "en", "fr"];

  // Arabic source string -> { en, fr }. Extend this as you add more
  // Arabic UI text to the site.
  const DICTIONARY = {
    // Nav / shell (see CONTENT-GUIDE.md)
    "الرئيسية": { en: "Home", fr: "Accueil" },
    "المسارات": { en: "Paths", fr: "Parcours" },
    "مختبر الصوت": { en: "Audio Lab", fr: "Labo audio" },
    "ملفي": { en: "My Profile", fr: "Mon profil" },
    "مساحتك التعليمية": { en: "Your learning space", fr: "Votre espace d'apprentissage" },
    "تحتاج مساعدة؟": { en: "Need help?", fr: "Besoin d'aide ?" },

    // Learning paths
    "مدخل إلى الذكاء الاصطناعي": { en: "Intro to AI", fr: "Introduction à l'IA" },
    "افهم الصورة الكبيرة والمفاهيم التي ستبني عليها كل خطوة لاحقة.": {
      en: "Understand the big picture and the concepts every later step builds on.",
      fr: "Comprenez la vue d'ensemble et les concepts sur lesquels chaque étape suivante s'appuiera.",
    },
    "بايثون من الصفر": { en: "Python from Scratch", fr: "Python à partir de zéro" },
    "اكتب أول برامجك بثقة، من المتغيرات حتى مشروع صغير قابل للتشغيل.": {
      en: "Write your first programs with confidence, from variables to a small runnable project.",
      fr: "Écrivez vos premiers programmes en toute confiance, des variables jusqu'à un petit projet fonctionnel.",
    },
    "مختبر الأوامر الذكية": { en: "Smart Prompt Lab", fr: "Labo des prompts intelligents" },
    "حوّل أفكارك إلى أوامر واضحة تعطي نماذج الذكاء الاصطناعي نتائج أفضل.": {
      en: "Turn your ideas into clear prompts that get better results from AI models.",
      fr: "Transformez vos idées en prompts clairs qui donnent de meilleurs résultats aux modèles d'IA.",
    },

    // CTAs
    "ابدأ درس اليوم": { en: "Start today's lesson", fr: "Commencer la leçon du jour" },
    "تعلّم بالاستماع": { en: "Learn by listening", fr: "Apprendre en écoutant" },
    "استمع الآن": { en: "Listen now", fr: "Écouter maintenant" },
    "أكملت هذا الدرس": { en: "I completed this lesson", fr: "J'ai terminé cette leçon" },
    "أنهيت الدرس": { en: "Lesson finished", fr: "Leçon terminée" },
    "حفظ التغيير": { en: "Save change", fr: "Enregistrer la modification" },
    "حفظ الاسم": { en: "Save name", fr: "Enregistrer le nom" },
    "إرسال الملاحظة": { en: "Send feedback", fr: "Envoyer le commentaire" },
    "افتح المسارات": { en: "Open paths", fr: "Ouvrir les parcours" },
    "شارك المساحة": { en: "Share this space", fr: "Partager cet espace" },

    // Auth modal (assets/firebase-auth.js)
    "تسجيل الدخول": { en: "Log in", fr: "Se connecter" },
    "إنشاء حساب": { en: "Create account", fr: "Créer un compte" },
    "البريد الإلكتروني": { en: "Email", fr: "E-mail" },
    "كلمة المرور": { en: "Password", fr: "Mot de passe" },
    "الدخول باستخدام Google": { en: "Continue with Google", fr: "Continuer avec Google" },
    "أو": { en: "or", fr: "ou" },
    "ليس لديك حساب؟ أنشئ حساباً": { en: "No account yet? Create one", fr: "Pas de compte ? Créez-en un" },
    "لديك حساب؟ سجّل الدخول": { en: "Already have an account? Log in", fr: "Déjà un compte ? Connectez-vous" },
    "تسجيل الخروج": { en: "Log out", fr: "Se déconnecter" },
    "الحساب": { en: "Account", fr: "Compte" },
    "تابع تعلّمك من حيث توقفت.": { en: "Pick up your learning right where you left off.", fr: "Reprenez votre apprentissage là où vous vous étiez arrêté." },
    "أنشئ حسابك للمتابعة.": { en: "Create your account to continue.", fr: "Créez votre compte pour continuer." },

    // Splash screen
    "splash.tagline": {
      en: "Learn AI and programming, step by step, in a space built for you.",
      fr: "Apprenez l'IA et la programmation, étape par étape, dans un espace pensé pour vous.",
    },
    "splash.login": { en: "Log in", fr: "Se connecter" },
    "splash.signup": { en: "Create an account", fr: "Créer un compte" },
    "splash.guest": { en: "Continue as guest", fr: "Continuer en tant qu'invité" },
    "splash.privacy": { en: "Privacy Policy", fr: "Politique de confidentialité" },
    "splash.authUnavailable": {
      en: "Sign-in isn't configured yet.",
      fr: "La connexion n'est pas encore configurée.",
    },
  };

  // Build reverse lookups so we can translate FROM en/fr back to ar,
  // and directly between en <-> fr, when switching languages.
  function sourceTextFor(lang) {
    // Returns a map of "text currently on screen in `lang`" -> ar key
    if (lang === "ar") return null;
    const map = new Map();
    Object.entries(DICTIONARY).forEach(([ar, translations]) => {
      const text = translations[lang];
      if (text) map.set(text, ar);
    });
    return map;
  }

  function getLang() {
    const stored = localStorage.getItem(LANG_KEY);
    return SUPPORTED.includes(stored) ? stored : "ar";
  }

  function translateNode(node, lang) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const original = node.textContent.trim();
    if (!original) return;

    if (lang === "ar") {
      // Try to find an ar key whose current translation matches this text
      // in any supported language, and restore the Arabic original.
      for (const [ar, translations] of Object.entries(DICTIONARY)) {
        if (translations.en === original || translations.fr === original) {
          node.textContent = node.textContent.replace(original, ar);
          return;
        }
      }
      return;
    }

    // Translating INTO en/fr: check direct Arabic key match first...
    if (DICTIONARY[original] && DICTIONARY[original][lang]) {
      node.textContent = node.textContent.replace(original, DICTIONARY[original][lang]);
      return;
    }
    // ...then check if it's already translated into the OTHER non-ar language.
    for (const [ar, translations] of Object.entries(DICTIONARY)) {
      if (translations.en === original || translations.fr === original) {
        if (translations[lang]) {
          node.textContent = node.textContent.replace(original, translations[lang]);
        }
        return;
      }
    }
  }

  function walkAndTranslate(root, lang) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, textarea, input")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);
    nodes.forEach((node) => translateNode(node, lang));

    // Also handle elements we control via data-i18n="dictionary.key"
    root.querySelectorAll && root.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const entry = DICTIONARY[key];
      if (entry) element.textContent = lang === "ar" ? key : (entry[lang] || key);
    });
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    // Layout direction intentionally stays RTL — see file header comment.
    walkAndTranslate(document.body, lang);
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
    updateSwitcherLabel(lang);
  }

  function labelFor(lang) {
    return { ar: "AR", en: "EN", fr: "FR" }[lang];
  }

  function updateSwitcherLabel(lang) {
    const button = document.getElementById("prime-lang-current");
    if (button) button.textContent = labelFor(lang);
  }

  function buildSwitcher() {
    const root = document.createElement("div");
    root.id = "prime-lang-switcher";
    root.innerHTML = `
      <button type="button" id="prime-lang-toggle" aria-haspopup="true" aria-expanded="false">
        <span aria-hidden="true">🌐</span>
        <span id="prime-lang-current">${labelFor(getLang())}</span>
      </button>
      <div id="prime-lang-menu" hidden>
        ${SUPPORTED.map((lang) => `<button type="button" data-lang="${lang}">${labelFor(lang)}</button>`).join("")}
      </div>
    `;
    document.body.appendChild(root);

    const menu = root.querySelector("#prime-lang-menu");
    root.querySelector("#prime-lang-toggle").addEventListener("click", () => {
      menu.hidden = !menu.hidden;
    });
    root.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        setLang(button.getAttribute("data-lang"));
        menu.hidden = true;
      });
    });
    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) menu.hidden = true;
    });
  }

  function observeAppRerenders() {
    const target = document.getElementById("root") || document.body;
    const observer = new MutationObserver(() => {
      const lang = getLang();
      if (lang !== "ar") walkAndTranslate(target, lang);
    });
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  }

  window.PrimeAIsionI18n = {
    t(key) {
      const lang = getLang();
      if (lang === "ar") return key;
      return (DICTIONARY[key] && DICTIONARY[key][lang]) || key;
    },
    getLang,
    setLang,
  };

  function init() {
    buildSwitcher();
    if (getLang() !== "ar") applyLang(getLang());
    observeAppRerenders();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
