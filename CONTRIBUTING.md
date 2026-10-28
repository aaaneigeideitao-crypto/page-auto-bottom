# 贡献指南 / Contributing

欢迎提交 Bug 反馈、功能建议和 Pull Request。本项目尽量保持简单：原生 Chrome Manifest V3，零运行时依赖，不需要打包工具。

## 本地开发

1. Fork 仓库并克隆到本地。
2. 在 `chrome://extensions/` 打开开发者模式。
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的仓库根目录。
4. 修改源码后，在扩展管理页面点击刷新，并刷新相关网页。

## 提交前检查

执行：

    node --check background.js
    node --check content.js
    node --check popup.js
    node -e "const m=require('./manifest.json'); if(m.manifest_version!==3)process.exit(1)"

建议再手动确认：

- 新安装后默认关闭；不影响未开启的网页。
- 当前页面开关、立即滚动以及约 1 分钟后的自动滚动正常。
- 相同网址多标签共享设置；不同路径独立；刷新后仍保留。
- 前端路由切换后会按新路径恢复设置。
- ChatGPT 这样的内部滚动容器能够正确向下滚动。
- Chrome 内部页面与不支持注入的页面会合理提示。
- 关闭后不再自动滚动，浏览器控制台没有新增异常。

## Pull Request 要求

- 尽量一个 PR 解决一个问题，说明原因和验证方式。
- 修改 UI 时附上截图；修改权限或隐私行为时同步更新 `README.md` 与 `PRIVACY.md`。
- 不上传访问令牌、账号、网页正文、个人对话、浏览器用户数据或打包后的本地配置。
- 不为简单扩展引入不必要的构建工具、第三方服务或新的广泛权限。

提交贡献即表示同意你的贡献按仓库的 [MIT License](LICENSE) 分发。
