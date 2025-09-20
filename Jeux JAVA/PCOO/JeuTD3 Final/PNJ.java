//Classe PNJ, classe fille de la classe Entite
public class PNJ extends Entites {
  private String Dialogue;
  private int NumPNJ; //Cette variable nous sert à numéroter les PNJs pour s'y retrouver plus facilement
  private int numFoisParler=0; //Cette variable nous sert à compter combien de fois on a parlé au PNJs

  public PNJ(String Nom, int PV, String Dialogue, int NumPNJ){
    super(Nom,PV);
    this.Dialogue=Dialogue;
    this.NumPNJ=NumPNJ;
  }

  public void parler(Joueur PJ){ //Méthode pour parler à un joueur
    
    if (this.NumPNJ==8){ //Cas du PNJ 8 (ville de Mirabar), on triple les dégâts de base

      if (this.numFoisParler==0){ //Si le joueur n'a jamais parlé au PNJ nr°8
        System.out.println(Nom + " : " + Dialogue); //Affiche le dialogue du PNJ
        numFoisParler++;
        int multiDegats=(int)(PJ.Niveau/3)+1;
        int degBase=(PJ.Degats/multiDegats)*3;
        PJ.Degats=degBase*(multiDegats);
        System.out.println("Vos dégâts ont été augmenté. Vous faites maintenant " + PJ.Degats + " dégâts!");
      }

      else{ //S'il a déjà parlé au PNJ
        System.out.println(this.Nom + " : Je ne peux plus rien faire pour vous...");
      }
    }

    else if (this.NumPNJ==9 ){ //Cas du PNJ 9 (ville de Mirabar), on apprend le nouveau sort au joueur s'il est un magicien

      if(this.numFoisParler==0 && PJ.Metier=="Magicien"){ //Si le joueur est un magicien et qu'il n'a jamais parlé au PNJ nr°9
        System.out.println(Nom + " : " + Dialogue); //Affiche le dialogue du PNJ
        numFoisParler++;
        Sorts[] NewSorts = new Sorts[PJ.TabSorts.length + 1]; //On rajoute tous les anciens sorts dans une nouvelle liste et on rajoute le nouveau sort
        for ( int i=0; i<PJ.TabSorts.length; i++){
          NewSorts[i]=PJ.TabSorts[i];
        }
        NewSorts[NewSorts.length-1]=Sorts.NUEE_DE_METEORES;
        PJ.TabSorts=NewSorts; //On a décidé de pas modifier les dégâts du nouveau sort apprit en fonction du niveau actuel du joueur, car on n'avait pas de détails la dessus
        //Exemple : On ne doublera pas les dégâts du sort s'il est au niveau 6 lorsqu'il l'a apprit, mais il doublera de dégâts au niveau 12
        System.out.println("Félicitations vous avez apprit un nouveau sort 'Nuée de météorites' !");
      }

      else if(PJ.Metier!="Magicien"){ //Si ce n'est pas un magicien
        System.out.println(this.Nom + " : Malheureusement vous n'êtes pas digne pour que je vous apprenne quoi que ce soit.\n         Seulement les magiciens peuvent côntroler un tel pouvoir.");
      }

      else{ //Si c'est un magicien et qu'il a déjà apprit le sort
        System.out.println(this.Nom + " : Je vous ai apprit tout ce que je savais...");
      }
    }

    else{ //Cas d'un PNJ normal
      System.out.println(Nom + " : " + Dialogue); //Affiche le dialogue du PNJ
    }
    numFoisParler++;
  }
}

