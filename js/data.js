// ============================================================
// DATA LAYER — Antigravity AI CFO
// ============================================================

const DATA_KEYS = {
  TRANSACTIONS: 'acfo_transactions',
  INVESTMENTS: 'acfo_investments',
  GOALS: 'acfo_goals',
  BUSINESS: 'acfo_business',
  SETTINGS: 'acfo_settings',
  CHAT: 'acfo_chat',
  INITIALIZED: 'acfo_initialized',
  VERSION: 'acfo_data_version',
};

// Bump this string any time you want ALL users to get a fresh reset
const DATA_VERSION = 'v2-fresh';

// ─── DEFAULT SETTINGS ─────────────────────────────────────
const DEFAULT_SETTINGS = {
  name: 'Ganesh',
  monthlyFixed: 6500,
  currency: '₹',
  geminiApiKey: '',
  allocation: {
    fixed: { savings: 30, investments: 30, essential: 30, lifestyle: 10 },
    dynamic: { investing: 35, savings: 25, business: 20, career: 10, lifestyle: 10 },
  },
};

// ─── SAMPLE DATA ──────────────────────────────────────────
const SAMPLE_TRANSACTIONS = [];

const SAMPLE_INVESTMENTS = [];

const SAMPLE_GOALS = {
  gamingSetup: { name: 'Gaming & Work Setup', icon: '🎮', target: 80000, current: 0, priority: 1, color: '#6c63ff', description: 'RTX GPU, Monitor, Mechanical Keyboard, Chair' },
  emergencyFund: { name: 'Emergency Fund', icon: '🛡️', target: 30000, current: 0, priority: 1, color: '#00d4aa', description: '3–6 months of expenses (target: ₹30,000)' },
  careerFund: { name: 'Career Investment Fund', icon: '📚', target: 20000, current: 0, priority: 1, color: '#a29bfe', description: 'Certifications, Labs, Security Tools, Books' },
  bike: { name: 'Bike', icon: '🏍️', target: 120000, current: 0, priority: 2, color: '#ffd166', description: 'Down payment + insurance for new bike' },
  car: { name: 'Car', icon: '🚗', target: 300000, current: 0, priority: 3, color: '#ff9f43', description: 'Future goal — long term' },
  lifestyle: { name: 'Lifestyle Fund', icon: '👟', target: 15000, current: 0, priority: 4, color: '#fd79a8', description: 'Shoes, accessories, personal purchases' },
};

const SAMPLE_BUSINESS = {
  tranzora: {
    name: 'Tranzora',
    description: 'Software/Tech startup',
    color: '#6c63ff',
    months: {},
  },
  zerodaycrew: {
    name: 'Zero_Day_Crew',
    description: 'Cybersecurity / Bug Bounty',
    color: '#00d4aa',
    months: {},
  },
};

// ─── DATA ACCESS FUNCTIONS ─────────────────────────────────

// CRIT-05: accepts forceMode='empty' so Clear Data gives a blank slate
// without reseeding sample transactions. Goals/Business structure is
// preserved (needed for the app to render) but with zeroed progress.
export function initializeData(forceMode = null) {
  // If the stored data version doesn't match, wipe everything and re-seed
  const storedVersion = localStorage.getItem(DATA_KEYS.VERSION);
  if (storedVersion !== DATA_VERSION) {
    Object.values(DATA_KEYS).forEach(k => localStorage.removeItem(k));
  }

  // Always re-initialize to ensure fresh empty state on first load
  if (localStorage.getItem(DATA_KEYS.INITIALIZED) && !forceMode) return;
  const useSamples = forceMode !== 'empty';

  // In empty mode, keep goal definitions but zero out current savings
  const goals = useSamples ? SAMPLE_GOALS : Object.fromEntries(
    Object.entries(SAMPLE_GOALS).map(([k, g]) => [k, { ...g, current: 0 }])
  );
  // In empty mode, keep entity definitions but clear historical months
  const business = useSamples ? SAMPLE_BUSINESS : {
    tranzora: { ...SAMPLE_BUSINESS.tranzora, months: {} },
    zerodaycrew: { ...SAMPLE_BUSINESS.zerodaycrew, months: {} },
  };

  localStorage.setItem(DATA_KEYS.TRANSACTIONS, JSON.stringify(useSamples ? SAMPLE_TRANSACTIONS : []));
  localStorage.setItem(DATA_KEYS.INVESTMENTS, JSON.stringify(useSamples ? SAMPLE_INVESTMENTS : []));
  localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(goals));
  localStorage.setItem(DATA_KEYS.BUSINESS, JSON.stringify(business));
  localStorage.setItem(DATA_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(DATA_KEYS.CHAT, JSON.stringify([]));
  localStorage.setItem(DATA_KEYS.INITIALIZED, '1');
  localStorage.setItem(DATA_KEYS.VERSION, DATA_VERSION);
}

