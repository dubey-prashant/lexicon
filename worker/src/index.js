// Cloudflare Worker: proxies AI lookups to Groq (primary) and Gemini
// (fallback), keeping the real API keys server-side.

// Edge uses the same chrome-extension:// scheme as Chrome, just a different ID.
const CHROME_EXTENSION_ORIGIN =
  'chrome-extension://ecjhibfihcgalgmeainnjemfcdlmaldm';
const EDGE_EXTENSION_ORIGIN =
  'chrome-extension://ohennnffikahbbihomgmkflmljfggiad';
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];

const MAX_QUERY_LENGTH = 100;
const GROQ_MODEL = 'openai/gpt-oss-20b';
const GEMINI_MODEL = 'gemini-3.8-flash';

function buildPrompt(query, isPhrase) {
  return isPhrase
    ? `Explain what the phrase "${query}" means. It wasn't found in a standard dictionary, so it's likely an idiom, expression, or slang. Give a concise explanation and one natural example sentence using it.`
    : `The word "${query}" wasn't found in a standard dictionary — it may be uncommon, slang, or a misspelling. Explain what it likely means (mentioning a probable correction if it looks like a typo of a common word) and give one natural example sentence.`;
}

function allowedOrigins(env) {
  const configured = (env.WEB_APP_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // unpacked/local extension gets a random ID, unlike the two published ones above
  const devExtensionOrigin = env.DEV_EXTENSION_ID
    ? [`chrome-extension://${env.DEV_EXTENSION_ID}`]
    : [];

  return [
    ...configured,
    CHROME_EXTENSION_ORIGIN,
    EDGE_EXTENSION_ORIGIN,
    ...devExtensionOrigin,
    ...DEV_ORIGINS,
  ];
}

function corsHeaders(origin, env) {
  const allowed = allowedOrigins(env).includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function jsonResponse(body, status, origin, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, env),
    },
  });
}

// Groq has no formal response schema, so the JSON shape is spelled out in the prompt instead
async function askGroq(query, isPhrase, env) {
  const prompt = buildPrompt(query, isPhrase);
  const jsonInstruction = `${prompt}\n\nRespond with ONLY a JSON object with exactly these keys: "explanation" (string, required) and "example" (string). No other text, no markdown formatting.`;

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: jsonInstruction }],
        response_format: { type: 'json_object' },
      }),
    },
  );

  const rawBody = await response.text();

  if (!response.ok) {
    console.error(`Groq API error ${response.status}:`, rawBody);
    const error = new Error(`Groq API error: ${response.status}`);
    // propagated to the client instead of a generic 502
    error.upstreamStatus = response.status;
    throw error;
  }

  const data = JSON.parse(rawBody);
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    console.error('Groq returned no content:', rawBody);
    throw new Error('Groq returned no content');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('Groq returned non-JSON text:', text);
    throw new Error('Groq did not return valid JSON');
  }

  return {
    word: query,
    isPhrase,
    explanation: parsed.explanation,
    example: parsed.example,
    source: 'groq',
  };
}

// Fallback, tried only if Groq errors out
async function askGemini(query, isPhrase, env) {
  const prompt = buildPrompt(query, isPhrase);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              explanation: { type: 'string' },
              example: { type: 'string' },
            },
            required: ['explanation'],
          },
          maxOutputTokens: 300,
          temperature: 0.5,
        },
      }),
    },
  );

  // read as text first — Gemini sometimes ignores responseMimeType and returns prose
  const rawBody = await response.text();

  if (!response.ok) {
    console.error(`Gemini API error ${response.status}:`, rawBody);
    const error = new Error(`Gemini API error: ${response.status}`);
    error.upstreamStatus = response.status;
    throw error;
  }

  const data = JSON.parse(rawBody);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Gemini returned no content:', rawBody);
    throw new Error('Gemini returned no content');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('Gemini ignored responseMimeType, raw text was:', text);
    throw new Error('Gemini did not return valid JSON');
  }

  return {
    word: query,
    isPhrase,
    explanation: parsed.explanation,
    example: parsed.example,
    source: 'gemini',
  };
}

async function askAI(query, env) {
  const isPhrase = query.trim().includes(' ');

  try {
    return await askGroq(query, isPhrase, env);
  } catch (primaryError) {
    console.error('Groq failed:', primaryError.message);

    // Gemini fallback is optional
    if (!env.GEMINI_API_KEY) {
      throw primaryError;
    }

    try {
      console.error('Trying Gemini fallback...');
      return await askGemini(query, isPhrase, env);
    } catch (fallbackError) {
      console.error('Gemini fallback also failed:', fallbackError.message);
      throw fallbackError;
    }
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin, env) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin, env);
    }

    if (!allowedOrigins(env).includes(origin)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, origin, env);
    }

    let query;
    try {
      const body = await request.json();
      query = typeof body.query === 'string' ? body.query.trim() : '';
    } catch {
      return jsonResponse({ error: 'Invalid request body' }, 400, origin, env);
    }

    if (!query || query.length > MAX_QUERY_LENGTH) {
      return jsonResponse({ error: 'Invalid query' }, 400, origin, env);
    }

    try {
      const result = await askAI(query, env);
      return jsonResponse(result, 200, origin, env);
    } catch (error) {
      console.error('AI lookup failed:', error);
      if (error.upstreamStatus === 503) {
        return jsonResponse(
          {
            error:
              'The AI service is currently overloaded — try again in a moment',
          },
          503,
          origin,
          env,
        );
      }
      // upstream free-tier quota hit, not our own limit
      if (error.upstreamStatus === 429) {
        return jsonResponse(
          {
            error:
              'The AI service has hit its free-tier limit — try again later',
          },
          429,
          origin,
          env,
        );
      }
      return jsonResponse({ error: 'AI lookup failed' }, 502, origin, env);
    }
  },
};
