# 部署指南

本文档提供详细的部署步骤，帮助您将"乌鸦的宝藏"部署到各种平台。

## 📋 部署前准备

### 1. 配置 API Key

**必须完成此步骤，否则 AI 功能将无法工作！**

```javascript
// 在 index.html 中找到以下代码（约第 2195 行）
this.apiKey = 'sk-5a7ff33cec6e4518a39669ba90d2e73a';

// 替换为您的实际 API Key
this.apiKey = 'sk-YOUR_ACTUAL_API_KEY_HERE';
```

### 2. 测试功能

在部署前，先在本地测试：
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

打开浏览器访问 `http://localhost:8000`，测试所有功能是否正常。

---

## 🌐 部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: Ravens Treasure"

# 创建并推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/ravens-treasure.git
git branch -M main
git push -u origin main
```

### 步骤 2：启用 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 **main** / **root**
4. 点击 **Save**
5. 等待几分钟，访问 `https://YOUR_USERNAME.github.io/ravens-treasure/`

### ⚠️ 安全注意

GitHub Pages 是公开的！如果不想暴露 API Key：
- 使用私有仓库（需要 GitHub Pro）
- 或使用下面的 Netlify/Vercel 方案

---

## 🚀 部署到 Netlify

### 方法 1：拖拽部署（最简单）

1. 访问 [netlify.com](https://www.netlify.com/)
2. 注册/登录账号
3. 点击 **Add new site** → **Deploy manually**
4. 将整个 `ravens_treasure_deploy` 文件夹拖拽到页面
5. 等待部署完成
6. 获得类似 `https://random-name-123.netlify.app` 的网址

### 方法 2：从 Git 部署

1. 将代码推送到 GitHub
2. 在 Netlify 点击 **Add new site** → **Import from Git**
3. 选择您的仓库
4. Build settings:
   - Build command: (留空)
   - Publish directory: `/`
5. 点击 **Deploy site**

### 配置环境变量（可选但推荐）

为了安全，可以将 API Key 设置为环境变量：

1. 在 Netlify 项目中，进入 **Site settings** → **Environment variables**
2. 添加变量：
   - Key: `DEEPSEEK_API_KEY`
   - Value: `sk-YOUR_ACTUAL_API_KEY`
3. 修改 `index.html` 中的代码：
   ```javascript
   // 需要配合 Netlify Functions 使用
   // 这是进阶方案，建议先使用直接配置的方式
   ```

---

## ⚡ 部署到 Vercel

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：部署

```bash
cd ravens_treasure_deploy
vercel
```

按提示操作：
1. 设置项目名称
2. 选择框架：**Other**
3. 确认部署

部署完成后会得到一个 `https://your-project.vercel.app` 网址。

### 使用 Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com/)
2. 登录并点击 **Add New** → **Project**
3. 导入您的 GitHub 仓库
4. 框架选择 **Other**
5. 点击 **Deploy**

---

## 🖥️ 部署到云服务器（Nginx）

### 假设使用 Ubuntu Server

### 步骤 1：安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 步骤 2：上传文件

```bash
# 使用 SCP 上传
scp -r ravens_treasure_deploy/* user@your-server:/var/www/ravens-treasure/

# 或使用 SFTP 客户端（如 FileZilla）
```

### 步骤 3：配置 Nginx

创建配置文件：
```bash
sudo nano /etc/nginx/sites-available/ravens-treasure
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名
    
    root /var/www/ravens-treasure;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/ravens-treasure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 步骤 4：配置 HTTPS（推荐）

使用 Let's Encrypt：
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🐳 使用 Docker 部署（可选）

### Dockerfile

创建 `Dockerfile`：
```dockerfile
FROM nginx:alpine

# 复制文件
COPY ravens_treasure_deploy/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 构建并运行

```bash
# 构建镜像
docker build -t ravens-treasure .

# 运行容器
docker run -d -p 80:80 ravens-treasure
```

### Docker Compose

创建 `docker-compose.yml`：
```yaml
version: '3'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./ravens_treasure_deploy:/usr/share/nginx/html
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

---

## 🔒 安全加固建议

### 1. API Key 保护

**生产环境最佳实践**：

不要将 API Key 直接写在前端代码中。使用以下方案之一：

#### 方案 A：使用无服务器函数（推荐）

**Netlify Functions 示例**：

创建 `netlify/functions/ai-generate.js`：
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { emotion, content } = JSON.parse(event.body);
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '...' },
        { role: 'user', content: `情绪：${emotion}\n内容：${content}` }
      ]
    })
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

然后在前端调用：
```javascript
const response = await fetch('/.netlify/functions/ai-generate', {
  method: 'POST',
  body: JSON.stringify({ emotion, content })
});
```

#### 方案 B：使用反向代理

在 Nginx 配置中添加：
```nginx
location /api/ {
    proxy_pass https://api.deepseek.com/;
    proxy_set_header Authorization "Bearer YOUR_API_KEY";
}
```

### 2. HTTPS

始终使用 HTTPS，特别是处理 API 请求时。

### 3. CSP (内容安全策略)

在 HTML 的 `<head>` 中添加：
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://api.deepseek.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

---

## 📊 性能优化

### 1. 启用压缩

确保服务器启用了 Gzip/Brotli 压缩。

### 2. CDN 加速

使用 Cloudflare 等 CDN 服务加速访问。

### 3. 资源优化

- HTML 文件已经是单文件，无需额外处理
- 考虑提取内联的大型 Base64 资源

---

## 🧪 部署后测试清单

- [ ] 页面能正常打开
- [ ] 响应式布局正常（手机/桌面）
- [ ] 能创建新宝藏
- [ ] AI 生成功能正常工作
- [ ] 本地降级模式正常
- [ ] 宝藏盒显示正确
- [ ] 抽取功能正常
- [ ] 音乐和音效正常
- [ ] 统计数据正确显示
- [ ] LocalStorage 数据持久化
- [ ] 控制台无错误信息

---

## 🆘 常见问题

### Q: API 调用失败

**A**: 检查：
1. API Key 是否正确配置
2. 浏览器控制台的具体错误信息
3. 网络是否能访问 DeepSeek API
4. CORS 策略（如果使用代理）

### Q: 部署后页面空白

**A**: 检查：
1. 浏览器控制台的错误信息
2. 网络请求是否正常
3. index.html 文件路径是否正确

### Q: GitHub Pages 404

**A**: 
1. 确保仓库中有 index.html
2. 检查 Pages 设置是否正确
3. 等待几分钟让部署生效

---

**部署完成！享受您的宝藏之旅吧！✨**
