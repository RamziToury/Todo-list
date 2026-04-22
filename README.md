# Todo List

Application web de gestion de tâches personnelles avec authentification, développée en HTML/CSS/JS vanilla dans le cadre du module **Programmation Web 1** (Filière IIIA — S4).

---

## Fonctionnalités

**Authentification**
- Inscription avec nom, email et mot de passe (validation côté client)
- Connexion avec vérification des identifiants
- Session persistante via LocalStorage
- Déconnexion

**Gestion des tâches**
- Ajout d'une tâche (titre, description, date)
- Modification d'une tâche existante
- Suppression
- Changement de statut (à faire / terminée)
- Les tâches sont liées à l'utilisateur connecté — chaque compte voit uniquement les siennes
- Sauvegarde automatique dans le LocalStorage après chaque action

**Filtres et recherche**
- Filtrage par statut : toutes / à faire / terminées
- Recherche en temps réel par titre, mot-clé ou statut

**Bonus**
- Mode sombre / clair, préférence sauvegardée
- Historique : dernière tâche ajoutée et dernière tâche supprimée
---

## Structure du projet

```
Todolist/
├── index.html   # Structure de la page (auth + app)
├── page.css     # Styles
└── page.js      # Logique JavaScript
```

---

## Lancer le projet

Aucune dépendance, aucun build requis. Il suffit d'ouvrir `index.html` dans un navigateur.

```bash
git clone https://github.com/<votre-username>/<votre-repo>.git
cd <votre-repo>
# Ouvrir index.html dans le navigateur
```

---

## LocalStorage — structure des données

| Clé | Contenu |
|---|---|
| `todoapp_users` | Tableau des comptes enregistrés |
| `todoapp_tasks` | Tableau de toutes les tâches |
| `todoapp_session` | Utilisateur actuellement connecté |
| `todoapp_darkmode` | Préférence du thème (`true` / `false`) |
| `todoapp_history` | Dernière tâche ajoutée / supprimée |

---

## Technologies

- HTML5
- CSS3 (variables CSS, transitions, responsive)
- JavaScript ES6 (DOM, événements, LocalStorage)
- Police : IBM Plex Sans / IBM Plex Mono (Google Fonts)

---

## Auteur

Réalisé dans le cadre du TP4 — *Todo List avancée avec authentification et Local Storage*  
HESTiM — Niveau 2A, Semestre S4
