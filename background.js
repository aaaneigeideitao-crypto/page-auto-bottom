"use strict";

const ALARM_NAME = "page-auto-bottom-every-minute";

async function ensureAlarm() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  }
}

chrome.runtime.onInstalled.addListener(() => { void ensureAlarm(); });
chrome.runtime.onStartup.addListener(() => { void ensureAlarm(); });
void ensureAlarm();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(
    tabs.filter((tab) => Number.isInteger(tab.id)).map((tab) =>
      chrome.tabs.sendMessage(tab.id, { type: "AUTO_BOTTOM_TICK" })
    )
  );
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "AUTO_BOTTOM_BADGE" || !sender.tab?.id) return;
  const tabId = sender.tab.id;
  void (async () => {
    await chrome.action.setBadgeText({
      tabId,
      text: message.enabled === true ? "ON" : ""
    });
    if (message.enabled === true) {
      await chrome.action.setBadgeBackgroundColor({ tabId, color: "#16803c" });
    }
  })().catch(() => {});
});
