# SLE - Guessle (App Mobile Flutter)

## Présentation

Guessle est une application mobile inspirée du jeu Wordle, développée en Flutter.  
Chaque jour, un nouveau mot et d'autre mode de jeu à deviner !
Les utilisateurs peuvent jouer en mode invité ou se connecter pour sauvegarder leurs statistiques et retrouver leur historique.
L’application communique avec un serveur via une API REST pour synchroniser le mot du jour, les parties et les scores.

---

## Fonctionnalités principales

- Jeu du mot du jour (Wordle-like)
- Jeu deviner perso de lol(Lolidle-like)
- Mode invité (pas besoin de compte)
- Inscription & connexion (sauvegarde des stats)
- Classement des joueurs
- Interface mobile responsive et ergonomique

---

## Prérequis

- **Flutter** (version 3.x recommandée)  
  [Installer Flutter](https://docs.flutter.dev/get-started/install)
- Un serveur backend Guessle opérationnel (voir le dossier /api ou la doc backend)

---

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <URL_DU_DEPOT_GITLAB>
   cd frontend_app_mobile 

Installer les dépendances
   flutter pub get

Le .env est le même que pour le site web

lancé au préalable le server.js en local cf README backend

Sur un émulateur ou un vrai smartphone
   flutter run

Pour générer un APK Android
   flutter build apk (peu testé à cause de moyen limité pas conseillé)

---

##Arborescence

.
├── android/
├── ios/
├── lib/
│   ├── main.dart(page dynamique qui affiche des boutons en fonctions des templates existant)
│   ├── API_fnc.dart (repertoire de toute 
│   ├── floating_bar.dart (élément d'ergonomie)
│   ├── login.dart (pop up de connexion au serveur)
│   ├── menu.dart (page dynamique qui affiche des boutons en fonctions des jeux qui existe dans le template selectionné)
│   ├── page_profil.dart (page dynamique qui permet d'appeler login ou d'afficher le leaderboard)
│   ├── page_jeu.dart (Page dynamique permettant au jeu de template worlde d'être jouer)
│   ├── LolIdle.dart (Page dynamique permettant au jeu de template lolidle d'être jouer)
├── pubspec.yaml
├── README.md
└── .gitignore
 ...

---

##Dépendances principales

flutter

http (pour les requêtes API)

shared_preferences (pour le stockage local)


Auteurs :

LASSAGNE Virgile

CAZACU Ion

Projet réalisé dans le cadre du cours SLE de L3 Informatique à l'UCA.

