// ============================================================
// APP CONTROLLER — Antigravity AI CFO
// ============================================================
import { initializeData, getSettings, getFinancialScore, getMonthKey } from './data.js';
import { renderDashboard } from './dashboard.js';
import { renderTransactions, initTransactions, openTxnModal, closeTxnModal } from './transactions.js';
import { renderInvestments, initInvestments, openInvModal, closeInvModal } from './investments.js';
import { renderGoals, initGoals } from './goals.js';
import { renderBusiness, initBusiness, openBizModal, closeBizModal } from './business.js';
import { renderBuyDecision, initBuyDecision } from './buyDecision.js';
import { renderWeeklyReview, renderMonthlyReview } from './reviews.js';
import { initChat, loadChatHistory } from './aiChat.js';
import { renderSettings, initSettings } from './settings.js';

// ─── TOAST SYSTEM ──────────────────────────────────────────
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── TAB NAVIGATION ───────────────────────────────────────
const TAB_RENDERERS = {
  dashboard: () => renderDashboard(),
  transactions: () => renderTransactions(),
  investments: () => renderInvestments(),
  goals: () => renderGoals(),
  business: () => renderBusiness(),
  buy: () => renderBuyDecision(),
  chat: () => loadChatHistory(),
  'weekly-review': () => renderWeeklyReview(),
  'monthly-review': () => renderMonthlyReview(),
  settings: () => renderSettings(),
};

let currentTab = 'dashboard';

function switchTab(tabId) {
  // Deactivate current
  document.querySelector('.page.active')?.classList.remove('active');
  document.querySelector('.nav-item.active')?.classList.remove('active');

  // Activate new
  document.getElementById('page-' + tabId)?.classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: ['🏠 Dashboard', 'Your financial overview at a glance'],
    transactions: ['💸 Transactions', 'Track income & expenses across all entities'],
    investments: ['📈 Investments', 'SIP tracker & portfolio progress'],
    goals: ['🎯 Goals', 'Track progress toward your financial goals'],
    business: ['🏢 Business', 'Tranzora & Zero_Day_Crew finances'],
    buy: ['🛒 Buy Decision', 'CFO verdict on purchases'],
    chat: ['🤖 AI CFO Chat', 'Your personal Gemini-powered financial advisor'],
    'weekly-review': ['📊 Weekly Review', 'Auto-generated weekly financial assessment'],
    'monthly-review': ['📅 Monthly Review', 'Complete monthly financial analysis'],
    settings: ['⚙️ Settings', 'Configure your profile and preferences'],
  };
  const [title, sub] = titles[tabId] || ['Antigravity AI CFO', ''];
  document.getElementById('topbar-title')?.textContent && (document.getElementById('topbar-title').textContent = title);
  document.getElementById('topbar-sub')?.textContent && (document.getElementById('topbar-sub').textContent = sub);

  currentTab = tabId;

  // Render
  TAB_RENDERERS[tabId]?.();

  // Update sidebar score
  updateSidebarScore();
}

function updateSidebarScore() {
  const score = getFinancialScore(getMonthKey());
  const el = document.getElementById('sidebar-score');
  if (el) el.textContent = score;
}

// ─── MODAL HANDLERS ───────────────────────────────────────
function setupModals() {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  });

  // Transaction modal
  document.getElementById('btn-add-txn')?.addEventListener('click', openTxnModal);
  document.getElementById('close-txn-modal')?.addEventListener('click', closeTxnModal);

  // Investment modal
  document.getElementById('btn-add-inv')?.addEventListener('click', openInvModal);
  document.getElementById('close-inv-modal')?.addEventListener('click', closeInvModal);

  // Goal modal
  document.getElementById('close-goal-modal')?.addEventListener('click', () => document.getElementById('goal-modal').classList.remove('open'));

  // Business modal
  document.getElementById('btn-log-biz')?.addEventListener('click', openBizModal);
  document.getElementById('close-biz-modal')?.addEventListener('click', closeBizModal);
}

// ─── GLOBAL REFRESH ───────────────────────────────────────
window.refreshDashboard = () => {
  if (currentTab === 'dashboard') renderDashboard();
  updateSidebarScore();
};

// ─── INIT ─────────────────────────────────────────────────
function init() {
  // Initialize data
  initializeData();

  // Setup nav
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Setup modals
  setupModals();

  // Init all tabs
  initTransactions();
  initInvestments();
  initGoals();
  initBusiness();
  initBuyDecision();
  initChat();
  initSettings();

  // Sub-tabs for reviews
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('[data-subtab-group]');
      parent?.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.subtab;
      parent?.querySelectorAll('[data-subtab-content]').forEach(c => {
        c.style.display = c.dataset.subtabContent === target ? 'block' : 'none';
      });
      if (target === 'weekly') renderWeeklyReview();
      if (target === 'monthly') renderMonthlyReview();
    });
  });

  // Load settings for sidebar name
  const settings = getSettings();
  const nameEl = document.getElementById('sidebar-user-name');
  if (nameEl) nameEl.textContent = settings.name;

  // Start on dashboard
  switchTab('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
