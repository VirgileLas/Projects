/* Création de la classe abstrait Sorts */
public abstract class Sorts {
    public String Nom;
    public int Cout;
    public int Degats;
    public int Regeneration;// Afin de facilité dans les calculs marlgré qu'un seul sort utilise de la regeneration il est plus facile de l'implémenter dans la classe abstraite.

  //Constructeur de la classe Sorts
  protected Sorts(String Nom, int Cout, int Degats, int Regeneration){
    this.Nom = Nom;
    this.Cout = Cout;
    this.Degats = Degats;
    this.Regeneration = Regeneration;
  }
}
