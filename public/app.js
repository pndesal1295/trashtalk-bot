const consentBox = document.getElementById('consent-box');
const enterBtn = document.getElementById('enter-btn');
const consentScreen = document.getElementById('consent-screen');
const chatScreen = document.getElementById('chat-screen');
const exitBtn = document.getElementById('exit-btn');
const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

let history = [];

consentBox.addEventListener('change', () => {
  enterBtn.disabled = !consentBox.checked;
});

enterBtn.addEventListener('click', () => {
  consentScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  addMessage('bot', 'Ano meron sayo? Sabihin mo, wag kang sungit-sungit diyan.');
});

exitBtn.addEventListener('click', () => {
  chatScreen.classList.add('hidden');
  consentScreen.classList.remove('hidden');
  consentBox.checked = false;
  enterBtn.disabled = true;
  messagesEl.innerHTML = '';
  history = [];
});

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
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
  typingEl.className = 'msg bot';
  typingEl.textContent = '...';
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

    // keep history from growing forever
    if (history.length > 20) history = history.slice(-20);
  } catch (err) {
    typingEl.remove();
    addMessage('bot', 'Nawala connection, tangina naman.');
  }
});
