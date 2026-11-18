# 刘怡苗生日网页定制版

已按需求修改入口：
- 自动填入姓名：刘怡苗
- 自动填入生日：2000.11.19
- 自动完成原项目的生日资料校验，跳过姓名/生日填写页
- 打开后直接显示原来的蛋糕开场页面
- 保留原来的“点击开启音乐与祝福”按钮及后续交互

## 发布到 GitHub Pages

1. 解压本压缩包。
2. 将解压后的项目文件上传/覆盖到你有写入权限的 GitHub 仓库（保留 `.github`、`web` 等目录结构）。
3. 在仓库 Settings → Pages → Build and deployment → Source 中选择 **GitHub Actions**。
4. 将修改后的项目推送到 `main` 或 `master` 分支；新增的 `.github/workflows/pages.yml` 会自动把 `web/` 目录发布到 GitHub Pages。
5. 等待仓库 Actions 中的部署任务成功，进入 Settings → Pages 查看实际网址。

注意：本项目原始开源版默认没有附带背景音乐。若原网站的音乐来自另外添加的音频文件，需把该音频文件一并放入 `web/audio/` 并在 `web/app.js` 的 `BACKGROUND_MUSIC` 配置中设置路径。浏览器仍要求用户点击按钮后才能可靠播放声音。

## 修改入口预设信息

编辑 `web/app.js` 文件末尾的两行：
```js
document.getElementById('birthday-name').value = '刘怡苗';
document.getElementById('birthday-password').value = '2000.11.19';
```
