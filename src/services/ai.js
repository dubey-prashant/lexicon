// Calls the Cloudflare Worker (worker/) that proxies to Groq/Gemini.
export async function askAI(query) {
  const workerUrl = import.meta.env.VITE_AI_WORKER_URL;
  if (!workerUrl) {
    throw new Error('AI lookup is not configured (VITE_AI_WORKER_URL missing)');
  }

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = new Error(`AI lookup failed (${response.status})`);
    // 429 = upstream free-tier quota exhausted, not a cap of ours
    error.isQuotaExhausted = response.status === 429;
    error.isUpstreamOverloaded = response.status === 503;
    throw error;
  }

  return response.json();
}
