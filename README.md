# 命运酒单转盘 (Lucky Drink Wheel)

一个简单的网页应用，帮你决定今晚喝什么！

## 特性
- 🎰 **炉石传说风格**：转动的卷轴效果。
- 🎵 **音效**：自带转动和胜利音效（无需下载音频文件）。
- 📝 **可配置**：修改 `config.js` 即可自定义酒单。
- 📱 **响应式**：手机和电脑都能用。

## 如何修改酒单
1. 打开 `config.js` 文件。
2. 修改 `DRINKS` 列表中的文字。
3. 保存即可。

## 快速部署 (GitHub Pages)
1. 在 GitHub 上创建一个新仓库 (例如 `lucky-wheel`)。
2. 将本地代码推送到仓库：
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lucky-wheel.git
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```
3. 进入 GitHub 仓库 -> **Settings** -> **Pages**。
4. 在 **Source** 下选择 `main` 分支，点击保存。
5. 等待几秒，你的网站就已经上线了！

## 本地运行
直接双击打开 `index.html` 即可（部分浏览器可能因安全策略限制音频，建议使用本地服务器）：
```bash
python3 -m http.server
```
然后访问 `http://localhost:8000`。
