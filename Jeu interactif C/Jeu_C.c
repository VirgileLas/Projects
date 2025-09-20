#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "entites.h"
#include "stdprof.h"
#define N_COLONNES_DEBUT 11
#define N_LIGNES_DEBUT 11
#define NOMBRE_VERS_LETTRE(i) 65+i /* Car A en ASCII est égal à 65 (en supposant que i=0 correspond a A) */
#define LIMITE_CARTE 35

/* Fonction separateur pour rendre plus visible ce qu'affiche le jeu */
void separateurDebut(void) {
	printf("------------------------------------------\n\n");
}
void separateurFin(void) {
	printf("\n------------------------------------------\n");
}

void freeCarte(entite*** carte, int nColonnes, int nLignes) {
	int i; int j;
	if (carte != NULL) {
		for (i = 0; i < nLignes; i++) {
			for (j = 0; j < nColonnes; j++) {
				if (carte[i][j]->constitution != NULL && carte[i][j]->type != TYPE_RAHAN) {
					free(carte[i][j]->constitution);
				}
				free(carte[i][j]);
			}
			free(carte[i]);
		}
		free(carte);
	}
}
void freePointeur(void* pointeur) {
	if (pointeur != NULL) {
		free(pointeur);
	}
}

entite*** creerCarte(int nColonnes, int nLignes, int debutX, int debutY, int *erreur) {
	entite*** carte;
	int i; int j; int k; int l;

	carte = malloc(nLignes * sizeof(entite**));
	if (carte == NULL) {
		printf("Erreur d'allocation memoire pour les lignes de la carte.\n");
		*erreur = 1;
		return NULL;
	}
	for (i = 0; i < nLignes; i++) {
		carte[i] = malloc(nColonnes * sizeof(entite*));
		if (carte[i] == NULL) {
			printf("Erreur d'allocation memoire pour les colonnes de la carte.\n");
			/* Liberer la memoire deja allouee */
			for (j = 0; j < i; j++) {
				free(carte[j]);
			}
			free(carte);
			*erreur = 1;
			return NULL;
		}
		for (j = 0; j < nColonnes; j++) {
			carte[i][j] = malloc(sizeof(entite));
			if (carte[i][j] == NULL) {
				printf("Erreur d'allocation memoire pour les cases de la carte.\n");
				/* Liberer la memoire deja allouee */
				for (l = 0; l < j; l++) {
					free(carte[i][l]);
				}
				for (k = 0; k <= i; k++) {
					free(carte[k]);
				}
				free(carte);
				*erreur = 1;
				return NULL;
			}
			/* On remplit les cases de TYPES_COORDONNEES */
			carte[i][j]->type = TYPE_COORDONNEES;
			carte[i][j]->caractere = ' ';
			carte[i][j]->constitution = NULL;
			carte[i][j]->ligne = i + debutY;
			carte[i][j]->colonne = j + debutX;
		}
	}
	return carte;
}

/* Fonction invocation pour afficher les statistiques de Rahan */
void invocation(rahan Rahan) {
	separateurDebut();
	printf("Voici vos statistiques :\n");
	printf("Sante/Points De Vie : %d/%d\n", Rahan.sante, Rahan.PVMax);
	printf("Force : %d\n", Rahan.force);
	printf("Vitesse : %d\n", Rahan.vitesse);
	separateurFin();
} 

/* Fonction trier pour afficher les objets de Rahan */
void trier(objet *Equipement, int tailleEquipement) {
	int i;
	separateurDebut();
	if (Equipement != NULL) {
		printf("Voici votre equipement actuel :\n\n");
		for (i = 0; i < tailleEquipement; i++) {
			printf("Description de l'equipement : %s\n", Equipement[i].description);
			printf("Classe de l'equipement : %s \n", Equipement[i].classe);
			printf("Cet equipement vous offre un bonus de %d pour la/les %s.\n", Equipement[i].bonus, (Equipement[i].typeBonus == 'V') ? "vitesse" : (Equipement[i].typeBonus == 'F') ? "force" : "points de vie");

		}
	}
	else {
		printf("Vous possedez aucun equipement pour l'instant.\n");
	}
	separateurFin();
}

/* Fonction vision pour afficher la carte*/
void vision(entite ***carte, int premiereColonne, int derniereColonne, int premiereLigne, int derniereLigne, int nColonnes, int nLignes) {
	int i, j;

	separateurDebut();
	/* Affiche les coordonnees des colonnes */
	printf("   ");
	for (i = premiereColonne; i <= derniereColonne; i++) {
		if (i < 0) {
			if (i > -10) {
				printf("%d ", i);
			}
			else {
				printf("-%c ", NOMBRE_VERS_LETTRE(-i - 10));
			}
		}
		else {
			if (i < 10) {
				printf("%d  ", i);
			}
			else {
				printf("%c  ", NOMBRE_VERS_LETTRE(i - 10));
			}
		}
	}
	printf("\n");

	/* Affiche le bord du haut de la carte */
	printf("  +");
	for (i = 0; i < nColonnes; i++) {
		printf("-++");
	}
	printf("\n");

	/* Affiche chaque ligne jusqu'au bord du bas de la carte. Le bord de la gauche et de la droite de la carte et les coordonnees des lignes sont aussi affichés ici. */
	for (i = premiereLigne; i <= derniereLigne; i++) {
		/* Partie pour afficher les coordonnees des lignes et le bord de la gauche de la carte */
		if (i < 0) {
			if (i > -10) {
				printf("%d|", i);
			}
			else {
				printf("-%c|", NOMBRE_VERS_LETTRE(-i - 10));
			}
		}
		else {
			if (i < 10) {
				printf(" %d|", i);
			}
			else {
				printf(" %c|", NOMBRE_VERS_LETTRE(i - 10));
			}
		}
		/* Partie pour afficher chaque case et ensuite le bord de la droite la carte */
		for (j = 0; j < nColonnes - 1; j++) {
			printf("%c  ", carte[i - premiereLigne][j]->caractere);
		}
		printf("%c |\n", carte[i - premiereLigne][j]->caractere);
	}

	/* Affiche le bord du bas de la carte */
	printf("  +");
	for (i = 0; i < nColonnes; i++) {
		printf("-++");
	}
	printf("\n");
	separateurFin();
}

