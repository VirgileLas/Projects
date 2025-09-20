//Classe Factory avec des paramétres permettant de créer des PNJs, on peut facilement y apporter des modifications ou rajouter des PNJs
//Les PNJs sont initialisés dans la classe LieuxFactory

public class PNJFactory {
    public static PNJ creerPNJ(int choix) {
        switch(choix){
            case 1: return new PNJ("Alex", 12, "Bonjour brave aventurier!", 1);
            case 2: return new PNJ("Lancelot", 129, "Je vous souhaite bonne chance dans votre aventure!", 2);
            case 3: return new PNJ("Mark", 30, "J'ai entendu dire qu'un Dragon se cache dans le volcan.", 3);
            case 4: return new PNJ("Gustave", 38, "La forêt regorge de monstres!", 4);
            case 5: return new PNJ("Greg", 10, "Des choses bizarres se tramment dans cette ville", 5);
            case 6: return new PNJ("Landor", 4, "Les monstres nous tueront tous!", 6);
            case 7: return new PNJ("Isabella", 12, "Il existerai un grand magicien dans la ville de Mirabar.", 7);
            case 8: return new PNJ("Galahad", 22, "Bienvenue dans ma forge. Laissez moi jetter un coup d'oeil à votre équipement.", 8);
            case 9: return new PNJ("Merlin", 54, "Vous m'avez l'air très doué, je me demande si vous êtes assez digne pour apprendre mon sort.", 9);

            default: //On throw une erreur si on essaie de créer un PNJ qui n'existe pas
                throw new IllegalArgumentException("Un type de PNJ inconnu a éssayé d'être créé. Consultez PNJFactory ou LieuxFactory.");
        }
    }
}

//public PNJ(String Nom, int PV, String Dialogue)