// =============================================
// CLES LOCALSTORAGE
// =============================================
const USERS_KEY   = 'todoapp_users';
const TASKS_KEY   = 'todoapp_tasks';
const SESSION_KEY = 'todoapp_session';
const DARK_KEY    = 'todoapp_darkmode';
const HIST_KEY    = 'todoapp_history';

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(DARK_KEY) === 'true') {
    document.body.classList.add('dark');
    document.getElementById('dark-toggle').textContent = 'Mode clair';
  }

  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    showAuthPage();
  }
});

// =============================================
// LOCALSTORAGE
// =============================================
function getUsers()        { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(u)      { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getTasks()        { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
function saveTasks(t)      { localStorage.setItem(TASKS_KEY, JSON.stringify(t)); }
function getSession()      { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }
function saveSession(u)    { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession()    { localStorage.removeItem(SESSION_KEY); }
function getHistory()      { return JSON.parse(localStorage.getItem(HIST_KEY) || '{"added":null,"deleted":null}'); }
function saveHistory(h)    { localStorage.setItem(HIST_KEY, JSON.stringify(h)); }

// =============================================
// NAVIGATION
// =============================================
function showAuthPage() {
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('app-page').classList.add('hidden');
}

function showApp(user) {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app-page').classList.remove('hidden');
  document.getElementById('welcome-msg').textContent = 'Bonjour ' + user.name;
  renderTasks();
  renderHistory();
}

// =============================================
// TABS
// =============================================
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent   = '';
  document.getElementById('reg-success').textContent = '';
}

// =============================================
// INSCRIPTION
// =============================================
function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('reg-error');
  const okEl     = document.getElementById('reg-success');

  errEl.textContent = '';
  okEl.textContent  = '';

  if (!name || !email || !password) {
    errEl.textContent = 'Tous les champs sont obligatoires.';
    return;
  }
  if (!isValidEmail(email)) {
    errEl.textContent = 'Adresse email invalide.';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'Cette adresse email est déjà utilisée.';
    return;
  }

  users.push({ id: Date.now().toString(), name, email, password });
  saveUsers(users);

  okEl.textContent = 'Compte créé. Vous pouvez vous connecter.';
  document.getElementById('reg-name').value     = '';
  document.getElementById('reg-email').value    = '';
  document.getElementById('reg-password').value = '';

  setTimeout(() => switchTab('login'), 1500);
}

// =============================================
// CONNEXION
// =============================================
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  errEl.textContent = '';

  if (!email || !password) {
    errEl.textContent = 'Tous les champs sont obligatoires.';
    return;
  }

  const user = getUsers().find(u => u.email === email && u.password === password);
  if (!user) {
    errEl.textContent = 'Email ou mot de passe incorrect.';
    return;
  }

  saveSession(user);
  document.getElementById('login-email').value    = '';
  document.getElementById('login-password').value = '';
  showApp(user);
}

// =============================================
// DECONNEXION
// =============================================
function handleLogout() {
  clearSession();
  showAuthPage();
}

// =============================================
// TACHES
// =============================================
let currentFilter = 'all';
let editingTaskId = null;

function handleAddTask() {
  const user  = getSession();
  const title = document.getElementById('task-title').value.trim();
  const desc  = document.getElementById('task-desc').value.trim();
  const date  = document.getElementById('task-date').value;
  const errEl = document.getElementById('task-error');

  errEl.textContent = '';

  if (!title) {
    errEl.textContent = 'Le titre est obligatoire.';
    return;
  }

  const task = {
    id:    Date.now().toString(),
    title,
    desc,
    date:  date || new Date().toISOString().split('T')[0],
    done:  false,
    owner: user.email,
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  const h = getHistory();
  h.added = task.title;
  saveHistory(h);
  renderHistory();

  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value  = '';
  document.getElementById('task-date').value  = '';

  renderTasks();
}

function renderTasks() {
  const user    = getSession();
  const search  = document.getElementById('search-input').value.trim().toLowerCase();
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-msg');
  const countEl = document.getElementById('task-count');

  let tasks = getTasks().filter(t => t.owner === user.email);

  if (currentFilter === 'done') tasks = tasks.filter(t => t.done);
  if (currentFilter === 'todo') tasks = tasks.filter(t => !t.done);

  if (search) {
    tasks = tasks.filter(t => {
      const inTitle  = t.title.toLowerCase().includes(search);
      const inDesc   = t.desc.toLowerCase().includes(search);
      const inStatus = (t.done ? 'terminee faite done' : 'a faire todo non faite').includes(search);
      return inTitle || inDesc || inStatus;
    });
  }

  countEl.textContent = tasks.length;

  if (tasks.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.innerHTML = tasks.map(buildTaskCard).join('');
}

function buildTaskCard(task) {
  const statusLabel = task.done
    ? '<span class="status-label status-done">Terminee</span>'
    : '<span class="status-label status-todo">A faire</span>';

  const checkClass = task.done ? 'task-checkbox checked' : 'task-checkbox';

  return `
    <div class="task-item ${task.done ? 'done' : ''}">
      <div class="${checkClass}" onclick="toggleDone('${task.id}')"></div>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        ${task.desc ? `<div class="task-desc">${escHtml(task.desc)}</div>` : ''}
        <div class="task-meta">
          ${statusLabel}
          <span>${task.date}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn" onclick="openEdit('${task.id}')">Modifier</button>
        <button class="task-btn delete" onclick="deleteTask('${task.id}')">Supprimer</button>
      </div>
    </div>
  `;
}

function toggleDone(id) {
  const tasks = getTasks();
  const idx   = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].done = !tasks[idx].done;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === id);
  saveTasks(tasks.filter(t => t.id !== id));

  if (task) {
    const h = getHistory();
    h.deleted = task.title;
    saveHistory(h);
    renderHistory();
  }

  renderTasks();
}

// =============================================
// MODAL EDITION
// =============================================
function openEdit(id) {
  const task = getTasks().find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value  = task.desc;
  document.getElementById('edit-date').value  = task.date;
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
  editingTaskId = null;
  document.getElementById('edit-modal').classList.add('hidden');
}

function saveEdit() {
  if (!editingTaskId) return;
  const title = document.getElementById('edit-title').value.trim();
  const desc  = document.getElementById('edit-desc').value.trim();
  const date  = document.getElementById('edit-date').value;
  if (!title) { alert('Le titre est obligatoire.'); return; }

  const tasks = getTasks();
  const idx   = tasks.findIndex(t => t.id === editingTaskId);
  if (idx === -1) return;
  tasks[idx].title = title;
  tasks[idx].desc  = desc;
  tasks[idx].date  = date;
  saveTasks(tasks);
  closeModal();
  renderTasks();
}

document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// =============================================
// FILTRES
// =============================================
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// =============================================
// MODE SOMBRE
// =============================================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(DARK_KEY, isDark);
  document.getElementById('dark-toggle').textContent = isDark ? 'Mode clair' : 'Mode sombre';
}

// =============================================
// HISTORIQUE (Bonus 2)
// =============================================
function renderHistory() {
  const h   = getHistory();
  const bar = document.getElementById('history-bar');
  document.getElementById('hist-added').textContent   = h.added   ? 'Ajoutee : ' + h.added   : '';
  document.getElementById('hist-deleted').textContent = h.deleted ? 'Supprimee : ' + h.deleted : '';
  bar.classList.toggle('hidden', !h.added && !h.deleted);
}

// =============================================
// UTILITAIRES
// =============================================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
