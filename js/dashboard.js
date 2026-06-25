// ============================================================
// DASHBOARD TAB — Antigravity AI CFO
// ============================================================
import {
  getMonthlyMetrics, getTotalPortfolio, getTotalInvested, getNetWorth,
  getFinancialScore, getCategoryBreakdown, getGoals, getInvestments,
  formatCurrency, getSettings, getMonthKey, sanitize,
} from './data.js';

let expenseChart = null;
let portfolioChart = null;
let trendChart = null;

export function renderDashboard() {
  const now = new Date();
  const monthKey = getMonthKey();
  const metrics = getMonthlyMetrics(monthKey);
  const score = getFinancialScore(monthKey);
  const goals = getGoals();
  const portfolio = getTotalPortfolio();
  const netWorth = getNetWorth();
  const settings = getSettings();

  // Update stat cards
  document.getElementById('dash-net-worth').textContent = formatCurrency(netWorth);
  document.getElementById('dash-monthly-income').textContent = formatCurrency(metrics.totalIncome);
  document.getElementById('dash-monthly-expenses').textContent = formatCurrency(metrics.totalExpenses);
  document.getElementById('dash-net-cashflow').textContent = formatCurrency(metrics.netCashFlow);
  document.getElementById('dash-net-cashflow').className = 'stat-value ' + (metrics.netCashFlow >= 0 ? 'text-teal' : 'text-coral');
  document.getElementById('dash-portfolio').textContent = formatCurrency(portfolio);
  document.getElementById('dash-savings-rate').textContent = metrics.savingsRate + '%';
  document.getElementById('dash-invest-rate').textContent = metrics.investmentRate + '%';

  // Portfolio progress toward ₹5L
  const portfolioGoal = 500000;
  const pct = Math.min(100, (portfolio / portfolioGoal) * 100);
  document.getElementById('dash-portfolio-progress').style.width = pct + '%';
  document.getElementById('dash-portfolio-pct').textContent = pct.toFixed(1) + '%';
  document.getElementById('dash-portfolio-val').textContent = formatCurrency(portfolio) + ' / ' + formatCurrency(portfolioGoal);

  // Financial score ring
  renderScoreRing(score);

  // Emergency fund progress
  const ef = goals.emergencyFund;
  if (ef) {
    const efPct = Math.min(100, (ef.current / ef.target) * 100);
    document.getElementById('dash-ef-bar').style.width = efPct + '%';
    document.getElementById('dash-ef-label').textContent = `${formatCurrency(ef.current)} / ${formatCurrency(ef.target)} (${efPct.toFixed(0)}%)`;
  }

  // CFO Alerts
  renderAlerts(metrics, goals, score, settings);

  // Charts
  renderExpenseDonut(monthKey);
  renderPortfolioDonut();

  // Goal highlights
  renderGoalHighlights(goals);
}

function renderScoreRing(score) {
  const ring = document.getElementById('score-ring-fill');
  const scoreNum = document.getElementById('score-number');
  const scoreText = document.getElementById('score-text');
  if (!ring) return;

  const circumference = 376;
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;

  let cls = 'poor';
  let text = 'Needs Work';
  if (score >= 80) { cls = 'excellent'; text = 'Excellent!'; }
  else if (score >= 65) { cls = 'good'; text = 'Good'; }
  else if (score >= 45) { cls = 'average'; text = 'Average'; }

  ring.className = `ring-fill ${cls}`;
  if (scoreNum) scoreNum.textContent = score;
  if (scoreText) scoreText.textContent = text;
}