/* Fonction pour changer les coordonnees de Rahan en fonction du choix du mouvement qui renvoie 1 si on ne peut pas avancer ou 0 si on peut */
int bouger(entite ***carte, int premiereColonne, int derniereColonne, int premiereLigne, int derniereLigne, char *commande, int *x, int *y) {
	int tempX, tempY; /* Variables pour stocker les nouvelles coordonnees de Rahan */
	/* On sait deja que la commande est une des 4 commandes de mouvement valides, donc on peut se contenter de verfier la 1ere lettre au lieu d'utiliser strcmp */
	tempX = (commande[0] == 'D') ? *x + 1 : (commande[0] == 'G') ? *x - 1 : *x;
	tempY = (commande[0] == 'B') ? *y + 1 : (commande[0] == 'H') ? *y - 1 : *y;

	/* On verifie que sur les nouvelles coordonnees ne se trouve pas le Demiugre ou un Rocher seulement si on ne sort pas de la carte, car la nouvelle case en dehors de la carte n'existe pas encore */
	if ((tempY >= premiereLigne) && (tempY <= derniereLigne) && (tempX >= premiereColonne) && (tempX <= derniereColonne)) {
		if (carte[tempY - premiereLigne][tempX - premiereColonne]->type == TYPE_ROCHER) {
			printf("Je ne peux pas avancer, le demiugre se trouve devant moi.\n");
			return(1);
		}
		else if (carte[tempY - premiereLigne][tempX - premiereColonne]->type == TYPE_DEMIUGRE) {
			printf("Je ne peux pas avancer, un rocher se trouve devant moi.\n");
			return(1);
		}
	}
	if ((tempY > LIMITE_CARTE) || (tempY < -LIMITE_CARTE) || (tempX > LIMITE_CARTE) || (tempX < -LIMITE_CARTE)) {
		printf("J'ai atteint la limite du monde de ce cote...il n'y a que le vide devant moi.\n");
		return(1);
	}
	/* On met les coordonnees de Rahan aux nouvelles coordonnees */
	*x = tempX;		
	*y = tempY;
	return 0;
}

/* Fonction de comabt entre Rahan et un Monstre qui change directement la sante de Rahan en se servant de l'adresse */
void combat(monstre Monstre, int *santeR, int forceR) {
	printf("Vous vous battez avec le monstre %s.\n", Monstre.nom);
	while (*santeR > 0) {
		Monstre.PVMax -= forceR;
		if (Monstre.PVMax <= 0) {
			break; /* On arrete la boucle si Rahan tue le monstre*/
		}
		*santeR -= Monstre.degats;
	}
	/* On met la sante de Rahan à 0 si elle est descendu dans les négatifs à cause de la derniere attaque du monstre, sinon on la change pas*/
	*santeR = (*santeR <= 0) ? 0 : *santeR;
}

/* Fonction pour manger qui change directement la sante de Rahan en se servant de l'adresse */
void manger(int *santeR, int PVMaxR, nourriture Nourriture) {
	separateurDebut();
	/* Si la sante plus la regeneration depasse le nombre de points de vie, on la met aux points de vie de Rahan, sinon y rajoute seulement la regeneration */
	*santeR = (*santeR + Nourriture.regeneration > PVMaxR) ? PVMaxR : *santeR + Nourriture.regeneration;
	printf("Vous avez mangé %s, %s. Vous avez régénéré %d points de santé.\n", Nourriture.nom, Nourriture.description, Nourriture.regeneration);
	separateurFin();
}

/* Fonction pour décider s'il faut équiper ou non l'objet sur le quel on tombe et qui change le tableau d'equipements s'il faut */
objet* choisirEquipement(objet* Equipement, int* tailleEquipement, objet nouveauObjet, int *erreur) {
	objet* nouveauTabEquipement;  int i;
	nouveauTabEquipement = NULL;
	separateurDebut();
	/* Boucle pour verifier s'il y a deja un objet de la classe du nouveauObjet, et ensuite le quel des 2 a le plus gros bonus */
	for (i = 0; i < *tailleEquipement; i++) {
		if ((strcmp(nouveauObjet.classe, Equipement[i].classe) == 0) && (nouveauObjet.bonus >= Equipement[i].bonus)) {
			Equipement[i] = nouveauObjet;
			printf("Vous avez recupere un nouveau objet et il remplacera un de vos objets courrants car il est plus puissant.\n");
			separateurFin();
			break;
		}
		else if ((strcmp(nouveauObjet.classe, Equipement[i].classe) == 0) && (nouveauObjet.bonus < Equipement[i].bonus)) {
			printf("Vous avez recupere un nouveau objet mais il ne sera pas ajoute a votre equipement, car il est moins puissant que vos objets courrants.\n");
			separateurFin();
			break;
		}
	}
	if (i == *tailleEquipement) {
		printf("Vous avez recupere un nouveau objet qui sera ajoute a votre equipement!\n");
		separateurFin();
		(*tailleEquipement)++;
		nouveauTabEquipement = malloc(*tailleEquipement * sizeof(objet));
		if (nouveauTabEquipement == NULL) {
			printf("Erreur d'allocation memoire pour le tableau d'Equipements.");
			*erreur = 1;
			return(NULL);
		}
		nouveauTabEquipement[*tailleEquipement - 1] = nouveauObjet;
		if (Equipement != NULL) {
			for (i = 0; i < *tailleEquipement - 1; i++) {
				nouveauTabEquipement[i] = Equipement[i];
			}
			free(Equipement);
		}
		return(nouveauTabEquipement);
	}
	return(Equipement);
}

/* Fonction pour changer les stats de Rahan quand il récupére un nouveau objet */
void changerStats(objet *Equipement, int tailleEquipement, rahan *Rahan) {
	int i;
	Rahan->vitesse = 1;
	Rahan->force = 10;
	Rahan->PVMax = 50;
	for (i = 0; i < tailleEquipement; i++) {
		if (Equipement[i].typeBonus == 'V') {
			Rahan->vitesse += Equipement[i].bonus;
		}
		else if (Equipement[i].typeBonus == 'F') {
			Rahan->force += Equipement[i].bonus;
		}
		else if (Equipement[i].typeBonus == 'P') {
			Rahan->PVMax += Equipement[i].bonus;
		}
	}
}

