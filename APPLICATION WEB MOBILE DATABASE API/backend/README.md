========================================================
                GUESSLE – BACKEND (Node.js/Express)
========================================================

Backend Node.js/Express pour l’application Guessle.
Ce backend gère toute l’API, la logique métier, la base MySQL, le cache Redis, l’authentification JWT et les parties du jeu.

--------------------------------------------------------
SOMMAIRE

1. Fonctionnalités principales
2. Structure des fichiers
3. Prérequis et installation
4. Configuration de l’environnement
5. Démarrage
6. Tests automatisés
7. Routes API principales
8. Technologies utilisées
9. Notes importantes et sécurité

--------------------------------------------------------
1. Fonctionnalités principales

- Authentification JWT et gestion sécurisée des utilisateurs
- Création et gestion des comptes joueurs
- Création et personnalisation des modes de jeu (game types, templates, challenges)
- Système de devinettes et validation des propositions
- Sauvegarde et restauration des parties (parties en cours)
- Classement et leaderboard
- Cron automatique pour reset quotidien (remise à zéro des parties et guesses chaque nuit)
- Connexion centralisée à MySQL et Redis
- API REST sécurisée et compatible CORS

--------------------------------------------------------
2. Structure des fichiers

backend/
  __tests__/        Tests Jest (unitaires et intégration)
  node_modules/
  .env              Variables d'environnement (non versionné)
  env.example       Exemple de configuration .env
  comparator.js     Comparateurs pour les guesses selon le mode de jeu
  db.js             Connexion à MySQL et Redis
  package.json      Dépendances et scripts npm
  server.js         Définition de l'API Express et de toute la logique métier
  start.js          Point d’entrée du backend

--------------------------------------------------------
3. Prérequis et installation

- Node.js (version 18 ou supérieure recommandée)
- npm
- MySQL (version 8 ou compatible)
- Redis (version 6 ou supérieure recommandée)

Installation des dépendances :

cd backend
npm install

--------------------------------------------------------
4. Configuration de l’environnement

Copie le fichier env.example en .env et remplis les valeurs en fonction de ta configuration locale :

En production, choisis une clé JWT et un mot de passe fort !

--------------------------------------------------------
5. Démarrage

Lance MySQL et Redis sur ta machine.
Pour démarrer le serveur backend :

cd backend
npm start
# npm start créera directement 2 entrées dans la table template qui sont obligatoires pour faire tourner l'App Web
# bien setup la database MySql d'abord donc

Le serveur démarre par défaut sur le port 5000 (modifiable via .env ou process.env.PORT).

En production, ajoute NODE_ENV=production dans ton .env, et utilise un gestionnaire comme PM2, Docker, etc.

--------------------------------------------------------
6. Tests automatisés

Tous les tests se trouvent dans backend/__tests__/.
Pour lancer la suite de tests :

cd backend
npm test

Les tests utilisent une base de test MySQL et attendent que Redis soit actif.
Les tests couvrent l’authentification, la gestion des parties, la création de modes, la gestion des devinettes, etc.

--------------------------------------------------------
7. Routes API principales

Exemples d’endpoints exposés par l’API :

POST   /signup                          Créer un nouvel utilisateur
POST   /login                           Se connecter (retourne un JWT)
POST   /logout                          Déconnexion (clear cookie)
GET    /auth                            Vérifie l’authentification JWT
GET    /users/:username                 Infos utilisateur (auth requis)
PUT    /users/:username                 Met à jour les stats utilisateur (auth requis)
GET    /leaderboard                     Top joueurs (classement)
GET    /challenge/:gameTypeId           Obtenir le challenge du jour
POST   /guess/:gameTypeId/:username     Faire une devinette (auth requis)
POST   /guess/:gameTypeId               Devinette en mode invité
GET    /restore/:gameTypeId/:username   Récupérer l’historique d’une partie (auth requis)
POST   /create_game_type/:templateId/:username   Créer un mode personnalisé (auth requis)
GET    /game_types                      Liste des modes disponibles
GET    /templates                       Liste de tous les templates de jeu
GET    /challenges/:gameTypeId          Liste des challenges d’un mode
POST   /add_challenges/:gameTypeId      Ajouter des challenges à un mode (auth requis)

Voir le fichier server.js pour la liste complète et les paramètres requis.

Toutes les routes protégées nécessitent un JWT valide (cookie ou header Authorization).

--------------------------------------------------------
8. Technologies utilisées

- Express.js : Serveur et routes REST
- MySQL2     : Accès base de données avec support Promise
- Redis      : Stockage temporaire, cache, daily challenge
- jsonwebtoken : Authentification JWT stateless
- bcryptjs      : Hash des mots de passe utilisateurs
- multer        : Upload multipart (gestion fichiers/images)
- cookie-parser : Gestion cookies httpOnly sécurisés
- node-cron     : Cron pour reset automatique chaque nuit
- dotenv        : Chargement des variables d’environnement

--------------------------------------------------------
9. Notes importantes et sécurité

- Ne versionne jamais le fichier .env contenant tes vrais secrets.
- Utilise des clés JWT longues et imprévisibles en production.
- Mets le flag secure:true sur les cookies httpOnly en prod (HTTPS obligatoire).
- Les logs MySQL/Redis sont utiles au debug, mais doivent être limités ou désactivés en prod.
- Adapte les tâches CRON à ton usage réel (en prod : ne pas reset les parties si tu veux garder l’historique !).
- Gère la politique CORS si le frontend change d’URL ou passe en production.

========================================================
                   FIN DU README BACKEND
========================================================
