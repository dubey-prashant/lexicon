# Lexicon AI Worker

Cloudflare Worker that proxies "explain this word/phrase" requests to Groq (primary) and Gemini (fallback), keeping the real API keys server-side as Cloudflare secrets. Separate deployable — nothing in `src/` or the root Vite configs touches this folder.

## How it works

- `src/index.js` — validates the request, checks the origin allowlist, tries Groq then falls back to Gemini on failure. The Gemini fallback is optional; skip `GEMINI_API_KEY` and Groq just runs without one.
- `wrangler.toml` — entry point + non-secret vars (allowed origins, dev extension ID).

No self-imposed rate limit — a 429 from Groq/Gemini's own free tier passes straight through to the client.

## One-time setup

1. Groq key: [console.groq.com](https://console.groq.com) (free, no card).
2. Cloudflare account: [dash.cloudflare.com](https://dash.cloudflare.com) (free, no card).
3. `cd worker && npx wrangler login`
4. `npx wrangler deploy` — note the printed URL, it's `VITE_AI_WORKER_URL` in the main project's `.env`.
5. `npx wrangler secret put GROQ_API_KEY`
6. Optional fallback: get a key at [ai.google.dev](https://ai.google.dev), then `npx wrangler secret put GEMINI_API_KEY`.
7. Set `WEB_APP_ORIGIN` in `wrangler.toml` to your deployed web app URL, then `npx wrangler deploy` again (plain var, needs a redeploy, not a secret).

## Local development

1. `worker/.dev.vars` (gitignored): `GROQ_API_KEY=...` (optionally `GEMINI_API_KEY=...` too).
2. `npx wrangler dev` — starts a local server, typically `http://localhost:8787`.
3. Set `VITE_AI_WORKER_URL=http://localhost:8787` in the root `.env`, then run the app as normal.

Testing the unpacked extension locally: it gets a random ID from Chrome, different from the published one. Find it on the extension's card in `chrome://extensions` and set `DEV_EXTENSION_ID` in `wrangler.toml` to it — only needed locally.

## Tuning

`MAX_QUERY_LENGTH`, `CHROME_EXTENSION_ORIGIN`, `EDGE_EXTENSION_ORIGIN` in `src/index.js` — update the latter two if you ever republish under a different extension ID.
