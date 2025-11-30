# cf_ai_chat_assistant

A small AI-powered chat application built on **Cloudflare Workers**, **Workers AI**, and **KV storage**.  
Created for the Cloudflare Software Engineering Internship optional AI assignment.

## 🔧 What it does

- Serves a simple HTML/JS chat UI from a Cloudflare Worker
- Handles user messages via `POST` from the same Worker
- Calls **Workers AI** (`@cf/meta/llama-3-8b-instruct`) to generate responses
- Stores per-session chat history in **KV** (`CHAT_HISTORY`)
- Returns a truncated, concise reply to keep answers readable

## 🧠 Tech Stack

- Cloudflare Workers (serverless compute)
- Workers AI (LLM inference)
- KV storage (session memory)
- Vanilla HTML + JavaScript for the frontend

## 📂 Files

- `worker.js` – Worker code (serves UI + handles chat + calls Workers AI + KV)
- `README.md` – Project overview and usage
- `PROMPTS.md` – List of AI prompts used while building

## ▶️ How it works

1. **GET /**  
   - Returns a minimal chat UI with a text box and send button.
   - The browser keeps a simple `session` ID to group messages.

2. **POST /**  
   - Body: `{ message, session }`
   - Loads previous history for that `session` from KV.
   - Prepends a small system prompt for concise answers.
   - Calls `env.AI.run('@cf/meta/llama-3-8b-instruct', { messages })`.
   - Truncates the model output to the first couple of sentences.
   - Saves updated history back to KV and returns `{ reply }`.

## 🚀 Running / Deploying

This app is designed to run directly on Cloudflare’s dashboard:

1. Create a **Worker** in the Cloudflare dashboard.
2. Add:
   - **Workers AI binding** named `AI`
   - **KV Namespace** named `CHAT_HISTORY`
3. Paste `worker.js` into the Worker editor.
4. Click **Deploy**.
5. Visit the `*.workers.dev` URL – you should see the chat UI.

You can also manage this with `wrangler` if you prefer, but it’s not required.

## ✅ Assignment Checklist

This project satisfies Cloudflare’s AI assignment requirements:

- **LLM** – Workers AI (`@cf/meta/llama-3-8b-instruct`)
- **Workflow / Coordination** – Worker handles routing, model calls, and KV updates
- **User Input** – Browser chat UI using HTML + fetch
- **Memory / State** – Chat history stored in KV per session
