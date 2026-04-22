// =============================================
// CONSTANTES LOCALSTORAGE
// =============================================
const USERS_KEY    = 'todoapp_users';
const TASKS_KEY    = 'todoapp_tasks';
const SESSION_KEY  = 'todoapp_session';
const DARKMODE_KEY = 'todoapp_darkmode';
const HISTORY_KEY  = 'todoapp_history';

// =============================================
// INITIALISATION AU CHARGEMENT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  // Appliquer le mode sombre sauvegardé
  if (localStorage.getItem(DARKMODE_KEY) === 'true') {
    document.body.classList.add('dark');
    document.getElementById('dark-toggle').textContent = '☀️';
  }

  // Vérifier si une session est active
  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    showAuthPage();
  }
});

// =============================================
// UTILITAIRES LOCALSTORAGE
// =============================================
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getTasks() {
  return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getSession() {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{"added":null,"deleted":null}');
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

// =============================================
// NAVIGATION ENTRE PAGES
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
// TABS CONNEXION / INSCRIPTION
// =============================================
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  // Effacer les messages
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent = '';
  document.getElementById('reg-success').textContent = '';
}

// =============================================
// PARTIE A & B : AUTHENTIFICATION
// =============================================

// 2. Inscription
function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('reg-error');
  const okEl     = document.getElementById('reg-success');

  errEl.textContent = '';
  okEl.textContent  = '';

  if (!name || !email || !password) {
    errEl.textContent = 'Veuillez remplir tous les champs.';
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

  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  saveUsers(users);

  okEl.textContent = 'Compte créé avec succès ! Vous pouvez vous connecter.';
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';

  // Basculer sur l'onglet connexion après 1.5s
  setTimeout(() => switchTab('login'), 1500);
}

// 3. Connexion
function handleLogin() {
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  errEl.textContent = '';

  if (!email || !password) {
    errEl.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    errEl.textContent = 'Email ou mot de passe incorrect.';
    return;
  }

  saveSession(user);
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showApp(user);
}

// Partie D : Déconnexion
function handleLogout() {
  clearSession();
  showAuthPage();
}

// =============================================
// PARTIE C : GESTION DES TÂCHES
// =============================================

let currentFilter = 'all';
let editingTaskId = null;

// 5. Ajouter une tâche
function handleAddTask() {
  const user  = getSession();
  const title = document.getElementById('task-title').value.trim();
  const desc  = document.getElementById('task-desc').value.trim();
  const date  = document.getElementById('task-date').value;
  const errEl = document.getElementById('task-error');

  errEl.textContent = '';

  if (!title) {
    errEl.textContent = 'Le titre de la tâche est obligatoire.';
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

  // Historique Bonus 2
  const h = getHistory();
  h.added = task.title;
  saveHistory(h);
  renderHistory();

  // Réinitialiser le formulaire
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value  = '';
  document.getElementById('task-date').value  = '';

  renderTasks();
}

// 6 & 7. Afficher les tâches filtrées
function renderTasks() {
  const user    = getSession();
  const tasks   = getTasks();
  const search  = document.getElementById('search-input').value.trim().toLowerCase();
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-msg');
  const countEl = document.getElementById('task-count');

  // Filtrer par utilisateur
  let userTasks = tasks.filter(t => t.owner === user.email);

  // Filtre statut
  if (currentFilter === 'done') userTasks = userTasks.filter(t => t.done);
  if (currentFilter === 'todo') userTasks = userTasks.filter(t => !t.done);

  // Bonus 3 : Recherche par titre / mot-clé / statut
  if (search) {
    userTasks = userTasks.filter(t => {
      const inTitle = t.title.toLowerCase().includes(search);
      const inDesc  = t.desc.toLowerCase().includes(search);
      const inStatus = (t.done ? 'terminée faite done' : 'à faire todo non faite').includes(search);
      return inTitle || inDesc || inStatus;
    });
  }

  countEl.textContent = userTasks.length;

  if (userTasks.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.innerHTML = userTasks.map(task => buildTaskCard(task)).join('');
}

function buildTaskCard(task) {
  const statusBadge = task.done
    ? '<span class="task-status-badge badge-done">✓ Terminée</span>'
    : '<span class="task-status-badge badge-todo">⏳ À faire</span>';

  const checkmark = task.done ? '✓' : '';

  return `
    <div class="task-item ${task.done ? 'done' : ''}" id="task-${task.id}">
      <div class="task-checkbox" onclick="toggleDone('${task.id}')" title="Changer le statut">${checkmark}</div>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        ${task.desc ? `<div class="task-desc">${escHtml(task.desc)}</div>` : ''}
        <div class="task-meta">
          ${statusBadge}
          <span>📅 ${task.date}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn" onclick="openEdit('${task.id}')" title="Modifier">✏️</button>
        <button class="task-btn delete" onclick="deleteTask('${task.id}')" title="Supprimer">🗑</button>
      </div>
    </div>
  `;
}

// Changement de statut
function toggleDone(id) {
  const tasks = getTasks();
  const idx   = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].done = !tasks[idx].done;
  saveTasks(tasks);
  renderTasks();
}

// Suppression
function deleteTask(id) {
  const tasks  = getTasks();
  const task   = tasks.find(t => t.id === id);
  const newArr = tasks.filter(t => t.id !== id);
  saveTasks(newArr);

  // Historique Bonus 2
  if (task) {
    const h = getHistory();
    h.deleted = task.title;
    saveHistory(h);
    renderHistory();
  }

  renderTasks();
}

// =============================================
// MODIFICATION (modal)
// =============================================
function openEdit(id) {
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === id);
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

// Fermer le modal en cliquant sur l'overlay
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
// BONUS 1 : MODE SOMBRE
// =============================================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(DARKMODE_KEY, isDark);
  document.getElementById('dark-toggle').textContent = isDark ? '☀️' : '🌙';
}

// =============================================
// BONUS 2 : HISTORIQUE
// =============================================
function renderHistory() {
  const h       = getHistory();
  const addedEl = document.getElementById('hist-added');
  const delEl   = document.getElementById('hist-deleted');

  addedEl.textContent = h.added   ? '➕ Dernière ajoutée : ' + h.added   : '';
  delEl.textContent   = h.deleted ? '🗑 Dernière supprimée : ' + h.deleted : '';

  // Masquer la barre si rien à afficher
  const bar = document.getElementById('history-bar');
  if (!h.added && !h.deleted) {
    bar.style.display = 'none';
  } else {
    bar.style.display = 'flex';
  }
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
