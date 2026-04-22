# Todo List

Application web de gestion de tâches personnelles en JavaScript Vanilla.  
Projet réalisé dans le cadre du cours **Programmation Web 2** — HESTiM, 2A-IIIA, 2025/2026.

---

## Fonctionnalités

**Login**
- L'utilisateur saisit son nom et clique sur "Se connecter"
- S'il existe déjà : connexion directe
- Sinon : création automatique du compte

**Tâches (CRUD)**
- Ajouter une tâche
- Afficher la liste des tâches
- Marquer une tâche comme terminée
- Supprimer une tâche

**Session**
- L'utilisateur reste connecté après rechargement de la page
- Bouton de déconnexion disponible

**Interface**
- Compteur de tâches (terminées / total)
- Mode sombre, préférence sauvegardée
- Animations à l'ajout et à la suppression des tâches

---

## Structure

```
todo-final-app/
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## Lancer le projet

Aucune dépendance, aucun build. Ouvrir `index.html` dans un navigateur.

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
# Ouvrir index.html
```

---

## LocalStorage

| Clé | Contenu |
|---|---|
| `todo_users` | Liste des utilisateurs enregistrés |
| `todo_tasks` | Toutes les tâches |
| `todo_session` | Utilisateur actuellement connecté |
| `todo_dark` | Préférence du thème |

---

## Technologies

- HTML5
- CSS3 (variables, transitions, animations)
- JavaScript ES6 (DOM, événements, LocalStorage)
