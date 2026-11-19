# 潘姝含生日网页定制版

## 已修改内容
- 打开网页时跳过姓名、出生日期填写页，直接进入原有蛋糕开场页。
- 预设姓名：潘姝含。
- 预设出生日期：2000.11.21。
- 保留原有蛋糕开场、心形卡片动画、卡片拖动/阅读、3D 蛋糕工坊、许愿与祝福信等交互。
- 将64张心形卡片的祝福调整为社区工作主题，围绕玄武湖街道仙居雅苑党群服务中心的居民服务、邻里关怀、志愿服务和基层工作。
- 将生日祝福信改为适配社区工作者的内容。

## 背景音乐
选用 Pixabay 上 Universfield 的《Peaceful Piano Background》（1分37秒，纯钢琴，页面标注可在 Pixabay Content License 下使用）：
https://pixabay.com/music/modern-classical-peaceful-piano-background-268021/

由于 Pixabay 的下载需由使用者在其页面主动下载，本压缩包没有擅自镜像或再分发音频文件。下载 MP3 后放入 `web/audio/peaceful-piano-background.mp3`，再在 `web/app.js` 中把：
```js
const BACKGROUND_MUSIC = { src: "", title: "" };
```
改为：
```js
const BACKGROUND_MUSIC = {
  src: "audio/peaceful-piano-background.mp3",
  title: "Peaceful Piano Background"
};
```
随后重新上传整个项目。音乐会在用户点击原有蛋糕开场按钮时播放，这是浏览器对自动播放声音的限制。

## 发布到 GitHub Pages
1. 解压本压缩包。
2. 将解压后的项目文件上传/覆盖到你有写入权限的 GitHub 仓库，保留 `.github`、`web` 等目录结构。
3. 在仓库 Settings → Pages → Build and deployment → Source 中选择 **GitHub Actions**。
4. 将修改后的项目推送到 `main` 或 `master` 分支。
5. 等待 GitHub Actions 中的部署任务成功，再打开 GitHub Pages 地址。

注意：本项目保留原有开源版结构，GitHub Pages 部署目录为 `web/`。
