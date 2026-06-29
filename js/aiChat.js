// ============================================================
// AI CHAT — Gemini Integration — Antigravity AI CFO
// ============================================================
import { getSettings, saveSettings, getChat, saveChat, getMonthlyMetrics, getGoals, getInvestments, getBusiness, getFinancialScore, getTotalPortfolio, formatCurrency, getMonthKey } from './data.js';

const CFO_SYSTEM_PROMPT = `You are Antigravity AI CFO — the personal AI Chief Financial Officer for Ganesh.

Ganesh's Profile:
- Student, Co-founder of Tranzora (tech startup) and Zero_Day_Crew (cybersecurity)
- Future: Security Engineer / DevSecOps Engineer
- Fixed Income: ₹4,000/month (gymnastics) + ₹2,000–3,000/month (dance) = ~₹6,500/month fixed
- Dynamic Income: Tranzora revenue, Zero_Day_Crew revenue, freelance (unpredictable)

Financial Philosophy: Balanced Wealth Builder
Money Allocation (Fixed Income): 30% Savings, 30% Investments, 30% Essential, 10% Lifestyle
Money Allocation (Dynamic Income): 35% Investing, 25% Savings, 20% Business Growth, 10% Career, 10% Lifestyle

Priority Goals (in order):
1. Gaming & Work Setup (₹80,000 target)
1. Emergency Fund (₹30,000 target)
1. Career Investment Fund — certifications, labs, security tools (₹20,000 target)
2. Bike (₹1,20,000 target)
3. Car (₹3,00,000 target)

Investment Goal: ₹5,00,000 invested portfolio

Your role:
- Act as a strict but supportive CFO and wealth coach
- Use real numbers and calculations in responses
- Challenge unnecessary spending — always ask: need vs want, aligned with goals?, cheaper alternatives?
- Encourage long-term thinking, consistent SIPs, smart reinvestment
- Explain investment concepts simply (SIPs, Index Funds, ETFs, asset allocation, diversification)
- Never present speculation as certainty
- Be direct, practical, and use Indian currency (₹)
- Keep responses concise and actionable`;

let isLoading = false;

function buildContextMessage(metrics, goals, portfolio, score) {
  return `Current Financial Context (as of today):
- Monthly Personal Income: ₹${metrics.personalIncome.toLocaleString('en-IN')}
- Monthly Personal Expenses: ₹${metrics.personalExpenses.toLocaleString('en-IN')}
- Net Cash Flow: ₹${metrics.netCashFlow.toLocaleString('en-IN')}
- Savings Rate: ${metrics.savingsRate}%
- Investment Rate: ${metrics.investmentRate}%
- Tranzora Income (this month): ₹${metrics.tranzIncome.toLocaleString('en-IN')}
- Zero_Day_Crew Income (this month): ₹${metrics.zdcIncome.toLocaleString('en-IN')}
- Total Portfolio Value: ₹${portfolio.toLocaleString('en-IN')} (Goal: ₹5,00,000)
- Emergency Fund: ₹${goals.emergencyFund?.current?.toLocaleString('en-IN')} / ₹${goals.emergencyFund?.target?.toLocaleString('en-IN')}
- Financial Score: ${score}/100`;
}

