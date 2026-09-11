# Lexicon — Dictionary Browser Extension

A dictionary browser extension for instant word lookups, with search history and word-of-the-day. Available on Chrome and Edge, with 200+ active users.

[![Microsoft Edge](https://img.shields.io/badge/Edge-Install-0078D4?style=for-the-badge&logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/dictionary-dubeytech/ohennnffikahbbihomgmkflmljfggiad)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Install-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/lexicon/ecjhibfihcgalgmeainnjemfcdlmaldm)

## Features

- Word lookup with definitions, synonyms/antonyms, examples, and pronunciation
- Select any text on a webpage to reveal an inline pill for instant explanations, without leaving the page
- AI-powered contextual explanations
- Local caching for instant results on repeat lookups
- Search history, favorites, stored locally
- Word-of-the-day

## Tech Stack

React.js, Chrome Extension APIs, Gemini API (contextual explanations), Tailwind CSS

## Status

Actively maintained — improvements ongoing.

## Local Development

```bash
git clone https://github.com/dubey-prashant/lexicon.git
cd lexicon
npm install

# Web preview
npm run dev

# Build the browser extension
npm run build:ext
```

Then load the built extension as an unpacked extension via `chrome://extensions` (enable Developer Mode first).

## Privacy

Search history and cached lookups are stored locally on-device.

---

_Note: `npm run dev` runs the web app in the browser for quick iteration; `npm run build:ext` produces the actual packaged extension._
