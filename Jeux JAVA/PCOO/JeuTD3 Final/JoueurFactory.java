//Classe Factory avec des paramétres permettant de créer un Joueur avec les valeurs dependant de la classe choisie par le Joueur dans "Main"
public class JoueurFactory {
    public static Joueur creerJoueur(int choix, String nom) {
        switch(choix) {
            case 1: return Joueur.getInstance(nom, 9, 0, 5, null, 9, 0, 0, new String[]{"Hache"}, "Barbare");
            case 2: return Joueur.getInstance(nom, 8, 0, 4, null, 8, 0, 2, new String[]{"Epée","Armure"}, "Guerrier");
            case 3: return Joueur.getInstance(nom, 7, 4, 2, new Sorts[] { Sorts.RAYON_DE_GIVRE , Sorts.BOULE_DE_FEU, Sorts.GUERISON }, 7, 4, 0, new String[]{"Dague"}, "Magicien");
            default: throw new IllegalArgumentException("Choix impossible. Veuillez reéssayer ou vérifier la classe JoueurFactory.");
            //Le default ne devrait jamais arriver car les exceptions ont été prises en compte dans "Main"
        }
    }
}