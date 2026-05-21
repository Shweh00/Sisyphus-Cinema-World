# 《Sisyphus' Cinema World》V1

这是一个 Canvas 竖屏向上攀爬网页小游戏原型，手机竖屏优先，也兼容电脑浏览器。项目不依赖外部版权素材，不需要安装依赖，可作为静态站点直接运行。

## 本地启动

```bash
cd /workspace/project
python3 -m http.server 4173 --bind 0.0.0.0
```

打开：

```text
http://127.0.0.1:4173/
```

如果 `4173` 端口已被占用，可以换成其他端口，例如：

```bash
python3 -m http.server 5173 --bind 0.0.0.0
```

## 主要文件

- `index.html`：Canvas 页面外壳，以及极简死亡/重玩弹窗。
- `src/main.js`：场景状态机、主循环、坠落、火死亡、“不要它”和结尾流程。
- `src/config.js`：路线高度、火概率、物理参数、颜色、唤醒半径等核心调参。
- `src/platform.js`：平台生成，以及电视机、报纸、胶卷、画框四类 V1 电影物品。
- `src/fire.js`：火的跟随、漂浮、变暗和触碰结果。
- `src/player.js`：像素小孩移动、跳跃、二段挣扎跳、抓边和爬上。
- `src/audio.js`：Web Audio 氛围音和物品唤醒短音效。
- `src/ending.js`：结尾黑暗下坠与老电视乱码停帧。
- `src/save.js`：使用 `localStorage` 永久解锁“不要它”。

## 常用调参位置

- 平台密度和间距：`src/config.js` 的 `CONFIG.platformGapMin`、`CONFIG.platformGapMax`。
- 平台/物品生成权重：`src/platform.js` 的 `PlatformManager.generateTo()`。
- 火触碰死亡概率：`src/config.js` 的 `CONFIG.fireKillChance`。
- 正常路线高度和结尾触发：`src/config.js` 的 `CONFIG.worldEndY`。
- 火的唤醒距离和触碰距离：`src/config.js` 的 `CONFIG.fireWakeRadius`、`CONFIG.fireContactRadius`。
- 火每次坠落后的变暗幅度：`src/config.js` 的 `CONFIG.fireFadePerFall`。
- 5 次坠落后进入“不要它”：`src/config.js` 的 `CONFIG.maxFallsBeforeLonely`。
- 结尾电视乱码效果：`src/ending.js` 的 `drawStopped()` 与 `drawCrt()`。

## 已实现的 V1 内容

- `start`、`playing`、`fireDeath`、`lonely`、`ending`、`endingStopped` 六类状态。
- 手机点按跳跃/二段跳，左右长按移动；桌面空格/点击跳跃，A/D 或方向键移动。
- 自动抓边，抓边后需要继续按方向、上键、W 或跳跃才会爬上。
- 镜头向上跟随，平台向上程序生成。
- 火会跟随玩家、漂浮、唤醒电影物品，触碰玩家时 50% 杀死、50% 向上托举。
- 每次坠落回到开头，火变暗；第 5 次坠落后火熄灭并进入“不要它”。
- 被火杀死后显示 `重来` / `不要它`，并用 `localStorage` 保存“不要它”解锁。
- “不要它”路线无火、无尽头，所有物品变成普通平台且不再响应。
- 正常路线到达高度后进入结尾：跳入黑暗、下坠、落到老电视机上，电视机显示乱码停帧。

## 验证命令

```bash
cd /workspace/project
for f in src/*.js; do node --check "$f" || exit 1; done
curl -s -o /tmp/sisyphus-root.html -w '%{http_code} %{content_type}\n' --max-time 5 http://127.0.0.1:4173/
curl -s -o /tmp/sisyphus-main.js -w '%{http_code} %{content_type}\n' --max-time 5 http://127.0.0.1:4173/src/main.js
```

当前复核结果：

- 所有 `src/*.js` 语法检查通过。
- `/` 返回 `200 text/html`。
- `/src/main.js` 返回 `200 text/javascript`。
