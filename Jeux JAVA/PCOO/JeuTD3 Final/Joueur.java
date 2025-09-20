// Création de la classe Joueur qui est un Singleton car un seul joueur peur exister à la fois, classe fille de la classe EntitesJM

public class Joueur extends EntitesJM {
  private static Joueur instance;
  public int Niveau;
  final public int PVNiveau;
  final public int ManaNiveau;
  final public int Armure;
  final public String[] Equipement; //Tableau qu'on peut dévlopper dans une classe dans la continuation du jeu (par exemple les équipements donneraient différentes stats)
  final public String Metier; //Nous permet de stocker le nom du métier

  //Constructeur en privé car la classe est un singleton
  private Joueur(String Nom, int PV, int Mana, int Degats, Sorts[] Sorts, int PVNiveau, int ManaNiveau, int Armure, String[] Equipement, String Metier) {
    super(Nom, PV, Mana, Degats, Sorts);
    this.Niveau = 1;
    this.PVNiveau = PVNiveau;
    this.ManaNiveau = ManaNiveau;
    this.Armure = Armure;
    this.Equipement = Equipement;
    this.Metier = Metier;
  }

  public void GagnerNiveau() { // Méthode pour modifier les PVs, Mana et Degats du joueur
    this.Niveau++; //Augmentation du niveau
    this.PVTotal += this.PVNiveau; //Augmention des PVs
    this.ManaTotal += this.ManaNiveau; //Augmentation du Mana

    if(this.Metier=="Magicien"){
      Sorts.ChangerStats(this); // Changer la regénération du sort "GUERISON"
    }

    System.out.println("Bravo! Vous êtes maintenant au niveau " + this.Niveau + ".");

    // On regarde le niveau du joueur pour modifier ses dégâts et ceux des sorts
    if (this.Niveau % 3 == 0) { // On augmente les dégâts de base tous les 3 niveaux
      this.Degats = this.Degats + (this.Degats / (int) (this.Niveau / 3));
      System.out.println("Bravo! Vos dégâts de base ont augmenté ! Vous faites maintenant " + this.Degats + " dégâts.");
    }

    if (this.Niveau % 6 == 0) { // On augmente les dégâts de base des sorts tous les 6 niveaux
      if (this.TabSorts != null) {
        for (Sorts i : this.TabSorts) {
          i.Degats = i.Degats + (i.Degats / (int) (this.Niveau / 6));
        }
        System.out.println("Bravo! Les dégâts causés par vos sorts ont augmenté !");
      }
    }
  }


  public void seReposer() {  //Méthode pour que le joueur se repose
    this.PV = this.PVTotal;
    this.Mana = this.ManaTotal;
    System.out.println("Vous vous êtes reposé et vous avez maintenant " + this.PV + " PV et " + this.Mana + " de Mana.");
  }


  //Méthode pour singleton (vérifie si une instance existe déjà et la renvoie si elle existe, sinon elle la créé avec les valeurs données)
  public static Joueur getInstance(String Nom, int PV, int Mana, int Degats, Sorts[] Sorts, int PVNiveau, int ManaNiveau, int Armure, String[] Equipement, String Metier) {
    if (instance == null) {
      instance = new Joueur(Nom, PV, Mana, Degats, Sorts, PVNiveau, ManaNiveau, Armure, Equipement, Metier);
    }
    return instance;
  }
}
