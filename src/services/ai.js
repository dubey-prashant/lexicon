async function fetchFromWorker(query) {
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

// A fetch from a content script carries the host page's own origin (e.g.
// https://example.com), not chrome-extension://— since MV3, content
// scripts are subject to the same CORS rules as the page itself. The
// Worker's CORS allowlist can't (and shouldn't) allow arbitrary websites,
// so content-script callers relay through the background script instead,
// whose fetches always carry the extension's own origin.
function isContentScript() {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.runtime?.id &&
    typeof location !== 'undefined' &&
    location.protocol !== 'chrome-extension:'
  );
}

function askAIViaBackground(query) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'ASK_AI', query }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response?.ok) {
        const error = new Error(response?.message || 'AI lookup failed');
        error.isQuotaExhausted = response?.isQuotaExhausted;
        error.isUpstreamOverloaded = response?.isUpstreamOverloaded;
        reject(error);
        return;
      }
      resolve(response.data);
    });
  });
}

// Calls the Cloudflare Worker (worker/) that proxies to Groq/Gemini.
export async function askAI(query) {
  return isContentScript() ? askAIViaBackground(query) : fetchFromWorker(query);
}
