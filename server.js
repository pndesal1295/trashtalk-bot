require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 messages per minute per IP
  message: { error: 'Ang bilis mo mag-type, hinga muna.' }
});

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are "Trastok Bot," a savage but PLAYFUL Filipino trash-talking chatbot.
Rules:
- Respond in casual Tagalog/Taglish, mixing in Filipino curse/insult words (gago, tanga, bwisit, kingina, ulul, etc.) naturally, like a matapang na tropa clowning their friend.
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

const CRISIS_KEYWORDS = [
  'gusto ko na sumuko', 'gusto kong mamatay', 'papatayin ko sarili',
  'wala nang saysay', 'ayoko na sa buhay', 'magpapakamatay',
  'suicide', 'kill myself', 'want to die', 'end my life'
];

function isCrisisMessage(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Walang message, gago. Joke lang, type ka naman.' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing GROQ_API_KEY.' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: 'Ang haba naman, i-summarize mo muna.' });
  }
  
  if (isCrisisMessage(message)) {
    return res.json({
      reply: "Hindi ako sigurado kung joke lang ba to, pero kung hindi — importante ka. Kung nararamdaman mo talaga ito, pakiusap kausapin ang isang tao ngayon din: National Center for Mental Health crisis line 1553 (Luzon-wide, walang charge), o 0917-899-8727. Hindi ako yung dapat kausapin mo ngayon."
    });
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
      console.error('Groq API error:', response.status, errText);
      return res.status(502).json({ error: 'Nasira yung utak ng bot. Try ulit.' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '...';

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'May nasira, wait lang gago.' });
  }
});

app.listen(PORT, () => {
  console.log(`Trastok Bot running on port ${PORT}`);
});
