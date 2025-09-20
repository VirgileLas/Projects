========================================================
         GUESSLE – README DE LA BASE DE DONNÉES
========================================================

Ce fichier décrit la structure de la base de données MySQL utilisée pour le projet Guessle.
Il présente chaque table, ses champs principaux, ses relations et la logique derrière la conception.

--------------------------------------------------------
SOMMAIRE

1. Introduction
2. Schéma global et logique de la base
3. Description des tables
   - users
   - templates
   - game_types
   - challenges
   - games
   - guesses
4. Contraintes et relations (clés étrangères)

--------------------------------------------------------
1. Introduction

La base de données Guessle stocke toutes les informations liées aux utilisateurs, modes de jeu, parties, scores, templates et devinettes.
Elle est conçue pour permettre :
- la gestion sécurisée des comptes,
- la personnalisation avancée des modes de jeu,
- le suivi et la sauvegarde des parties,
- un classement des joueurs,
- une extensibilité pour de futurs jeux ou templates.

--------------------------------------------------------
2. Schéma global et logique

Principales entités :
- Utilisateurs (users)
- Templates génériques de modes de jeu (templates)
- Modes de jeu personnalisés (game_types)
- Challenges associés à chaque mode (challenges)
- Parties individuelles jouées (games)
- Essais/propositions dans une partie (guesses)

Les relations assurent l’intégrité et facilitent les requêtes complexes (classements, historique, etc).

--------------------------------------------------------
3. Description des tables

a) users
---------------------------------
Contient les données d’authentification et de statistiques des joueurs.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- username (VARCHAR, unique)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- games_played (INT, défaut 0)
- games_won (INT, défaut 0)
- created_at (DATETIME)

b) templates
---------------------------------
Modèles génériques pour créer de nouveaux modes de jeu.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- name (VARCHAR, unique)
- description (TEXT)
- type (VARCHAR, optionnel)

c) game_types
---------------------------------
Modes de jeu personnalisés ou dérivés d’un template.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- name (VARCHAR, unique)
- template_id (INT, clé étrangère vers templates.id)
- description (TEXT)
- created_by (VARCHAR, clé étrangère vers users.username)
- data_schema (JSON)
- image (MEDIUMBLOB, optionnelle)
- number_of_guesses (INT)
- wordSize (INT)

d) challenges
---------------------------------
Puzzles ou énigmes associées à chaque mode de jeu.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- game_type_id (INT, clé étrangère vers game_types.id)
- data (JSON)
- solution (VARCHAR)

e) games
---------------------------------
Parties jouées par les utilisateurs.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- status (ENUM: 'in_progress', 'won', 'lost')
- challenge_id (INT, clé étrangère vers challenges.id)
- username (VARCHAR, clé étrangère vers users.username)
- game_type_id (INT, clé étrangère vers game_types.id)
- started_at (DATETIME)

f) guesses
---------------------------------
Essais/propositions dans une partie.

Champs principaux :
- id (INT, auto_increment, clé primaire)
- game_id (INT, clé étrangère vers games.id)
- guess (VARCHAR)
- guess_number (INT)

--------------------------------------------------------
4. Contraintes et relations (clés étrangères)

- game_types.template_id     REFERENCES templates(id)
- game_types.created_by      REFERENCES users(username)
- challenges.game_type_id    REFERENCES game_types(id)
- games.challenge_id         REFERENCES challenges(id)
- games.username            REFERENCES users(username)
- games.game_type_id         REFERENCES game_types(id)
- guesses.game_id            REFERENCES games(id)



========================================================
            FIN DU README BASE DE DONNÉES
========================================================
