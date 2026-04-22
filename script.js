// =============================================
// CLES LOCALSTORAGE
// =============================================
const USERS_KEY   = 'todo_users';
const TASKS_KEY   = 'todo_tasks';
const SESSION_KEY = 'todo_session';
const DARK_KEY    = 'todo_dark';

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  // Appliquer le mode sombre sauvegardé
  if (localStorage.getItem(DARK_KEY) === 'true') {
    document.body.classList.add('dark');
    document.getElementById('dark-toggle').textContent = 'Mode clair';
  }

  // Vérifier la session active
  const session = getSession();
  if (session) {
    showTodoPage(session);
  } else {
    document.getElementById('login-page').classList.remove('hidden');
  }

  // Valider avec Entrée sur le champ login
  document.getElementById('input-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // Valider avec Entrée sur le champ tâche
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAddTask();
  });
});

// =============================================
// LOCALSTORAGE
// =============================================
function getUsers()     { return JSON.parse(localStorage.getItem(USERS_KEY)   || '[]'); }
function saveUsers(u)   { localStorage.setItem(USERS_KEY,   JSON.stringify(u)); }
function getTasks()     { return JSON.parse(localStorage.getItem(TASKS_KEY)   || '[]'); }
function saveTasks(t)   { localStorage.setItem(TASKS_KEY,   JSON.stringify(t)); }
function getSession()   { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }
function saveSession(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

// =============================================
// 1. SYSTEME DE LOGIN
// Connexion directe si le nom existe,
// création automatique sinon.
// =============================================
function handleLogin() {
  const name  = document.getElementById('input-name').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!name) {
    errEl.textContent = 'Veuillez entrer votre nom.';
    return;
  }

  let users = getUsers();
  let user  = users.find(u => u.name.toLowerCase() === name.toLowerCase());

  // Création automatique si nouveau
  if (!user) {
    user = { id: Date.now().toString(), name };
    users.push(user);
    saveUsers(users);
  }

  saveSession(user);
  document.getElementById('input-name').value = '';
  showTodoPage(user);
}

// =============================================
// 4. GESTION DE SESSION
// =============================================
function showTodoPage(user) {
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('todo-page').classList.remove('hidden');
  document.getElementById('welcome-msg').textContent = 'Bonjour ' + user.name;
  renderTasks();
}

function handleLogout() {
  clearSession();
  document.getElementById('todo-page').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
}

// =============================================
// 2. CRUD DES TACHES
// =============================================

// Ajouter
function handleAddTask() {
  const user    = getSession();
  const input   = document.getElementById('task-input');
  const title   = input.value.trim();
  const errEl   = document.getElementById('task-error');

  errEl.textContent = '';

  if (!title) {
    errEl.textContent = 'Le titre est obligatoire.';
    return;
  }

  const task = {
    id:    Date.now().toString(),
    title,
    done:  false,
    owner: user.id,
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  input.value = '';
  input.focus();
  renderTasks();
}

// Marquer comme terminée / non terminée
function toggleTask(id) {
  const tasks = getTasks();
  const idx   = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].done = !tasks[idx].done;
  saveTasks(tasks);
  renderTasks();
}

// Supprimer avec animation
function deleteTask(id) {
  const item = document.getElementById('task-' + id);
  if (!item) return;

  item.classList.add('removing');
  item.addEventListener('animationend', () => {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
  }, { once: true });
}

// =============================================
// AFFICHAGE DES TACHES
// =============================================
function renderTasks() {
  const user    = getSession();
  const tasks   = getTasks().filter(t => t.owner === user.id);
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-msg');

  // Compteur (total / terminées)
  const total  = tasks.length;
  const done   = tasks.filter(t => t.done).length;
  document.getElementById('counter').textContent = total > 0
    ? done + ' / ' + total + ' terminees'
    : '';

  if (tasks.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');

  listEl.innerHTML = tasks.map(task => `
    <li class="task-item ${task.done ? 'done' : ''}" id="task-${task.id}">
      <div class="task-check ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></div>
      <span class="task-text">${escHtml(task.title)}</span>
      <button class="task-delete" onclick="deleteTask('${task.id}')">Supprimer</button>
    </li>
  `).join('');
}

// =============================================
// MODE SOMBRE (Bonus)
// =============================================
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(DARK_KEY, isDark);
  document.getElementById('dark-toggle').textContent = isDark ? 'Mode clair' : 'Mode sombre';
}

// =============================================
// UTILITAIRE
// =============================================
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
