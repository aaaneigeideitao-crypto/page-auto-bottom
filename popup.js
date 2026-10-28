"use strict";

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const page = document.getElementById("page");
const now = document.getElementById("now");
const error = document.getElementById("error");

let tabId = null;
let currentKey = null;
let enabled = false;
let isWebPage = false;

function showError(message) {
  error.textContent = message;
  error.hidden = !message;
}

function render() {
  const supported = Boolean(currentKey);
  toggle.disabled = !supported;
  toggle.setAttribute("aria-checked", String(enabled));
  now.disabled = !supported || !enabled;
  status.textContent = !supported
    ? (isWebPage ? "暂时无法连接此网页" : "当前页面不支持自动滚动")
    : enabled ? "已开启 · 每分钟滚到底" : "已关闭（默认）";
}

async function initialize() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("找不到当前标签页");
    tabId = tab.id;
    let url;
    try { url = new URL(tab.url); } catch (_) {}
    isWebPage = Boolean(url && ["http:", "https:"].includes(url.protocol));
    if (!isWebPage) {
      page.textContent = tab.title || "当前页面";
      showError("Chrome 内部页面和扩展页面不支持自动滚动。");
      render();
      return;
    }

    page.textContent = url.origin + url.pathname;
    let response;
    try {
      response = await chrome.tabs.sendMessage(tabId, { type: "AUTO_BOTTOM_GET_PAGE" });
      if (response?.build !== 2) throw new Error("需要注入新版脚本");
    } catch (_) {
      // A ChatGPT tab may have been opened before this extension was installed.
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
        response = await chrome.tabs.sendMessage(tabId, { type: "AUTO_BOTTOM_GET_PAGE" });
      } catch (_) {
        showError("这是普通网页，但插件无法连接。请检查扩展的网站访问权限；也可刷新页面重试。");
        render();
        return;
      }
    }

    if (!response?.key) {
      showError("已连接网页，但无法获取当前网址。");
      render();
      return;
    }
    currentKey = response.key;
    page.textContent = response.url || page.textContent;
    const stored = await chrome.storage.local.get(currentKey);
    enabled = stored[currentKey] === true;
    render();
    showError("");
  } catch (_) {
    render();
    showError("无法读取当前标签页，请关闭插件窗口后重试。");
  }
}

toggle.addEventListener("click", async () => {
  if (!currentKey) return;
  toggle.disabled = true;
  const next = !enabled;
  try {
    await chrome.storage.local.set({ [currentKey]: next });
    enabled = next;
    showError("");
  } catch (_) {
    showError("保存失败，请重新打开插件再试。");
  } finally {
    render();
  }
});

now.addEventListener("click", async () => {
  if (!enabled || !tabId) return;
  try {
    await chrome.tabs.sendMessage(tabId, { type: "AUTO_BOTTOM_NOW" });
  } catch (_) {
    showError("页面可能已刷新，请刷新后再试。");
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !currentKey || !changes[currentKey]) return;
  enabled = changes[currentKey].newValue === true;
  render();
});

void initialize();
