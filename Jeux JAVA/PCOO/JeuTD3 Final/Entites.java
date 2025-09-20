//Classe "Entites", classe parent de tous les monstres, PNJs et du joueur
public abstract class Entites {
    final public String Nom;
    public int PVTotal;
    public int PV;
  
    protected Entites(String Nom, int PV){
      this.Nom=Nom;
      this.PVTotal=PV;
      this.PV=PV;
    }
  }