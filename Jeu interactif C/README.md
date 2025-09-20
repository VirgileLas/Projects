# 🗺️ Jeu de survie textuel — Projet C

Ce projet est un jeu textuel en C dans lequel vous incarnez **Rahan**, un personnage évoluant sur une carte dynamique peuplée de monstres, de nourritures, d’objets et d’obstacles. L’univers est basé sur des commandes que vous entrez pour déplacer Rahan, explorer la carte, et survivre dans ce monde en expansion.

## 📁 Contenu

- `JeuC.c` : fichier principal contenant la logique du jeu.
- `entites.h`, `stdprof.h` : en-têtes (headers) nécessaires au bon fonctionnement du jeu (non fournis ici, en cours de récupération).
- Structures utilisées :
  - `entite`, `rahan`, `objet`, `monstre`, `nourriture`, etc.

## 🧠 Objectifs pédagogiques

- Manipulation de la mémoire dynamique (`malloc`, `free`)
- Gestion de structures imbriquées
- Traitement de commandes utilisateur (mode interactif ou fichier)
- Système de sauvegarde/restauration via mémoire statique
- Affichage dynamique d’une carte à coordonnées étendues

## ⚙️ Compilation

Compile avec GCC (ou autre compilateur C compatible POSIX) :

```bash
gcc -o jeu JeuC.c -Wall


 Lancer une partie en mode interactif :
bash
./jeu

Lancer une partie avec un fichier de commandes :
bash
./jeu commandes.txt