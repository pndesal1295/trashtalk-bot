# Bwisit Bot

Chatbot na magmumura sayo, with consent gate before it starts.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and drop in your real Anthropic API key:
   ```
   cp .env.example .env
   ```
3. `npm start`
4. Open `http://localhost:3000`

Get an API key from https://console.anthropic.com/ (Settings > API Keys). You'll need billing set up there, this is NOT the same as your claude.ai chat subscription.

## Deploy to Render (free tier, single service)

1. Push this folder to a GitHub repo
2. Go to render.com > New > Web Service > connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable: `ANTHROPIC_API_KEY` = your key
6. Deploy. Render gives you a live `.onrender.com` URL

Note: free tier Render services sleep after inactivity, first request after sleep takes ~30s to wake up. Fine for a portfolio demo, not for production.

## What to check before showing this to anyone

- [ ] Consent checkbox actually gates the chat (test with box unchecked)
- [ ] Try a sad/distressed message ("nalulungkot ako") and confirm the bot drops the act
- [ ] Confirm your API key isn't committed to git (check `.gitignore` includes `.env`)
- [ ] Set a spending limit on your Anthropic API key so a viral moment doesn't blow up your bill
