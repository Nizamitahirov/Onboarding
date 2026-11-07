// api/chat.js — NextGen AI köməkçisi üçün Vercel serverless funksiyası (Groq).
// Açar bu serverless faylda saxlanılır (brauzerə göndərilmir). İstəsəniz Vercel-də GROQ_API_KEY
// environment variable təyin edib bu dəyəri əvəz edə bilərsiniz.
// Model avtomatik seçilir: sualın mürəkkəbliyinə görə "fast" və ya "deep" səviyyə,
// sonra Groq-da hazırda mövcud olan modellər arasından ən uyğunu; xəta olarsa növbəti modelə keçir.

const GROQ = 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = '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';

// Üstünlük sırası (mövcud olmayanlar avtomatik keçilir)
const PREFERRED = {
  deep: [
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'moonshotai/kimi-k2-instruct-0905',
    'moonshotai/kimi-k2-instruct',
    'qwen/qwen3-32b',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'openai/gpt-oss-20b',
  ],
  fast: [
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
  ],
};
// Chat üçün yararsız modellər (səs, təhlükəsizlik filtrləri və s.)
const NON_CHAT = /whisper|tts|playai|guard|orpheus|distil|embed|vision-preview|compound/i;

const LIMITS = { messages: 20, messageChars: 4000, contextChars: 16000 };
const MODELS_TTL_MS = 10 * 60 * 1000;
let modelsCache = { at: 0, ids: null };

// Sadə yaddaş-daxili limit (bir instansiya üzrə): IP başına dəqiqədə 20 sorğu
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

async function availableModels(key, fetchImpl) {
  if (modelsCache.ids && Date.now() - modelsCache.at < MODELS_TTL_MS) return modelsCache.ids;
  try {
    const r = await fetchImpl(`${GROQ}/models`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error('models ' + r.status);
    const data = await r.json();
    const ids = (data.data || []).filter((m) => m.active !== false && !NON_CHAT.test(m.id)).map((m) => m.id);
    if (ids.length) modelsCache = { at: Date.now(), ids };
    return ids;
  } catch (e) {
    return null; // siyahı alınmadısa, üstünlük siyahısı ilə birbaşa cəhd edirik
  }
}

const DEEP_WORDS = /analiz|müqayis|muqayis|hesabat|izah|niyə|niye|strategi|tövsiy|tovsiy|plan|xülas|xulas|risk|səbəb|sebeb|təhlil|tehlil|prioritet|qiymətləndir|statistik|trend|ümumi vəziyyət|compare|analy[sz]|explain|why|summar|recommend|strategy|report|insight|priorit|evaluate|breakdown|overview/i;

/** Sualın mürəkkəbliyinə görə səviyyə seçimi */
function chooseTier(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const text = last ? last.content : '';
  let score = 0;
  if (text.length > 220) score += 2;
  else if (text.length > 90) score += 1;
  if (DEEP_WORDS.test(text)) score += 2;
  if ((text.match(/\?/g) || []).length >= 2) score += 1;
  if (/\n/.test(text)) score += 1;
  if (messages.length > 8) score += 1;
  if (/^\s*(salam|hi|hello|hey|sağ ol|sag ol|təşəkkür|tesekkur|thanks|thank you|ok|oldu)\b/i.test(text) && text.length < 40) score = 0;
  return score >= 2 ? 'deep' : 'fast';
}

function rankModels(tier, ids) {
  const order = [...PREFERRED[tier], ...PREFERRED[tier === 'deep' ? 'fast' : 'deep']];
  const uniq = [...new Set(order)];
  if (!ids) return uniq;
  const ranked = uniq.filter((m) => ids.includes(m));
  // Siyahıda tanımadığımız yeni modellər varsa — ölçüsünə görə (adındakı "NNb") əlavə edirik
  const size = (id) => { const m = id.match(/(\d+)b/i); return m ? Number(m[1]) : 0; };
  const extra = ids.filter((m) => !ranked.includes(m)).sort((a, b) => (tier === 'deep' ? size(b) - size(a) : size(a) - size(b)));
  return [...ranked, ...extra];
}

function systemPrompt(lang, context) {
  const az = lang !== 'en';
  return [
    'You are NextGen, the AI assistant built into the "Onboarding" platform (an employee onboarding management system covering pre-boarding through day 180).',
    az
      ? 'Always answer in Azerbaijani (Latin script), unless the user clearly writes in another language — then answer in that language.'
      : 'Always answer in English, unless the user clearly writes in another language — then answer in that language.',
    'Be concise, warm and practical. Use short paragraphs or bullet lists. Use **bold** for key names and numbers. No tables.',
    'Use ONLY the platform data in the CONTEXT below for facts about employees, tasks, access requests, surveys, trainings and the handbook. If something is not in the context, say you do not have that information — never invent people, dates or numbers.',
    'The context is already filtered to what the current user role is allowed to see. Never reveal data about people outside this context.',
    'When useful, point the user to the right page of the app (Dashboard, Employees, Access, Handbook, Feedback, Surveys, Trainings, My onboarding, Settings).',
    'You cannot change data yourself; explain how the user can do it in the app.',
    '',
    'CONTEXT:',
    context || '(no context)',
  ].join('\n');
}

function sanitize(body) {
  const messages = Array.isArray(body && body.messages) ? body.messages : [];
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-LIMITS.messages)
    .map((m) => ({ role: m.role, content: m.content.slice(0, LIMITS.messageChars) }));
  const context = typeof body.context === 'string' ? body.context.slice(0, LIMITS.contextChars) : '';
  const lang = body.lang === 'en' ? 'en' : 'az';
  return { messages: clean, context, lang };
}

function stripThinking(text) {
  return String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/** Əsas məntiq (test üçün fetchImpl ötürülə bilər) */
async function chat(body, { key, fetchImpl = fetch } = {}) {
  const { messages, context, lang } = sanitize(body || {});
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { status: 400, json: { error: 'bad_request' } };
  if (!key) return { status: 500, json: { error: 'missing_key' } };

  const tier = chooseTier(messages);
  const ids = await availableModels(key, fetchImpl);
  const candidates = rankModels(tier, ids).slice(0, 4);
  const payloadBase = {
    messages: [{ role: 'system', content: systemPrompt(lang, context) }, ...messages],
    temperature: tier === 'deep' ? 0.4 : 0.5,
    max_tokens: tier === 'deep' ? 1400 : 700,
  };

  let lastError = null;
  for (const model of candidates) {
    try {
      const r = await fetchImpl(`${GROQ}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payloadBase, model }),
      });
      if (r.status === 401 || r.status === 403) return { status: 502, json: { error: 'invalid_key' } };
      if (!r.ok) { lastError = `${model}: ${r.status}`; continue; } // 400/404 (model yoxdur), 413, 429, 5xx → növbəti model
      const data = await r.json();
      const reply = stripThinking(data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
      if (!reply) { lastError = `${model}: empty`; continue; }
      return { status: 200, json: { reply, model, tier } };
    } catch (e) {
      lastError = `${model}: ${e.message}`;
    }
  }
  return { status: 502, json: { error: 'upstream_failed', detail: lastError } };
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: 'rate_limited' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  try {
    const out = await chat(body, { key: process.env.GROQ_API_KEY || GROQ_API_KEY });
    return res.status(out.status).json(out.json);
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
}

module.exports = handler;
module.exports.chat = chat;
module.exports.chooseTier = chooseTier;
module.exports.rankModels = rankModels;
module.exports._resetCache = () => { modelsCache = { at: 0, ids: null }; };