function renderAlerts(metrics, goals, score, settings) {
  const container = document.getElementById('dash-alerts');
  if (!container) return;

  const alerts = [];
  const alloc = settings.allocation?.fixed || {};

  // Savings rate alert
  const targetSavings = alloc.savings || 30;
  if (metrics.savingsRate < targetSavings && metrics.personalIncome > 0) {
    alerts.push({ type: 'warning', icon: '⚠️', title: `Savings rate is ${metrics.savingsRate}%`, sub: `Target is ${targetSavings}%. Save ₹${Math.round(metrics.personalIncome * targetSavings / 100 - (metrics.personalIncome - metrics.personalExpenses)).toLocaleString('en-IN')} more this month.` });
  } else if (metrics.personalIncome > 0) {
    alerts.push({ type: 'success', icon: '✅', title: `Savings rate on track at ${metrics.savingsRate}%`, sub: `Your target is ${targetSavings}%. Great discipline!` });
  }

  // Emergency fund
  const ef = goals.emergencyFund;
  if (ef && ef.current < ef.target) {
    const remaining = ef.target - ef.current;
    alerts.push({ type: 'info', icon: '🛡️', title: `Emergency fund ${((ef.current/ef.target)*100).toFixed(0)}% funded`, sub: `₹${remaining.toLocaleString('en-IN')} more needed. Priority 1.` });
  } else if (ef) {
    alerts.push({ type: 'success', icon: '🛡️', title: 'Emergency fund fully funded!', sub: 'You have 100% of your safety net covered.' });
  }

  // Investment rate
  const targetInvest = alloc.investments || 30;
  if (metrics.investmentRate < 15 && metrics.personalIncome > 0) {
    alerts.push({ type: 'danger', icon: '📉', title: `Low investment rate: ${metrics.investmentRate}%`, sub: `You should be investing at least 30% of income. Start or increase your SIPs.` });
  } else if (metrics.personalIncome > 0) {
    alerts.push({ type: 'success', icon: '📈', title: `Investing ${metrics.investmentRate}% of income`, sub: 'Keep it up! Consistency builds wealth.' });
  }

  // Business income
  if (metrics.tranzIncome + metrics.zdcIncome > 0) {
    alerts.push({ type: 'info', icon: '💼', title: `Business income: ${formatCurrency(metrics.tranzIncome + metrics.zdcIncome)}`, sub: 'Allocate 35% to investing, 25% to savings from this dynamic income.' });
  } else {
    alerts.push({ type: 'warning', icon: '💼', title: 'No business income logged this month', sub: 'Push for Tranzora / Zero_Day_Crew revenue. Every ₹ counts.' });
  }

  container.innerHTML = alerts.slice(0, 4).map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-icon">${a.icon}</div>
      <div class="alert-text">
        <p>${a.title}</p>
        <span>${a.sub}</span>
      </div>
    </div>
  `).join('');
}

function renderExpenseDonut(monthKey) {
  const ctx = document.getElementById('expense-chart');
  if (!ctx) return;
  const breakdown = getCategoryBreakdown(monthKey);
  const labels = Object.keys(breakdown);
  const data = Object.values(breakdown);
  const colors = ['#7c6fff','#00d4aa','#ffd166','#ff6b6b','#fd79a8','#ff9f43','#a29bfe','#55efc4'];

  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0, hoverBorderWidth: 2, hoverBorderColor: 'rgba(255,255,255,0.3)' }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { position: 'right', labels: { color: '#9999bb', font: { size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₹${ctx.parsed.toLocaleString('en-IN')} (${((ctx.parsed / data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`,
          },
          backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
          titleColor: '#eeeef5', bodyColor: '#9999bb',
        },
      },
    },
  });
}

function renderPortfolioDonut() {
  const ctx = document.getElementById('portfolio-chart');
  if (!ctx) return;
  const invs = getInvestments();
  const colors = ['#7c6fff','#00d4aa','#ffd166','#ff9f43','#fd79a8','#ff6b6b'];

  if (portfolioChart) portfolioChart.destroy();
  portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: invs.map(i => i.name),
      datasets: [{ data: invs.map(i => i.currentValue), backgroundColor: invs.map((i, idx) => i.color || colors[idx]), borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { position: 'right', labels: { color: '#9999bb', font: { size: 12 }, padding: 14, usePointStyle: true } },
        tooltip: {
          callbacks: { label: (ctx) => ` ₹${ctx.parsed.toLocaleString('en-IN')}` },
          backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
          titleColor: '#eeeef5', bodyColor: '#9999bb',
        },
      },
    },
  });
}

function renderGoalHighlights(goals) {
  const container = document.getElementById('dash-goals');
  if (!container) return;

  const priorityGoals = Object.entries(goals)
    .filter(([, g]) => g.priority <= 2)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .slice(0, 3);

  container.innerHTML = priorityGoals.map(([, g]) => {
    const pct = Math.min(100, (g.current / g.target) * 100);
    return `
      <div class="goal-card">
        <div class="goal-card-header">
          <span class="goal-icon">${sanitize(g.icon)}</span>
          <div>
            <div class="goal-name">${sanitize(g.name)}</div>
            <div class="goal-priority">Priority ${g.priority}</div>
          </div>
          <div class="goal-pct" style="margin-left:auto">${pct.toFixed(0)}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%; --start:${g.color}; --end:${g.color}aa;"></div>
        </div>
        <div class="goal-amounts">
          <span class="goal-current" style="color:${g.color}">${formatCurrency(g.current)}</span>
          <span class="goal-target">of ${formatCurrency(g.target)}</span>
        </div>
      </div>
    `;
  }).join('');
}
