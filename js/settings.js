// ============================================================
// SETTINGS TAB — Antigravity AI CFO
// ============================================================
import { getSettings, saveSettings } from './data.js';
import { showToast } from './app.js';

export function renderSettings() {
  const s = getSettings();

  setVal('set-name', s.name);
  setVal('set-monthly-fixed', s.monthlyFixed);
  setVal('set-api-key', s.geminiApiKey || '');

  // Allocation — fixed
  setVal('set-alloc-savings', s.allocation?.fixed?.savings ?? 30);
  setVal('set-alloc-investments', s.allocation?.fixed?.investments ?? 30);
  setVal('set-alloc-essential', s.allocation?.fixed?.essential ?? 30);
  setVal('set-alloc-lifestyle', s.allocation?.fixed?.lifestyle ?? 10);

  // Allocation — dynamic
  setVal('set-dyn-investing', s.allocation?.dynamic?.investing ?? 35);
  setVal('set-dyn-savings', s.allocation?.dynamic?.savings ?? 25);
  setVal('set-dyn-business', s.allocation?.dynamic?.business ?? 20);
  setVal('set-dyn-career', s.allocation?.dynamic?.career ?? 10);
  setVal('set-dyn-lifestyle', s.allocation?.dynamic?.lifestyle ?? 10);

  updateAllocTotals();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function updateAllocTotals() {
  const fixed = ['savings', 'investments', 'essential', 'lifestyle'].map(k => parseFloat(document.getElementById('set-alloc-' + k)?.value || 0));
  const fixedTotal = fixed.reduce((a, b) => a + b, 0);
  const fixedEl = document.getElementById('set-fixed-total');
  if (fixedEl) {
    fixedEl.textContent = fixedTotal + '%';
    fixedEl.style.color = fixedTotal === 100 ? 'var(--teal)' : 'var(--coral)';
  }

  const dyn = ['investing', 'savings', 'business', 'career', 'lifestyle'].map(k => parseFloat(document.getElementById('set-dyn-' + k)?.value || 0));
  const dynTotal = dyn.reduce((a, b) => a + b, 0);
  const dynEl = document.getElementById('set-dyn-total');
  if (dynEl) {
    dynEl.textContent = dynTotal + '%';
    dynEl.style.color = dynTotal === 100 ? 'var(--teal)' : 'var(--coral)';
  }
}

export function initSettings() {
  // Live total update
  ['savings', 'investments', 'essential', 'lifestyle'].forEach(k => {
    document.getElementById('set-alloc-' + k)?.addEventListener('input', updateAllocTotals);
  });
  ['investing', 'savings', 'business', 'career', 'lifestyle'].forEach(k => {
    document.getElementById('set-dyn-' + k)?.addEventListener('input', updateAllocTotals);
  });

  document.getElementById('settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = getSettings();
    s.name = document.getElementById('set-name')?.value || 'Ganesh';
    s.monthlyFixed = parseFloat(document.getElementById('set-monthly-fixed')?.value) || 6500;
    s.geminiApiKey = document.getElementById('set-api-key')?.value?.trim() || '';

    s.allocation = {
      fixed: {
        savings: parseFloat(document.getElementById('set-alloc-savings')?.value) || 30,
        investments: parseFloat(document.getElementById('set-alloc-investments')?.value) || 30,
        essential: parseFloat(document.getElementById('set-alloc-essential')?.value) || 30,
        lifestyle: parseFloat(document.getElementById('set-alloc-lifestyle')?.value) || 10,
      },
      dynamic: {
        investing: parseFloat(document.getElementById('set-dyn-investing')?.value) || 35,
        savings: parseFloat(document.getElementById('set-dyn-savings')?.value) || 25,
        business: parseFloat(document.getElementById('set-dyn-business')?.value) || 20,
        career: parseFloat(document.getElementById('set-dyn-career')?.value) || 10,
        lifestyle: parseFloat(document.getElementById('set-dyn-lifestyle')?.value) || 10,
      },
    };

    saveSettings(s);
    showToast('Settings saved ✓', 'success');
    window.refreshDashboard?.();
    // Update sidebar name
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = s.name;
  });

  // Toggle API key visibility
  document.getElementById('toggle-api-key')?.addEventListener('click', () => {
    const inp = document.getElementById('set-api-key');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Reset data
  document.getElementById('reset-data-btn')?.addEventListener('click', () => {
    if (confirm('⚠️ This will reset ALL financial data to sample data. Are you sure?')) {
      Object.keys(localStorage).filter(k => k.startsWith('acfo_')).forEach(k => localStorage.removeItem(k));
      showToast('Data reset. Refreshing...', 'info');
      setTimeout(() => location.reload(), 1200);
    }
  });

  // Clear data
  document.getElementById('clear-data-btn')?.addEventListener('click', () => {
    if (confirm('⚠️ This will DELETE all your data permanently. Are you sure?')) {
      Object.keys(localStorage).filter(k => k.startsWith('acfo_')).forEach(k => localStorage.removeItem(k));
      localStorage.setItem('acfo_initialized', '0'); // force re-init as empty
      Object.keys(localStorage).filter(k => k.startsWith('acfo_')).forEach(k => {
        if (k !== 'acfo_initialized') localStorage.removeItem(k);
      });
      showToast('All data cleared. Refreshing...', 'info');
      setTimeout(() => location.reload(), 1200);
    }
  });
}
