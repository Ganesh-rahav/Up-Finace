// ============================================================
// INVESTMENTS TAB — Antigravity AI CFO
// ============================================================
import { getInvestments, addInvestment, deleteInvestment, updateInvestment, getTotalPortfolio, getTotalInvested, formatCurrency, sanitize } from './data.js';
import { showToast } from './app.js';

export function renderInvestments() {
  const invs = getInvestments();
  const totalPortfolio = getTotalPortfolio();
  const totalInvested = getTotalInvested();
  const totalReturn = totalPortfolio - totalInvested;
  const returnPct = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : 0;

  // Header stats
  setEl('inv-total-value', formatCurrency(totalPortfolio));
  setEl('inv-total-invested', formatCurrency(totalInvested));
  setEl('inv-total-return', (totalReturn >= 0 ? '+' : '') + formatCurrency(totalReturn));
  document.getElementById('inv-total-return')?.classList.toggle('text-teal', totalReturn >= 0);
  document.getElementById('inv-total-return')?.classList.toggle('text-coral', totalReturn < 0);
  setEl('inv-return-pct', returnPct + '%');
  document.getElementById('inv-return-pct')?.classList.toggle('text-teal', totalReturn >= 0);
  document.getElementById('inv-return-pct')?.classList.toggle('text-coral', totalReturn < 0);

  // Portfolio goal ₹5L
  const goal = 500000;
  const pct = Math.min(100, (totalPortfolio / goal) * 100);
  const bar = document.getElementById('inv-goal-bar');
  if (bar) bar.style.width = pct + '%';
  setEl('inv-goal-pct', pct.toFixed(1) + '%');
  // HIGH-09: inv-goal-pct-2 is the large percentage display next to the progress
  // bar label in HTML. It was never set, so it always showed blank.
  setEl('inv-goal-pct-2', pct.toFixed(1) + '%');
  setEl('inv-goal-label', `${formatCurrency(totalPortfolio)} of ${formatCurrency(goal)} invested`);
  const remaining = goal - totalPortfolio;
  const monthlyContrib = invs.filter(i => i.monthlyAmount > 0).reduce((s, i) => s + i.monthlyAmount, 0);
  // HIGH-05: original formula (remaining / monthlyContrib) ignored portfolio growth returns,
  // overestimating time to goal by 30-50% for index fund investors. This simulation
  // compounds existing portfolio + future SIPs at a conservative 12% p.a. (1% monthly).
  function monthsToReachGoal(currentVal, targetVal, monthlySIP) {
    if (monthlySIP <= 0) return '∞';
    const monthlyRate = 0.12 / 12; // 1% per month
    let val = currentVal;
    let months = 0;
    while (val < targetVal && months < 600) { // 600 = 50-year cap
      val = val * (1 + monthlyRate) + monthlySIP;
      months++;
    }
    return months;
  }
  const monthsToGoal = monthlyContrib > 0
    ? monthsToReachGoal(totalPortfolio, goal, monthlyContrib)
    : '∞';
  setEl('inv-months-to-goal', `At current pace (${formatCurrency(monthlyContrib)}/mo SIP, ~12% p.a.): ~${monthsToGoal} months to goal`);

  // Investment cards
  const container = document.getElementById('inv-cards');
  if (container) {
    container.innerHTML = invs.map(inv => {
      const ret = inv.currentValue - inv.totalInvested;
      const retPct = inv.totalInvested > 0 ? ((ret / inv.totalInvested) * 100).toFixed(1) : 0;
      return `
        <div class="investment-card" style="--inv-color:${inv.color || '#7c6fff'}">
          <div class="inv-header">
            <div>
              <div class="inv-name">${sanitize(inv.name)}</div>
              <div class="inv-type">${sanitize(inv.type)} • ${sanitize(inv.fund)}</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="window.deleteInv('${inv.id}')">🗑</button>
          </div>
          <div class="inv-metrics">
            <div class="inv-metric">
              <div class="inv-metric-label">Invested</div>
              <div class="inv-metric-val">${formatCurrency(inv.totalInvested)}</div>
            </div>
            <div class="inv-metric">
              <div class="inv-metric-label">Current Value</div>
              <div class="inv-metric-val">${formatCurrency(inv.currentValue)}</div>
            </div>
            <div class="inv-metric">
              <div class="inv-metric-label">Return</div>
              <div class="inv-metric-val inv-return ${ret >= 0 ? 'positive' : 'negative'}">${ret >= 0 ? '+' : ''}${formatCurrency(ret)} (${retPct}%)</div>
            </div>
          </div>
          ${inv.monthlyAmount > 0 ? `<div style="margin-top:10px;font-size:12px;color:var(--text-muted)">🔄 SIP: <strong style="color:var(--purple-light)">${formatCurrency(inv.monthlyAmount)}/month</strong> • Started ${inv.startDate}</div>` : `<div style="margin-top:10px;font-size:12px;color:var(--text-muted)">One-time investment • Started ${inv.startDate}</div>`}
          <div style="margin-top:10px">
            <input type="number" class="form-control" style="max-width:180px;display:inline-block;padding:6px 10px;font-size:13px" placeholder="Update current value" id="val-${inv.id}" value="${inv.currentValue}" />
            <button class="btn btn-sm btn-secondary" style="margin-left:6px" onclick="window.updateInvValue('${inv.id}')">Update</button>
          </div>
        </div>
      `;
    }).join('') + (invs.length === 0 ? '<div class="empty-state"><div class="empty-icon">📈</div><p>No investments yet. Add your first one!</p></div>' : '');
  }
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function initInvestments() {
  // CRIT-03: assign once here, not inside renderInvestments().
  // Prevents re-creation of these closures on every portfolio re-render.
  window.deleteInv = (id) => {
    deleteInvestment(id);
    renderInvestments();
    showToast('Investment removed', 'info');
  };
  window.updateInvValue = (id) => {
    const val = parseFloat(document.getElementById('val-' + id)?.value);
    if (!isNaN(val) && val >= 0) {
      updateInvestment(id, { currentValue: val });
      renderInvestments();
      showToast('Value updated ✓', 'success');
    }
  };

  document.getElementById('inv-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const inv = {
      name: fd.get('name'),
      type: fd.get('type'),
      fund: fd.get('fund') || fd.get('name'),
      monthlyAmount: parseFloat(fd.get('monthly')) || 0,
      totalInvested: parseFloat(fd.get('invested')),
      currentValue: parseFloat(fd.get('current')),
      startDate: fd.get('startDate'),
      color: fd.get('color') || '#7c6fff',
    };
    if (!inv.name || isNaN(inv.totalInvested) || isNaN(inv.currentValue)) {
      showToast('Please fill required fields', 'error');
      return;
    }
    addInvestment(inv);
    e.target.reset();
    closeInvModal();
    renderInvestments();
    showToast('Investment added! 📈', 'success');
    window.refreshDashboard?.();
  });

  const dateInput = document.querySelector('#inv-form [name="startDate"]');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

export function openInvModal() { document.getElementById('inv-modal').classList.add('open'); }
export function closeInvModal() { document.getElementById('inv-modal').classList.remove('open'); }
