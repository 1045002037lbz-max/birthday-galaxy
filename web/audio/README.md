# 背景音乐

本定制版选用 Pixabay 的纯钢琴曲《Peaceful Piano Background》（Universfield，1:37）：
https://pixabay.com/music/modern-classical-peaceful-piano-background-268021/

该页面标注可在 Pixabay Content License 下使用。请在 Pixabay 页面点击 Free download 下载 MP3，并保存为：

`web/audio/peaceful-piano-background.mp3`

然后在 `web/app.js` 中设置：

```js
const BACKGROUND_MUSIC = {
  src: "audio/peaceful-piano-background.mp3",
  title: "Peaceful Piano Background"
};
```

点击网页原有的蛋糕开场按钮后才会播放，以符合浏览器的自动播放限制。请保留下载页面和许可信息以便日后核对。
