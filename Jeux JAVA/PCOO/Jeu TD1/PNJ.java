/*Création de la classe PNJ, 
classe fille de la classe Entite*/
public class PNJ extends Entite {
  private String Dialogue;

  public PNJ(String Nom, int PV, String Dialogue){
    super(Nom,PV);
    this.Dialogue=Dialogue;
  }

  public void parler(){
    System.out.println(Nom + " : " + Dialogue);
  }  
}

