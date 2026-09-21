/* ============================================================
   GYM MANAGEMENT SYSTEM — app.js
   ============================================================ */

const API = 'http://localhost:3000/api';

// ─── NAVIGATION ─────────────────────────────────────────────
function navigate(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + viewId);
  const navItem = document.querySelector(`[data-view="${viewId}"]`);
  if (view)    view.classList.add('active');
  if (navItem) navItem.classList.add('active');

  const titles = {
    dashboard: 'Dashboard <span>Overview</span>',
    members:   'Member <span>Management</span>',
    payments:  'Payment <span>Records</span>',
    workouts:  'Workout <span>Schedule</span>',
    dietplans: 'Diet <span>Plans</span>',
  };
  document.getElementById('page-title').innerHTML = titles[viewId] || viewId;

  switch (viewId) {
    case 'dashboard': loadDashboard(); break;
    case 'members':   loadMembers();   break;
    case 'payments':  loadPayments();  break;
    case 'workouts':  loadWorkouts();  break;
    case 'dietplans': loadDietPlans(); break;
  }
}

// ─── FETCH HELPER ────────────────────────────────────────────
async function apiFetch(endpoint) {
  const res = await fetch(API + endpoint);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiPost(endpoint, body) {
  const res = await fetch(API + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(API + endpoint, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── TOAST ───────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icon = type === 'success' ? '✅' : '❌';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── BADGE FACTORY ───────────────────────────────────────────
function badge(text, cls) {
  return `<span class="badge ${cls}">${text}</span>`;
}

function genderBadge(g) {
  const map = { Male: 'badge-male', Female: 'badge-female', Other: 'badge-other' };
  return badge(g, map[g] || 'badge-other');
}

function planBadge(p) {
  const map = { Basic: 'badge-basic', Standard: 'badge-standard', Premium: 'badge-premium' };
  return badge(p, map[p] || 'badge-basic');
}

function diffBadge(d) {
  const map = { Beginner: 'badge-beginner', Intermediate: 'badge-intermediate', Advanced: 'badge-advanced' };
  return badge(d, map[d] || 'badge-beginner');
}

function modeBadge(m) {
  const map = { Cash: 'badge-cash', Card: 'badge-card', UPI: 'badge-upi', 'Net Banking': 'badge-netbanking' };
  return badge(m, map[m] || 'badge-cash');
}

function statusBadge(s) {
  const cls = 'badge-' + s.toLowerCase().replace(' ', '');
  return badge(s, cls);
}

function dietBadge(d) {
  const map = {
    Keto: 'badge-keto', Vegan: 'badge-vegan', 'High Protein': 'badge-highprotein',
    Balanced: 'badge-balanced', 'Low Carb': 'badge-lowcarb'
  };
  return badge(d, map[d] || 'badge-balanced');
}

// ─── TABLE HELPER ────────────────────────────────────────────
function setTableLoading(tbodyId) {
  document.getElementById(tbodyId).innerHTML =
    `<tr class="loader-row"><td colspan="20"><span class="spinner"></span>Loading data...</td></tr>`;
}

function setTableEmpty(tbodyId, msg = 'No data available', icon = '📭') {
  document.getElementById(tbodyId).innerHTML =
    `<tr><td colspan="20">
       <div class="empty-state">
         <div class="empty-icon">${icon}</div>
         <p>${msg}</p>
       </div>
     </td></tr>`;
}

function setTableError(tbodyId) {
  document.getElementById(tbodyId).innerHTML =
    `<tr><td colspan="20">
       <div class="empty-state">
         <div class="empty-icon">⚠️</div>
         <p>Could not connect to server. Make sure backend is running.</p>
       </div>
     </td></tr>`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── DASHBOARD ───────────────────────────────────────────────
async function loadDashboard() {
  // ── Stats
  try {
    const d = await apiFetch('/dashboard');
    animateNumber('stat-members',  d.totalMembers   || 0, false);
    animateNumber('stat-revenue',  d.totalRevenue   || 0, true);
    animateNumber('stat-trainers', d.activeTrainers || 0, false);
    animateNumber('stat-today',    d.paymentsToday  || 0, true);
  } catch {
    ['stat-members','stat-revenue','stat-trainers','stat-today'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
  }

  // ── Recent Payments
  const pmtEl = document.getElementById('recent-payments');
  pmtEl.innerHTML = '<div class="mini-list-item"><span class="spinner"></span> Loading...</div>';
  try {
    const payments = await apiFetch('/payments');
    const recent = payments.slice(0, 5);
    pmtEl.innerHTML = recent.length
      ? recent.map(p => `
          <div class="mini-list-item">
            <div>
              <div class="mini-name">${p.member || '—'}</div>
              <div class="mini-sub">${p.pay_date} · ${modeBadge(p.mode)}</div>
            </div>
            <div class="mini-amount">₹${Number(p.amount).toLocaleString('en-IN')}</div>
          </div>`).join('')
      : '<div class="mini-list-item empty-inline">📭 No payments yet</div>';
  } catch {
    pmtEl.innerHTML = '<div class="mini-list-item empty-inline">⚠️ Error loading payments</div>';
  }

  // ── Plan Distribution Chart
  const planEl = document.getElementById('plan-breakdown');
  try {
    const members = await apiFetch('/members');
    const counts = { Basic: 0, Standard: 0, Premium: 0 };
    members.forEach(m => { if (counts[m.plan] !== undefined) counts[m.plan]++; });
    planEl.innerHTML = '';
    renderPlanChart(counts);
  } catch {
    planEl.innerHTML = '<p class="empty-inline" style="padding:12px">⚠️ Error loading chart</p>';
  }

  // ── Active Trainers
  await loadTrainers();
}

// ─── PLAN CHART ──────────────────────────────────────────────
let planChartInstance = null;

function renderPlanChart(counts) {
  const ctx = document.getElementById('plan-chart');
  if (!ctx) return;
  if (planChartInstance) { planChartInstance.destroy(); }

  planChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Members',
        data: Object.values(counts),
        backgroundColor: ['rgba(139,148,158,0.3)','rgba(59,130,246,0.4)','rgba(250,204,21,0.4)'],
        borderColor:     ['#9ca3af','#60a5fa','#fbbf24'],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1117',
          titleColor: '#eef2f7',
          bodyColor: '#8b9ab0',
          borderColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#8b9ab0', font: { family: 'DM Mono', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#8b9ab0', stepSize: 1, font: { family: 'DM Mono', size: 11 } }
        }
      }
    }
  });
}

// ─── TRAINERS ────────────────────────────────────────────────
async function loadTrainers() {
  const grid    = document.getElementById('trainers-grid');
  const countEl = document.getElementById('trainers-count');
  grid.innerHTML = '<div class="mini-list-item"><span class="spinner"></span> Loading...</div>';

  try {
    const data   = await apiFetch('/trainers');
    const active = data.filter(t => t.status === 'Active');
    if (countEl) countEl.textContent = active.length + ' active';

    if (!active.length) {
      grid.innerHTML = '<div class="mini-list-item empty-inline">📭 No trainers available</div>';
      return;
    }

    grid.innerHTML = active.map(t => `
      <div class="trainer-card">
        <div class="trainer-avatar">${initials(t.name)}</div>
        <div>
          <div class="trainer-name">${t.name}</div>
          <div class="trainer-spec">${t.specialty || '—'}</div>
          <div class="trainer-exp">${t.experience} yrs exp</div>
        </div>
      </div>`).join('');
  } catch {
    grid.innerHTML = '<div class="mini-list-item empty-inline">⚠️ Error loading trainers</div>';
  }
}

function animateNumber(id, target, isMoney) {
  const el = document.getElementById(id);
  const duration = 900;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * ease);
    el.textContent = isMoney ? Number(value).toLocaleString('en-IN') : value;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── MEMBERS ─────────────────────────────────────────────────
async function loadMembers() {
  setTableLoading('members-tbody');
  try {
    const data = await apiFetch('/members');
    const tbody = document.getElementById('members-tbody');
    document.getElementById('members-count').textContent = data.length + ' records';
    if (!data.length) { setTableEmpty('members-tbody', 'No members found', '🏋️'); return; }
    tbody.innerHTML = data.map(m => `
      <tr>
        <td>
          <div class="member-name">
            <div class="member-avatar">${initials(m.name)}</div>
            <div class="member-info">
              <div class="name">${m.name}</div>
              <div class="email">${m.email}</div>
            </div>
          </div>
        </td>
        <td>${m.phone || '—'}</td>
        <td>${genderBadge(m.gender)}</td>
        <td>${planBadge(m.plan)}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">${m.join_date}</td>
        <td>${statusBadge(m.status)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id})">🗑 Delete</button>
        </td>
      </tr>
    `).join('');
  } catch {
    setTableError('members-tbody');
  }
}

async function deleteMember(id) {
  if (!confirm('Delete this member? This will also remove their payments, workouts, and diet plans.')) return;
  try {
    await apiDelete(`/members/${id}`);
    toast('Member deleted successfully');
    loadMembers();
    loadDashboard();
  } catch {
    toast('Failed to delete member', 'error');
  }
}

async function addMember(e) {
  e.preventDefault();
  const body = {
    name:      document.getElementById('m-name').value.trim(),
    email:     document.getElementById('m-email').value.trim(),
    phone:     document.getElementById('m-phone').value.trim(),
    gender:    document.getElementById('m-gender').value,
    plan:      document.getElementById('m-plan').value,
    join_date: document.getElementById('m-date').value,
    status:    'Active',
  };
  if (!body.name || !body.email || !body.join_date) { toast('Please fill all required fields', 'error'); return; }
  try {
    await apiPost('/members', body);
    toast('Member added successfully ✅');
    closeModal('modal-member');
    document.getElementById('form-member').reset();
    loadMembers();
    loadDashboard();
  } catch (err) {
    toast('Failed: ' + err.message, 'error');
  }
}

// ─── PAYMENTS ────────────────────────────────────────────────
async function loadPayments() {
  setTableLoading('payments-tbody');
  try {
    const data = await apiFetch('/payments');
    const tbody = document.getElementById('payments-tbody');
    document.getElementById('payments-count').textContent = data.length + ' records';
    if (!data.length) { setTableEmpty('payments-tbody', 'No payments found', '💳'); return; }
    tbody.innerHTML = data.map(p => `
      <tr>
        <td>
          <div class="member-name">
            <div class="member-avatar">${initials(p.member)}</div>
            <div class="member-info"><div class="name">${p.member}</div></div>
          </div>
        </td>
        <td class="amount-cell">₹${Number(p.amount).toLocaleString('en-IN')}</td>
        <td>${modeBadge(p.mode)}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">${p.pay_date}</td>
        <td>${statusBadge(p.status)}</td>
      </tr>
    `).join('');
  } catch {
    setTableError('payments-tbody');
  }
}

async function addPayment(e) {
  e.preventDefault();
  const body = {
    member_id: document.getElementById('p-member').value,
    amount:    document.getElementById('p-amount').value,
    mode:      document.getElementById('p-mode').value,
    pay_date:  document.getElementById('p-date').value,
    status:    document.getElementById('p-status').value,
  };
  if (!body.member_id || !body.amount || !body.pay_date) { toast('Fill all fields', 'error'); return; }
  try {
    await apiPost('/payments', body);
    toast('Payment recorded ✅');
    closeModal('modal-payment');
    document.getElementById('form-payment').reset();
    loadPayments();
    loadDashboard();
  } catch (err) {
    toast('Failed: ' + err.message, 'error');
  }
}

// ─── WORKOUTS ────────────────────────────────────────────────
async function loadWorkouts() {
  setTableLoading('workouts-tbody');
  try {
    const data = await apiFetch('/workouts');
    const tbody = document.getElementById('workouts-tbody');
    document.getElementById('workouts-count').textContent = data.length + ' records';
    if (!data.length) { setTableEmpty('workouts-tbody', 'No workouts scheduled', '🏃'); return; }
    tbody.innerHTML = data.map(w => `
      <tr>
        <td>
          <div class="member-name">
            <div class="member-avatar">${initials(w.member)}</div>
            <div class="member-info"><div class="name">${w.member}</div></div>
          </div>
        </td>
        <td style="font-weight:600">${w.workout}</td>
        <td>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">🔁 ${w.frequency}</span>
        </td>
        <td>${diffBadge(w.difficulty)}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${w.trainer || '—'}</td>
      </tr>
    `).join('');
  } catch {
    setTableError('workouts-tbody');
  }
}

async function addWorkout(e) {
  e.preventDefault();
  const body = {
    member_id:  document.getElementById('w-member').value,
    workout:    document.getElementById('w-name').value.trim(),
    frequency:  document.getElementById('w-freq').value,
    difficulty: document.getElementById('w-diff').value,
    trainer_id: document.getElementById('w-trainer').value || null,
  };
  if (!body.member_id || !body.workout) { toast('Fill all fields', 'error'); return; }
  try {
    await apiPost('/workouts', body);
    toast('Workout added ✅');
    closeModal('modal-workout');
    document.getElementById('form-workout').reset();
    loadWorkouts();
  } catch (err) {
    toast('Failed: ' + err.message, 'error');
  }
}

// ─── DIET PLANS ──────────────────────────────────────────────
async function loadDietPlans() {
  setTableLoading('diet-tbody');
  try {
    const data = await apiFetch('/dietplans');
    const tbody = document.getElementById('diet-tbody');
    document.getElementById('diet-count').textContent = data.length + ' records';
    if (!data.length) { setTableEmpty('diet-tbody', 'No diet plans found', '🥗'); return; }
    tbody.innerHTML = data.map(d => `
      <tr>
        <td>
          <div class="member-name">
            <div class="member-avatar">${initials(d.member)}</div>
            <div class="member-info"><div class="name">${d.member}</div></div>
          </div>
        </td>
        <td>${dietBadge(d.diet_type)}</td>
        <td>
          <span style="font-family:var(--font-mono);font-size:13px;color:var(--accent)">${d.calories}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:2px">kcal</span>
        </td>
        <td style="font-size:12px;color:var(--text-secondary);max-width:240px;white-space:normal">${d.notes || '—'}</td>
      </tr>
    `).join('');
  } catch {
    setTableError('diet-tbody');
  }
}

async function addDietPlan(e) {
  e.preventDefault();
  const body = {
    member_id: document.getElementById('d-member').value,
    diet_type: document.getElementById('d-type').value,
    calories:  document.getElementById('d-cal').value,
    notes:     document.getElementById('d-notes').value.trim(),
  };
  if (!body.member_id || !body.calories) { toast('Fill all fields', 'error'); return; }
  try {
    await apiPost('/dietplans', body);
    toast('Diet plan added ✅');
    closeModal('modal-diet');
    document.getElementById('form-diet').reset();
    loadDietPlans();
  } catch (err) {
    toast('Failed: ' + err.message, 'error');
  }
}

// ─── MODAL CONTROL ───────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  // Populate member dropdowns
  if (id === 'modal-payment' || id === 'modal-workout' || id === 'modal-diet') {
    populateMemberDropdowns();
  }
  if (id === 'modal-workout') {
    populateTrainerDropdown();
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

async function populateMemberDropdowns() {
  try {
    const members = await apiFetch('/members');
    const opts = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    ['p-member', 'w-member', 'd-member'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<option value="">Select member...</option>` + opts;
    });
  } catch { /* silent */ }
}

async function populateTrainerDropdown() {
  try {
    const trainers = await apiFetch('/trainers');
    const el = document.getElementById('w-trainer');
    if (el) el.innerHTML = `<option value="">No trainer</option>` +
      trainers.map(t => `<option value="${t.id}">${t.name} (${t.specialty})</option>`).join('');
  } catch { /* silent */ }
}

// ─── DATE DISPLAY ────────────────────────────────────────────
function setDate() {
  const now = new Date();
  document.getElementById('date-display').textContent =
    now.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  navigate('dashboard');
});
