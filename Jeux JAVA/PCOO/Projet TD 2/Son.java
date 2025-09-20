public class Son {
  double frequence;
  float debut;
  float fin;
  int canal;
  public Son(double frequence, float debut, float fin, int canal){
    this.frequence=frequence;
    this.debut=debut;
    this.fin=fin;
    this.canal=canal;
  }
  public double getFrequence(){
    return frequence;
  }
  public float getDebut(){
    return debut;
  }
  public float getFin(){
    return fin;
  }
  public int getCanal(){
    return canal;
  }
}