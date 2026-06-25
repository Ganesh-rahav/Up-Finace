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
};

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
const SAMPLE_TRANSACTIONS = [
  // June 2026
  { id: 't1', date: '2026-06-01', type: 'income', category: 'Gymnastics Teaching', amount: 4000, entity: 'personal', note: 'Monthly gymnastics salary', recurring: true },
  { id: 't2', date: '2026-06-03', type: 'income', category: 'Dance Teaching', amount: 2500, entity: 'personal', note: 'Monthly dance salary', recurring: true },
  { id: 't3', date: '2026-06-05', type: 'expense', category: 'Food & Groceries', amount: 1200, entity: 'personal', note: 'Monthly groceries', recurring: false },
  { id: 't4', date: '2026-06-07', type: 'expense', category: 'Transport', amount: 400, entity: 'personal', note: 'Bus & auto', recurring: false },
  { id: 't5', date: '2026-06-10', type: 'income', category: 'Tranzora Revenue', amount: 8000, entity: 'tranzora', note: 'Client project payment', recurring: false },
  { id: 't6', date: '2026-06-12', type: 'expense', category: 'Business Operations', amount: 1500, entity: 'tranzora', note: 'Hosting + tools subscription', recurring: false },
  { id: 't7', date: '2026-06-15', type: 'expense', category: 'Education', amount: 800, entity: 'personal', note: 'TryHackMe subscription', recurring: true },
  { id: 't8', date: '2026-06-18', type: 'income', category: 'Zero_Day_Crew Revenue', amount: 3000, entity: 'zerodaycrew', note: 'Bug bounty payout', recurring: false },
  { id: 't9', date: '2026-06-20', type: 'expense', category: 'Lifestyle', amount: 600, entity: 'personal', note: 'Eating out + entertainment', recurring: false },
  { id: 't10', date: '2026-06-22', type: 'expense', category: 'Investment - SIP', amount: 2000, entity: 'personal', note: 'Nifty 50 Index SIP', recurring: true },
  // May 2026
  { id: 't11', date: '2026-05-01', type: 'income', category: 'Gymnastics Teaching', amount: 4000, entity: 'personal', note: '', recurring: true },
  { id: 't12', date: '2026-05-03', type: 'income', category: 'Dance Teaching', amount: 2000, entity: 'personal', note: '', recurring: true },
  { id: 't13', date: '2026-05-08', type: 'expense', category: 'Food & Groceries', amount: 1100, entity: 'personal', note: '', recurring: false },
  { id: 't14', date: '2026-05-10', type: 'income', category: 'Tranzora Revenue', amount: 5000, entity: 'tranzora', note: 'Retainer fee', recurring: false },
  { id: 't15', date: '2026-05-15', type: 'expense', category: 'Transport', amount: 350, entity: 'personal', note: '', recurring: false },
  { id: 't16', date: '2026-05-20', type: 'expense', category: 'Investment - SIP', amount: 2000, entity: 'personal', note: 'Nifty 50 Index SIP', recurring: true },
  { id: 't17', date: '2026-05-22', type: 'expense', category: 'Business Operations', amount: 800, entity: 'tranzora', note: 'Domain renewal', recurring: false },
  { id: 't18', date: '2026-05-25', type: 'expense', category: 'Lifestyle', amount: 400, entity: 'personal', note: '', recurring: false },
  // April 2026
  { id: 't19', date: '2026-04-01', type: 'income', category: 'Gymnastics Teaching', amount: 4000, entity: 'personal', note: '', recurring: true },
  { id: 't20', date: '2026-04-02', type: 'income', category: 'Dance Teaching', amount: 3000, entity: 'personal', note: '', recurring: true },
  { id: 't21', date: '2026-04-05', type: 'expense', category: 'Food & Groceries', amount: 1300, entity: 'personal', note: '', recurring: false },
  { id: 't22', date: '2026-04-10', type: 'income', category: 'Tranzora Revenue', amount: 12000, entity: 'tranzora', note: 'Big client project', recurring: false },
  { id: 't23', date: '2026-04-12', type: 'expense', category: 'Business Operations', amount: 2000, entity: 'tranzora', note: 'Contractor payment', recurring: false },
  { id: 't24', date: '2026-04-15', type: 'expense', category: 'Investment - SIP', amount: 2000, entity: 'personal', note: 'Nifty 50 Index SIP', recurring: true },
  { id: 't25', date: '2026-04-18', type: 'income', category: 'Zero_Day_Crew Revenue', amount: 5000, entity: 'zerodaycrew', note: 'Security audit contract', recurring: false },
  { id: 't26', date: '2026-04-20', type: 'expense', category: 'Education', amount: 1500, entity: 'personal', note: 'Security course purchase', recurring: false },
  { id: 't27', date: '2026-04-25', type: 'expense', category: 'Lifestyle', amount: 800, entity: 'personal', note: 'New shoes', recurring: false },
];