/* Fonction pour calculer l'indice dans la matrice par rapport a la coordonnee choisie par le joueur (marche avec la coordonnee x et y) */
void calculIndice(char* text, int *nombre, int coorRahan, int coorDemiugre, int coordonneePremiereCase) {
	/* On calcule d'abord la coordonnee absolue en fonction du type de coordonnee donnee, si c'est deja une coordonnee absolue, on fait rien */
	/* Si coordonnee par rapport au Demiugre, on calcule la coordonnee absolue */
	/* Si coordonnee par rapport a Rahan, on calcule la coordonnee absolue */
	/* On enleve a la coordonnee absolue la coordonnee (x ou y dependant des cas) de la premiere case de la matrice pour ainsi récuperer l'indice de la case chosie */
	*nombre = (text[0] == 'd') ? coorDemiugre + *nombre : (text[0] == 'D') ? coorRahan + *nombre : *nombre;
	*nombre -= coordonneePremiereCase;
}

/* Fonction pour augmenter la taille de la carte si on sort de la carte, renvoye la nouvelle matrice */
entite ***augmenterCarte(entite ***ancienneCarte, char *commande, entite Rahan, int *nColonnes, int *nLignes, int debutX, int finX, int debutY, int finY, int *erreur){
	entite*** nouvelleCarte; /* La nouvelle carte */
	int tempNombreColonnes; int tempNombreLignes; /* Nombre de lignes et colonnes de la nouvelle carte */
	int diffX; int diffY; /* La difference entre le nombre de colonnes et lignes entre l'ancienne et nouvelle carte, elles seront egales a 0 ou 1 */
	int i; int j;
	/* On modifie une des 4 coordonnees, en fonction de la commande, avec la coordonnee colonne ou ligne de Rahan car il est sorti de la carte */
	if (strcmp(commande, "HAUT") == 0) {
		debutY = Rahan.ligne;
	}
	else if (strcmp(commande, "BAS") == 0) {
		finY = Rahan.ligne;
	}
	else if (strcmp(commande, "GAUCHE") == 0) {
		debutX = Rahan.colonne;
	}
	else if (strcmp(commande, "DROITE") == 0) {
		finX = Rahan.colonne;
	}

	tempNombreLignes = finY - debutY + 1;
	tempNombreColonnes = finX - debutX + 1;

	/* Allocation de la memoire de la nouvelle carte */
	nouvelleCarte = creerCarte(tempNombreColonnes, tempNombreLignes, debutX, debutY, erreur);
	if (*erreur) {
		return NULL;
	}

	/* Difference du nombre de lignes et colonnes entre la nouvelle et l'ancienne carte, egales donc a 1 ou 0 */
	diffY = (-nouvelleCarte[0][0]->ligne) + ancienneCarte[0][0]->ligne;
	diffX = (-nouvelleCarte[0][0]->colonne) + ancienneCarte[0][0]->colonne;

	for (i = 0; i < *nLignes; i++) {
		for (j = 0; j < *nColonnes; j++) {
			if (ancienneCarte[i][j]->constitution != NULL) {
				*(nouvelleCarte[i + diffY][j + diffX]) = *(ancienneCarte[i][j]);
				nouvelleCarte[i + diffY][j + diffX]->constitution = malloc(sizeof(constitution));
				if (nouvelleCarte[i + diffY][j + diffX]->constitution == NULL) {
					printf("Erreur d'allocation memoire pour la constitution d'une case lorsqu'on agrandit la carte.");
					*erreur = 1;
					freeCarte(nouvelleCarte, *nColonnes, *nLignes);
					freeCarte(ancienneCarte, *nColonnes, *nLignes);
					return NULL;
				}
				*(nouvelleCarte[i + diffY][j + diffX]->constitution) = *(ancienneCarte[i][j]->constitution);
			}
			else {
				*(nouvelleCarte[i + diffY][j + diffX]) = *(ancienneCarte[i][j]);
			}
		}
	}
	freeCarte(ancienneCarte, *nColonnes, *nLignes);

	*nLignes = tempNombreLignes;
	*nColonnes = tempNombreColonnes;
	return(nouvelleCarte);
}

entite creerRahan(int *erreur) {
	entite Rahan;
	Rahan.type = TYPE_RAHAN;
	Rahan.caractere = 'R';
	Rahan.colonne = 5;
	Rahan.ligne = 4;
	Rahan.constitution = malloc(sizeof(rahan));
	if (Rahan.constitution == NULL) {
		*erreur = 1;
		printf("malloc n'a pas reussi à allouer de la memoire pour le pointeur constitution de Rahan\n");
	}
	Rahan.constitution->rahan.PVMax = 50;
	Rahan.constitution->rahan.sante = 50;
	Rahan.constitution->rahan.force = 10;
	Rahan.constitution->rahan.vitesse = 1;
	return Rahan;
}
entite creerDemiugre() {
	entite Demiugre;
	Demiugre.type = TYPE_DEMIUGRE;
	Demiugre.caractere = 'Y';
	Demiugre.constitution = NULL;
	Demiugre.ligne = 5;
	Demiugre.colonne = 5;
	return Demiugre;
}


