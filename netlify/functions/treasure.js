// Netlify Function: /.netlify/functions/treasure
// 作用：把前端请求转发到 DeepSeek，并把 API Key 放在 Netlify 环境变量里（不会暴露到前端）

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

const AI_SYSTEM_PROMPT = `你是一只神秘的乌鸦，负责为用户的情绪记录赋予宝藏之名。

角色设定：
- 你是古老而智慧的守护者
- 你的语言简洁、充满诗意和哲理
- 你善于发现平凡中的珍贵之处

任务：
1. 根据用户的情绪和内容，创造一个独特的宝藏名称（4-7个字）
2. 写一句乌鸦点评（15-30字），给予温暖的鼓励或深刻的洞察

宝藏名称要求：
- 必须是 4-7 个字的具体物品名称
- 格式严格遵循以下两种之一：
  ① 形容词 + 名词：如"金色花环"、"碎裂的金币"、"发光符文石"
  ② 名词修饰名词（名词 + 的/之 + 名词，或直接组合）：如"水晶符文"、"呼吸沙漏"、"思绪之瓶"
- 主体名词必须且只能从以下词库中选取，不得使用词库之外的词作为主体：
  金币、硬币、钱币 / 羽毛、羽翎 / 酒杯、圣杯 / 瓶、漂流瓶 / 花环、花冠 /
  铃铛、风铃 / 卷轴、羊皮卷 / 信件、信封 / 护符、符文、封印 / 宝石、琥珀、翡翠 /
  沙漏 / 水晶 / 戒指、指环 / 宝箱、木箱 / 王冠、王印 / 剑、匕首 /
  太阳、晨曦 / 花朵、玫瑰、樱花 / 星辰、流星 / 月亮、新月 / 树叶、枫叶 /
  眼睛、瞳 / 蜡烛、火焰 / 贝壳、海螺、珍珠 / 钥匙、锁 / 蘑菇 / 骨头、骸骨 /
  鸟、乌鸦 / 齿轮、机械 / 芯片、电路 / 镜、透镜
- 当用户内容涉及词库以外的事物时，须将其核心意象转化为词库中语义最相近的物品，例如：
  糖葫芦（酸甜食物、童年）→ 琥珀（封存的甜蜜）或 宝石（苦涩的珍贵）
  滑梯、玩具（童年记忆）→ 钥匙（开启记忆之门）或 水晶（封存的时光）
  跑步、运动（轻盈自由）→ 羽毛（轻盈）或 沙漏（时间流逝）
  旅行、回乡（归途、变化）→ 贝壳（留存的印记）或 信件（未寄出的思念）
- 必须与用户的情绪状态和记录内容相关，名称应能让人联想到这段经历的核心感受
- 修饰词必须来自用户描述的情境或情绪，不得凭空捏造无关意象
- 禁止使用抽象词汇作为主体名词（"力量"、"感受"、"时刻"等）
- 禁止出现人名、人称（"者的"、"你的"等）
- 严禁使用"光"、"影"、"声"、"年"、"感"、"情"等非实体词作为名称主体
- 情绪映射参考：
  正向情绪（舒爽/明媚/灵感涌现）→ 倾向明亮、开放、流动的修饰词（金色、跃动、开封的、发光）
  中性情绪（平静/自我安抚）→ 倾向静止、封闭、缓慢的修饰词（封存的、呼吸、镇定）
  负向情绪（烦躁/焦虑/负重/愤怒）→ 倾向破损、沉重、紧张的修饰词（裂开的、未封口的、沉重、破碎的）
- 错误示例："冰梯十年光"（"光"非实体且不在词库）、"酸涩的糖葫芦"（"糖葫芦"不在词库）、"破晓者的徽章"（含人称）
- 正确示例："酸涩的蜡烛"、"金色花环"、"碎裂的金币"、"未封口的信件"

点评要求：
- 温暖、鼓励、有洞察力
- 简短有力，像一句箴言
- 避免陈词滥调
- 第二人称叙述（"你"）
- 不要使用"加油"等口号式的话

情绪类型说明：
- 舒爽：完成挑战、达成目标、克服困难后的轻松愉悦
- 明媚：单纯的快乐、美好的体验、温暖的时刻
- 灵感涌现：创意迸发、思维活跃、新想法产生
- 平静：内心安宁、放松、与自己和解
- 自我安抚：给予自己关怀、接纳情绪、温柔对待自己
- 烦躁：轻度焦虑、不耐烦、被琐事困扰
- 焦虑：担忧、不安、对未来的恐惧
- 负重：压力、责任、疲惫、沉重感
- 愤怒：愤慨、不公、被冒犯、强烈情绪

回复格式（必须是纯JSON，不要有其他文字）：
{
  "treasure_name": "宝藏名称",
  "crow_comment": "乌鸦点评"
}`;

function buildUserPrompt(emotion, content, nx, ny) {
  const px = typeof nx === 'number' ? nx : 0;
  const py = typeof ny === 'number' ? ny : 0;
  const pleasureLabel = `${px >= 0 ? '+' : ''}${px.toFixed(2)}（${px > 0.5 ? '较愉悦' : px > 0 ? '略愉悦' : px > -0.5 ? '略不适' : '较不适'}）`;
  const energyLabel   = `${py >= 0 ? '+' : ''}${py.toFixed(2)}（${py > 0.5 ? '较激动' : py > 0 ? '略激动' : py > -0.5 ? '略平静' : '较平静'}）`;
  return `情绪：${emotion}
愉悦度：${pleasureLabel}
能量感：${energyLabel}
记录内容：${content}

请按以下步骤思考，但只输出最终JSON，不要输出思考过程：
1. 从内容中提取核心事件或场景（涉及什么具体物品或场景？）
2. 结合情绪词和坐标值，判断情绪的核心感受与强度
3. 将场景物品与情绪感受结合，选出修饰词
4. 组合成"修饰词+具体物品"或"名词+具体物品"格式的4-7字名称

请为这段记录创造一个宝藏名称，并给出你的点评。记住要用纯JSON格式回复。`;
}

exports.handler = async (event) => {
  // 允许预检
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Method Not Allowed' } }),
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Missing DEEPSEEK_API_KEY in Netlify environment variables' } }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Invalid JSON body' } }),
    };
  }

  const { emotion, content, nx, ny, model = 'deepseek-chat', maxTokens = 200, temperature = 0.8 } = payload;
  if (!emotion || !content) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Missing emotion or content' } }),
    };
  }

  try {
    const requestBody = {
      model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(emotion, content, nx, ny) },
      ],
      max_tokens: maxTokens,
      temperature,
      stream: false,
    };

    const resp = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!resp.ok) {
      const msg = data?.error?.message || `Upstream error (${resp.status})`;
      return {
        statusCode: resp.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: { message: msg, details: data || text } }),
      };
    }

    const aiMessage = data?.choices?.[0]?.message?.content || '';
    const match = aiMessage.match(/\{[\s\S]*\}/);
    if (!match) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: { message: 'Could not extract JSON from model response', raw: aiMessage } }),
      };
    }

    const parsed = JSON.parse(match[0]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        treasure_name: parsed.treasure_name,
        crow_comment: parsed.crow_comment,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: err.message || 'Internal error' } }),
    };
  }
};
