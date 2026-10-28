(() => {
  "use strict";

  // Multiple popup opens must not install duplicate listeners.
  if (globalThis.__pageAutoBottomV2) return;
  globalThis.__pageAutoBottomV2 = true;

  const STORAGE_PREFIX = "page-auto-bottom:";
  const SCROLL_SELECTOR = [
    "main", "[role='main']", "#thread", "[data-scroll-container]",
    "[data-testid*='scroll']", "[class*='overflow']",
    "[style*='overflow']"
  ].join(",");

  let currentKey = null;
  let isEnabled = false;
  let revision = 0;

  function pageKey() {
    if (location.protocol !== "https:" && location.protocol !== "http:") return null;
    const path = location.pathname.replace(new RegExp("/+$"), "") || "/";
    return STORAGE_PREFIX + location.origin + path;
  }

  function reportBadge() {
    try {
      void chrome.runtime.sendMessage({
        type: "AUTO_BOTTOM_BADGE",
        enabled: isEnabled
      }).catch(() => {});
    } catch (_) {
      // The extension may have been reloaded while the tab remained open.
    }
  }

  function scrollBottom() {
    if (!isEnabled) return;
    const candidates = new Set([
      document.scrollingElement, document.documentElement, document.body
    ]);
    document.querySelectorAll(SCROLL_SELECTOR).forEach((node) => candidates.add(node));

    // Chat/conversation pages may scroll an ancestor of the message list.
    const marker = document.querySelector(
      "#thread, [data-testid^='conversation-turn'], [data-message-author-role]"
    );
    if (marker) {
      let node = marker;
      while (node && node !== document.documentElement) {
        candidates.add(node);
        node = node.parentElement;
      }
    }

    let winner = null;
    let bestScore = -Infinity;

    for (const el of candidates) {
      if (!(el instanceof HTMLElement)) continue;
      if (el.closest("nav, aside, [role='navigation'], [role='dialog']")) continue;
      if (el.clientHeight < 140 || el.clientWidth < 200) continue;
      if (el.scrollHeight - el.clientHeight < 24) continue;
      const style = getComputedStyle(el);
      if (!/auto|scroll|overlay/.test(style.overflowY) &&
          el !== document.scrollingElement && el !== document.body) continue;
      if (style.visibility === "hidden" || style.display === "none") continue;

      let score = Math.min(el.clientHeight / 10, 100);
      if (el === document.scrollingElement) score += 10;
      if (el.closest("main, [role='main']") ||
          el.matches("main, [role='main']")) score += 100;
      if (marker && (el === marker || el.contains(marker))) score += 180;
      if (el.querySelector("[data-message-author-role], [data-testid^='conversation-turn']")) {
        score += 140;
      }
      if (el.matches("pre, code, textarea") || el.closest("pre, code")) {
        score -= 500;
      }

      if (score > bestScore) {
        winner = el;
        bestScore = score;
      }
    }

    if (winner) {
      winner.scrollTop = winner.scrollHeight;
      if (winner === document.scrollingElement || winner === document.body) {
        window.scrollTo(0, winner.scrollHeight);
      }
    } else {
      const doc = document.scrollingElement || document.documentElement;
      doc.scrollTop = doc.scrollHeight;
      window.scrollTo(0, doc.scrollHeight);
    }
  }

  function doScroll() {
    if (!isEnabled) return;
    scrollBottom();
    // Some dynamic pages append content while processing the first scroll.
    setTimeout(scrollBottom, 400);
    setTimeout(scrollBottom, 1200);
  }

  async function syncPageState() {
    const key = pageKey();
    if (key === currentKey && revision !== 0) return;

    const requestRevision = ++revision;
    currentKey = key;
    isEnabled = false;
    reportBadge();
    if (!key) return;

    try {
      const stored = await chrome.storage.local.get(key);
      if (revision !== requestRevision || currentKey !== key) return;
      isEnabled = stored[key] === true;
      reportBadge();
      if (isEnabled) doScroll();
    } catch (_) {
      isEnabled = false;
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !currentKey || !changes[currentKey]) return;
    isEnabled = changes[currentKey].newValue === true;
    reportBadge();
    if (isEnabled) doScroll();
  });

  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type === "AUTO_BOTTOM_GET_PAGE") {
      const key = pageKey();
      if (key !== currentKey) {
        void syncPageState().then(() => respond({
          build: 2, key: currentKey, enabled: isEnabled, title: document.title,
          url: location.origin + location.pathname
        }));
        return true;
      }
      respond({
        build: 2, key: currentKey, enabled: isEnabled, title: document.title,
        url: location.origin + location.pathname
      });
      return;
    }

    if (message?.type === "AUTO_BOTTOM_TICK" ||
        message?.type === "AUTO_BOTTOM_NOW") {
      if (pageKey() !== currentKey) {
        void syncPageState().then(() => {
          if (isEnabled) doScroll();
        });
      } else {
        doScroll();
      }
      respond({ received: true });
    }
  });

  addEventListener("popstate", () => { void syncPageState(); });
  addEventListener("hashchange", () => { void syncPageState(); });
  addEventListener("pageshow", () => { void syncPageState(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void syncPageState();
  });

  // React/SPA navigation often uses pushState without popstate.
  setInterval(() => {
    if (pageKey() !== currentKey) void syncPageState();
  }, 3000);

  void syncPageState();
})();