void creerObjet(entite ***carte, int ligne, int colonne, char* commande, int *erreur) {
	int i;
	if (*erreur != 0) {
		return;
	}
	carte[ligne][colonne]->constitution = malloc(sizeof(objet));
	if (carte[ligne][colonne]->constitution == NULL) {
		printf("Erreur d'allocation de la memoire pour la constitution de l'objet.");
		*erreur = 1;
	}
	i = sscanf(commande, "{%[^,], %c+%d, %[^}]}", carte[ligne][colonne]->constitution->objet.description, &(carte[ligne][colonne]->constitution->objet.typeBonus), &(carte[ligne][colonne]->constitution->objet.bonus) , carte[ligne][colonne]->constitution->objet.classe);

	if (i == 4) {
		carte[ligne][colonne]->type = TYPE_OBJET;
		carte[ligne][colonne]->caractere = '!';
		/*debug*/
		printf("Un nouveau objet a été créé : \n");
		printf("Description : %s.\n", carte[ligne][colonne]->constitution->objet.description);
		printf("Stats (la lettre) : %c.\n", carte[ligne][colonne]->constitution->objet.typeBonus);
		printf("Bonus (le numero) : %d.\n", carte[ligne][colonne]->constitution->objet.bonus);
		printf("Classe : %s.\n", carte[ligne][colonne]->constitution->objet.classe);
	}
	else {
		free(carte[ligne][colonne]->constitution);
		printf("La commande pour créer un objet a été mal écrite.");
		*erreur = 33;
	}
}
void creerNourriture(entite*** carte, int ligne, int colonne, char* commande, int *erreur) {
	int i;
	if (*erreur != 0) {
		return;
	}
	carte[ligne][colonne]->constitution = malloc(sizeof(nourriture));
	if (carte[ligne][colonne]->constitution == NULL) {
		printf("Erreur d'allocation de la memoire pour la constitution de la nourriture.");
		*erreur = 1;
	}
	i = sscanf(commande, "(%[^,], %d, %[^)])", carte[ligne][colonne]->constitution->nourriture.nom, &(carte[ligne][colonne]->constitution->nourriture.regeneration), carte[ligne][colonne]->constitution->nourriture.description);

	if (i == 3) {
		carte[ligne][colonne]->type = TYPE_NOURRITURE;
		carte[ligne][colonne]->caractere = '*';
		/*debug*/
		printf("Un nouvelle nourriture a été créé : \n");
		printf("Description : %s\n", carte[ligne][colonne]->constitution->nourriture.description);
		printf("Nom : %s\n", carte[ligne][colonne]->constitution->nourriture.nom);
		printf("Regen (le numero) : %d\n", carte[ligne][colonne]->constitution->nourriture.regeneration);
	}
	else {
		free(carte[ligne][colonne]->constitution);
		printf("La commande pour créer de la nourriture a été mal écrite.");
		*erreur=34;
	}
}
void creerMonstre(entite*** carte, int ligne, int colonne, char* commande, int *erreur) {
	int i;
	if (*erreur != 0) {
		return;
	}
	carte[ligne][colonne]->constitution = malloc(sizeof(monstre));
	if (carte[ligne][colonne]->constitution == NULL) {
		printf("Erreur d'allocation de la memoire pour la constitution du monstre.");
		*erreur = 1;
	}
	i = sscanf(commande, "<%[^,], %d, %d>", carte[ligne][colonne]->constitution->monstre.nom, &(carte[ligne][colonne]->constitution->monstre.degats), &(carte[ligne][colonne]->constitution->monstre.PVMax));
	if (i == 3) {
		carte[ligne][colonne]->type = TYPE_MONSTRE;
		carte[ligne][colonne]->caractere = '@';
		/*debug*/
		printf("Un nouveau monstre a été créé : \n");
		printf("Nom : %s\n", carte[ligne][colonne]->constitution->monstre.nom);
		printf("Degats : %d\n", carte[ligne][colonne]->constitution->monstre.degats);
		printf("PVMax : %d\n", carte[ligne][colonne]->constitution->monstre.PVMax);
	}
	else {
		free(carte[ligne][colonne]->constitution);
		printf("La commande pour créer un monstre a été mal écrite.");
		*erreur=35;
	}
}
void creerRocher(entite ***carte, int ligne, int colonne, int *erreur) {
	if (*erreur != 0) {
		return;
	}
	carte[ligne][colonne]->type = TYPE_ROCHER;
	carte[ligne][colonne]->caractere = '#';
	carte[ligne][colonne]->constitution = NULL;
}

void verificationCase(entite*** carte, int ligne, int colonne, int *erreur) {
	if ((ligne == -1) || (colonne == -1)) {
		printf("Vous n'avez pas choisi une ou deux coordonnees avant de creer quelquechose.\n");
		*erreur = 31;
		return;
	}
	if (carte[ligne][colonne]->type != TYPE_COORDONNEES) {
		printf("Vous essayez de créer quelquechose sur une case occupée!\n");
		*erreur=32;
		return;
	}
}
void viderCase(entite*** carte, int ligne, int colonne) {
	if (carte[ligne][colonne]->constitution != NULL && carte[ligne][colonne]->type != TYPE_RAHAN) {
		free(carte[ligne][colonne]->constitution);
	}
	carte[ligne][colonne]->type = TYPE_COORDONNEES;
	carte[ligne][colonne]->caractere = ' ';
	carte[ligne][colonne]->constitution = NULL;
}

void scanner(char* commande, int *erreur) {
	int test;
	test = scanf("%100[^\n]", commande);
	printf("Entrez une commande : ");
	if (getchar() != '\n') {
		printf("Vous avez depasse la taille de 100 caracteres pour la commande.\n");
		*erreur=2;
	}
	if (test <= 0) {
		printf("Erreur de lecture du scanner...\n");
		*erreur=3;
	}
	printf("\n");
}

int verifTypePartie(int argc, char* argv[], int *erreur) {
	FILE* fichier;
	if (argc > 2) {
		printf("Vous avez donné trop d'arguments lors du lancement du programme.");
		*erreur = 21;
		return -1;
	}
	else if (argc == 1) {
		if (isatty(0)) {
			return 0;
		}
		else {
			return 1;
		}
	}
	else {
		fichier = fopen(argv[1], "r");
		if (fichier == NULL) {
			printf("Le fichier passé en argument n'existe pas.");
			*erreur = 22;
			return -1;
		}
		else {
			fclose(fichier);
			return 3;
		}
	}
}

