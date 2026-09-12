# Backup

Code and data kept intentionally, but not part of any build — nothing in `src/`, `worker/`, or the Vite configs references this folder.

- **`words/`** — `clean-words.txt` and `scowl-words.txt`, the SCOWL-derived source lists that `public/words/common-words.json` (the actual autocomplete data, used by `src/services/localWordList.js`) was generated from. Kept in case that list needs regenerating or expanding later.
