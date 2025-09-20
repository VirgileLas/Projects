/*
On a fait le choix de créer cette classe par visibilité au sein du code dans "Main".
On y a ajouté tous les bouts de code qu'il aurait fallu répéter plusieures fois dans "Main" comme nettoyerConsole() et Séparateur(),
et tous les gros bouts de code qu'on a pu mettre dans une fonction pour que le code principal dans "Main" soit plus lisible.
*/
public class Utility {

    public static void nettoyerConsole() { //Méthode pour "nettoyer" la console
        for (int i = 0; i < 50; i++) {
            System.out.println();
        }
    }


    public static void Separateur(){ //Séparateur "-------------------"
        System.out.println("----------------------------------------------");
    }


    public static void affichageStats(Joueur PJ){
        System.out.println("Voici vos statistiques :");
        System.out.println("- Nom : " + PJ.Nom);
        System.out.println("- Métier : " + PJ.Metier);
        System.out.println("- Niveau : " + PJ.Niveau +"/20");
        System.out.println("- Dégâts : " + PJ.Degats);
        System.out.println("- Points de vie: " + PJ.PV + "/" + PJ.PVTotal);
        if(PJ.Mana>0){
            System.out.println("- Mana : " + PJ.Mana + "/" + PJ.ManaTotal);
        }
        System.out.println("- Equipement :");
        for (String i : PJ.Equipement){
            System.out.print("'" + i + "'" + " ");
        }
        System.out.print("\n");

        if(PJ.TabSorts!=null){
            System.out.println("- Sorts :");
            for (Sorts j : PJ.TabSorts){
                System.out.print("'" + j.Nom + "'" + " ");
            }
        }
        System.out.print("\n");
    }


    public static int Actions(Lieux LieuCourrant){ //Méthode pour afficher les actions possibles
        if (LieuCourrant.Ville==false){ //On vérifie si c'est une ville ou non
            System.out.println("Vous êtes actuellement à " + LieuCourrant.Nom + "."); //Affiche le lieu courrant
        }
        else{
            System.out.println("Vous êtes actuellement dans la ville " + LieuCourrant.Nom + "."); //Affiche le lieu courrant
        }
        System.out.println("Que voulez-vous faire?");
        Separateur();


        int x=0; // La variable x sert à annoncer le numéro de l'action
        
        System.out.println(x + ". Afficher votre profile"); //Affichage du profile avec tous les stats
        x++;

        for (PNJ i : LieuCourrant.PNJTab){ //Affichage des PNJs aux quels on peut parler
            System.out.println(x + ". Parler à " + i.Nom);
            x++; 
        }

        for (Monstres i : LieuCourrant.MonstreTab){  //Affichage des monstres possibles à attaquer
          if (i!=null){ // Quand un monstre est tué, il est passé à 'null' donc on vérifie pour ne pas donner une action inutile
            System.out.println(x + ". Attaquer " + i.Nom);
            x++;
          }
        }

        for (Lieux i : LieuCourrant.Lieux_AccessiblesTab){
            System.out.println(x + ". Aller à " + i.Nom);
            x++;
        }

        for (Monstres i : LieuCourrant.MonstreTab){ 
          if (i!=null){ //On vérifie si tous les monstres sont morts pour voir s'il est possible de se reposer
            x--;
            return x; //On renvoie le nombre d'actions possibles sans la possibilité de se reposer si un monstre est vivant
          }
        }

        System.out.println(x + ". Se reposer"); //On rajoute "Se reposer" car tous les monstres sont morts
        return x; //On renvoie le nombre d'actions possibles
    }


    public static void Fin(Joueur PJ){  //Méthode pour annoncer la mort ou la victoire du joueur en fonction du niveau du joueur
        if (PJ.Niveau==20){
            System.out.println("Vous avez gagné!");
        }
        else{
            System.out.println("Vous êtes mort...");
        }

    }
}