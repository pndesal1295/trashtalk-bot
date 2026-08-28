const consentBox = document.getElementById('consent-box');
const enterBtn = document.getElementById('enter-btn');
const consentScreen = document.getElementById('consent-screen');
const chatScreen = document.getElementById('chat-screen');
const exitBtn = document.getElementById('exit-btn');
const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const clearBtn = document.getElementById('clear-btn');

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  input.style.height = 'auto';
  input.focus();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

let history = [];

consentBox.addEventListener('change', () => {
  enterBtn.disabled = !consentBox.checked;
});

enterBtn.addEventListener('click', () => {
  consentScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  addMessage('bot', 'Aba, pumasok pa ang bobo. Anong kailangan mo? Bilis.');
});

exitBtn.addEventListener('click', () => {
  chatScreen.classList.add('hidden');
  consentScreen.classList.remove('hidden');
  consentBox.checked = false;
  enterBtn.disabled = true;
  messagesEl.innerHTML = '';
  history = [];
  input.value = '';
  input.style.height = 'auto';
});

function addMessage(role, text) {
  const div = document.createElement('div');
  const isUser = role === 'user';
  
  // Brutalist Chat Bubble Styling
  div.className = `max-w-[85%] px-5 py-4 border-4 border-black font-bold text-base leading-relaxed uppercase ${
    isUser 
      ? 'self-end bg-black text-white shadow-[6px_6px_0_0_rgba(200,200,200,1)]' 
      : 'self-start bg-white text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]'
  }`;
  
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  input.value = '';

  const typingEl = document.createElement('div');
  // Brutalist typing indicator
  typingEl.className = 'max-w-[85%] px-5 py-4 border-4 border-black font-bold bg-white text-black self-start shadow-[6px_6px_0_0_rgba(0,0,0,1)] uppercase';
  typingEl.textContent = 'NAG-IISIP NG MURA...';
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history })
    });
    const data = await res.json();

    typingEl.remove();

    if (data.error) {
      addMessage('bot', data.error);
      return;
    }

    addMessage('bot', data.reply);
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: data.reply });

    if (history.length > 20) history = history.slice(-20);
  } catch (err) {
    typingEl.remove();
    addMessage('bot', 'Putsa, nawala internet. Ayusin mo connection mo.');
  }
});