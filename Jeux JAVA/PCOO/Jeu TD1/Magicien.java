/*Création de la classe du joueur Magicien, 
classe fille de la classe Joueur*/
public class Magicien extends Joueur {
  public Magicien(String Nom) {
    super(Nom, 7, 4, 2, new Sorts[] { new RayonDeGivre(), new BouleDeFeu() }, 7, 4, 0, new String[]{"Dague"});
  }
}