char* fichierVersString(char* argv[], int *erreur) {
	FILE* fichier; char ligne[LIMITE]; int i; int j; char* fichierString; int nLignes;
	nLignes = 0;
	fichier = fopen(argv[1], "r");
	while (fgets(ligne, LIMITE, fichier) != NULL) {
		for (i = 0; i < LIMITE; i++) {
			if (ligne[i] == '\n') {
				break;
			}
		}
		if (i == LIMITE - 1) {
			printf("Une ligne de votre fichier dépasse la LIMITE de caracteres...");
			*erreur = 23;
			return NULL;
		}
		nLignes++;
	}
	fclose(fichier);
	fichierString = malloc(nLignes * LIMITE * sizeof(char));
	fichier = fopen(argv[1], "r");
	j = 0;
	while (fgets(ligne, LIMITE, fichier) != NULL) {
		if (ligne[0] != '\n') {
			i = 0;
			while (ligne[i] != '#' && ligne[i] != '\n' && ligne[i] != EOF) {
				fichierString[j] = ligne[i];
				i++; j++;
			}
			fichierString[j] = '\n';
			j++;
		}
	}
	fichierString[j - 1] = '\0';
	fclose(fichier);
	return fichierString;
}

void enleverEspacesFin(char* text) {
	int i;
	i = 0;
	while (text[i] != '\0') {
		i++;
	}
	i--;
	while (text[i] == ' ') {
		i--;
	}
	text[i + 1] = '\0';
}

void recupCommande(char *fichierString, int *indice, char *commande) {
	int i;
	i = 0;
	while (fichierString[*indice] != '\n' && fichierString[*indice] != '\0') {
		commande[i] = fichierString[*indice];
		i++;
		(*indice)++;
	}
	commande[i] = '\0';
}


entite *** sauvegarderEtRestaurer(char *commande, entite ***carte, int *nLignes, int *nColonnes, entite *Rahan, objet *Equipement, int *tailleE, int *ligne, int *colonne, int *erreur) {
	static entite ***svCarte;
	static int svNLignes;
	static int svNColonnes;
	static entite svRahan;
	static objet *svEquipement;
	static int svTailleE;
	static int svLigne;
	static int svColonne;

	int i; int j;
	if (strcmp(commande, "SAUVEGARDER") == 0) {
		svRahan.type = TYPE_RAHAN;
		svRahan.caractere = 'R';
		svRahan.ligne = Rahan->ligne;
		svRahan.colonne = Rahan->colonne;
		svRahan.constitution = malloc(sizeof(rahan));
		if (svRahan.constitution == NULL) {
			printf("Erreur d'allocation memoire pour la constitution de la sauvegarde de Rahan.\n");
			*erreur = 1;
			return NULL;
		}
		svRahan.constitution->rahan = Rahan->constitution->rahan;

		svLigne = *ligne;
		svColonne = *colonne;
		svTailleE = *tailleE;
		svEquipement = NULL;
		if (Equipement != NULL) {
			svEquipement = malloc(svTailleE * sizeof(objet));
			if (svEquipement == NULL) {
				printf("Erreur d'allocation memoire pour la sauvegarde de l'equipement.\n");
				*erreur = 1;
				return NULL;
			}
			for (i = 0; i < svTailleE; i++) {
				svEquipement[i] = Equipement[i];
			}
		}
		svNColonnes = *nColonnes;
		svNLignes = *nLignes;
		svCarte = creerCarte(svNColonnes, svNLignes, carte[0][0]->colonne, carte[0][0]->ligne, erreur);
		if (*erreur) {
			return NULL;
		}
		for (i = 0; i < *nLignes; i++) {
			for (j = 0; j < *nColonnes; j++) {
				if ((carte[i][j]->constitution != NULL) && (carte[i][j]->type != TYPE_RAHAN)) {
					svCarte[i][j]->constitution = malloc(sizeof(*(carte[i][j]->constitution)));
					if (svCarte[i][j]->constitution == NULL) {
						printf("Erreur d'allocation memoire pour la constitution d'une case pour la sauvegarde de la carte.\n");
						*erreur = 1;
						return NULL;
					}
					*(svCarte[i][j]->constitution) = *(carte[i][j]->constitution);
				}
				else {
					svCarte[i][j]->constitution = NULL;
				}
				svCarte[i][j]->type = carte[i][j]->type;
				svCarte[i][j]->caractere = carte[i][j]->caractere;
				svCarte[i][j]->colonne = carte[i][j]->colonne;
				svCarte[i][j]->ligne = carte[i][j]->ligne;
			}
		}
		return NULL;
		/* La sauvegarde sera videe a la fin du programme */
	}
	else if ((strcmp(commande, "RESTAURER") == 0) && svCarte != NULL) {
		Rahan->ligne = svRahan.ligne;
		Rahan->colonne = svRahan.colonne;
		Rahan->constitution->rahan = svRahan.constitution->rahan;
		*ligne = svLigne;
		*colonne = svColonne;
		*tailleE = svTailleE;
		if (Equipement != NULL) {
			free(Equipement);
			Equipement = malloc(svTailleE * sizeof(objet));
			if (Equipement = NULL) {
				printf("Erreur d'allocation memoire pour la restauration du tableau d'equipements.");
				*erreur = 1;
				return NULL;
			}
			for (i = 0; i < svTailleE; i++) {
				Equipement[i] = svEquipement[i];
			}
		}
		freeCarte(carte, *nColonnes, *nLignes);
		*nColonnes = svNColonnes;
		*nLignes = svNLignes;

		carte = creerCarte(*nColonnes, *nLignes, svCarte[0][0]->colonne, svCarte[0][0]->ligne, erreur);
		if (carte == NULL) {
			printf("Erreur d'allocation memoire pour la restauration de la carte.");
			*erreur = 1;
			return NULL;
		}
		for (i = 0; i < *nLignes; i++) {
			for (j = 0; j < *nColonnes; j++) {
				if (svCarte[i][j]->constitution != NULL) {
					carte[i][j]->constitution = malloc(sizeof(*(carte[i][j]->constitution)));
					if (carte[i][j]->constitution == NULL) {
						printf("Erreur d'allocation memoire pour la constitution d'une case pour la restauration de la carte.\n");
						*erreur = 1;
						return NULL;
					}
					*(carte[i][j]->constitution) = *(svCarte[i][j]->constitution);
				}
				else {
					carte[i][j]->constitution = NULL;
				}
				carte[i][j]->type = svCarte[i][j]->type;
				carte[i][j]->caractere = svCarte[i][j]->caractere;
				carte[i][j]->colonne = svCarte[i][j]->colonne;
				carte[i][j]->ligne = svCarte[i][j]->ligne;
			}
		}
		return carte;
	}
	else if (strcmp(commande, "FREE") == 0) {
		freeCarte(svCarte, svNColonnes, svNLignes);
		freePointeur(svEquipement);
		freePointeur(svRahan.constitution);
		return NULL;
	}
	else {
		printf("Vous n'avez pas lancé une sauvegarde avant de restaurer...");
		*erreur=26;
		return NULL;
	}
}

