// ============================================================
// BUY DECISION ANALYZER — Antigravity AI CFO
// ============================================================
import { getMonthlyMetrics, getGoals, getInvestments, getSettings, formatCurrency, getMonthKey } from './data.js';

export function renderBuyDecision() {
  // Reset verdict
  const verdictArea = document.getElementById('verdict-area');
  if (verdictArea) verdictArea.style.display = 'none';
}

export function analyzePurchase() {
  const name = document.getElementById('buy-name')?.value?.trim();
  const price = parseFloat(document.getElementById('buy-price')?.value);
  const category = document.getElementById('buy-category')?.value || 'lifestyle';

  if (!name || isNaN(price) || price <= 0) {
    alert('Please enter item name and price.');
    return;
  }

  const monthKey = getMonthKey();
  const metrics = getMonthlyMetrics(monthKey);
  const goals = getGoals();
  const settings = getSettings();

  // Calculations
  // HIGH-07: original used personalIncome - metrics.personalExpenses which could be
  // negative mid-month before income arrives, causing false "savings go negative" flags.
  // Use the projected full-month income (settings baseline) as the reference instead.
  const projectedMonthlyIncome = metrics.personalIncome > 0
    ? metrics.personalIncome          // use actual if income already logged this month
    : (settings.monthlyFixed || 6500); // fall back to configured baseline
  const currentSavings = projectedMonthlyIncome - metrics.personalExpenses;
  const efGoal = goals.emergencyFund;
  const efFunded = efGoal ? efGoal.current / efGoal.target : 1;
  const efDeficit = efGoal ? Math.max(0, efGoal.target - efGoal.current) : 0;

  // Monthly SIP total
  const invs = getInvestments();
  const monthlySIP = invs.filter(i => i.monthlyAmount > 0).reduce((s, i) => s + i.monthlyAmount, 0);

  // Impact calculations
  const incomeImpactPct = projectedMonthlyIncome > 0 ? ((price / projectedMonthlyIncome) * 100).toFixed(1) : 0;
  const savingsAfter = currentSavings - price;
  const sipDaysDelayed = monthlySIP > 0 ? Math.round((price / monthlySIP) * 30) : 0;

  // Determine verdict
  let verdict = 'approve';
  let reasons = [];
  let flags = 0;

  // Flag 1: Emergency fund not funded
  if (efFunded < 0.5) {
    flags += 2;
    reasons.push(`🛡️ Your emergency fund is only ${(efFunded * 100).toFixed(0)}% funded (₹${efDeficit.toLocaleString('en-IN')} deficit). This money should go there first.`);
  } else if (efFunded < 1) {
    flags += 1;
    reasons.push(`🛡️ Emergency fund at ${(efFunded * 100).toFixed(0)}%. Consider completing it before this purchase.`);
  }

  // Flag 2: Price > 50% of monthly income
  if (price > personalIncome * 0.5 && personalIncome > 0) {
    flags += 2;
    reasons.push(`💰 This is ${incomeImpactPct}% of your monthly income — a significant hit.`);
  } else if (price > personalIncome * 0.25 && personalIncome > 0) {
    flags += 1;
    reasons.push(`💰 This is ${incomeImpactPct}% of your monthly income. Consider timing.`);
  }

  // Flag 3: Would push savings negative
  if (savingsAfter < 0) {
    flags += 3;
    reasons.push(`❌ This would push your monthly savings negative by ₹${Math.abs(savingsAfter).toLocaleString('en-IN')}.`);
  }

  // Flag 4: Career / gaming setup priority
  const gamingGoal = goals.gamingSetup;
  const careerGoal = goals.careerFund;
  if ((gamingGoal && gamingGoal.current < gamingGoal.target * 0.5) && category === 'lifestyle') {
    flags += 1;
    reasons.push(`🎮 Gaming/Work setup (P1 goal) is only ${((gamingGoal.current / gamingGoal.target) * 100).toFixed(0)}% funded. Prioritize that first.`);
  }
  if ((careerGoal && careerGoal.current < careerGoal.target * 0.3) && category === 'lifestyle') {
    flags += 1;
    reasons.push(`📚 Career Investment Fund (P1 goal) needs attention before lifestyle spending.`);
  }

  // Positive factors
  if (category === 'career' || category === 'education') {
    flags -= 2;
    reasons.unshift(`📚 Career investments always pay off. This is a smart allocation.`);
  }
  if (category === 'gaming_setup') {
    flags -= 1;
    reasons.unshift(`🎮 This is a Priority 1 goal! Spending here is aligned with your plan.`);
  }

  // Final verdict
  if (flags <= 0) verdict = 'approve';
  else if (flags <= 2) verdict = 'delay';
  else verdict = 'reject';

  // Approve reasons
  if (reasons.length === 0) {
    reasons.push(`✅ Your finances are in good shape to absorb this purchase.`);
    reasons.push(`💡 Make sure to maintain your SIP contributions (₹${monthlySIP.toLocaleString('en-IN')}/mo) regardless.`);
  }

  // Suggest delay timeline
  if (verdict === 'delay') {
    const monthsToSave = personalIncome > 0 ? Math.ceil(price / (personalIncome * 0.1)) : 2;
    reasons.push(`⏳ Suggested timeline: save specifically for this over ${monthsToSave} month${monthsToSave > 1 ? 's' : ''}.`);
  }

  displayVerdict(verdict, name, price, reasons, {
    incomeImpactPct,
    sipDaysDelayed,
    efImpactPct: efGoal ? ((price / efGoal.target) * 100).toFixed(1) : 'N/A',
    savingsAfter,
  });
}

function displayVerdict(verdict, name, price, reasons, impacts) {
  const area = document.getElementById('verdict-area');
  if (!area) return;
  area.style.display = 'block';
  document.getElementById('verdict-placeholder')?.style && (document.getElementById('verdict-placeholder').style.display = 'none');
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const emojis = { approve: '✅', delay: '⏳', reject: '❌' };
  const labels = { approve: 'APPROVED', delay: 'DELAY IT', reject: 'REJECTED' };

  document.getElementById('verdict-card').className = 'verdict-card ' + verdict;
  document.getElementById('verdict-emoji').textContent = emojis[verdict];
  document.getElementById('verdict-label').textContent = labels[verdict];
  document.getElementById('verdict-item-name').textContent = `"${name}" — ${formatCurrency(price)}`;
  document.getElementById('verdict-reason').innerHTML = reasons.map(r => `<p style="margin:5px 0;text-align:left">• ${r}</p>`).join('');

  document.getElementById('impact-income').textContent = impacts.incomeImpactPct + '%';
  document.getElementById('impact-sip').textContent = impacts.sipDaysDelayed + ' days';
  document.getElementById('impact-ef').textContent = impacts.efImpactPct + '%';
}

export function initBuyDecision() {
  document.getElementById('buy-analyze-btn')?.addEventListener('click', analyzePurchase);

  // Allow Enter key
  ['buy-name', 'buy-price'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') analyzePurchase();
    });
  });
}
