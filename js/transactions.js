// ============================================================
// TRANSACTIONS TAB — Antigravity AI CFO
// ============================================================
import { getTransactions, addTransaction, deleteTransaction, formatCurrency, getMonthKey, sanitize } from './data.js';
import { showToast } from './app.js';

let currentFilter = { entity: 'all', type: 'all', month: getMonthKey() };

export function renderTransactions() {
  renderTransactionTable();
  updateTransactionSummary();
}

function getFilteredTransactions() {
  const txns = getTransactions();
  return txns.filter(t => {
    const monthMatch = !currentFilter.month || t.date.startsWith(currentFilter.month);
    const entityMatch = currentFilter.entity === 'all' || t.entity === currentFilter.entity;
    const typeMatch = currentFilter.type === 'all' || t.type === currentFilter.type;
    return monthMatch && entityMatch && typeMatch;
  });
}

function renderTransactionTable() {
  const tbody = document.getElementById('txn-tbody');
  if (!tbody) return;
  const txns = getFilteredTransactions();

  if (txns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No transactions found. Add your first one!</td></tr>`;
    return;
  }

  tbody.innerHTML = txns.map(t => `
    <tr>
      <td><span class="font-mono" style="font-size:12px;color:var(--text-muted)">${t.date}</span></td>
      <td>
        <div style="font-weight:600;font-size:13.5px">${sanitize(t.category)}</div>
        ${t.note ? `<div style="font-size:12px;color:var(--text-muted)">${sanitize(t.note)}</div>` : ''}
      </td>
      <td><span class="badge badge-${t.entity}">${entityLabel(t.entity)}</span></td>
      <td><span class="badge badge-${t.type}">${t.type === 'income' ? '↑ Income' : '↓ Expense'}</span></td>
      <td style="font-weight:700;font-family:'JetBrains Mono',monospace;color:${t.type === 'income' ? 'var(--teal)' : 'var(--coral)'}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
      </td>
      <td>${t.recurring ? '<span style="font-size:11px;color:var(--purple-light);background:rgba(124,111,255,0.1);padding:2px 8px;border-radius:10px">🔄 Recurring</span>' : ''}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.deleteTransaction('${t.id}')">🗑</button>
      </td>
    </tr>
  `).join('');

}

function entityLabel(e) {
  const map = { personal: '👤 Personal', tranzora: '🚀 Tranzora', zerodaycrew: '🔐 Zero_Day_Crew' };
  return map[e] || e;
}

function updateTransactionSummary() {
  const txns = getFilteredTransactions();
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  const incEl = document.getElementById('txn-total-income');
  const expEl = document.getElementById('txn-total-expenses');
  const netEl = document.getElementById('txn-net');
  if (incEl) incEl.textContent = formatCurrency(income);
  if (expEl) expEl.textContent = formatCurrency(expenses);
  if (netEl) {
    netEl.textContent = (net >= 0 ? '+' : '-') + formatCurrency(Math.abs(net));
    netEl.className = 'stat-value ' + (net >= 0 ? 'text-teal' : 'text-coral');
  }
}

export function initTransactions() {
  // CRIT-03: assign once at init, not inside renderTransactionTable().
  // Previously this was re-defined on every table render, causing a race
  // condition where clicking delete before a re-render threw TypeError.
  window.deleteTransaction = (id) => {
    deleteTransaction(id);
    renderTransactions();
    showToast('Transaction deleted', 'info');
  };

  // Month filter buttons
  const prevBtn = document.getElementById('txn-month-prev');
  const nextBtn = document.getElementById('txn-month-next');
  const monthDisplay = document.getElementById('txn-month-display');

  function updateMonthDisplay() {
    const d = new Date(currentFilter.month + '-01');
    if (monthDisplay) monthDisplay.textContent = d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  updateMonthDisplay();

  prevBtn?.addEventListener('click', () => {
    // HIGH-04: avoid toISOString() which converts to UTC and can give the wrong
    // month key in IST (UTC+5:30) at midnight boundaries. Use local date parts directly.
    const [y, m] = currentFilter.month.split('-').map(Number);
    const d = new Date(y, m - 2, 1); // m-2: month is 1-indexed, getMonth() is 0-indexed
    currentFilter.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    updateMonthDisplay();
    renderTransactions();
  });
  nextBtn?.addEventListener('click', () => {
    const [y, m] = currentFilter.month.split('-').map(Number);
    const d = new Date(y, m, 1); // m: next month (0-indexed = current month + 1)
    currentFilter.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    updateMonthDisplay();
    renderTransactions();
  });

  // Entity filter
  document.getElementById('txn-filter-entity')?.addEventListener('change', (e) => {
    currentFilter.entity = e.target.value;
    renderTransactions();
  });

  // Type filter
  document.getElementById('txn-filter-type')?.addEventListener('change', (e) => {
    currentFilter.type = e.target.value;
    renderTransactions();
  });

  // Add Transaction form
  document.getElementById('txn-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const txn = {
      date: fd.get('date'),
      category: fd.get('category'),
      amount: parseFloat(fd.get('amount')),
      type: fd.get('txn-type'),
      entity: fd.get('entity'),
      note: fd.get('note') || '',
      recurring: fd.get('recurring') === 'on',
    };
    if (!txn.date || !txn.category || isNaN(txn.amount) || txn.amount <= 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    addTransaction(txn);
    e.target.reset();
    // Set today's date by default
    const dateInput = e.target.querySelector('[name="date"]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    closeTxnModal();
    renderTransactions();
    showToast('Transaction added! ✓', 'success');
    // refresh dashboard
    window.refreshDashboard?.();
  });

  // Set today's date as default
  const dateInput = document.querySelector('#txn-form [name="date"]');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

export function openTxnModal() {
  document.getElementById('txn-modal').classList.add('open');
}
export function closeTxnModal() {
  document.getElementById('txn-modal').classList.remove('open');
}
