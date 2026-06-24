// ============================================================
// GOALS TAB — Antigravity AI CFO
// ============================================================
import { getGoals, updateGoal, formatCurrency } from './data.js';
import { showToast } from './app.js';

let editingGoalKey = null;

export function renderGoals() {
  const goals = getGoals();
  const container = document.getElementById('goals-container');
  if (!container) return;

  const sorted = Object.entries(goals).sort(([, a], [, b]) => a.priority - b.priority);
  const totalSaved = sorted.reduce((s, [, g]) => s + g.current, 0);
  const totalTarget = sorted.reduce((s, [, g]) => s + g.target, 0);

  setEl('goals-total-saved', formatCurrency(totalSaved));
  setEl('goals-total-target', formatCurrency(totalTarget));
  setEl('goals-overall-pct', totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) + '%' : '0%');
  const bar = document.getElementById('goals-overall-bar');
  if (bar) bar.style.width = Math.min(100, (totalSaved / totalTarget) * 100) + '%';

  container.innerHTML = sorted.map(([key, g]) => {
    const pct = Math.min(100, (g.current / g.target) * 100);
    const remaining = g.target - g.current;
    const priorityColors = { 1: 'var(--teal)', 2: 'var(--gold)', 3: 'var(--orange)', 4: 'var(--pink)' };
    const pColor = priorityColors[g.priority] || 'var(--purple)';
    return `
      <div class="goal-card" style="border-color:${pct >= 100 ? g.color : 'var(--border)'}">
        <div class="goal-card-header">
          <span class="goal-icon">${g.icon}</span>
          <div style="flex:1">
            <div class="goal-name">${g.name}</div>
            <div class="goal-priority" style="color:${pColor}">P${g.priority} Priority • ${g.description || ''}</div>
          </div>
          ${pct >= 100 ? '<span style="font-size:20px">🎉</span>' : ''}
          <button class="btn btn-sm btn-secondary" onclick="window.editGoal('${key}')">✏️ Edit</button>
        </div>
        <div class="progress-bar" style="height:10px">
          <div class="progress-fill" style="width:${pct}%; --start:${g.color}; --end:${g.color}99;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;gap:8px">
          <div>
            <span class="goal-current" style="color:${g.color};font-size:22px;font-family:'JetBrains Mono',monospace;font-weight:800">${formatCurrency(g.current)}</span>
            <span class="goal-target" style="margin-left:6px">of ${formatCurrency(g.target)}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:18px;font-weight:800;color:var(--text-primary)">${pct.toFixed(1)}%</div>
            <div style="font-size:11px;color:var(--text-muted)">${pct < 100 ? formatCurrency(remaining) + ' remaining' : 'Goal Achieved! 🎉'}</div>
          </div>
        </div>
        ${pct < 100 ? `
          <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
            <input type="number" id="goal-add-${key}" class="form-control" style="max-width:150px;padding:6px 10px;font-size:13px" placeholder="Add ₹ amount">
            <button class="btn btn-sm btn-teal" onclick="window.addToGoal('${key}')">+ Add</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  window.addToGoal = (key) => {
    const val = parseFloat(document.getElementById('goal-add-' + key)?.value);
    const goals = getGoals();
    if (!isNaN(val) && val > 0) {
      const newVal = (goals[key].current || 0) + val;
      updateGoal(key, { current: Math.min(newVal, goals[key].target) });
      renderGoals();
      showToast(`₹${val.toLocaleString('en-IN')} added to ${goals[key].name}!`, 'success');
      window.refreshDashboard?.();
    }
  };

  window.editGoal = (key) => {
    editingGoalKey = key;
    const goals = getGoals();
    const g = goals[key];
    document.getElementById('goal-edit-name').value = g.name;
    document.getElementById('goal-edit-target').value = g.target;
    document.getElementById('goal-edit-current').value = g.current;
    document.getElementById('goal-edit-description').value = g.description || '';
    document.getElementById('goal-edit-icon').value = g.icon;
    document.getElementById('goal-modal').classList.add('open');
  };
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function initGoals() {
  document.getElementById('goal-edit-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!editingGoalKey) return;
    const fd = new FormData(e.target);
    updateGoal(editingGoalKey, {
      name: fd.get('name'),
      target: parseFloat(fd.get('target')),
      current: parseFloat(fd.get('current')),
      description: fd.get('description'),
      icon: fd.get('icon'),
    });
    document.getElementById('goal-modal').classList.remove('open');
    renderGoals();
    showToast('Goal updated ✓', 'success');
    window.refreshDashboard?.();
    editingGoalKey = null;
  });
}
