========================================================
           GUESSLE – DOCUMENTATION COMPLETE
========================================================

Guessle est une application fullstack de jeu de devinettes, composée d’un backend Node.js (Express, MySQL, Redis) et d’un frontend React (Vite), Flutter .
Ce document décrit en détail l’architecture, l’installation, la configuration, l’utilisation, la documentation API, la base de données, la gestion des tests, et fournit des conseils de contribution.

--------------------------------------------------------
SOMMAIRE

1. Présentation du projet
2. Architecture générale
3. Structure du dépôt
4. Installation et configuration
   - Backend (API)
   - Frontend (Web)
5. Démarrage de l’application
6. Utilisation côté utilisateur
7. Configuration avancée
8. Documentation technique de l’API
9. Schéma de la base de données
10. Gestion des tests
11. Auteurs

--------------------------------------------------------
1. Présentation du projet

Guessle est un jeu de devinettes multijoueur, inspiré de Wordle, qui propose :
- Plusieurs modes de jeu (Wordle et variantes)
- Un système de comptes, d’authentification et de sessions
- Un classement des joueurs (leaderboard)
- Une expérience multi-plateforme : web (React), mobile (Flutter possible)
- Une API RESTful pour piloter toutes les fonctionnalités

--------------------------------------------------------
2. Architecture générale

- Backend Node.js, express.js : Fournit les routes API REST, gère la logique métier, la base MySQL et le cache Redis.
- Frontend React (Vite) : Application web interactive pour jouer, s’inscrire, gérer ses parties.
- Base de données MySQL : Stocke utilisateurs, jeux, scores, templates, challenges, etc.
- Redis : Gère les sessions, le cache, et accélère les vérifications de tokens.
- Frontend Flutter pour App Mobile : Application mobile (Android/iOS) connectée à l’API, permettant de retrouver toutes les fonctionnalités principales.


Schéma d’architecture :

Utilisateurs --> Frontend React/Flutter --> API Node.js (Express) --> MySQL
                                       |
                                       +--> Redis

--------------------------------------------------------
3. Structure du dépôt

