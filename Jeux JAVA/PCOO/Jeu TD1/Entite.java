/*Création de la classe Entite, 
classe parent de tous les monstres et des métiers */
public abstract class Entite {
  
  public String Nom;
  public int PVTotal;
  public int PV;

  protected Entite(String Nom, int PV){
    this.Nom=Nom;
    this.PVTotal=PV;
    this.PV=PV;
  }
}