void verifAubeCrepuscule(char* argv[], char* fichierString, int* typePartie, int* erreur) {
	int indiceCommande; char commande[LIMITE];
	indiceCommande = 0;
	recupCommande(fichierString, &indiceCommande, commande);
	enleverEspacesFin(commande);
	if (strcmp(commande, "AUBE") == 0) {
		*typePartie = 3;
	}
	else if (strcmp(commande, "A") == 0) {
		*typePartie = 4;
	}
	else {
		printf("La premiere commande du fichier n'est pas AUBE ou A...");
		*erreur = 24;
		return;
	}
	while (fichierString[indiceCommande] != '\0') {
		indiceCommande++;
		recupCommande(fichierString, &indiceCommande, commande);
	}
	enleverEspacesFin(commande);
	if ((*typePartie == 3) && (*erreur == 0)) {
		if (strcmp(commande, "CREPUSCULE") != 0) {
			printf("La derniere commande du fichier n'est pas CREPUSCULE...");
			*erreur = 25;
		}
	}
	else if ((*typePartie == 4) && (*erreur == 0)) {
		if (strcmp(commande, "C") != 0) {
			printf("La derniere commande du fichier n'est pas C...");
			*erreur = 25;
		}
	}
}

void pipeVersCommande(int *erreur, char *commande) {
	char c; int i;
	i = 0;
	while ((c = getchar()) != '\n' && c != EOF && c != '#') {
		if (i > LIMITE) {
			printf("Depassement de la taille LIMITE pour la commande entree.");
			*erreur = 2;
			return;
		}
		commande[i] = c;
		i++;
	}
	commande[i] = '\0';
	if (c == '#') {
		while ((c = getchar()) != '\n');
	}
}

