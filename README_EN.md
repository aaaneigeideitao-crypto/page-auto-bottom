# Page Auto Bottom — Chrome Extension

A lightweight, open-source Chrome extension that scrolls selected pages to the bottom every minute. Useful for long pages that keep receiving new content, including ChatGPT conversations. **Not affiliated with or endorsed by OpenAI.**

**Version:** 1.1.0 · Chrome Manifest V3 · [MIT License](LICENSE)

## Features

- **Off by default.** Enable it only for pages you choose.
- **Per-page preferences.** Each origin and path has a separate on/off setting; query strings and URL fragments are ignored.
- **Auto-scroll every minute.** Enabled pages scroll immediately, then roughly every minute using Chrome Alarms.
- **Scroll now.** Manually trigger a scroll from the toolbar popup.
- **Shared settings.** Multiple tabs at the same URL share preferences; settings survive reloads.
- **Nested scroll containers.** Finds the main scrolling area of modern sites, including conversational UIs.
- **Single-page app support.** Detects route changes.
- **Local-only operation.** No accounts, telemetry, ads, or external requests.

## Installation

1. Download or clone this repository.
2. Open `chrome://extensions/` in Google Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose the repository root containing `manifest.json`.
5. Open a regular website, click the extension icon, and enable auto-scroll.

Reload an already open page if the extension cannot connect. Chrome internal pages and the Chrome Web Store do not permit extension injection.

## Permissions

| Permission | Reason |
| --- | --- |
| `storage` | Saves per-page preferences in Chrome's local extension storage |
| `alarms` | Schedules a check every minute |
| `tabs` | Sends scroll messages to open tabs |
| `scripting` | Injects a content script into pages opened before the extension was installed |
| `http://*/*`, `https://*/*` | Lets the content script identify the page's main scroll container |

Content scripts can run on regular web pages, but **scrolling is disabled by default**. The script inspects DOM and scroll properties locally; it does not retain or transmit page content. For details, see [Privacy Policy](PRIVACY.md).

## Development

No build tools or dependencies required. Edit the files, reload the extension in `chrome://extensions/`, then reload the test page.

    node --check background.js
    node --check content.js
    node --check popup.js

See [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md), and [Changelog](CHANGELOG.md).

For Chinese documentation, see [README.md](README.md).
