// =============================================
// CLES LOCALSTORAGE
// =============================================
const USERS_KEY = 'todo_users';
const TASKS_KEY = 'todo_tasks';
const SESSION_KEY = 'todo_session';
const DARK_KEY = 'todo_dark';

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  // Appliquer le mode sombre sauvegardé
  applyDark(localStorage.getItem(DARK_KEY) === 'true');

  // Session active ?
  const session = getSession();
  if (session) {
    showTodoPage(session);
  }

  // Entrée sur les champs login
  document.getElementById('input-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('input-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // Entrée sur le champ tâche
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAddTask();
  });
});

// =============================================
// LOCALSTORAGE
// =============================================
function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getTasks() { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
function saveTasks(t) { localStorage.setItem(TASKS_KEY, JSON.stringify(t)); }
function getSession() { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }
function saveSession(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

// =============================================
// INSCRIPTION
// =============================================
function handleRegister() {
  const name = document.getElementById('input-name').value.trim();
  const password = document.getElementById('input-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!name) {
    errEl.textContent = 'Veuillez entrer votre nom.';
    return;
  }
  if (!password) {
    errEl.textContent = 'Veuillez entrer un mot de passe.';
    return;
  }

  let users = getUsers();
  let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

  if (user) {
    errEl.textContent = 'Ce nom d\'utilisateur existe déjà. Veuillez vous connecter.';
    return;
  }

  // Création du nouvel utilisateur
  user = { id: Date.now().toString(), name, password };
  users.push(user);
  saveUsers(users);

  // Connexion automatique après inscription
  saveSession(user);
  document.getElementById('input-name').value = '';
  document.getElementById('input-password').value = '';
  showTodoPage(user);
}

// =============================================
// LOGIN
// nom + mot de passe :
//   - utilisateur existant → vérification mdp
// =============================================
function handleLogin() {
  const name = document.getElementById('input-name').value.trim();
  const password = document.getElementById('input-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!name) {
    errEl.textContent = 'Veuillez entrer votre nom.';
    return;
  }
  if (!password) {
    errEl.textContent = 'Veuillez entrer un mot de passe.';
    return;
  }

  let users = getUsers();
  let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

  if (!user) {
    errEl.textContent = 'Utilisateur inexistant. Veuillez vous inscrire.';
    return;
  }

  // Vérification du mot de passe
  if (user.password !== password) {
    errEl.textContent = 'Mot de passe incorrect.';
    return;
  }

  saveSession(user);
  document.getElementById('input-name').value = '';
  document.getElementById('input-password').value = '';
  showTodoPage(user);
}

// =============================================
// SESSION
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
// TACHES
// =============================================
let currentFilter = 'all';

function handleAddTask() {
  const user = getSession();
  const input = document.getElementById('task-input');
  const title = input.value.trim();
  const errEl = document.getElementById('task-error');

  errEl.textContent = '';

  if (!title) {
    errEl.textContent = 'Le titre est obligatoire.';
    return;
  }

  const task = {
    id: Date.now().toString(),
    title,
    done: false,
    owner: user.id,
  };

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  input.value = '';
  input.focus();
  renderTasks();
}

function toggleTask(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].done = !tasks[idx].done;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const item = document.getElementById('task-' + id);
  if (!item) return;

  item.classList.add('removing');
  item.addEventListener('animationend', () => {
    saveTasks(getTasks().filter(t => t.id !== id));
    renderTasks();
  }, { once: true });
}

function renderTasks() {
  const user = getSession();
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-msg');

  let tasks = getTasks().filter(t => t.owner === user.id);

  // Filtre statut
  if (currentFilter === 'done') tasks = tasks.filter(t => t.done);
  if (currentFilter === 'todo') tasks = tasks.filter(t => !t.done);

  // Recherche
  if (search) {
    tasks = tasks.filter(t => {
      const inTitle = t.title.toLowerCase().includes(search);
      const inStatus = (t.done ? 'terminee done' : 'a faire todo').includes(search);
      return inTitle || inStatus;
    });
  }

  // Compteur (sur toutes les tâches de l'utilisateur, pas filtrées)
  const all = getTasks().filter(t => t.owner === user.id);
  const done = all.filter(t => t.done).length;
  document.getElementById('counter').textContent =
    all.length > 0 ? done + ' / ' + all.length + ' terminees' : '';

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

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// =============================================
// MODE SOMBRE — fonctionne sur les deux pages
// =============================================
function applyDark(isDark) {
  document.body.classList.toggle('dark', isDark);
  const label = isDark ? 'Mode clair' : 'Mode sombre';
  const t1 = document.getElementById('dark-toggle-login');
  const t2 = document.getElementById('dark-toggle-app');
  if (t1) t1.textContent = label;
  if (t2) t2.textContent = label;
}

function toggleDark() {
  const isDark = !document.body.classList.contains('dark');
  localStorage.setItem(DARK_KEY, isDark);
  applyDark(isDark);
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