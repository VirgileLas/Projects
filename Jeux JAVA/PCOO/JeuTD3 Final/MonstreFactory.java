//Classe Factory avec des paramétres permettant de créer des Monstres, on peut facilement y apporter des modifications ou rajouter des monstres
//Les monstres sont initialisés dans la classe LieuxFactory
public class MonstreFactory {
    public static Monstres creerMonstre(String type) {
        switch (type) {
            case "Gobelin":
                return new Monstres(type, 4, 0, 4, null);
            case "Orc":
                return new Monstres(type, 8, 0, 5, null);
            case "Chauve Souris":
                return new Monstres(type, 6, 0, 5, null);
            case "Nécromant":
                return new Monstres(type, 30,  10, 8, new Sorts[] { Sorts.TRANSFERT_DE_VIE });
            case "Dragon":
                return new Monstres(type, 70, 24, 12, new Sorts[] { Sorts.SOUFFLE_DU_DRAGON });
            case "Géant":
                return new Monstres(type, 90, 0, 25, null);
            case "Dragon Vénérable":
                return new Monstres(type, 220, 48, 24, new Sorts[] { Sorts.SOUFFLE_DU_DRAGON_VENERABLE } );
            default: //On throw une erreur si on essaie de créer un monstre qui n'existe pas
                throw new IllegalArgumentException("Un type de monstre inconnu a éssayé d'être créé. Consultez MonstreFactory ou LieuxFactory.");
                
        }
    }
}