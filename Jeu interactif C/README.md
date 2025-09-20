Jeu de survie textuel — Projet C

Ce projet est un jeu textuel en C dans lequel le joueur incarne Rahan, un personnage qui évolue sur une carte dynamique peuplée de monstres, de nourritures, d’objets et d’obstacles. Le jeu repose sur des commandes saisies par l’utilisateur pour déplacer Rahan, explorer la carte et tenter de survivre.

Contenu du projet :

JeuC.c : fichier principal avec la logique du jeu

entites.h, stdprof.h : fichiers en-têtes nécessaires (en cours de récupération)

Structures utilisées : entite, rahan, objet, monstre, nourriture, etc.

Objectifs pédagogiques :

Utilisation de la mémoire dynamique (malloc, free)

Gestion de structures imbriquées

Traitement de commandes utilisateur (mode interactif ou fichier)

Mise en place d’un système de sauvegarde et restauration avec mémoire statique

Affichage dynamique d’une carte avec coordonnées étendues

Compilation :
Compiler avec gcc ou un autre compilateur C compatible POSIX :
gcc -o jeu JeuC.c -Wall

Exécution :

Mode interactif : ./jeu

Avec un fichier de commandes : ./jeu commandes.txt

```bash
gcc -o jeu JeuC.c -Wall


 Lancer une partie en mode interactif :
bash
./jeu

Lancer une partie avec un fichier de commandes :
bash
./jeu commandes.txt
