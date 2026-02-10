# API 配置说明

本文档详细说明如何配置 DeepSeek API Key 以及相关的配置选项。

## 🔑 获取 API Key

### 步骤 1：注册账号

1. 访问 [DeepSeek 平台](https://platform.deepseek.com)
2. 点击"注册"创建账号
3. 完成邮箱验证

### 步骤 2：创建 API Key

1. 登录后进入控制台
2. 点击左侧菜单的 **API Keys**
3. 点击 **Create API Key** 按钮
4. 给 Key 起一个名字（如：Ravens Treasure）
5. 复制生成的 API Key（以 `sk-` 开头）

⚠️ **重要**：API Key 只会显示一次，请立即保存！

### 步骤 3：充值（如需要）

- DeepSeek 按使用量计费
- 新用户通常有免费额度
- 可在"账户余额"中查看和充值

---

## ⚙️ 在代码中配置

### 找到配置位置

打开 `index.html` 文件，搜索以下任一关键词：
- `⚠️ 开发者请在此处配置`
- `this.apiKey = 'sk-`
- `class AITreasureService`

您会找到类似这样的代码（约在第 2193-2195 行）：

```javascript
class AITreasureService {
    constructor() {
        // 开发者模式：API Key硬编码在代码中，用户无法修改
        // ⚠️ 开发者请在此处配置您的DeepSeek API Key
        this.apiKey = 'sk-5a7ff33cec6e4518a39669ba90d2e73a'; // 请替换为您的实际API Key
```

### 替换 API Key

将示例 Key 替换为您的实际 Key：

```javascript
// 修改前
this.apiKey = 'sk-5a7ff33cec6e4518a39669ba90d2e73a';

// 修改后
this.apiKey = 'sk-YOUR_ACTUAL_API_KEY_HERE';
```

### 保存文件

确保保存修改后再部署！

---

## 🔧 高级配置

### API 端点和模型配置

在 `index.html` 中找到 `AI_CONFIG` 对象（约第 2131 行）：

```javascript
const AI_CONFIG = {
    provider: 'deepseek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    maxTokens: 200,
    temperature: 0.8,
    timeout: 8000 // 8秒超时
};
```

### 可调整的参数

| 参数 | 说明 | 默认值 | 推荐范围 |
|------|------|--------|---------|
| `model` | 使用的模型 | `deepseek-chat` | - |
| `maxTokens` | 最大生成长度 | `200` | 100-500 |
| `temperature` | 创造性程度 | `0.8` | 0.5-1.0 |
| `timeout` | 请求超时时间(毫秒) | `8000` | 5000-15000 |

#### temperature 说明
- **0.5-0.7**：更保守、一致的输出
- **0.8-0.9**：平衡创造性和一致性（推荐）
- **0.9-1.0**：更有创意但可能不太可控

#### maxTokens 说明
- **100-150**：简短精炼的宝藏名称
- **200-300**：适中的描述长度（推荐）
- **300-500**：更详细的描述

### 修改 AI 提示词

如果想调整 AI 生成的风格，可以修改 `AI_SYSTEM_PROMPT`（约第 2144 行）：

```javascript
const AI_SYSTEM_PROMPT = `你是一只神秘的乌鸦，负责为用户的情绪记录赋予宝藏之名。

角色设定：
- 你是古老而智慧的守护者
- 你的语言简洁、充满诗意和哲理
- 你善于发现平凡中的珍贵之处

任务：
1. 根据用户的情绪和内容，创造一个独特的宝藏名称（4-7个字）
2. 写一句乌鸦点评（15-30字），给予温暖的鼓励或深刻的洞察

...（后续内容）
`;
```

您可以根据需要调整：
- 角色设定
- 语言风格
- 宝藏名称长度
- 点评长度和风格

---

## 💰 费用说明

### DeepSeek 定价

截至 2026 年 2 月：
- **deepseek-chat**: 约 ¥0.001/1K tokens
- **输入/输出**: 均按此计费

### 每次生成的成本估算

基于默认配置（maxTokens: 200）：
- 系统提示词: ~400 tokens
- 用户输入: ~50 tokens
- AI 输出: ~100 tokens
- **总计**: ~550 tokens ≈ ¥0.0006/次

### 月成本估算

| 使用频率 | 每月生成次数 | 预估费用 |
|---------|-------------|---------|
| 轻度使用 | 100次 | ¥0.06 |
| 中度使用 | 500次 | ¥0.30 |
| 重度使用 | 2000次 | ¥1.20 |

**结论**：费用非常低廉，一般用户每月不到 1 元。

### 免费额度

- 新用户通常有初始免费额度
- 具体额度请查看 DeepSeek 平台

---

## 🛡️ 安全最佳实践

### ⚠️ 不要做的事

1. ❌ 不要将包含真实 API Key 的代码上传到公开的 GitHub 仓库
2. ❌ 不要在 commit 历史中暴露 API Key
3. ❌ 不要在社交媒体或论坛分享包含 API Key 的代码
4. ❌ 不要与他人共享您的 API Key

### ✅ 应该做的事

1. ✅ 使用环境变量存储 API Key（生产环境）
2. ✅ 定期更换 API Key
3. ✅ 监控 API 使用量
4. ✅ 设置使用限额提醒
5. ✅ 使用 `.gitignore` 排除包含敏感信息的文件

### 推荐的安全方案

#### 开发环境
```javascript
// 直接配置（仅用于本地开发）
this.apiKey = 'sk-your-dev-key';
```

#### 生产环境

**方案 1：使用无服务器函数（推荐）**
```javascript
// 前端不包含 API Key
const response = await fetch('/.netlify/functions/ai-generate', {
    method: 'POST',
    body: JSON.stringify({ emotion, content })
});
```

**方案 2：使用环境变量（需要构建步骤）**
```javascript
this.apiKey = process.env.DEEPSEEK_API_KEY;
```

**方案 3：使用后端代理**
```javascript
// API Key 存储在服务器端
const response = await fetch('/api/ai-generate', {
    method: 'POST',
    body: JSON.stringify({ emotion, content })
});
```

---

## 🧪 测试 API 配置

### 方法 1：使用浏览器控制台

1. 打开应用页面
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 输入 `testAI()` 并回车
5. 查看测试结果

### 方法 2：直接使用功能

1. 进入"记录"页面
2. 选择一个情绪
3. 输入一些内容
4. 点击"生成宝藏"
5. 观察是否成功生成

### 诊断日志

打开控制台，您会看到类似的日志：

```
🔑 API Key检查: { exists: true, length: 48, isValid: true, ... }
🌐 网络状态: true
🎯 开始生成宝藏: { emotion: "明媚", content: "..." }
🤖 尝试使用AI生成...
📡 正在调用DeepSeek API...
✅ API响应成功: { ... }
✨ AI生成成功
```

如果出现错误，会显示详细的错误信息。

---

## 🔄 降级机制

### 自动降级条件

当以下情况发生时，应用会自动切换到本地模式：

1. API Key 未配置或无效
2. 网络离线
3. API 请求失败（超时、错误等）
4. 超过速率限制（默认 30 次/分钟）

### 本地模式说明

- 使用预设的宝藏名称库
- 不消耗 API 额度
- 生成速度更快
- 但缺少个性化和创意

---

## 📊 监控和维护

### 定期检查

建议每周检查一次：
1. API Key 是否仍然有效
2. API 使用量和余额
3. 是否有异常的使用模式

### DeepSeek 平台监控

在 [DeepSeek 控制台](https://platform.deepseek.com) 可以查看：
- API 调用次数
- Token 使用量
- 费用明细
- 错误率统计

### 设置告警

建议设置：
- 余额低于阈值时发送通知
- 日使用量超过预期时告警
- API Key 即将过期提醒

---

## ❓ 常见问题

### Q: API Key 无效怎么办？

**A**: 
1. 检查 Key 是否完整复制（通常 48 个字符）
2. 确认 Key 是否以 `sk-` 开头
3. 在 DeepSeek 平台检查 Key 状态
4. 如果 Key 泄露，立即删除并创建新的

### Q: 如何切换到其他 AI 服务？

**A**: 修改 `AI_CONFIG` 和相关代码，适配新的 API 格式。

### Q: 可以使用 OpenAI 的 API 吗？

**A**: 可以，但需要修改：
- `endpoint` 改为 OpenAI 端点
- `model` 改为 `gpt-3.5-turbo` 或 `gpt-4`
- API Key 格式可能不同

### Q: 如何限制 API 使用？

**A**: 
1. 在代码中调整速率限制参数
2. 在 DeepSeek 平台设置配额
3. 监控使用量并及时调整

---

**配置完成！现在您可以享受 AI 增强的宝藏生成功能了！** 🎉
