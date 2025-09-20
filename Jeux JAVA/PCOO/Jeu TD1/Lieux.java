/*Création de la classe Lieux */
public class Lieux {
  public String Nom;
  public PNJ[] PNJTab;
  public Entites_Joueurs[] MonstreTab;
  public Lieux[] Lieux_AccessiblesTab;

  public Lieux(String Nom,PNJ[] Ptab, Entites_Joueurs[] Monstre, int Nlieu) {
    this.Nom = Nom; 
    this.MonstreTab = Monstre;
    this.PNJTab = Ptab;
    this.Lieux_AccessiblesTab = new Lieux[Nlieu]; // Pas besoin de vérification il y a toujours au moins 1 lieu accessible celui par lequel on arrive
    
  }

  public void LieuxImpl(Lieux[] l ){// Methode pour ajouter des lieux accessibles, pour facilité les manipulations dans la fonction main
    this.Lieux_AccessiblesTab = l;
  }



  public int[] taille(){ // Methode de calcul du nombre de valeur non nul dans les tableaux de la class on revois un tableau qui a en indice 0 le nombre de PNJ de l'object en indice 1 le nombre de monstre encore en vie en indice 2 le nombre de lieux accessible c'est ce tableau qui va nous donner les valeurs necaissaire au bon fonctionnement de notre algo de liaison dans la class main;
    int[] t={0,0,0};
      for (PNJ p : PNJTab){// simple boucle qui n'incremente qu'en cas de valeur non nul dans le tableau (j'ajoute puisque que lorsqu'on crée notre object lieu on ajoute un tableau vide de longeur 0 si le lieu ne contient pas de monstre ou de PNJ cela permet que cette algorithme fonctionne correctement)
        if (p != null){
          t[0]++;
        }
      }
      for (Entites_Joueurs m : MonstreTab){//idem
        if(m != null){
          t[1]++;
        }
      }
      for (Lieux l2 : Lieux_AccessiblesTab){//idem
        if (l2 != null){
          t[2]++;
        }
      }
      return t;
  }
  
  public void TriMonstre(){ // methode permetant de pousser les monstre mort à la fin du tableau afin que l'algorithme de liaison fonctionne correctement
    for (int i = 0; i<MonstreTab.length-1; i++){// simple algorithme de tri à bulle
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
