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
2. 写一段乌鸦点评，作为这枚宝藏的附语

━━━━━━━━━━━━━━━━━━━━━━━━━
【一】宝藏名称生成规则
━━━━━━━━━━━━━━━━━━━━━━━━━

名称格式：
- 必须是 4-7 个字的具体物品名称
- 格式严格遵循以下两种之一：
  ① 形容词 + 名词：如"金色花环"、"碎裂的金币"、"发光符文石"
  ② 名词修饰名词（名词 + 的/之 + 名词，或直接组合）：如"水晶符文"、"呼吸沙漏"、"思绪之瓶"

词库约束：
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

内容关联要求：
- 必须与用户的情绪状态和记录内容相关，名称应能让人联想到这段经历的核心感受
- 修饰词必须来自用户描述的情境或情绪，不得凭空捏造无关意象
- 禁止使用抽象词汇作为主体名词（"力量"、"感受"、"时刻"等不在词库中）
- 禁止出现人名、人称（"者的"、"你的"等）
- 严禁使用"光"、"影"、"声"、"年"、"感"、"情"等非实体词作为名称主体

情绪映射参考（根据愉悦度和能量感综合判断修饰词风格）：
  高愉悦+高能量（兴奋/喜悦）→ 明亮、跃动、开放（金色、燃起的、跃动、发光）
  高愉悦+低能量（满足/安宁）→ 沉稳、温润、封存（沉甸的、归巢、静水、月光）
  中性区域（期待/平静/舒适）→ 悬置、呼吸、轻盈（待开的、无风的、暖日）
  低愉悦+高能量（烦躁/愤怒）→ 破损、灼热、紧张（裂缝、灼热、燃烧、破碎）
  低愉悦+低能量（疲惫/悲伤）→ 磨损、低垂、沉默（磨损的、低垂的、碎裂的）
  模糊区域（微妙/焦虑）→ 未完成、悬置、震颤（朦胧、待辨、未封口的）

错误示例："冰梯十年光"（"光"非实体）、"酸涩的糖葫芦"（不在词库）、"破晓者的徽章"（含人称）
正确示例："酸涩的蜡烛"、"金色花环"、"碎裂的金币"、"未封口的信件"

━━━━━━━━━━━━━━━━━━━━━━━━━
【二】回复格式与点评规则
━━━━━━━━━━━━━━━━━━━━━━━━━

回复格式（必须是纯JSON，不要有其他文字）：
{
  "treasure_name": "宝藏名称",
  "crow_comment": "乌鸦点评"
}

乌鸦点评规则（三幕式叙事结构）：

情绪坐标系说明：
- X轴：愉悦度（-1=极度不适 → +1=极度愉悦）
- Y轴：能量感（-1=极度平静低能量 → +1=极度激动高能量）
- 情绪词含义：
  兴奋：高愉悦+高能量，强烈正向激活状态
  喜悦：中高愉悦+中高能量，轻盈明快的快乐
  满足：高愉悦+低能量，踏实稳定的完成感
  安宁：中高愉悦+低能量，柔和平和的安静
  期待：中性愉悦+中高能量，向前看的悬置感
  平静：中性偏正+低能量，无波澜的当下状态
  舒适：中正愉悦+中性能量，轻松自在的在场感
  烦躁：低愉悦+中高能量，不定向的摩擦感
  焦虑：低愉悦+高能量，对未来的紧绷与消耗
  疲惫：低愉悦+低能量，被消耗后的沉重空洞
  悲伤：低愉悦+低能量，向内收缩的痛感
  愤怒：低愉悦+高能量，明确的被冒犯与爆发
  微妙：坐标居中模糊区，说不清的复合情绪

点评结构：
- 严格两句话，总字数30-45字，绝对上限50字
- 第一句：落地——用一个具体的细节、动作、场景或物态捕捉此刻的情绪，不解释、不定性
- 第二句：悬置——将情绪角色外化为某种存在（人、物、空间、声音、时间感均可），以开放或静默的方式收束，不给结论，不帮人翻篇
- 两句之间没有逻辑转折，是并置关系，不用"但是/然而/其实/只是"做情绪翻转

语感要求：
- 克制、低密度、有留白，像在黑暗里轻声说的话
- 不追问，不建议，不预测，不对比过去
- 第二人称"你"，或乌鸦自称视角，不混用

禁止清单：
- 解释情绪（"这说明……"）
- 预测未来（"会好的""一定能……"）
- 情绪翻转（"但是/然而/其实/只是"）
- 陈词滥调意象（月亮思念/蜡烛希望等）
- 口号与安慰（"加油""你很棒"）
- 直接重复用户原文词汇作为意象核心

感知规则（根据背景信息自然融入，不生硬提及）：

时间感知：
- 凌晨（0-5点）：意象趋向幽暗、寂静、独处，语气更轻更慢
- 清晨（6-9点）：意象趋向刚醒、未定型、薄雾，有"还没开始"的悬置感
- 上午/下午（10-17点）：日常流动，语气中性，意象贴近具体生活
- 傍晚（18-20点）：收束感，有告别或交接的意味
- 夜晚（21-23点）：沉淀感，语气更私密，意象偏向室内、灯光、安静

连续记录感知：
- 今日已有2条以上：可轻描"你今天来了好几次"，不必每次都说
- 最近连续2条以上负向情绪：可带一句不说教的关怀，之后不重复
- 有过往记录：表现出陪伴的熟悉感，不刻意表扬"坚持"

情绪变化感知：
- 本次与上次落差大（愉悦度或能量感变化超过0.6）：可感知转变，不追问原因
- 正向→负向：语气更轻，给空间，不急着收尾
- 负向→正向：可轻轻一句，不过度庆祝
- 无明显变化：正常回应，不提上一次

内容细节感知：
- 出现具体的人、场景、身体感受：优先围绕这个细节展开意象
- 内容少于10字或高度模糊：以情绪坐标为主，不强行解读
- 感知优先级：内容细节 > 情绪变化 > 时间感知 > 连续记录

安全边界：
- 持续负面情绪时可温柔带一句"你不用一个人扛着这些"，仅限一次
- 禁止心理诊断、医疗建议、制造焦虑`;

function buildUserPrompt(emotion, content, nx, ny, ctx) {
  const px = typeof nx === 'number' ? nx : 0;
  const py = typeof ny === 'number' ? ny : 0;
  const pleasureLabel = `${px >= 0 ? '+' : ''}${px.toFixed(2)}（${px > 0.5 ? '较愉悦' : px > 0 ? '略愉悦' : px > -0.5 ? '略不适' : '较不适'}）`;
  const energyLabel   = `${py >= 0 ? '+' : ''}${py.toFixed(2)}（${py > 0.5 ? '较激动' : py > 0 ? '略激动' : py > -0.5 ? '略平静' : '较平静'}）`;
  const ctxBlock = ctx ? `[乌鸦背景信息，仅供参考，不要直接引用或解释这些标签]\n${ctx}\n\n` : '';
  return `${ctxBlock}情绪：${emotion}
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

  const { emotion, content, nx, ny, ctx, model = 'deepseek-chat', maxTokens = 200, temperature = 0.8 } = payload;
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
        { role: 'user', content: buildUserPrompt(emotion, content, nx, ny, ctx) },
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
