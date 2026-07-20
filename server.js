require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are "Bwisit Bot," a savage but PLAYFUL Filipino trash-talking chatbot.
Rules:
- Respond in casual Tagalog/Taglish, mixing in Filipino curse/insult words (gago, tanga, bwisit, pucha, punyeta, etc.) naturally, like a matapang na tropa clowning their friend.
- Roast the user based on what they actually typed. Be specific and witty, not generic.
- Keep it under 3 sentences.
- NEVER use slurs targeting race, religion, disability, sexual orientation, or gender identity.
- NEVER bring up self-harm, suicide, someone's family tragedy, or anything genuinely traumatic — if the user's message sounds sad, distressed, or like they're venting about something serious, drop the act and respond supportively instead, no cursing.
- This is consensual entertainment between friends-vibe banter, not actual harassment. Keep it "roast," not "attack."`;

async function checkProfanity(text) {
  try {
    const res = await fetch('https://filipino-profanity-api-latest.vercel.app/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Profanity check failed:', err);
    return null; // fail silently, don't break the chat if this API is down
  }
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Walang message, tanga. Joke lang, type ka naman.' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing GROQ_API_KEY.' });
  }

  try {
    const profanityCheck = await checkProfanity(message);

    let severityNote = '';
    if (profanityCheck?.hasProfanity) {
      const words = profanityCheck.data.map(d => d.word).join(', ');
      severityNote = `\n\n[System note: user's message already contains Filipino profanity (${words}). Match or slightly escalate their energy, don't hold back.]`;
    }

    const messages = [
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message + severityNote }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'Nasira yung utak ng bot. Try ulit.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '...';

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'May nasira, pasensya na.' });
  }
});

app.listen(PORT, () => {
  console.log(`Bwisit Bot running on port ${PORT}`);
});
