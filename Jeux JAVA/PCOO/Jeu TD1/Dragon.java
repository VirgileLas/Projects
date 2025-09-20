/*Création de la classe du monstre Dragon, 
classe fille de la classe Entites_Joueurs */
public class Dragon extends Entites_Joueurs{
  public Dragon(){
    super("Dragon", 70, 24, 12, new Sorts[] {new SouffleDuDragon()});
  }
}