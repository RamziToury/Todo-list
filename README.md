# Todo List

Application web de gestion de tâches personnelles en JavaScript Vanilla.  
Projet réalisé dans le cadre du cours **Programmation Web 2** — HESTiM, 2A-IIIA, 2025/2026.

---

## Fonctionnalités

**Login**
- L'utilisateur saisit son nom et un mot de passe
- S'il existe déjà : connexion directe avec vérification du mot de passe
- Sinon : création automatique du compte avec le mot de passe saisi

**Tâches (CRUD)**
- Ajouter une tâche
- Afficher la liste des tâches
- Marquer une tâche comme terminée
- Supprimer une tâche (avec animation)

**Recherche & filtres**
- Barre de recherche par titre ou mot-clé
- Filtres : toutes / à faire / terminées

**Session**
- L'utilisateur reste connecté après rechargement
- Bouton de déconnexion disponible

**Interface**
- Compteur de tâches (terminées / total)
- Mode sombre disponible sur la page de login et sur l'application
- Animations à l'ajout et à la suppression

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

Aucune dépendance. Ouvrir `index.html` dans un navigateur.

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
# Ouvrir index.html
```

---

## LocalStorage

| Clé | Contenu |
|---|---|
| `todo_users` | Liste des utilisateurs (nom + mot de passe) |
| `todo_tasks` | Toutes les tâches |
| `todo_session` | Utilisateur actuellement connecté |
| `todo_dark` | Préférence du thème |

---

## Technologies

- HTML5
- CSS3 (variables, transitions, animations)
- JavaScript ES6 (DOM, événements, LocalStorage)
