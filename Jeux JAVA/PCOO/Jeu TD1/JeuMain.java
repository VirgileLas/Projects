// fait par Virgile Lassagne et Cazacu Ion, Licence MI


import java.util.Scanner;

public class JeuMain {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);

    /* Début du jeu : Choisir le métier en écrivant le nom du métier et aussi le nom du joueur.
    Si le métier n'existe pas, il sera demandé au joueur de reécrire le nom du métier
    tant que celui-ci existe. */
    System.out.println("Bienvenue dans 'Les Nuits de Padhiver'! Veuillez entrer votre nom: ");
    String Nom = sc.nextLine();
    System.out.println("Choisissez un métier (Barbare ou Guerrier ou Magicien): ");
    String Metier = sc.nextLine();
    while (!Metier.equals("Barbare") && !Metier.equals("Guerrier") && !Metier.equals("Magicien")){
      System.out.println("Ce métier n'existe pas, veuillez en choisir un qui existe: ");
      Metier = sc.nextLine();
    }

    /* Création du joueur dépendant du métier choisi. */
    Joueur PJ=null;
    if (Metier.equals("Barbare")) {
      PJ = new Barbare(Nom);
    }
    else if(Metier.equals("Guerrier")) {
      PJ = new Guerrier(Nom);
    }
    else if(Metier.equals("Magicien")){
      PJ = new Magicien(Nom);
    } 
    System.out.println("Vous avez choisi le métier de " + Metier + " et vous avez une " + PJ.Equipement[0] + " comme arme. Cette arme fait " + PJ.Degats + " de dégâts.");
    
    // Création des PNJs
    PNJ PNJ1 = new PNJ("Alex", 12, "Bonjour brave aventurier!");
    PNJ PNJ2 = new PNJ("Lancelot", 67, "Je vous souhaite bonne chance dans votre aventure!");
    PNJ PNJ3 = new PNJ("Mark", 30, "J'ai entendu dire qu'un Dragon se cache dans le volcan.");
    PNJ PNJ4 = new PNJ("Gustave", 38, "La forêt regorge de monstres!");
    
    /* Création des lieux sans les lieux accessibles, 
    mais on donne le nombre de lieux accessible pour chaque lieu. 
    On a choisi de rajouter les lieux accessibles après car 
    c'est impossible d'ajouter un lieu pas encore créé en tant que lieu accessible.
    Par exemple, on aurrait créé 'Padhiver' en premier et ensuite rajouté 'Route Nord'
    alors qu'elle existe pas, donc impossible. */
    Lieux Padhiver = new Lieux("Padhiver",new PNJ[]{PNJ1,PNJ2},new Entites_Joueurs[0],2);
    Lieux RouteNord = new Lieux("Route Nord ",new PNJ[]{PNJ3},new Entites_Joueurs[0],2);
    Lieux RouteSud = new Lieux("Route Sud",new PNJ[]{PNJ4},new Entites_Joueurs[]{new Orc(),new Orc()},2);
    Lieux Foret = new Lieux("Forêt",new PNJ[0],new Entites_Joueurs[]{new Gobelin(),new Gobelin()} ,2);
    Lieux MaraisDesMorts = new Lieux("Marais des Morts",new PNJ[0],new Entites_Joueurs[]{new ChauveSouris(),new ChauveSouris(),new ChauveSouris()},2);
    Lieux Crypte = new Lieux("Crypte",new PNJ[0],new Entites_Joueurs[]{new Necromant()},1);
    Lieux Volcan = new Lieux("Volcan",new PNJ[0],new Entites_Joueurs[]{new Dragon()},1);

    /* Ajout des lieux accessibles à chaque lieu 
    grâce à la méthode LieuxImpl de la classe Lieux. */
    Padhiver.LieuxImpl(new Lieux[]{RouteNord,RouteSud});
    RouteNord.LieuxImpl(new Lieux[]{Padhiver,Foret});
    RouteSud.LieuxImpl(new Lieux[]{Padhiver,MaraisDesMorts});
    Foret.LieuxImpl(new Lieux[]{RouteNord,Volcan});
    MaraisDesMorts.LieuxImpl(new Lieux[]{RouteSud,Crypte});
    Crypte.LieuxImpl(new Lieux[]{MaraisDesMorts});
    Volcan.LieuxImpl(new Lieux[]{Foret});

    // Déclaration du Lieu Courrant et on sauvegarde les dégâts de base du joueur
    Lieux LieuCourrant = Padhiver; 
    int deg = PJ.Degats;

    /* Boucle principale du jeu qui tourne tant que le joueur n'est pas au niveau 10,
    On cassera la boucle en utilisant "break" que si le joueur mort à un certain mort. */
    while (PJ.Niveau < 10){
      
      System.out.println("Vous êtes actuellement à " + LieuCourrant.Nom);
      System.out.println("Que voulez-vous faire?");

      // La variable x sert à annoncer à la combientième d'action on est.
      int x=1;
      for (PNJ i : LieuCourrant.PNJTab){
          System.out.println(x + ". Parler à " + i.Nom);
          x++; 
      }
      /* Quand un monstre est tué, il est passé à 'null'
      donc on vérifie pour pas donner une action inutile. */
      for (Entites_Joueurs i : LieuCourrant.MonstreTab){
        if (i!=null){
          System.out.println(x + ". Attaquer " + i.Nom);
          x++;
        }
      }
      for (Lieux i : LieuCourrant.Lieux_AccessiblesTab){
          System.out.println(x + ". Aller à " + i.Nom);
          x++;
      }
      //On vérifie si tous les monstres sont morts pour voir s'il est possible de se reposer.
      boolean m=true;
      for (Entites_Joueurs i : LieuCourrant.MonstreTab){
        if (i!=null){
          m=false;
          break;
        }
      }
      if (m){
        System.out.println(x + ". Se reposer");
        x++;
      }

      System.out.println("---------------------------");
      /* On demande le chiffre du choix choisi et on redemande 
      si jamais le chiffre n'est pas dans la liste. */
      int choix = sc.nextInt();
      while (choix>=x || choix<1){
        System.out.println("Ce choix n'est pas possible. Veuillez en choisir un autre!");
        choix = sc.nextInt();
      }
      System.out.println("---------------------------");

      /* On récupére le tableau renvoyé par la fonction taille() de la classe 'Lieux' 
      qui nous retourne un tableau de taille 3 avec le nombre de PNJ du lieu,
      le nombre de Monstres, et le nombre des lieux accessibles, dans le lieu courrant. */
        int[] tab = LieuCourrant.taille();

      /* On regarde si le choix est à propos des PNJ en regardant s'il est 
      plus petit que le nombre de PNJ, donc parler au PNJ. */
      if (1<=choix && choix<=tab[0]){
        LieuCourrant.PNJTab[choix-1].parler();
        System.out.println("---------------------------");
      }
      /* On regarde sinon si le choix est à propos des Monstres et on attaque donc le monstre. */  
      else if (tab[0]<choix && choix<=tab[0]+tab[1]){
        if (PJ.Combat(LieuCourrant.MonstreTab[choix-1-tab[0]],PJ)){
          /* On attaque le monstre grâce à la méthode 'Combat' de la classe
          'Entites_Joueurs'. On met le monstre tué à 'null'.
          On trie le tableau des Monstres du lieu courrant 
          en mettant les monstres tués donc égaux à 'null' à la fin du tableau.
          On fait gagner un niveau au joueur grâce à la méthode 'GagnerNiveau'. */
          LieuCourrant.MonstreTab[choix-1-tab[0]]=null;
          LieuCourrant.TriMonstre();
          Joueur.GagnerNiveau(PJ);
          System.out.println("Bravo! Vous êtes maintenant au niveau " + PJ.Niveau);
          /* On regarde le niveau du joueur pour modifier ses dégâts et ceux des sorts.*/
          if (PJ.Niveau==3){
            PJ.Degats=deg*2;
            System.out.println("Bravo! Vos dégâts ont augmenté ! Vous faites maintenant " + PJ.Degats);
          }
          else if (PJ.Niveau==6){
            PJ.Degats=deg*3;
            System.out.println("Bravo! Vos dégâts ont augmenté ! Vous faites maintenant " + PJ.Degats);
            if (PJ.Sorts!=null){
              for (Sorts i : PJ.Sorts){
                i.Degats=i.Degats*2;
                System.out.println("Bravo! Les dégâts causés par vos sorts ont doublé !");
              }
            }
          }
          else if (PJ.Niveau==9){
            System.out.println("Bravo! Vos dégâts ont augmenté ! Vous faites maintenant " + PJ.Degats);
            PJ.Degats=deg*4;
          }
        }
        /* Sinon le joueur est mort, on casse la boucle, donc on arrête le jeu. */
        else{
          break;
        }
        System.out.println("---------------------------");
      }
      /* On regarde sinon si le choix est à propos des lieux accessibles
      et on change de lieu courrant. */
      else if (tab[0]+tab[1]<choix && choix<=tab[0]+tab[1]+tab[2]){
        LieuCourrant=LieuCourrant.Lieux_AccessiblesTab[choix-tab[1]-tab[0]-1];
      }
      /* On regarde sinon si le choix est à propos de se reposer et on lance la méthode 'Reposer'. */
      else if (m=true && choix==tab[0]+tab[1]+tab[2]+1){
        Joueur.Reposer(PJ);
        System.out.println("Vous vous êtes reposé et vous avez maintenant "+PJ.PV + " PV et " +PJ.Mana+ " de Mana.");
        System.out.println("---------------------------");
      }
    }
    
    /* Une fois la boucle principale finie, 
    on regarde si le joueur à atteint le niveau 10, 
    ce qui veut dire qu'il à gagné le jeu. 
    Sinon, cela veut dire qu'il est mort 
    à un moment du jeu et la boucle à été 'break'. */
    if (PJ.Niveau==10){
      System.out.println("Vous avez gagné!");
    }
    else{
      System.out.println("Vous êtes mort...");
    }
  }
}
  
  