int main(int argc, char* argv[]) {
	entite*** carte; entite Rahan; entite Demiugre; /* Creation carte + Rahan + Demiugre */
	int nLignes, nColonnes; /* Taille de la matrice */
	int premiereLigne, premiereColonne, derniereLigne, derniereColonne; /*Coordonnees de la toute premiere case et celles de la toute derniere pour s'y retrouver plus facilement */
	int indiceLigneRahan, indiceColonneRahan;  /* Indices de Rahan dans la matrice */

	objet* tabEquipement; int tailleE; /* Liste Equipement avec sa taille */
	
	char* fichierString; /* Chaine de caracteres pour sauvegarder le fichier donné en argument sans les commentaires */
	int indiceCommande; /* Indice permettant à savoir à quelle commande de fichierString on est */
	int typePartie; /* Pour stocker 1 (lancement avec un fichier en argument) ou 0 (lancement en partie normale) */
	FILE* fichier; /* Pour ouvrir le fichier (s'il y en a un) */

	char commande[LIMITE]; /* Variable pour stocker la commande */
	int tailleCommande; /* Taille de la variable commande */

	int n; /* Variable qui sera utilisée pour vérifier si certaines commandes sont bien écrites en partie normale */
	int ligne, colonne; /* Pour stocker les indices par rapport aux coordonnees données pour la création de quelquechose */
	int vitesse; /* Variable pour sotcker la vitesse de Rahan */

	int i; /* Variables d'itération */

	int erreur;

	erreur = 0;
	nLignes = N_LIGNES_DEBUT; nColonnes = N_COLONNES_DEBUT;
	carte = creerCarte(nColonnes, nLignes, 0, 0, &erreur); Rahan = creerRahan(&erreur); Demiugre = creerDemiugre();
	premiereLigne = carte[0][0]->ligne; premiereColonne = carte[0][0]->colonne;
	derniereLigne = carte[nLignes-1][nColonnes-1]->ligne; derniereColonne = carte[nLignes-1][nColonnes-1]->colonne;
	indiceLigneRahan = Rahan.ligne; indiceColonneRahan = Rahan.colonne;

	*(carte[Rahan.ligne][Rahan.colonne]) = Rahan;
	*(carte[Demiugre.ligne][Demiugre.colonne]) = Demiugre;

	tabEquipement = NULL; tailleE = 0;

	fichierString = NULL;
	indiceCommande = 0;
	typePartie = verifTypePartie(argc, argv, &erreur);
	fichier = NULL;

	tailleCommande = 0;

	ligne = -1; colonne = -1; /* Initialisation à -1 pour savoir si le joueur a donné des coordonnees avant de creer qqchose, car des indices vont jamais être négatifs */
	
	if (typePartie == 3) {
		fichierString = fichierVersString(argv, &erreur);
		verifAubeCrepuscule(argv, fichierString, &typePartie, &erreur);
		recupCommande(fichierString, &indiceCommande, commande); /* Pour eviter de recuperer la commande AUBE */
	}
	else if (typePartie == 1) {
		pipeVersCommande(&erreur, commande);
		enleverEspacesFin(commande);
		if (strcmp(commande, "AUBE") == 0) {
			typePartie = 1;
		}
		else if (strcmp(commande, "A") == 0) {
			typePartie = 2;
		}
		else {
			printf("La premiere commande du fichier n'est pas AUBE ou A.");
			erreur = 24;
		}
	}
	


	/*Boucle principale du jeu*/
	while ((Rahan.constitution->rahan.sante > 0) && (erreur == 0) && (typePartie == 0 || typePartie == 1 || typePartie == 3)) {
		if (typePartie == 3) {
			indiceCommande++; 
			recupCommande(fichierString, &indiceCommande, commande);
			enleverEspacesFin(commande);
			printf("Commande entree : %s\n", commande);
		}
		else if (typePartie == 1) {
			pipeVersCommande(&erreur,commande);
			while (commande[0] == '\0') {
				pipeVersCommande(&erreur, commande);
			}
			if (erreur != 0) {
				break;
			}
			enleverEspacesFin(commande);
			printf("Commande entree : %s\n",commande);
		}
		else {
			scanner(commande, &erreur);
		}
		tailleCommande = strlen(commande);

		if (strcmp(commande, "INVOCATION") == 0) {
			invocation(Rahan.constitution->rahan);
		}
		else if (strcmp(commande, "VISION") == 0) {
			vision(carte, premiereColonne, derniereColonne, premiereLigne, derniereLigne, nColonnes, nLignes);
		}
		else if (strcmp(commande, "TRIER") == 0) {
			trier(tabEquipement, tailleE);
		}
		else if (strcmp(commande, "SAUVEGARDER") == 0) {
			sauvegarderEtRestaurer("FREE", NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
			/* On peut ignorer ce que la fonction renvoie car elle renvoyera NULL en cas d'echec comme en cas de reussite de la sauvegarde */
			sauvegarderEtRestaurer(commande, carte, &nLignes, &nColonnes, &Rahan, tabEquipement, &tailleE, &ligne, &colonne, &erreur);
		}
		else if (strcmp(commande, "RESTAURER") == 0) {
			carte = sauvegarderEtRestaurer(commande, carte, &nLignes, &nColonnes, &Rahan, tabEquipement, &tailleE, &ligne, &colonne, &erreur);
			if (carte != NULL) {
				premiereColonne = carte[0][0]->colonne; premiereLigne = carte[0][0]->ligne;
				derniereColonne = carte[nLignes - 1][nColonnes - 1]->colonne; derniereLigne = carte[nLignes - 1][nColonnes - 1]->ligne;
				indiceColonneRahan = Rahan.colonne - premiereColonne;
				indiceLigneRahan = Rahan.ligne - premiereLigne;
			}
		}
		
		else if (sscanf(commande, "X=%d%n",&colonne,&n) || sscanf(commande, "dX=%d%n",&colonne,&n) || sscanf(commande, "DX=%d%n",&colonne,&n)) {
			if (commande[n] != '\0') {
				printf("Vous avez mal ecrit la commande pour choisir la coordonnee X.");
				erreur = 27;
			}
			calculIndice(commande, &colonne, Rahan.colonne, Demiugre.colonne, premiereColonne);
			if (colonne >= nColonnes || colonne < 0) {
				printf("La coordonnée X choisie vous fait sortir de la carte.\n");
				erreur = 28;
			}
		}
		else if (sscanf(commande, "Y=%d%n",&ligne,&n) || sscanf(commande, "dY=%d%n",&ligne,&n) || sscanf(commande, "DY=%d%n",&ligne,&n)) {
			if (commande[n] != '\0') {
				printf("Vous avez mal ecrit la commande pour choisir la coordonnee Y.");
				erreur = 29;
			}
			calculIndice(commande, &ligne, Rahan.ligne, Demiugre.ligne, premiereLigne);
			if (ligne >= nLignes || ligne < 0) {
				printf("La coordonnée Y choisie vous fait sortir de la carte.\n");
				erreur = 30;
			}
					
		}

		else if ((strcmp(commande, "ROCHER") == 0)) {
			verificationCase(carte, ligne, colonne, &erreur);
			creerRocher(carte, ligne, colonne, &erreur);
		}
		else if (commande[0] == '{' && commande[tailleCommande-1] == '}') {
			verificationCase(carte, ligne, colonne, &erreur);
			creerObjet(carte, ligne, colonne, commande, &erreur);
		}
		else if (commande[0] == '(' && commande[tailleCommande-1] == ')') {
			verificationCase(carte, ligne, colonne, &erreur);
			creerNourriture(carte, ligne, colonne, commande, &erreur);
		}
		else if (commande[0] == '<' && commande[tailleCommande-1] == '>') {
			verificationCase(carte, ligne, colonne, &erreur);
			creerMonstre(carte, ligne, colonne, commande, &erreur);

		}

		else if (strcmp(commande, "HAUT") == 0 || strcmp(commande, "BAS") == 0 || strcmp(commande, "GAUCHE") == 0 || strcmp(commande, "DROITE") == 0) {
			viderCase(carte, indiceLigneRahan, indiceColonneRahan);
			vitesse = Rahan.constitution->rahan.vitesse;
			for (i = 0; i < vitesse; i++) {
				/* Si jamais on est devant le demiugre ou un rocher, on s'arrête */
				if (bouger(carte, premiereColonne, derniereColonne, premiereLigne, derniereLigne, commande, &Rahan.colonne, &Rahan.ligne)) {
					break; 
				}
				/* Indices ligne et colonne de Rahan dans la matrice carte*/
				indiceColonneRahan = Rahan.colonne - premiereColonne;
				indiceLigneRahan = Rahan.ligne - premiereLigne;
				/* On agrandit la carte si on y est sorti */
				if (Rahan.colonne > derniereColonne || Rahan.colonne < premiereColonne || Rahan.ligne > derniereLigne || Rahan.ligne < premiereLigne) {
					carte = augmenterCarte(carte, commande, Rahan, &nColonnes, &nLignes, premiereColonne, derniereColonne, premiereLigne, derniereLigne, &erreur);
					if (carte != NULL) {
						premiereColonne = carte[0][0]->colonne; premiereLigne = carte[0][0]->ligne;
						derniereColonne = carte[nLignes - 1][nColonnes - 1]->colonne; derniereLigne = carte[nLignes - 1][nColonnes - 1]->ligne;
						indiceColonneRahan = Rahan.colonne - premiereColonne; indiceLigneRahan = Rahan.ligne - premiereLigne;
					}
				}
				else if (carte[indiceLigneRahan][indiceColonneRahan]->type == TYPE_MONSTRE) {
					combat(carte[indiceLigneRahan][indiceColonneRahan]->constitution->monstre, &(Rahan.constitution->rahan.sante), Rahan.constitution->rahan.force);
					if (Rahan.constitution->rahan.sante <= 0) {
						printf("Vous êtes mort en combat contre le monstre %s...\n", carte[indiceLigneRahan][indiceColonneRahan]->constitution->monstre.nom);
					}
					else {
						viderCase(carte, indiceLigneRahan, indiceColonneRahan);
						printf("Vous avez vaincu le monstre!\n");
						break;
					}
				}

				else if (carte[indiceLigneRahan][indiceColonneRahan]->type == TYPE_NOURRITURE) {
					manger(&(Rahan.constitution->rahan.sante), Rahan.constitution->rahan.PVMax, carte[indiceLigneRahan][indiceColonneRahan]->constitution->nourriture);
					viderCase(carte, indiceLigneRahan, indiceColonneRahan);
				}

				else if (carte[indiceLigneRahan][indiceColonneRahan]->type == TYPE_OBJET) {
					tabEquipement = choisirEquipement(tabEquipement, &tailleE, carte[indiceLigneRahan][indiceColonneRahan]->constitution->objet, &erreur);
					viderCase(carte, indiceLigneRahan, indiceColonneRahan);
					changerStats(tabEquipement, tailleE, &(Rahan.constitution->rahan));
				}
				if (erreur) {
					break;
				}
			}
			if (carte != NULL) {
				*carte[indiceLigneRahan][indiceColonneRahan] = Rahan;
			}
		}
		else if ((strcmp(commande, "CREPUSCULE") == 0) && (typePartie == 3 || typePartie == 1)) {
			break;
		}
		else {
			printf("Commande inconnue.\n");
			erreur=36;
		}
	}
	
	while ((strcmp(commande, "C") != 0) && (typePartie == 2 || typePartie == 4) && (erreur==0)) {
		if (typePartie == 4) {
			indiceCommande++; /* Pour eviter de recuperer la commande A */
			recupCommande(fichierString, &indiceCommande, commande);
			enleverEspacesFin(commande);
			printf("Commande entree : %s\n", commande);
		}
		else if (typePartie == 2) {
			pipeVersCommande(&erreur, commande);
			if (erreur != 0) {
				break;
			}
			enleverEspacesFin(commande);
			printf("Commande entree : %s\n", commande);
		}
		if (strcmp(commande, "I") == 0) {
			invocation(Rahan.constitution->rahan);
		}
		else if (strcmp(commande, "V") == 0) {
			vision(carte, premiereColonne, derniereColonne, premiereLigne, derniereLigne, nColonnes, nLignes);
		}
		else if (sscanf(commande, "X=%d%n", &colonne, &n) || sscanf(commande, "dX=%d%n", &colonne, &n) || sscanf(commande, "DX=%d%n", &colonne, &n)) {
			if (commande[n] != '\0') {
				printf("Vous avez mal ecrit la commande pour choisir la coordonnee X.");
				erreur = 27;
			}
			calculIndice(commande, &colonne, Rahan.colonne, Demiugre.colonne, premiereColonne);
			if (colonne >= nColonnes || colonne < 0) {
				printf("La coordonnée X choisie vous fait sortir de la carte.\n");
				erreur = 28;
			}
		}
		else if (sscanf(commande, "Y=%d%n", &ligne, &n) || sscanf(commande, "dY=%d%n", &ligne, &n) || sscanf(commande, "DY=%d%n", &ligne, &n)) {
			if (commande[n] != '\0') {
				printf("Vous avez mal ecrit la commande pour choisir la coordonnee Y.");
				erreur = 29;
			}
			calculIndice(commande, &ligne, Rahan.ligne, Demiugre.ligne, premiereLigne);
			if (ligne >= nLignes || ligne < 0) {
				printf("La coordonnée Y choisie vous fait sortir de la carte.\n");
				erreur = 30;
			}

		}
		else if ((strcmp(commande, "R") == 0)) {
			verificationCase(carte, ligne, colonne, &erreur);
			creerRocher(carte, ligne, colonne, &erreur);
		}
		else if (strcmp(commande, "H") == 0 || strcmp(commande, "B") == 0 || strcmp(commande, "G") == 0 || strcmp(commande, "D") == 0) {
			viderCase(carte, indiceLigneRahan, indiceColonneRahan);
			if (bouger(carte, premiereColonne, derniereColonne, premiereLigne, derniereLigne, commande, &Rahan.colonne, &Rahan.ligne)) {
				break;
			}
			/* Indices ligne et colonne de Rahan dans la matrice carte*/
			indiceColonneRahan = Rahan.colonne - premiereColonne;
			indiceLigneRahan = Rahan.ligne - premiereLigne;
			/* On agrandit la carte si on y est sorti */
			if (Rahan.colonne > derniereColonne || Rahan.colonne < premiereColonne || Rahan.ligne > derniereLigne || Rahan.ligne < premiereLigne) {
				carte = augmenterCarte(carte, commande, Rahan, &nColonnes, &nLignes, premiereColonne, derniereColonne, premiereLigne, derniereLigne, &erreur);
				if (carte != NULL) {
					premiereColonne = carte[0][0]->colonne; premiereLigne = carte[0][0]->ligne;
					derniereColonne = carte[nLignes - 1][nColonnes - 1]->colonne; derniereLigne = carte[nLignes - 1][nColonnes - 1]->ligne;
					indiceColonneRahan = Rahan.colonne - premiereColonne; indiceLigneRahan = Rahan.ligne - premiereLigne;
				}
			}
			if (erreur) {
				break;
			}
		}
		if (carte != NULL) {
			*carte[indiceLigneRahan][indiceColonneRahan] = Rahan;
		}
		else if (commande[0] == '\0' || commande[0] == EOF || commande == NULL) {
			printf("La derniere commande du fichier n'est pas C.");
			erreur = 25;
			break;
		}
		else {
			printf("Commande inconnue.");
			erreur = 36;
			break;
		}
	}
	
	
	sauvegarderEtRestaurer("FREE", NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
	freeCarte(carte, nColonnes, nLignes);
	freePointeur(Rahan.constitution);
	freePointeur(fichierString);
	freePointeur(tabEquipement);
	printf("Le programme marche !\n");
	return erreur;
}



