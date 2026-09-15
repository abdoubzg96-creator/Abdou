/*
 * PrimeAIsion form bridge
 *
 * This file intentionally does not import or modify the minified React bundle.
 * It listens in the capture phase so it can read values before React closes
 * the report dialog and removes its textarea from the DOM.
 */
(function primeAIsionFormBridge(window, document) {
  "use strict";

  var config = window.PRIMEAISION_FORM_CONFIG || {};
  var webhookUrl = typeof config.webhookUrl === "string"
    ? config.webhookUrl.trim()
    : "";
  var storageKey = "primeaision-form-submissions";
  var maxStoredSubmissions = 50;

  function safeRead() {
    try {
      var value = window.localStorage.getItem(storageKey);
      var parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("[PrimeAIsion] Could not read local submissions.", error);
      return [];
    }
  }

  function saveLocally(payload) {
    try {
      var submissions = safeRead();
      submissions.push(payload);
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(submissions.slice(-maxStoredSubmissions))
      );
    } catch (error) {
      console.warn("[PrimeAIsion] Could not save submission locally.", error);
    }
  }

  function sendToWebhook(payload) {
    if (!webhookUrl) {
      return Promise.resolve({ skipped: true });
    }

    return window.fetch(webhookUrl, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Webhook responded with HTTP " + response.status);
      }
      return response;
    });
  }

  function collectAndStore(form, fields) {
    var payload = Object.assign({
      form: form,
      source: "primeaision-site",
      page: window.location.href,
      submittedAt: new Date().toISOString(),
    }, fields);

    saveLocally(payload);
    sendToWebhook(payload).catch(function (error) {
      // The local copy is already safe; do not break the existing UI if the
      // external service is unavailable or has not enabled CORS yet.
      console.warn("[PrimeAIsion] Webhook delivery failed.", error);
    });
    window.dispatchEvent(new CustomEvent("primeaision:form-saved", {
      detail: payload,
    }));
  }

  function valueOf(selector) {
    var element = document.querySelector(selector);
    return element && typeof element.value === "string"
      ? element.value.trim()
      : "";
  }

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest("button")
      : null;
    if (!target) {
      return;
    }

    if (target.getAttribute("data-testid") === "button-submit-report") {
      var message = valueOf('[data-testid="textarea-report"]');
      if (message) {
        collectAndStore("report", { message: message });
      }
      return;
    }

    if (
      target.getAttribute("data-testid") === "button-save-profile" ||
      target.getAttribute("data-testid") === "button-save-name"
    ) {
      var displayName = valueOf(
        '[data-testid="input-profile-name"], [data-testid="input-display-name"]'
      );
      if (displayName) {
        collectAndStore("profile", { displayName: displayName });
      }
    }
  }, true);

  // Also supports future native forms added without touching the compiled app.
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || !form.matches || !form.matches("form[data-webhook-form]")) {
      return;
    }

    var fields = {};
    new FormData(form).forEach(function (value, key) {
      if (typeof value === "string") {
        fields[key] = value.trim();
      }
    });
    collectAndStore(form.getAttribute("data-webhook-form") || "custom", fields);
  }, true);

  window.PrimeAIsionForms = {
    getSaved: safeRead,
    send: collectAndStore,
    setWebhook: function (url) {
      webhookUrl = typeof url === "string" ? url.trim() : "";
    },
  };
}(window, document));