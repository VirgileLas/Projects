//Classe "EntitesJM", classe fille de la classe "Entites" classe parent des monstres et du joueur 
public abstract class EntitesJM extends Entites {
  public int ManaTotal;
  public int Mana;
  public Sorts[] TabSorts;
  public int Degats;

  protected EntitesJM(String Nom, int PV, int Mana, int Degats, Sorts[] TabSorts){ // Constructeur de la classe Entites_Joueurs
    super(Nom, PV);
    this.ManaTotal=Mana;
    this.Mana=Mana;
    this.Degats=Degats;
    this.TabSorts=TabSorts;
  }

  
  private Sorts ChoisirSort(EntitesJM Personnage){ //Méthode servant à regarder si le monstre ou le joueur possédent des sorts et qui renvoie le sort le plus fort qu'il peut lancer
    if (Personnage.TabSorts != null){
        Sorts choixSort=Personnage.TabSorts[0]; //On choisi le premier sort de la liste de sorts
        for (Sorts i : Personnage.TabSorts){ //On regarde tous les sorts du personnage un par un
          if (Personnage.PV<=Personnage.PVTotal/3 && i.Cout<=Personnage.Mana && i.Regeneration>choixSort.Regeneration){ //Si les PVs du joueur sont à un tiers de ses PVs Max, on priorisera le sort de soin le plus puissant
            choixSort=i;
          }
          else if (Personnage.PV>Personnage.PVTotal/3 && i.Cout<=Personnage.Mana && i.Degats>choixSort.Degats){ //S'il n'a pas un sort de soin, le sort d'attaque le plus fort sera lancé
            choixSort=i;
          }
        }
        if (choixSort.Cout<=Personnage.Mana){ //On vérifie de nouveau s'il a assez de mana pour le sort (pour le cas où on choisi le 1er sort)
          return choixSort; //On renvoie le sort choisi
        }
        else{
          return null; //Sinon on renvoie "null"
        }
    }
    return null; //Sinon on renvoie "null"
  }


  /* Methode permettant de choisir entre le sort (s'il est possible à utiliser) et une attaque normale. 
  Elle retourne les dégâts de l'attaque ou du sort, priorisant le sort s'il peut en utiliser. 
  Le calcul du mana restant et de la régénération de la vie grâce au sort est fait ici aussi. */
  private int Attaquer(EntitesJM Personnage){ 
    Sorts choixSort=ChoisirSort(Personnage); //On choisi le sort le plus fort que le personnage peut lancer en fonction du mana restant
    if (choixSort!=null){ //On vérifie si le personnage peut lancer un sort
      
      Personnage.Mana=Personnage.Mana-choixSort.Cout; //On modifie le mana du personnage
      int PV=Personnage.PV; //Variable servant uniquement à calculer (correctement) combien de PVs on a régénéré
      Personnage.PV=Personnage.PV+choixSort.Regeneration; //On modifie les PVs du personnage en fonction de la régéneration du sort
      int regen=choixSort.Regeneration; //Variable servant uniquement à afficher (correctement) combien de PVs on a régénéré
      
      if (Personnage.PV>=Personnage.PVTotal){ //Si on dépasse la vie totale à cause de la régéneration d'un sort, on remet les PV au PVTotaux du personnage
        Personnage.PV=Personnage.PVTotal;
        regen=Personnage.PVTotal-PV;
      }

      if (choixSort.Regeneration>0 && Personnage instanceof Monstres){ //On affiche si le monstre a régénéré de la vie 
        System.out.println("Le monstre a régénéré " + regen + " PVs de sa vie grâce à son sort '" + choixSort.Nom + "'.");
      }

      else if (choixSort.Regeneration>0 && Personnage instanceof Joueur){ //On affiche si le joueur a régénéré de la vie 
        System.out.println("Vous avez régénéré " + regen + " PVs de votre vie grâce au sort '" + choixSort.Nom + "'.");
      }

      return choixSort.Degats; //On renvoie les dégâts du sort
    }

    else{
      return Personnage.Degats; //On renvoie les dégâts d'une attaque normale sinon
    }
  }
  

  public boolean Combat(Monstres Monstre, Joueur Joueur){ //Méthode de combat entre un Monstre et le Joueur qui retourne un boolean en fonction de la victoire ou de la mort du joueur
    while (Monstre.PV>0 && Joueur.PV>0){ //Le combat continue tant que le monstre et le joueur sont en vie
      // Le joueur attaque en premier et ensuite le monstre
      Sorts x=ChoisirSort(Joueur); //On choisi le sort du Joueur
      int AttaqueJoueur=Attaquer(Joueur); // On recupère les dégâts de la méthode Attaquer
      Monstre.PV=Monstre.PV-AttaqueJoueur;// On inflige les dégâts

      if (x==null){ // On annonce l'attaque normale s'il n'y a pas de sort disponible
      System.out.println("Vous avez infligé " + AttaqueJoueur + " dégâts au monstre avec votre attaque normale."); 
      }

      else{ // On annonce l'attaque avec le sort sinon si elle fait des dégâts
        if (AttaqueJoueur>0){
          System.out.println("Vous avez infligé " + AttaqueJoueur + " dégâts au monstre avec votre sort '" + x.Nom + "'. Vous avez utilisé "+x.Cout+" de mana, il vous reste " + Joueur.Mana + " de mana."); 
        }
      }

      if (Monstre.PV<=0){ // On arrête la méthode si le monstre est mort
        System.out.println("Il vous reste " + Joueur.PV + " PV et il reste au Monstre 0 PV.");
        System.out.println("Bravo! Vous avez vaincu le monstre!");
        return true; //On renvoie true si le joueur a gagné grâce à son attaque
      }
      

      //Tour du monstre pour attaquer
      Sorts y=ChoisirSort(Monstre); //On choisi le sort du Monstre
      int AttaqueMonstre=Attaquer(Monstre); //On récupère les dégâts de la méthode Attaquer

      if (y==null){ //On annonce l'attaque normale s'il n'y a pas de sort disponible
        Joueur.PV=Joueur.PV-AttaqueMonstre+Joueur.Armure; //On inflige les dégâts en fonction de l'armure du joueur
        System.out.println("Le Monstre vous a infligé " + AttaqueMonstre + " dégâts avec son attaque normale.");
      }
      else{
        Joueur.PV=Joueur.PV-AttaqueMonstre; //On inflige les dégâts sans prendre en compte l'armure car c'est une attaque avec un sort
        System.out.println("Le Monstre vous a infligé " + AttaqueMonstre + " dégâts avec son sort '" + y.Nom + "'.");
      } 

      //On affiche les PVs restants du joueur et du monstre aprés que chacun a attaqué
      if (Joueur.PV<0){
        System.out.println("Il vous reste 0 PV et il reste au Monstre " + Monstre.PV + " PV.");
        System.out.println("Le monstre vous a tué...");
      }
      else{
      System.out.println("Il vous reste " + Joueur.PV + " PV et il reste au Monstre " + Monstre.PV + " PV.");
      }
    }
    return false; //On renvoie false si le joueur est mort à cause de l'attaque du monstre
  }
}