========================================================
                GUESSLE – FRONTEND WEB (React/Vite)
========================================================

Ce frontend est une application web React, basée sur Vite, permettant de jouer à Guessle, s’inscrire, se connecter, consulter le classement, et créer/modifier des modes de jeu.

--------------------------------------------------------
SOMMAIRE

1. Fonctionnalités principales
2. Structure des fichiers
3. Prérequis et installation
4. Démarrage et scripts utiles
5. Configuration de l’API

--------------------------------------------------------
1. Fonctionnalités principales

- Authentification et inscription des utilisateurs
- Affichage et gestion du tableau de jeu (plusieurs types/modes)
- Classement (leaderboard) des meilleurs joueurs
- Création de modes de jeu personnalisés (TemplateCreationForm)
- Navigation protégée (ProtectedRoute)
- Affichage des parties en cours, historique, statistiques
- Interface responsive pour une utilisation desktop/mobile

--------------------------------------------------------
2. Structure des fichiers

frontend/
  public/              Fichiers statiques (images, favicons, etc.)
  src/
    assets/            Images, logos, SVG
    components/        Composants réutilisables UI et logique :
      API.js                 Fonctions pour accéder à l’API backend
      BottomNav.jsx          Navigation menu bas de page
      GameBoardType1.jsx     Plateau de jeu template 1
      GameBoardType2.jsx     Plateau de jeu template 2
      Login.jsx              Formulaire de connexion
      Signup.jsx             Formulaire d’inscription
      TemplateCreationForm.jsx  Création de mode de jeu selon un template
      ProtectedRoute.jsx     Protection des routes privées (auth)
      ...                    Styles associés (components.css, etc.)
    pages/             Pages de l’application :
      AuthPage.jsx           Page d’authentification centralisée
      CreatorPage.jsx        Page de création de mode de jeu selon un template
      GamePage.jsx           Page d’une partie
      HomePage.jsx           Page d’accueil
      LeaderboardPage.jsx    Classement général
      ProfilePage.jsx        Profil utilisateur
      ...                    Styles associés (pages.css, etc.)
    App.jsx             Point d’entrée principal React (routing)
    AuthContext.jsx     Gestion du contexte d’authentification global
    config.json         Configuration, URLs API, etc.
    main.jsx            Bootstrap de l’app React
    index.css           Style global
  package.json          Dépendances et scripts npm
  README.md             Ce fichier

--------------------------------------------------------
3. Prérequis et installation

- Node.js (version 18 ou supérieure recommandée)
- npm

Installation des dépendances :

cd frontend
npm install

--------------------------------------------------------
4. Démarrage et scripts utiles

- Développement local :
    npm run dev
  Accès sur http://localhost:5173 (par défaut)

- Build production :
    npm run build

- Preview du build (simule la prod en local) :
    npm run preview


--------------------------------------------------------
5. Configuration de l’API

L’URL de l’API backend doit être configurée dans le projet.  
Vérifie le fichier src/config.json ou tout point centralisé des requêtes dans API.js.  
Si le backend tourne sur une autre machine ou un autre port, adapte cette configuration.

Pour le développement, assure-toi que le backend (http://localhost:5000) accepte bien les requêtes CORS depuis le frontend (http://localhost:5173).

========================================================
                FIN DU README FRONTEND WEB
========================================================
