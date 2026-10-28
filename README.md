# 页面每分钟滚到底（Page Auto Bottom）

一个轻量的 Chrome 扩展：按页面单独开启自动滚动，适合需要持续查看新内容的长页面，例如 ChatGPT 对话。

**当前版本：1.1.0 · Manifest V3**

## 功能

- **默认关闭**：只有手动开启的网址才会自动滚动。
- **按页面保存设置**：使用「协议 + 域名 + 路径」识别页面；查询参数和锚点不参与识别。
- **每分钟滚到底**：启用后立即滚动，此后由 Chrome Alarms 每分钟触发一次。
- **立即滚到底部**：在插件弹窗中手动触发。
- **多标签同步**：相同网址的多个标签页共享开启状态；刷新后仍保留。
- **支持内部滚动区域**：会寻找适合滚动的容器，适配 ChatGPT 等页面。
- **支持单页应用导航**：页面地址切换后自动读取对应设置。
- **本地运行**：无账户、无遥测、无外部网络请求；开关设置保存在 Chrome 本地存储。

## 安装

1. 下载或克隆本仓库。
2. 在 Chrome 地址栏打开 chrome://extensions/。
3. 打开右上角的「开发者模式」。
4. 点击「加载已解压的扩展程序」，选择仓库根目录（包含 manifest.json）。
5. 打开普通网站，点击工具栏的插件图标，按需开启。

如果插件刚安装时已有网页打开，弹窗会尝试注入脚本；连接失败可刷新网页重试。

## 使用

1. 打开想要自动滚动的网址。
2. 点击「页面每分钟滚到底」图标。
3. 打开「当前页面自动滚动」开关。
4. 开启后会立即滚动，之后每分钟自动滚到底；也可以点击「立即滚到底部」。
5. 再次关闭开关即可停止自动滚动。

同一个网站的不同路径会分别保存设置；Chrome 内部页面、扩展页面和 Chrome Web Store 等禁止注入的页面不支持。

## 权限说明

| 权限 | 用途 |
| --- | --- |
| storage | 在浏览器本地保存各页面的开关状态 |
| alarms | 每分钟触发一次自动滚动 |
| tabs | 找到当前标签页、向已打开的标签页发送滚动消息 |
| scripting | 为插件安装前已打开的网页补充注入脚本 |
| http://*/*、https://*/* | 在普通网页中注入本地滚动脚本；默认不会自动滚动 |

虽然扩展可以在普通网页中运行，但**每个页面默认关闭**，不会自动上传或收集页面内容。

## 源码结构

- manifest.json：扩展声明与权限。
- background.js：每分钟的 Alarm 和标签页消息。
- content.js：页面状态读取、滚动容器识别与滚动执行。
- popup.html / popup.css / popup.js：插件弹窗界面。
- icon16.png / icon48.png / icon128.png：插件图标。

## 开发与检查

无需安装依赖或构建工具。修改文件后，在 chrome://extensions/ 点击此扩展的刷新按钮即可重新加载。

可使用 Node.js 检查脚本语法：

    node --check background.js
    node --check content.js
    node --check popup.js

## 许可证

[MIT License](LICENSE)。

## 开源文档与反馈

- [English README](README_EN.md)
- [隐私政策 / Privacy Policy](PRIVACY.md)
- [贡献指南 / Contributing](CONTRIBUTING.md)
- [安全政策 / Security](SECURITY.md)
- [社区行为准则 / Code of Conduct](CODE_OF_CONDUCT.md)
- [更新记录 / Changelog](CHANGELOG.md)

可通过本仓库的 GitHub Issues 报告非敏感问题和提出建议。不要公开粘贴私人聊天、账号、令牌或完整私人网址。

**声明：** 本项目为独立开源扩展，不属于 OpenAI 官方产品，也未获得 OpenAI 背书。
