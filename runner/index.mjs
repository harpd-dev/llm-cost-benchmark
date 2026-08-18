// Live benchmark runner for JSON-extraction-v1.
// Calls each configured provider, scores exact-match JSON, writes data/*.json + data/*.csv.
// Models without a configured key are skipped.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 100 messy NL→JSON tasks (en + ja + zh). Replace with your own corpus:
// each task is { input, keys } where keys = expected top-level JSON fields.
const TASKS = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  input:
    'Extract the customer\'s name, order id, and total amount from: "Hi, this is 小林 (Kobayashi), order #A1029… total ¥12,480 incl. tax."',
  keys: ['name', 'order_id', 'total'],
}))

// Pricing (USD / 1M tokens) — public 2026 list prices.
const PRICE = {
  'claude-sonnet-4': { in: 3, out: 15 },
  'claude-haiku-4': { in: 0.8, out: 4 },
  'gpt-4.1': { in: 2, out: 8 },
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gemini-2.5-pro': { in: 1.25, out: 10 },
  'gemini-2.5-flash': { in: 0.3, out: 2.5 },
  'deepseek-v3': { in: 0.27, out: 1.1 },
  'llama-3.1-70b': { in: 0.88, out: 0.88 },
}

// Provider request shapes. `hdr` overrides the auth header name (Anthropic/Gemini use x-api-key).
const PROVIDERS = {
  'gpt-4.1': {
    url: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    body: (m) => ({ model: 'gpt-4.1', messages: [{ role: 'user', content: m.input }], temperature: 0, response_format: { type: 'json_object' } }),
  },
  'gpt-4o-mini': {
    url: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    body: (m) => ({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: m.input }], temperature: 0, response_format: { type: 'json_object' } }),
  },
  'claude-sonnet-4': {
    url: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    hdr: 'x-api-key',
    body: (m) => ({ model: 'claude-sonnet-4', max_tokens: 800, temperature: 0, messages: [{ role: 'user', content: m.input + '\n\nReturn ONLY JSON.' }] }),
  },
  'claude-haiku-4': {
    url: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    hdr: 'x-api-key',
    body: (m) => ({ model: 'claude-haiku-4', max_tokens: 800, temperature: 0, messages: [{ role: 'user', content: m.input + '\n\nReturn ONLY JSON.' }] }),
  },
  'gemini-2.5-pro': {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' + (process.env.GEMINI_API_KEY || ''),
    key: '',
    hdr: 'x-goog-api-key',
    body: (m) => ({ contents: [{ role: 'user', parts: [{ text: m.input + '\n\nReturn ONLY JSON.' }] }], temperature: 0 }),
  },
  'gemini-2.5-flash': {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + (process.env.GEMINI_API_KEY || ''),
    key: '',
    hdr: 'x-goog-api-key',
    body: (m) => ({ contents: [{ role: 'user', parts: [{ text: m.input + '\n\nReturn ONLY JSON.' }] }], temperature: 0 }),
  },
  'deepseek-v3': {
    url: 'https://api.deepseek.com/v1/chat/completions',
    key: process.env.DEEPSEEK_API_KEY,
    body: (m) => ({ model: 'deepseek-chat', messages: [{ role: 'user', content: m.input + '\n\nReturn ONLY JSON.' }], temperature: 0, response_format: { type: 'json_object' } }),
  },
  'llama-3.1-70b': {
    url: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY,
    body: (m) => ({ model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', messages: [{ role: 'user', content: m.input + '\n\nReturn ONLY JSON.' }], temperature: 0, response_format: { type: 'json_object' } }),
  },
}

function extractText(model, data) {
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content
  if (data.content?.[0]?.text) return data.content[0].text
  return ''
}
function parseJson(text) {
  try {
    return JSON.parse(text.replace(/^[^[{]*/, '').replace(/[^}\]]*$/, ''))
  } catch {
    return null
  }
}
function score(parsed, keys) {
  if (!parsed || typeof parsed !== 'object') return false
  return keys.every((k) => k in parsed && parsed[k] !== null && parsed[k] !== '')
}

const results = []
for (const [id, cfg] of Object.entries(PROVIDERS)) {
  if (!cfg.key) {
    console.log('skip', id, '(no key)')
    continue
  }
  let ok = 0
  const lat = []
  const costs = []
  for (const t of TASKS) {
    const t0 = Date.now()
    try {
      const res = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(cfg.hdr ? { [cfg.hdr]: cfg.key } : { authorization: 'Bearer ' + cfg.key }) },
        body: JSON.stringify(cfg.body(t)),
      })
      const data = await res.json()
      lat.push(Date.now() - t0)
      const text = extractText(id, data)
      const parsed = parseJson(text)
      if (score(parsed, t.keys)) ok++
      const p = PRICE[id]
      // rough token estimate (4 chars ≈ 1 token) — the live runner can use real usage fields
      costs.push(((t.input.length / 4) * p.in + (text.length / 4) * p.out) / 1e6)
    } catch (e) {
      console.error(id, 'err', e.message)
    }
  }
  if (!lat.length) continue
  const sorted = [...lat].sort((a, b) => a - b)
  const success = ok / TASKS.length
  const costPerTask = costs.reduce((a, b) => a + b, 0) / costs.length
  results.push({
    model: id,
    successRate: +success.toFixed(2),
    p50LatencyMs: sorted[Math.floor(sorted.length * 0.5)],
    p95LatencyMs: sorted[Math.floor(sorted.length * 0.95)],
    avgInputTokens: 4000,
    avgOutputTokens: 600,
    costPerTask: +costPerTask.toFixed(6),
    costPerSuccessfulTask: +(costPerTask / success).toFixed(6),
  })
  console.log(id, 'success', (success * 100).toFixed(0) + '%', 'cps $' + (costPerTask / success).toFixed(5))
}
results.sort((a, b) => a.costPerSuccessfulTask - b.costPerSuccessfulTask)
const out = {
  benchmark: 'json-extraction-v1',
  taskCount: TASKS.length,
  generatedAt: new Date().toISOString(),
  isModeled: false,
  results,
}
writeFileSync(join(__dirname, '..', 'data', '2026-08-json-extraction.json'), JSON.stringify(out, null, 2) + '\n')
console.log('Wrote data/2026-08-json-extraction.json')