export async function sendMessage(userMessage) {
  if (isLoading || !userMessage.trim()) return;

  const settings = getSettings();
  // CRIT-02: key is stored btoa-encoded. atob() decodes it.
  // try/catch handles legacy plain-text keys stored before this fix.
  let apiKey = '';
  try {
    apiKey = settings.geminiApiKey ? atob(settings.geminiApiKey) : '';
  } catch {
    apiKey = settings.geminiApiKey || ''; // plain-text fallback (pre-fix data)
  }

  if (!apiKey) {
    appendMessage('ai', `⚠️ No Gemini API key configured. Please go to **Settings** and paste your API key to enable AI chat.\n\nYou can get a free API key at [aistudio.google.com](https://aistudio.google.com).`);
    return;
  }

  // Add user message
  appendMessage('user', userMessage);

  // Show typing indicator
  const typingId = showTyping();
  isLoading = true;
  document.getElementById('chat-send')?.setAttribute('disabled', 'true');

  // Build context
  const monthKey = getMonthKey();
  const metrics = getMonthlyMetrics(monthKey);
  const goals = getGoals();
  const portfolio = getTotalPortfolio();
  const score = getFinancialScore(monthKey);
  const contextMsg = buildContextMessage(metrics, goals, portfolio, score);

  // Build message history for API
  const chatHistory = getChat();
  const apiMessages = [];

  // Add recent chat history (last 10 messages)
  chatHistory.slice(-10).forEach(m => {
    apiMessages.push({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.content }] });
  });

  // Add context + current message
  apiMessages.push({ role: 'user', parts: [{ text: contextMsg + '\n\n' + userMessage }] });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: CFO_SYSTEM_PROMPT }] },
        contents: apiMessages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    removeTyping(typingId);
    appendMessage('ai', aiText);

    // Save to history
    const history = getChat();
    history.push({ role: 'user', content: userMessage, ts: Date.now() });
    history.push({ role: 'ai', content: aiText, ts: Date.now() });
    if (history.length > 100) history.splice(0, history.length - 100);
    saveChat(history);

  } catch (err) {
    removeTyping(typingId);
    appendMessage('ai', `❌ Error calling Gemini API: **${err.message}**\n\nCheck your API key in Settings, or verify your internet connection.`);
  } finally {
    isLoading = false;
    document.getElementById('chat-send')?.removeAttribute('disabled');
  }
}

function appendMessage(role, content) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `chat-message ${role}`;
  div.innerHTML = `
    <div class="chat-avatar">${role === 'ai' ? '🤖' : '👤'}</div>
    <div class="chat-bubble ${role === 'ai' ? 'markdown-content' : ''}">${role === 'ai' ? renderMarkdown(content) : escapeHtml(content)}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-message ai';
  div.id = id;
  div.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble typing">
      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  if (id) document.getElementById(id)?.remove();
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(124,111,255,0.15);padding:1px 5px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:12px">$1</code>')
    .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s(.+)/g, '<h3>$1</h3>')
    .replace(/#{1}\s(.+)/g, '<h3>$1</h3>')
    .replace(/^\s*[-•]\s(.+)/gm, '<li>$1</li>')
    // HIGH-02: previous regex used /s flag (dotAll) and only ran once, failing to wrap
    // multiple separate bullet lists. This version wraps every contiguous <li> group.
    .replace(/((?:<li>[^<]*<\/li>\s*)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

export function loadChatHistory() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';

  const history = getChat();
  if (history.length === 0) {
    // Welcome message
    const settings = getSettings();
    const monthKey = getMonthKey();
    const score = getFinancialScore(monthKey);
    appendMessage('ai', `👋 Hey **${settings.name}**! I'm your **Antigravity AI CFO**.\n\nYour current financial score is **${score}/100**. I'm here to help you build wealth, make smart decisions, and stay accountable.\n\n**Ask me anything:**\n- "How should I allocate my Tranzora income?"\n- "Should I buy a ₹5,000 gaming headset?"\n- "Explain index fund investing"\n- "What's my path to ₹5 lakh portfolio?"\n- "Give me a weekly review"`);
    return;
  }

  history.forEach(m => appendMessage(m.role, m.content));
}

export function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  sendBtn?.addEventListener('click', () => {
    const msg = input?.value?.trim();
    if (msg) {
      input.value = '';
      input.style.height = 'auto';
      sendMessage(msg);
    }
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = input.value.trim();
      if (msg) { input.value = ''; input.style.height = 'auto'; sendMessage(msg); }
    }
  });

  // Auto-resize textarea
  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Suggestion chips
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) input.value = btn.textContent;
      const msg = btn.textContent;
      if (input) input.value = '';
      sendMessage(msg);
    });
  });
}
