// ============================================================
// REVIEWS TAB (Weekly + Monthly) — Antigravity AI CFO
// ============================================================
import { getMonthlyMetrics, getGoals, getInvestments, getBusiness, getFinancialScore, getTotalPortfolio, formatCurrency, getMonthKey } from './data.js';

export function renderWeeklyReview() {
  const monthKey = getMonthKey();
  const metrics = getMonthlyMetrics(monthKey);
  const goals = getGoals();
  const score = getFinancialScore(monthKey);
  const invs = getInvestments();
  const portfolio = getTotalPortfolio();

  const container = document.getElementById('weekly-content');
  if (!container) return;

  const scoreColor = score >= 80 ? 'var(--teal)' : score >= 60 ? 'var(--gold)' : 'var(--coral)';
  const ef = goals.emergencyFund;
  const gamingSetup = goals.gamingSetup;

  // Biggest win
  let biggestWin = 'Maintained financial discipline';
  if (metrics.tranzIncome + metrics.zdcIncome > 5000) biggestWin = `Business income of ${formatCurrency(metrics.tranzIncome + metrics.zdcIncome)} received`;
  else if (metrics.savingsRate >= 30) biggestWin = `Excellent savings rate of ${metrics.savingsRate}%`;
  else if (metrics.investmentRate >= 25) biggestWin = `Strong investment rate of ${metrics.investmentRate}%`;

  // Biggest mistake
  let biggestMistake = 'No major issues this week';
  if (metrics.personalExpenses > metrics.personalIncome) biggestMistake = `Overspent by ${formatCurrency(metrics.personalExpenses - metrics.personalIncome)}`;
  else if (metrics.investmentRate < 10) biggestMistake = 'Below target investment rate — no or low SIP this month';
  else if (ef && ef.current < ef.target * 0.3) biggestMistake = 'Emergency fund critically underfunded';

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
      <div>
        <h3 style="font-size:20px;font-weight:800">Weekly Financial Review</h3>
        <p style="color:var(--text-muted);font-size:13px">Based on current month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div style="text-align:center">
        <div style="font-size:48px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${scoreColor}">${score}</div>
        <div style="font-size:12px;color:var(--text-muted);font-weight:600">FINANCIAL SCORE</div>
        <div style="font-size:11px;color:${scoreColor};margin-top:3px">${score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Average' : 'Needs Work'}</div>
      </div>
    </div>

    <div class="grid-2" style="gap:14px;margin-bottom:16px">
      ${reviewSection('💰 Income Summary', [
        ['Fixed Income', formatCurrency(metrics.personalIncome), ''],
        ['Tranzora', formatCurrency(metrics.tranzIncome), 'text-gold'],
        ['Zero_Day_Crew', formatCurrency(metrics.zdcIncome), 'text-teal'],
        ['Total Income', formatCurrency(metrics.totalIncome), 'text-teal fw-800'],
      ])}
      ${reviewSection('💸 Expense Summary', [
        ['Personal Expenses', formatCurrency(metrics.personalExpenses), 'text-coral'],
        ['Business Expenses', formatCurrency(metrics.tranzExpenses + metrics.zdcExpenses), 'text-coral'],
        ['Investments', formatCurrency(metrics.investmentExpenses), 'text-purple'],
        ['Net Cash Flow', formatCurrency(metrics.netCashFlow), metrics.netCashFlow >= 0 ? 'text-teal fw-800' : 'text-coral fw-800'],
      ])}
    </div>

    <div class="grid-2" style="gap:14px;margin-bottom:16px">
      ${reviewSection('📈 Investment Progress', [
        ['Total Portfolio', formatCurrency(portfolio), 'text-teal'],
        ['Goal (₹5 Lakh)', '₹5,00,000', ''],
        ['Progress', ((portfolio / 500000) * 100).toFixed(1) + '%', 'text-purple fw-800'],
        ['Investment Rate', metrics.investmentRate + '%', metrics.investmentRate >= 30 ? 'text-teal' : 'text-gold'],
      ])}
      ${reviewSection('🛡️ Emergency Fund', [
        ['Current', formatCurrency(ef?.current || 0), 'text-teal'],
        ['Target', formatCurrency(ef?.target || 0), ''],
        ['Progress', ef ? ((ef.current / ef.target) * 100).toFixed(0) + '%' : '0%', ef && ef.current >= ef.target ? 'text-teal fw-800' : 'text-gold fw-800'],
        ['Remaining', formatCurrency(Math.max(0, (ef?.target || 0) - (ef?.current || 0))), 'text-muted'],
      ])}
    </div>

    <div class="grid-2" style="gap:14px;margin-bottom:16px">
      <div class="review-section" style="background:rgba(0,212,170,0.05);border-color:var(--teal)">
        <h4 style="color:var(--teal)">🏆 Biggest Win</h4>
        <p style="font-size:14px">${biggestWin}</p>
      </div>
      <div class="review-section" style="background:rgba(255,107,107,0.05);border-color:var(--coral)">
        <h4 style="color:var(--coral)">⚠️ Area to Improve</h4>
        <p style="font-size:14px">${biggestMistake}</p>
      </div>
    </div>

    <div class="review-section">
      <h4>🎯 Recommended Actions</h4>
      ${getWeeklyActions(metrics, goals, score).map(a => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px">→ ${a}</div>`).join('')}
    </div>
  `;
}

export function renderMonthlyReview() {
  const monthKey = getMonthKey();
  const metrics = getMonthlyMetrics(monthKey);
  const goals = getGoals();
  const score = getFinancialScore(monthKey);
  const biz = getBusiness();
  const portfolio = getTotalPortfolio();

  const container = document.getElementById('monthly-content');
  if (!container) return;

  const tzMonth = biz.tranzora?.months[monthKey] || { revenue: 0, expenses: 0 };
  const zdcMonth = biz.zerodaycrew?.months[monthKey] || { revenue: 0, expenses: 0 };

  const spendingBreakdown = Object.entries(
    metrics.txns.filter(t => t.type === 'expense' && t.entity === 'personal')
      .reduce((m, t) => { m[t.category] = (m[t.category] || 0) + t.amount; return m; }, {})
  ).sort(([, a], [, b]) => b - a);

  container.innerHTML = `
    <div style="margin-bottom:24px">
      <h3 style="font-size:20px;font-weight:800">Monthly Financial Report</h3>
      <p style="color:var(--text-muted);font-size:13px">${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
    </div>

    <div class="grid-4" style="gap:12px;margin-bottom:20px">
      ${miniStat('Net Cash Flow', (metrics.netCashFlow >= 0 ? '+' : '') + formatCurrency(metrics.netCashFlow), metrics.netCashFlow >= 0 ? 'var(--teal)' : 'var(--coral)')}
      ${miniStat('Savings Rate', metrics.savingsRate + '%', metrics.savingsRate >= 30 ? 'var(--teal)' : 'var(--gold)')}
      ${miniStat('Investment Rate', metrics.investmentRate + '%', metrics.investmentRate >= 30 ? 'var(--teal)' : 'var(--gold)')}
      ${miniStat('Financial Score', score + '/100', score >= 75 ? 'var(--teal)' : score >= 50 ? 'var(--gold)' : 'var(--coral)')}
    </div>

    <div class="grid-2" style="gap:14px;margin-bottom:16px">
      ${reviewSection('🏢 Business Performance', [
        ['Tranzora Revenue', formatCurrency(tzMonth.revenue), 'text-gold'],
        ['Tranzora Profit', formatCurrency(tzMonth.revenue - tzMonth.expenses), tzMonth.revenue - tzMonth.expenses >= 0 ? 'text-teal' : 'text-coral'],
        ['Zero_Day_Crew Revenue', formatCurrency(zdcMonth.revenue), 'text-teal'],
        ['Total Business Income', formatCurrency(metrics.tranzIncome + metrics.zdcIncome), 'text-gold fw-800'],
      ])}
      ${reviewSection('⚡ Risk Analysis', [
        ['Emergency Fund Health', goals.emergencyFund ? ((goals.emergencyFund.current / goals.emergencyFund.target) * 100).toFixed(0) + '% funded' : 'Not set', goals.emergencyFund && goals.emergencyFund.current >= goals.emergencyFund.target ? 'text-teal' : 'text-coral'],
        ['Overspend Risk', metrics.personalExpenses > metrics.personalIncome ? 'HIGH ⚠️' : 'LOW ✅', metrics.personalExpenses > metrics.personalIncome ? 'text-coral' : 'text-teal'],
        ['Investment Consistency', metrics.investmentExpenses > 0 ? 'SIPs Active ✅' : 'No SIPs ❌', metrics.investmentExpenses > 0 ? 'text-teal' : 'text-coral'],
        ['Business Dependency', metrics.personalIncome > 0 ? ((metrics.personalIncome / metrics.totalIncome) * 100).toFixed(0) + '% fixed income' : 'N/A', 'text-muted'],
      ])}
    </div>

    <div class="review-section" style="margin-bottom:14px">
      <h4>💸 Spending Breakdown (Personal)</h4>
      ${spendingBreakdown.length > 0 ? spendingBreakdown.map(([cat, amt]) => `
        <div class="review-item">
          <span class="ri-label">${cat}</span>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:100px;height:6px;background:rgba(255,255,255,0.07);border-radius:10px;overflow:hidden">
              <div style="width:${Math.min(100,(amt/metrics.personalExpenses)*100)}%;height:100%;background:var(--purple);border-radius:10px"></div>
            </div>
            <span class="ri-value text-coral">${formatCurrency(amt)}</span>
          </div>
        </div>
      `).join('') : '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">No personal expenses logged.</p>'}
    </div>

    <div class="review-section">
      <h4>📋 Top Priorities for Next Month</h4>
      ${getMonthlyPriorities(metrics, goals).map((p, i) => `
        <div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start">
          <span style="background:var(--purple);color:white;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
          <span style="font-size:13.5px">${p}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function reviewSection(title, rows) {
  return `
    <div class="review-section">
      <h4>${title}</h4>
      ${rows.map(([label, value, cls]) => `
        <div class="review-item">
          <span class="ri-label">${label}</span>
          <span class="ri-value ${cls}">${value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function miniStat(label, value, color) {
  return `
    <div class="stat-card" style="--accent:${color}">
      <div class="stat-label">${label}</div>
      <div class="stat-value" style="color:${color};font-size:22px">${value}</div>
    </div>
  `;
}

function getWeeklyActions(metrics, goals, score) {
  const actions = [];
  const ef = goals.emergencyFund;

  if (ef && ef.current < ef.target) actions.push(`Build emergency fund: add ₹${Math.min(1000, ef.target - ef.current).toLocaleString('en-IN')} this week`);
  if (metrics.investmentRate < 20) actions.push('Start or increase your monthly SIP — aim for at least ₹1,000/month');
  if (metrics.tranzIncome + metrics.zdcIncome === 0) actions.push('Push for a Tranzora or Zero_Day_Crew client this week');
  if (metrics.savingsRate < 20) actions.push('Cut lifestyle spending by ₹500 and redirect to savings');
  if (goals.careerFund && goals.careerFund.current < goals.careerFund.target * 0.2) actions.push('Allocate ₹500 toward Career Investment Fund (certifications, labs)');
  actions.push('Log all transactions promptly — missing data = missed insights');
  if (score < 60) actions.push('Review your allocation plan: 30% savings, 30% investments, 30% essential');

  return actions.slice(0, 5);
}

function getMonthlyPriorities(metrics, goals) {
  const prios = [];
  const ef = goals.emergencyFund;
  const gaming = goals.gamingSetup;
  const career = goals.careerFund;

  if (ef && ef.current < ef.target) prios.push(`Complete Emergency Fund (${((ef.current / ef.target) * 100).toFixed(0)}% done) — target: ${formatCurrency(ef.target)}`);
  prios.push(`Maintain SIP discipline — invest consistently regardless of income fluctuations`);
  if (career && career.current < career.target) prios.push(`Grow Career Fund — purchase at least one certification or course`);
  if (metrics.tranzIncome + metrics.zdcIncome < 5000) prios.push(`Drive Tranzora and Zero_Day_Crew revenue — target ₹5,000+ from businesses`);
  if (gaming && gaming.current < gaming.target) prios.push(`Save toward Gaming & Work Setup (${formatCurrency(gaming.current)} of ${formatCurrency(gaming.target)})`);
  prios.push(`Review all subscriptions and cut anything unused`);

  return prios.slice(0, 5);
}
