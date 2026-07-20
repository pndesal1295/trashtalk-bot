# Trastok Bot

Chatbot na magmumura sayo, with consent gate before it starts.

🔗 **Live**: https://trastok-bot.onrender.com

Note: free tier sleeps after inactivity, first request after a quiet period can take 30-50s to wake up. Just refresh if it looks stuck.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and drop in your real Groq API key:
```
   cp .env.example .env
```
3. `npm start`
4. Open `http://localhost:3000`

Get a free API key from https://console.groq.com/ (API Keys). No credit card required for the free tier.

## Deploy your own copy to Render

1. Fork/clone this repo, push to your own GitHub
2. Go to render.com > New > Web Service > connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable: `GROQ_API_KEY` = your key
6. Deploy. Render gives you a live `.onrender.com` URL

## Safety features

- **Consent gate**: chat is locked behind an explicit checkbox before it unlocks
- **Crisis keyword filter**: messages matching common distress/suicidal phrasing (Tagalog and English) skip the LLM entirely and return a mental health hotline message instead — no roleplay, no roast, guaranteed
- **Profanity severity check**: uses a free public Filipino profanity API to detect if the user is already cursing, and adjusts the bot's energy accordingly
- **Rate limiting**: 15 messages per minute per IP
- **Message length cap**: 1000 characters max per message

## Known limitations

- Crisis keyword filter is exact-substring matching, not a proper classifier — it catches common phrasings but can miss creative wording. Not a substitute for real moderation if this ever goes beyond a portfolio demo.
- System prompt safety instructions (no slurs, drop persona for distress) rely on the LLM following them, which isn't 100% guaranteed on every phrasing — tested manually, not exhaustively.

## Tech stack

- Node.js / Express backend
- Groq API (Llama 3.3 70B) for chat responses
- [Filipino Profanity API](https://github.com/jobelGolde12/filipino_profanity_api_latest) for severity detection
- Vanilla JS + Tailwind CDN frontend
- Deployed on Render