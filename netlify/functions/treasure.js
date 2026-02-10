// Netlify Function: /.netlify/functions/treasure
// 作用：把前端请求转发到 DeepSeek，并把 API Key 放在 Netlify 环境变量里（不会暴露到前端）

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

const AI_SYSTEM_PROMPT = `你是一只神秘的乌鸦，负责为用户的情绪记录赋予宝藏之名。

规则：
- 宝藏名称：4-7个字，富有诗意与象征
- 乌鸦点评：15-30字，温暖、有洞察
- 避免口号式“加油”等陈词滥调
- 第二人称叙述（“你”）
- 必须输出纯JSON，不要任何额外文字

输出格式（必须是纯JSON）：
{\n  "treasure_name": "宝藏名称",\n  "crow_comment": "乌鸦点评"\n}`;

function buildUserPrompt(emotion, content) {
  return `情绪：${emotion}\n记录内容：${content}\n\n请为这段记录创造一个宝藏名称，并给出你的点评。记住要用纯JSON格式回复。`;
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

  const { emotion, content, model = 'deepseek-chat', maxTokens = 200, temperature = 0.8 } = payload;
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
        { role: 'user', content: buildUserPrompt(emotion, content) },
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
        // 同站点调用通常不需要 CORS，但加上也不坏
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
