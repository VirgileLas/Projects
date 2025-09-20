/*Création de la classe abstraite Joueur, 
classe fille de la classe Entites_Joueurs */
public abstract class Joueur extends Entites_Joueurs {
  public int Niveau;
  private int PVNiveau;
  private int ManaNiveau;
  protected int Armure;
  public String[] Equipement;

  protected Joueur(String Nom, int PV, int Mana, int Degats, Sorts[] Sorts, int PVNiveau, int ManaNiveau, int Armure, String[] Equipement){
    super(Nom, PV, Mana, Degats, Sorts);
    this.Niveau = 1;
    this.PVNiveau = PVNiveau;
    this.ManaNiveau = ManaNiveau;
    this.Armure = Armure;
    this.Equipement=Equipement;
  }

  public static void GagnerNiveau(Joueur PJ) {
    PJ.Niveau += 1;
    PJ.PVTotal += PJ.PVNiveau;
    PJ.ManaTotal += PJ.ManaNiveau;
  }

  public static void Reposer(Joueur PJ) {
    PJ.PV = PJ.PVTotal;
    PJ.Mana = PJ.ManaTotal;
  }


}
