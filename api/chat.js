export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });

  const GROQ_KEY = process.env.GROQ_KEY;
  if (!GROQ_KEY) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });

  try {
    const text = await req.text();
    const { prompt } = JSON.parse(text);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });

    const result = await response.text();
    if (!response.ok) return new Response(JSON.stringify({ error: result }), { status: 500, headers });

    const data = JSON.parse(result);
    const reply = data.choices?.[0]?.message?.content || 'No response.';
    return new Response(JSON.stringify({ reply }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
