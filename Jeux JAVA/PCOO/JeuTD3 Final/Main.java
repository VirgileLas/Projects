//Projet par Cazacu Ion et Virigile Lassagne, double licence MI (2ème année)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in); //On lance le scanner

        //Début du jeu

        System.out.println("Bienvenue dans 'Les Nuits de Padhiver 2'! Veuillez entrer votre nom: ");
        Utility.Separateur(); //Séparateur "-----------------------"
        String Nom = sc.nextLine(); //Le joueur choisi son nom
        Utility.Separateur(); //Séparateur "-----------------------"
        System.out.println("Bonjour " + Nom + " ! Veuillez choisir un métier : ");
    

        int metier;
        while (true){ //Le joueur choisi son métier
          try{ //Le joueur doit rentrer un numéro (1/2/3) pour choisir son métier
            System.out.println("Tapez 1 pour Barbare\nTapez 2 pour Guerrier\nTapez 3 pour Magicien");
            Utility.Separateur(); //Séparateur "-----------------------"
            metier = sc.nextInt();
            Utility.Separateur(); //Séparateur "-----------------------"
            if (metier>0 && metier<4){
                break;
            }
            else{
                System.out.println("Veuillez taper un choix possible...");
                Utility.Separateur(); //Séparateur "-----------------------"
            }
          }
          catch(Exception e){ //S'il rentre autre chose, il devra reéssayer jusqu'à rentrer un des 3 nombres
            Utility.Separateur(); //Séparateur "-----------------------"
            System.out.println("Veuillez taper un choix possible...");
            Utility.Separateur(); //Séparateur "-----------------------"
            sc.nextLine(); //Nettoyage du scanner, sinon une boucle infinie a lieu
          }  
        }


        Joueur PJ = JoueurFactory.creerJoueur(metier, Nom); //Création d'un objet de la classe Joueur "PJ" avec le métier et nom choisis

        Lieux LieuCourrant = LieuxFactory.creerLieux(); //Création des lieux (+PNJs et Monstres) et mise en place du lieu courrant

        Sorts.ChangerStats(PJ); //On change la régénération du Sort "Guérison" pour qu'elle soit égale aux PVs Max du Joueur

        Utility.nettoyerConsole(); //Néttoyage de la console


        while (PJ.Niveau < 20){ //Boucle principale du jeu qui dure jusqu'à ce que le joueur soit niveau 20 (et qui sera "break" s'il est mort)
      

            Utility.Separateur(); //Séparateur "-----------------------"


            int nombreActions=Utility.Actions(LieuCourrant); //Affichage de toutes les actions possibles et on récupére le nombre d'actions possibles


            Utility.Separateur(); //Séparateur "-----------------------"


            int choix;
            while (true){ //Le joueur doit choisir une action (parler/attaquer/bouger/se reposer)
                try{
                    choix = sc.nextInt();//On demande le choix de la personne et on redemande si ce n'est pas un choix possible
                    if (choix>nombreActions || choix<0) {
                        Utility.Separateur(); //Séparateur "-----------------------"
                        System.out.println("Ce nombre ne correspond à aucune action possible. Veuillez choisir une action!");
                        Utility.Separateur(); //Séparateur "-----------------------"
                    }
                    else{
                        break;
                    }
                }
                catch(Exception e){ //S'il rentre autre chose qu'un nombre, il devra reéssayer
                    Utility.Separateur(); //Séparateur "-----------------------"
                    System.out.println("Veuillez taper un chiffre correspondant à une action...");
                    Utility.Separateur(); //Séparateur "-----------------------"
                    sc.nextLine(); //Nettoyage du scanner, sinon une boucle infinie a lieu
                }  
            }


            Utility.Separateur(); //Séparateur "-----------------------"
            Utility.nettoyerConsole(); //Néttoyage de la console   


            int[] tab = LieuCourrant.taille(); //On récupére la taille du tableau du lieu courrant, contenant le nombre de monstres, pnjs et lieux accéssibles


            if (choix==0){
                Utility.affichageStats(PJ);
            }
            else if (1<=choix && choix<=tab[0]){ //On regarde si le choix est à propos des PNJs
                Utility.Separateur(); //Séparateur "-----------------------"
                LieuCourrant.PNJTab[choix-1].parler(PJ); //On affiche le dialogue du PNJ
            }

            else if (tab[0]<choix && choix<=tab[0]+tab[1]){ //On regarde si le choix est à propos des monstres
                Utility.Separateur(); //Séparateur "-----------------------"
                if (PJ.Combat(LieuCourrant.MonstreTab[choix-1-tab[0]],PJ)){ //On regarde si le joueur a tué le monstre
                    Utility.Separateur();
                    LieuCourrant.MonstreTab[choix-1-tab[0]]=null; //On met le monstre à "null" puisqu'il est mort, pour ne plus l'afficher
                    LieuCourrant.TriMonstre(); //On trie le tableau de monstres du lieu courrant
                    PJ.GagnerNiveau(); //On fait gagner un niveau au Joueur et on  modifie ses dégâts de sorts ou de base selon son niveau
                }
                else{ //Sinon le joueur est mort lors du combat, on casse la boucle, donc on arrête le jeu 
                  break;
                }
            }

            else if (tab[0]+tab[1]<choix && choix<=tab[0]+tab[1]+tab[2]){ //On regarde si le choix est à propos de changer de lieu
              LieuCourrant=LieuCourrant.Lieux_AccessiblesTab[choix-tab[1]-tab[0]-1]; //On change de lieu courrant
            }

            else if ( choix==tab[0]+tab[1]+tab[2]+1 ){ //On regarde si le choix est à ropos de se reposer
                Utility.Separateur(); //Séparateur "-----------------------"
                PJ.seReposer(); //On repose le joueur
            }

        }
        

        Utility.Separateur(); //Séparateur "-----------------------"


        Utility.Fin(PJ); //Fin du jeu, on affiche un message en fonction de si le joueur est au niveau 20 ou non (donc mort)
        sc.close(); //On ferme le scanner
    }
}