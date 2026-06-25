// ============================================================
// BUSINESS FINANCE TAB — Antigravity AI CFO
// ============================================================
import { getBusiness, saveBusiness, getTransactions, formatCurrency, getMonthKey, sanitize } from './data.js';
import { showToast } from './app.js';

let bizChart = null;

export function renderBusiness() {
  const biz = getBusiness();
  const months = getLastNMonths(6);
  const currentMonth = getMonthKey();

  ['tranzora', 'zerodaycrew'].forEach(entity => {
    const e = biz[entity];
    if (!e) return;
    const pfx = entity === 'tranzora' ? 'tz' : 'zdc';

    // Sum all months for totals
    const totalRev = Object.values(e.months).reduce((s, m) => s + (m.revenue || 0), 0);
    const totalExp = Object.values(e.months).reduce((s, m) => s + (m.expenses || 0), 0);
    const totalProfit = totalRev - totalExp;

    // Current month
    const cm = e.months[currentMonth] || { revenue: 0, expenses: 0 };
    const cmProfit = cm.revenue - cm.expenses;

    setEl(`${pfx}-rev`, formatCurrency(cm.revenue));
    setEl(`${pfx}-exp`, formatCurrency(cm.expenses));
    setEl(`${pfx}-profit`, (cmProfit >= 0 ? '+' : '') + formatCurrency(cmProfit));
    setEl(`${pfx}-total-rev`, formatCurrency(totalRev));
    setEl(`${pfx}-total-profit`, formatCurrency(totalProfit));

    const profitEl = document.getElementById(`${pfx}-profit`);
    if (profitEl) {
      profitEl.className = 'biz-stat-val ' + (cmProfit >= 0 ? 'text-teal' : 'text-coral');
    }

    // Reinvestment recommendation
    const reinvestEl = document.getElementById(`${pfx}-reinvest`);
    if (reinvestEl && cm.revenue > 0) {
      const reinvest = Math.round(cm.revenue * 0.2);
      reinvestEl.innerHTML = `💼 Recommended reinvestment this month: <strong style="color:var(--gold)">${formatCurrency(reinvest)}</strong> (20% of revenue)`;
    }
  });

  renderBizChart(biz, months);
  renderBizHistory(biz);
}

function renderBizChart(biz, months) {
  const ctx = document.getElementById('biz-chart');
  if (!ctx) return;

  const labels = months.map(m => {
    const d = new Date(m + '-01');
    return d.toLocaleString('default', { month: 'short' });
  });

  const tzRevenue = months.map(m => (biz.tranzora?.months[m]?.revenue || 0));
  const zdcRevenue = months.map(m => (biz.zerodaycrew?.months[m]?.revenue || 0));

  if (bizChart) bizChart.destroy();
  bizChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Tranzora', data: tzRevenue, backgroundColor: 'rgba(124,111,255,0.7)', borderColor: '#7c6fff', borderWidth: 2, borderRadius: 6 },
        { label: 'Zero_Day_Crew', data: zdcRevenue, backgroundColor: 'rgba(0,212,170,0.7)', borderColor: '#00d4aa', borderWidth: 2, borderRadius: 6 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#9999bb', font: { size: 12 }, usePointStyle: true } },
        tooltip: {
          callbacks: { label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}` },
          backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#eeeef5', bodyColor: '#9999bb',
        },
      },
      scales: {
        x: { ticks: { color: '#9999bb', font: { size: 12 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9999bb', font: { size: 12 }, callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

function renderBizHistory(biz) {
  ['tranzora', 'zerodaycrew'].forEach(entity => {
    // HIGH-03: HTML uses id="tz-history" for Tranzora and id="zerodaycrew-history"
    // for Zero_Day_Crew. The old code computed "zdc-history" which never matched,
    // leaving the ZDC history panel permanently blank.
    const historyId = entity === 'tranzora' ? 'tz-history' : 'zerodaycrew-history';
    const container = document.getElementById(historyId);
    if (!container) return;
    const e = biz[entity];
    const entries = Object.entries(e.months).sort(([a], [b]) => b.localeCompare(a));

    container.innerHTML = entries.map(([month, data]) => {
      const profit = data.revenue - data.expenses;
      const d = new Date(month + '-01');
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      return `
        <div class="review-item">
          <span class="ri-label">${label} ${data.notes ? '• ' + sanitize(data.notes) : ''}</span>
          <div style="text-align:right">
            <div class="ri-value text-teal" style="font-size:12px">Rev: ${formatCurrency(data.revenue)}</div>
            <div class="ri-value ${profit >= 0 ? 'text-teal' : 'text-coral'}" style="font-size:12px">Profit: ${formatCurrency(profit)}</div>
          </div>
        </div>
      `;
    }).join('') || '<p style="color:var(--text-muted);font-size:13px;padding:10px 0">No history yet.</p>';
  });
}

function getLastNMonths(n) {
  const months = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(getMonthKey(m.toISOString()));
  }
  return months;
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function initBusiness() {
  document.getElementById('biz-log-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const entity = fd.get('entity');
    const month = fd.get('month').slice(0, 7);
    const revenue = parseFloat(fd.get('revenue')) || 0;
    const expenses = parseFloat(fd.get('expenses')) || 0;
    const notes = fd.get('notes') || '';

    const biz = getBusiness();
    if (!biz[entity]) return;
    biz[entity].months[month] = { revenue, expenses, notes };
    saveBusiness(biz);
    e.target.reset();
    closeBizModal();
    renderBusiness();
    showToast('Business entry logged ✓', 'success');
    window.refreshDashboard?.();
  });

  const monthInput = document.querySelector('#biz-log-form [name="month"]');
  if (monthInput) monthInput.value = new Date().toISOString().slice(0, 7);
}

export function openBizModal() { document.getElementById('biz-modal')?.classList.add('open'); }
export function closeBizModal() { document.getElementById('biz-modal')?.classList.remove('open'); }