.
├── backend
│   ├── __tests__ 
│   │   └── ...           (Tests Jest)
│   ├── documentationAPI.txt  (Documentation sommére de l'API)
│   ├── env.example       (Contient l'exemple du fichier .env qu'il faut créer avec les détails du serveur MySQL et Redis (mot de passes etc.))
│   ├── comparator.js     (Comparateurs servant à l'API)
│   ├── db.js             (Centralise et gère l’accès à MySQL et Redis pour le backend)
│   ├── server.js         (Définit l’app Express et les instructions de l'API)
│   ├── start.js          (Point d’entrée de l’API)
│   ├── README.txt        (Fichier ReadMe contenant plus d'explications sur l'API)
│   └── ...               
├── database
│   └── README.txt        (Fichier ReadMe expliquant la structure de la base de données)
├── frontend
│   ├── public             
│   │   └── ...           (Images et autres fichiers pour l'app web)
│   ├── src               
│   │   ├── assets        
│   │   │   └── ...       (Images et autres fichiers pour l'app web)
│   │   ├── components      
│   │   │   └── ...       (Composants React pour les pages de l'app web)
│   │   └── pages
│   │       └── ...       (Pages React de l'app web)
│   ├── README.txt        (Fichier ReadMe contenant plus d'explications sur l'app web)
│   └── ...
├── frontend_mobile_app
│   ├── README.txt        (Fichier ReadMe contenant plus d'explications sur l'app mobile)    
│   └── ...               (Fichiers pour l'app mobile)
├── README.txt            (Ce fichier, contient une documentation générale)
└── ...

Chaque dossier contient un package.json avec ses propres dépendances et scripts NPM.

--------------------------------------------------------
4. Installation et configuration

4.1. Prérequis
- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.x (ou compatible)
- Redis >= 7.x

4.2. Backend (API)

cd backend
npm install
cp env.example .env
# Adapter les variables d’environnement dans .env selon ta config locale
npm start

.env.example à copier/renommer en .env. Les variables à renseigner :
    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
    - REDIS_URL, REDIS_PASSWORD
    - JWT_SECRET_KEY

4.3. Frontend (Web)

cd frontend
npm install
npm run dev

Par défaut, l’application se lance sur http://localhost:5173

Pour connecter à un backend distant, adapte les appels d’API (ex : via un fichier config, variable d’environnement ou proxy Vite)

--------------------------------------------------------
5. Démarrage de l’application Web 

5.1. Créer la base de données MySQL selon les règles du fichier README.txt du dossier database
Lancer la base de données MySQL
Assure-toi que ta BDD est lancée et accessible avec les identifiants indiqués dans .env.

5.2. Lancer Redis
Assure-toi que le serveur Redis tourne localement ou sur l’URL configurée.

5.3. Démarrer le backend

cd backend
npm start

Par défaut sur le port 5000 (modifiable via process.env.PORT)

5.4. Démarrer le frontend

cd frontend
npm run dev

5.5. Tester l’accès

- Backend API : http://localhost:5000/
- Frontend Web : http://localhost:5173

--------------------------------------------------------
6. Utilisation côté utilisateur

- Crée un compte ou connecte-toi
- Joue à des parties, consulte le classement, crée tes propres modes
- Le backend gère les scores, la sauvegarde, la validation des devinettes
- Les routes sont sécurisées par JWT, avec stockage possible en cookie (web) ou local storage

--------------------------------------------------------
7. Configuration avancée

- Adapter les ports : Tu peux changer les ports dans .env ou dans les scripts de démarrage
- Déploiement : Prévois des fichiers .env.production, scripts de migration SQL, instructions Docker (optionnel)
- Environnement de dev/test : utilise NODE_ENV pour distinguer prod/dev/test

--------------------------------------------------------
8. Documentation technique de l’API

Principaux endpoints (extrait) :

Méthode | Endpoint                                         | Description
--------|--------------------------------------------------|-------------------------------------------
POST    | /signup                                          | Création d’un compte
POST    | /login                                           | Authentification (JWT en retour)
GET     | /leaderboard                                     | Récupère le classement
POST    | /create_game_type/:templateId/:username          | Crée un nouveau mode de jeu
POST    | /add_challenges/:gameTypeId                      | Ajoute des challenges à un mode
POST    | /guess/:gameTypeId/:username                     | Fait une devinette si on est connecté
GET     | /restore/:gameTypeId/:username                   | Restaure les devinettes précédentes
GET     | /templates                                       | Liste tous les templates
GET     | /challenges/:gameTypeId                          | Liste des challenges pour un mode
GET     | /users/:username                                 | Profil utilisateur
PUT     | /users/:username                                 | Mise à jour des stats user

Voir le code et le README.txt dans le dossier backend pour tous les endpoints.

Exemple de réponse :
{
  "success": true,
  "token": "<JWT>",
  "user": { "username": "testuser", ... }
}

Authentification :
- JWT envoyé via header Authorization (Bearer ...) ou cookie sécurisé

Gestion des erreurs :
- Les erreurs sont retournées avec un code HTTP approprié et un objet { success: false, message: ... }

--------------------------------------------------------
9. Schéma de la base de données
La base de données est sensé reinitialiser les tables games et guesses chaque jour à minuit.

Voir scripts SQL dans le dossier database
Tables principales :
    - users : comptes joueurs
    - templates : modèles de modes de jeu
    - game_types : variantes de jeu
    - challenges : ensembles d’énigmes pour chaque mode
    - games : parties commencées par les joueurs
    - guesses : propositions faites par les joueurs

Clés étrangères : respect des contraintes d’intégrité (ex : challenge lié à game_type, game lié à user)

Exemple minimal (extrait) :

CREATE TABLE users (
  username VARCHAR(32) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ...
);

CREATE TABLE game_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) UNIQUE NOT NULL,
  template_id INT,
  created_by VARCHAR(32),
  ...
);

--------------------------------------------------------
10. Gestion des tests

- Les tests automatisés sont dans backend/__tests__
- Utilise Jest et Supertest
- Lancer tous les tests avec :

cd backend
npm test

- Les tests couvrent l’auth, les parties, la création de modes, la gestion des devinettes, etc.

--------------------------------------------------------
11. Auteurs

- Auteur 1 (Web App et API) : Ion Cazacu
- Auteur 2 (App Mobile et API) : Virgile Lassagne
- Licence Informatique 3
- Projet pour le cours de SLE

--------------------------------------------------------
ANNEXE : To do & améliorations possibles

- Ajout d’un frontend Flutter/mobile complet
- Commenter le code
- Repenser la logique du frontend potentiellement pour le rendre plus propre

========================================================
               FIN DE LA DOCUMENTATION
========================================================

