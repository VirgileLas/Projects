//Enumération de sorts. On a fait ce choix car ça nous paraissait le plus judicieux
public enum Sorts {
    RAYON_DE_GIVRE("Rayon de givre", 2, 4, 0),
    BOULE_DE_FEU("Boule de feu",9, 15, 0),
    GUERISON("Guérison", 10, 0, 0),
    NUEE_DE_METEORES("Nuée de météores", 15, 30, 0),
    TRANSFERT_DE_VIE("Transfert de vie", 5, 12, 6),
    SOUFFLE_DU_DRAGON("Souffle du dragon", 8, 20, 0),
    SOUFFLE_DU_DRAGON_VENERABLE("Souffle du dragon vénérable", 16, 60, 0);

    final public String Nom;
    final public int Cout;
    public int Degats; //On ne peut pas rendre Degats "final" car on a besoin de changer les degats des sorts du Magicien à certains niveaux
    public int Regeneration; //On ne peut pas rendre la Regeneration "final" car on a besoin de la changer pour le sort "GUERISON" à chaque niveau

    // Constructeur de la classe Sorts
    Sorts(String Nom, int Cout, int Degats, int Regeneration) {
        this.Nom = Nom;
        this.Cout = Cout;
        this.Degats = Degats;
        this.Regeneration = Regeneration;
    }

    //Changer la regeneration du sort 'GUERISON' a chaque niveau
    public static void ChangerStats (Joueur joueur){
        Sorts.GUERISON.Regeneration=joueur.PVTotal;
    }
}
