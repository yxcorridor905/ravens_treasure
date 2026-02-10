# 乌鸦的宝藏 - 部署包

## 📦 包含文件

```
ravens_treasure_deploy/
├── index.html              # 主应用文件
├── README.md              # 本说明文件
├── DEPLOYMENT.md          # 部署指南
├── API_CONFIG.md          # API配置说明
└── CHANGELOG.md           # 更新日志
```

## 🚀 快速开始

### 本地测试
1. 直接双击打开 `index.html`
2. 或使用本地服务器：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```
3. 浏览器访问 `http://localhost:8000`

### 在线部署
支持部署到以下平台：
- ✅ GitHub Pages
- ✅ Netlify
- ✅ Vercel
- ✅ 云服务器（Nginx/Apache）
- ✅ 静态网站托管服务

详细步骤请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## ⚙️ 配置 API Key

**重要：在部署前必须配置 DeepSeek API Key**

1. 打开 `index.html` 文件
2. 搜索 `⚠️ 开发者请在此处配置`
3. 将以下内容：
   ```javascript
   this.apiKey = 'sk-5a7ff33cec6e4518a39669ba90d2e73a';
   ```
   替换为您的实际 API Key：
   ```javascript
   this.apiKey = 'sk-YOUR_ACTUAL_API_KEY_HERE';
   ```
4. 保存文件

获取 API Key：https://platform.deepseek.com

详细说明请查看 [API_CONFIG.md](API_CONFIG.md)

## ✨ 功能特性

### 核心功能
- 📝 情绪记录与宝藏生成
- 🤖 AI 增强描述（DeepSeek API）
- 📚 本地模式降级（无需API也能使用）
- 🎁 随机抽取宝藏
- 🎵 背景音乐与音效
- 📊 统计功能（宝藏总数、记录天数）

### 技术特点
- 🌐 纯前端应用，无需后端
- 💾 LocalStorage 本地存储
- 📱 响应式设计（手机/桌面）
- 🎨 精美的视觉效果
- 🔒 API Key 对用户隐藏

## 🔐 安全提示

### ⚠️ 重要安全建议

1. **不要在公共代码仓库中暴露 API Key**
   - 如果使用 GitHub，请将包含真实 API Key 的版本放在私有仓库
   - 或使用环境变量/服务端代理

2. **建议的安全方案**：
   - **方案A**：使用服务端代理（推荐用于公开项目）
   - **方案B**：将 API Key 配置放在服务器端环境变量
   - **方案C**：使用私有仓库部署

3. **生产环境建议**：
   - 使用 Netlify/Vercel 的环境变量功能
   - 设置 API 请求频率限制
   - 监控 API 使用量

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器

## 🐛 故障排除

### AI 功能不工作
1. 检查浏览器控制台（F12）
2. 确认 API Key 已正确配置
3. 检查网络连接
4. 验证 DeepSeek 服务状态

### 数据丢失
- 应用使用 LocalStorage 存储数据
- 清除浏览器缓存会删除所有宝藏
- 建议定期导出数据（未来功能）

### 音乐不播放
- 某些浏览器需要用户交互后才能播放音频
- 点击页面任意位置激活音频系统

## 📞 技术支持

如遇到问题，请检查：
1. API Key 是否正确配置
2. 浏览器控制台的错误信息
3. 网络连接是否正常
4. DeepSeek 服务是否可用

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新信息。

## 📄 许可证

本项目为开源项目，供学习和个人使用。

---

**祝您使用愉快！✨**

如有问题或建议，欢迎反馈。
