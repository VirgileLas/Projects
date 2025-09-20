/* Création de la classe abstraite Entite_Joueurs, classe fille de la classe Entite. 
Toutes les sous classes nous permettent de limiter les initialisations dans la fonction main. */
public abstract class Entites_Joueurs extends Entite {
  protected int ManaTotal;
  protected int Mana;
  protected Sorts[] Sorts;
  protected int Degats;

  // Constructeur de la classe Entites_Joueurs
  protected Entites_Joueurs(String Nom, int PV, int Mana, int Degats, Sorts[] Sorts){
    super(Nom, PV);
    this.ManaTotal=Mana;
    this.Mana=Mana;
    this.Degats=Degats;
    this.Sorts=Sorts;
  }

  private Sorts ChoisirSort(Entites_Joueurs Personnage){ 
    /* Méthode permettant de vérifier si le personnage a des sorts et 
    qui retourne le sort le plus fort qu'il est capable de lancer. */
    if (Personnage.Sorts != null){
        Sorts a=Personnage.Sorts[0];
        for (Sorts i : Personnage.Sorts){
          if (i.Cout<=Personnage.Mana && i.Degats>a.Degats){
            a=i;
          }
        }
        if (a.Cout<=Personnage.Mana){
          return a;
        }
        else{
          return null;
        }
    }
    return null;
  }

  private int Attaquer(Entites_Joueurs Personnage){ 
    /*Methode permettant de choisir entre le sort (s'il est possible à utiliser) 
    et une attaque normale se servant de la méthode 'ChoisirSort'. 
    Elle retourne les dégâts de l'attaque ou du sort, 
    priorisant le sort s'il peut en utiliser. Le calcul du mana restant et de la 
    régénération de la vie grâce au sort est fait ici aussi. */
    Sorts SortP=ChoisirSort(Personnage);
    if (SortP!=null){
      Personnage.Mana=Personnage.Mana-SortP.Cout;
      Personnage.PV=Personnage.PV+SortP.Regeneration;
      if (SortP.Regeneration>0){
        System.out.println("Le monstre a régénéré " + SortP.Regeneration + " PV de sa vie.");
      }
      /* Si on dépasse la vie totale à cause de la régéneration d'un sort,
      on remet les PV au PVTotaux du monstre ou joueur. */
      if (Personnage.PV>=Personnage.PVTotal){
        Personnage.PV=Personnage.PVTotal;
      }
      return SortP.Degats;
    }
    else{
      return Personnage.Degats;
    }
  }
  
  public boolean Combat(Entites_Joueurs Monstre, Joueur Joueur){
    /* Méthode de combat entre le joueur et le monstre prenant fin lorsque un des deux est vaincu.
    Elle retourne 'True si le monstre est mort ou 'False' si le joueur est mort. */
    while (Monstre.PV>0 && Joueur.PV>0){
      // Boucle 'tant que' qui assure que la méthode ne prenne pas fin avant la mort d'un des deux
      // Le joueur attaque en premier et ensuite le Monstre
      Sorts x=ChoisirSort(Joueur); // On verifie si le joueur a un sort 
      int AttaqueJoueur=Attaquer(Joueur); // On recupère les dégâts de la méthode Attaquer
      Monstre.PV=Monstre.PV-AttaqueJoueur;// On inflige les dégâts
      if (x==null){
      System.out.println("Vous avez infligé " + AttaqueJoueur + " dégats au monstre avec votre attaque normale."); // On annonce l'attaque normale si il n'y a pas de sort disponible
      }
      else{
        System.out.println("Vous avez infligé " + AttaqueJoueur + " dégats au monstre avec votre sort "+ x.Nom +". Vous avez utilisé "+x.Cout+" de mana, il vous reste " + Joueur.Mana + " de mana."); // On annonce l'attaque avec le sort sinon
      }
      if (Monstre.PV<=0){ // On arrête la méthode si le monstre est mort
        System.out.println("Bravo! Le monstre est mort!");
        return true;
      }
      
      Sorts y=ChoisirSort(Monstre); // Tour du monstre
      int AttaqueMonstre=Attaquer(Monstre);
      if (y==null){
        Joueur.PV=Joueur.PV-AttaqueMonstre;
        System.out.println("Le Monstre vous a infligé " +AttaqueMonstre+ " dégats avec son attaque normale.");
      }
      else{
        Joueur.PV=Joueur.PV-AttaqueMonstre+Joueur.Armure;
        System.out.println("Le Monstre vous a infligé " +AttaqueMonstre+ " dégats avec son sort " + y.Nom + " .");
      } 
      if (Joueur.PV<0){
        System.out.println("Il vous reste 0 PV et il reste au Monstre "+ Monstre.PV +" PV.");
      }
      else if (Monstre.PV<0){
        System.out.println("Il vous reste "+ Joueur.PV +" PV et il reste au Monstre 0 PV.");
      }
      else{
      System.out.println("Il vous reste "+ Joueur.PV +" PV et il reste au Monstre "+ Monstre.PV +" PV."); // On affiche l'état du combat 
      }
    }
    return false;
  }
}