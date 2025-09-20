/*Création de la classe du monstre Necromant, 
classe fille de la classe Entites_Joueurs*/
public class Necromant extends Entites_Joueurs {
  public Necromant() {
    super("Nécromant", 30, 10, 8, new Sorts[] { new TransferDeVie() });
  }
}