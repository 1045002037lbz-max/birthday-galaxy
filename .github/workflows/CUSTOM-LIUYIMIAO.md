# 刘怡苗生日网页定制版

## 已完成的定制
- 姓名预设为：刘怡苗。
- 出生日期预设为：2000.11.19，自动完成原有生日资料校验，跳过姓名/生日填写页。
- 打开后直接显示原来的蛋糕开场页面。
- 增加 15 条产科护士主题祝福卡片，以及专属生日祝福信。
- 添加专门为本网页合成的原创轻柔钢琴/音乐盒风格生日配乐：`web/audio/liu-yimiao-birthday.mp3`。
- 保留原来的音乐开关、淡入淡出、蛋糕动画、卡片和后续交互。音乐需点击开场按钮后播放，这是浏览器的正常限制。

## 发布到 GitHub Pages
1. 先 Fork 原仓库到自己的 GitHub 账号。
2. 在自己的仓库中，用本项目文件替换对应文件，务必保留 `.github/workflows/pages.yml`、`web/`、`web/audio/liu-yimiao-birthday.mp3` 等目录和文件。
3. 确认仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 提交到 `main` 分支后，进入 Actions 等待 `Deploy` 工作流成功。
5. 成功后在 Settings → Pages 查看发布网址。

## 音乐文件特别提醒
MP3 文件必须一并上传到 `web/audio/` 目录。`.gitignore` 已为该文件添加例外，不会再被 Git 忽略。不要只上传 `app.js`，否则音乐按钮会出现但没有可播放的音频。