export function getSettings() {
  return JSON.parse(localStorage.getItem(DATA_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
}
export function saveSettings(s) { localStorage.setItem(DATA_KEYS.SETTINGS, JSON.stringify(s)); }

export function getTransactions() {
  return JSON.parse(localStorage.getItem(DATA_KEYS.TRANSACTIONS) || '[]');
}
export function saveTransactions(t) { localStorage.setItem(DATA_KEYS.TRANSACTIONS, JSON.stringify(t)); }
export function addTransaction(t) {
  const txns = getTransactions();
  t.id = 't' + Date.now();
  txns.push(t);
  txns.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveTransactions(txns);
  return t;
}
export function deleteTransaction(id) {
  const txns = getTransactions().filter(t => t.id !== id);
  saveTransactions(txns);
}

export function getInvestments() {
  return JSON.parse(localStorage.getItem(DATA_KEYS.INVESTMENTS) || '[]');
}
export function saveInvestments(i) { localStorage.setItem(DATA_KEYS.INVESTMENTS, JSON.stringify(i)); }
export function addInvestment(inv) {
  const invs = getInvestments();
  inv.id = 'i' + Date.now();
  invs.push(inv);
  saveInvestments(invs);
  return inv;
}
export function updateInvestment(id, updates) {
  const invs = getInvestments().map(i => i.id === id ? { ...i, ...updates } : i);
  saveInvestments(invs);
}
export function deleteInvestment(id) {
  saveInvestments(getInvestments().filter(i => i.id !== id));
}

export function getGoals() {
  return JSON.parse(localStorage.getItem(DATA_KEYS.GOALS) || JSON.stringify(SAMPLE_GOALS));
}
export function saveGoals(g) { localStorage.setItem(DATA_KEYS.GOALS, JSON.stringify(g)); }
export function updateGoal(key, updates) {
  const goals = getGoals();
  goals[key] = { ...goals[key], ...updates };
  saveGoals(goals);
}

export function getBusiness() {
  return JSON.parse(localStorage.getItem(DATA_KEYS.BUSINESS) || JSON.stringify(SAMPLE_BUSINESS));
}
export function saveBusiness(b) { localStorage.setItem(DATA_KEYS.BUSINESS, JSON.stringify(b)); }

export function getChat() { return JSON.parse(localStorage.getItem(DATA_KEYS.CHAT) || '[]'); }
export function saveChat(msgs) { localStorage.setItem(DATA_KEYS.CHAT, JSON.stringify(msgs)); }

// ─── COMPUTED METRICS ──────────────────────────────────────

export function getMonthKey(date) {
  return date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7);
}

export function getMonthlyMetrics(monthKey) {
  const txns = getTransactions().filter(t => t.date.startsWith(monthKey));
  const personalIncome = txns.filter(t => t.type === 'income' && t.entity === 'personal').reduce((s, t) => s + t.amount, 0);
  const personalExpenses = txns.filter(t => t.type === 'expense' && t.entity === 'personal').reduce((s, t) => s + t.amount, 0);
  const investmentExpenses = txns.filter(t => t.type === 'expense' && t.category.includes('Investment') && t.entity === 'personal').reduce((s, t) => s + t.amount, 0);
  const tranzIncome = txns.filter(t => t.type === 'income' && t.entity === 'tranzora').reduce((s, t) => s + t.amount, 0);
  const tranzExpenses = txns.filter(t => t.type === 'expense' && t.entity === 'tranzora').reduce((s, t) => s + t.amount, 0);
  const zdcIncome = txns.filter(t => t.type === 'income' && t.entity === 'zerodaycrew').reduce((s, t) => s + t.amount, 0);
  const zdcExpenses = txns.filter(t => t.type === 'expense' && t.entity === 'zerodaycrew').reduce((s, t) => s + t.amount, 0);
  const totalIncome = personalIncome + tranzIncome + zdcIncome;
  const totalExpenses = personalExpenses + tranzExpenses + zdcExpenses;
  const netCashFlow = totalIncome - totalExpenses;
  // CRIT-06: exclude SIP outflows from expenses when computing savings rate.
  // SIP money is invested, not spent — it should not deflate the savings rate.
  const nonInvestmentExpenses = personalExpenses - investmentExpenses;
  const savingsRate = personalIncome > 0 ? ((personalIncome - nonInvestmentExpenses) / personalIncome * 100).toFixed(1) : 0;
  const investmentRate = personalIncome > 0 ? (investmentExpenses / personalIncome * 100).toFixed(1) : 0;
  return {
    personalIncome, personalExpenses, investmentExpenses,
    tranzIncome, tranzExpenses, zdcIncome, zdcExpenses,
    totalIncome, totalExpenses, netCashFlow,
    savingsRate: parseFloat(savingsRate),
    investmentRate: parseFloat(investmentRate),
    txns,
  };
}

export function getTotalPortfolio() {
  return getInvestments().reduce((s, i) => s + i.currentValue, 0);
}

export function getTotalInvested() {
  return getInvestments().reduce((s, i) => s + i.totalInvested, 0);
}

// CRIT-07: previous version added goals.emergencyFund.current on top of
// getTotalPortfolio(), which already includes the Emergency Fund FD investment.
// That counted the same money twice. Portfolio is the single source of truth.
export function getNetWorth() {
  return getTotalPortfolio();
}

export function getFinancialScore(monthKey) {
  const metrics = getMonthlyMetrics(monthKey);
  const settings = getSettings();
  const goals = getGoals();
  let score = 50;
  // Savings rate (max +20)
  if (metrics.savingsRate >= 30) score += 20;
  else if (metrics.savingsRate >= 20) score += 12;
  else if (metrics.savingsRate >= 10) score += 5;
  else if (metrics.savingsRate < 0) score -= 15;
  // Investment rate (max +20)
  if (metrics.investmentRate >= 30) score += 20;
  else if (metrics.investmentRate >= 20) score += 13;
  else if (metrics.investmentRate >= 10) score += 6;
  // Emergency fund progress (max +10)
  const efGoal = goals.emergencyFund;
  if (efGoal) {
    const efPct = efGoal.current / efGoal.target;
    if (efPct >= 1) score += 10;
    else if (efPct >= 0.5) score += 5;
    else if (efPct >= 0.25) score += 2;
  }
  // HIGH-06: previous binary check (any income > 0 = +10) meant ₹1 of biz income
  // scored identically to ₹50,000, making the score gameable. Use a tiered scale instead.
  const bizIncome = metrics.tranzIncome + metrics.zdcIncome;
  if (bizIncome >= 10000) score += 10;
  else if (bizIncome >= 5000) score += 7;
  else if (bizIncome >= 1000) score += 3;
  else if (bizIncome > 0) score += 1;
  // Overspending penalty
  if (metrics.personalExpenses > metrics.personalIncome) score -= 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getCategoryBreakdown(monthKey) {
  const txns = getTransactions()
    .filter(t => t.date.startsWith(monthKey) && t.type === 'expense' && t.entity === 'personal');
  const map = {};
  txns.forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return map;
}

export function formatCurrency(amount) {
  const s = getSettings();
  return `${s.currency}${Math.abs(amount).toLocaleString('en-IN')}`;
}

// CRIT-01: DOM-based HTML sanitizer for all user-generated strings rendered
// via innerHTML. Uses the browser's own parser — no external dependency needed.
export function sanitize(str) {
  if (str === null || str === undefined) return '';
  const el = document.createElement('div');
  el.textContent = String(str);
  return el.innerHTML;
}
