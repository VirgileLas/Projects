//Classe Lieux
public class Lieux {
  public String Nom;
  public PNJ[] PNJTab;
  public Monstres[] MonstreTab;
  public Lieux[] Lieux_AccessiblesTab;
  public boolean Ville;

  public Lieux(String Nom,PNJ[] Ptab, Monstres[] Monstre, int Nlieu, boolean Ville) {
    this.Nom = Nom; 
    this.MonstreTab = Monstre;
    this.PNJTab = Ptab;
    this.Lieux_AccessiblesTab = new Lieux[Nlieu];
    this.Ville = Ville;
  }


  public void LieuxImpl(Lieux[] l ){ //Méthode pour ajouter des lieux accessibles à un lieu, pour facilité les manipulations dans la fonction main
    this.Lieux_AccessiblesTab = l;
  }


  /*Méthode de calcul du nombre de valeur non nulles dans les tableaux d'un objet de la classe "Lieux".
  On renvoie un tableau qui a comme premier nombre, le nombre de PNJs du lieu, 
  comme second nombre, le nombre de monstres encore en vie, 
  et en comme dernier le nombre de lieux accessibles.*/
  public int[] taille(){ 
    int[] t={0,0,0};
      for (PNJ p : PNJTab){ //Simple boucle qui n'incremente qu'en cas de valeur non nulle dans le tableau. Il existe toujours un tableau de taille 0 au moins.
        if (p != null){
          t[0]++;
        }
      }
      for (Monstres m : MonstreTab){ //Pareil
        if(m != null){
          t[1]++;
        }
      }
      for (Lieux l2 : Lieux_AccessiblesTab){ //Pareil
        if (l2 != null){
          t[2]++;
        }
      }
      return t; //On renvoie le tableau
  }
  
  
  public void TriMonstre(){ //Méthode permetant de pousser les monstre mort à la fin du tableau afin que l'algorithme de liaison fonctionne correctement
    for (int i = 0; i<MonstreTab.length-1; i++){ //Simple algorithme de tri
      if (MonstreTab[i] == null){
        for (int j=i ; j<=MonstreTab.length-2; j++){
          if (MonstreTab[j+1] !=null){
            MonstreTab[j] = MonstreTab[j+1];
            MonstreTab[j+1] = null;
          }
        }
      }
    }
  }
}