const SAMPLE_INVESTMENTS = [
  { id: 'i1', name: 'Nifty 50 Index Fund', type: 'SIP', fund: 'Nippon India Nifty 50', monthlyAmount: 2000, totalInvested: 6000, currentValue: 6420, startDate: '2026-04-01', color: '#6c63ff' },
  { id: 'i2', name: 'Mid Cap Fund', type: 'SIP', fund: 'Axis Midcap Fund', monthlyAmount: 500, totalInvested: 1500, currentValue: 1580, startDate: '2026-04-01', color: '#00d4aa' },
  { id: 'i3', name: 'Emergency Fund FD', type: 'FD', fund: 'SBI Fixed Deposit', monthlyAmount: 0, totalInvested: 5000, currentValue: 5175, startDate: '2025-12-01', color: '#ffd166' },
  { id: 'i4', name: 'Digital Gold', type: 'Gold', fund: 'PhonePe Gold', monthlyAmount: 0, totalInvested: 1000, currentValue: 1085, startDate: '2026-02-15', color: '#ff9f43' },
];

const SAMPLE_GOALS = {
  gamingSetup: { name: 'Gaming & Work Setup', icon: '🎮', target: 80000, current: 12000, priority: 1, color: '#6c63ff', description: 'RTX GPU, Monitor, Mechanical Keyboard, Chair' },
  emergencyFund: { name: 'Emergency Fund', icon: '🛡️', target: 30000, current: 8000, priority: 1, color: '#00d4aa', description: '3–6 months of expenses (target: ₹30,000)' },
  careerFund: { name: 'Career Investment Fund', icon: '📚', target: 20000, current: 3500, priority: 1, color: '#a29bfe', description: 'Certifications, Labs, Security Tools, Books' },
  bike: { name: 'Bike', icon: '🏍️', target: 120000, current: 5000, priority: 2, color: '#ffd166', description: 'Down payment + insurance for new bike' },
  car: { name: 'Car', icon: '🚗', target: 300000, current: 0, priority: 3, color: '#ff9f43', description: 'Future goal — long term' },
  lifestyle: { name: 'Lifestyle Fund', icon: '👟', target: 15000, current: 2000, priority: 4, color: '#fd79a8', description: 'Shoes, accessories, personal purchases' },
};

const SAMPLE_BUSINESS = {
  tranzora: {
    name: 'Tranzora',
    description: 'Software/Tech startup',
    color: '#6c63ff',
    months: {
      '2026-06': { revenue: 8000, expenses: 1500, notes: 'Client project payment' },
      '2026-05': { revenue: 5000, expenses: 800, notes: 'Retainer fee' },
      '2026-04': { revenue: 12000, expenses: 2000, notes: 'Big client project' },
    },
  },
  zerodaycrew: {
    name: 'Zero_Day_Crew',
    description: 'Cybersecurity / Bug Bounty',
    color: '#00d4aa',
    months: {
      '2026-06': { revenue: 3000, expenses: 0, notes: 'Bug bounty payout' },
      '2026-05': { revenue: 0, expenses: 0, notes: '' },
      '2026-04': { revenue: 5000, expenses: 0, notes: 'Security audit contract' },
    },
  },
};

// ─── DATA ACCESS FUNCTIONS ─────────────────────────────────

// CRIT-05: accepts forceMode='empty' so Clear Data gives a blank slate
// without reseeding sample transactions. Goals/Business structure is
// preserved (needed for the app to render) but with zeroed progress.
export function initializeData(forceMode = null) {
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
