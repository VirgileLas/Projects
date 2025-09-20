/*Classe Factory avec des paramétres permettant de créer tous les lieux, en créant les lieux, 
on initialise aussi les Monstres et les PNJs en utilisant les méthodes des classes MonstreFactory et PNJFactory.
On peut faire des changements comme rajouter des monstres aux lieux très simplement.*/
public class LieuxFactory {
  public static Lieux creerLieux() { //La méthode renvoie le lieu de départ

    Lieux Padhiver = new Lieux(
        "Padhiver",
        new PNJ[] { PNJFactory.creerPNJ(1), PNJFactory.creerPNJ(2) },
        new Monstres[0],
        2,
        true);

    Lieux RouteNord = new Lieux(
        "Route Nord",
        new PNJ[] { PNJFactory.creerPNJ(3) },
        new Monstres[0],
        3,
        false);

    Lieux RouteSud = new Lieux(
        "Route Sud",
        new PNJ[] { PNJFactory.creerPNJ(4) },
        new Monstres[] { MonstreFactory.creerMonstre("Orc"), MonstreFactory.creerMonstre("Orc") },
        4,
        false);

    Lieux Foret = new Lieux(
        "Forêt",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Gobelin"), MonstreFactory.creerMonstre("Gobelin") },
        2,
        false);

    Lieux Luskan = new Lieux(
        "Luskan",
        new PNJ[] { PNJFactory.creerPNJ(5) },
        new Monstres[0],
        2,
        true);

    Lieux Eauprofonde = new Lieux(
        "Eauprofonde",
        new PNJ[] { PNJFactory.creerPNJ(6), PNJFactory.creerPNJ(7) },
        new Monstres[0],
        1,
        true);

    Lieux RouteRiviere = new Lieux(
        "Route Rivière",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Orc"), MonstreFactory.creerMonstre("Orc"),
            MonstreFactory.creerMonstre("Orc") },
        1,
        false);

    Lieux RouteSudEst = new Lieux(
        "Route Sud-Est",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Géant"), MonstreFactory.creerMonstre("Géant") },
        2,
        false);

    Lieux Mirabar = new Lieux(
        "Mirabar",
        new PNJ[] { PNJFactory.creerPNJ(8), PNJFactory.creerPNJ(9) },
        new Monstres[0],
        2,
        true);

    Lieux MaraisdesMorts = new Lieux(
        "Marais des Morts",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Chauve Souris"), MonstreFactory.creerMonstre("Chauve Souris"),
            MonstreFactory.creerMonstre("Chauve Souris") },
        2,
        false);

    Lieux RouteNordEst = new Lieux(
        "Route Nord-Est",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Géant"), MonstreFactory.creerMonstre("Géant") },
        2,
        false);

    Lieux Crypte = new Lieux(
        "Crypte",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Nécromant") },
        1,
        false);

    Lieux Volcan = new Lieux(
        "Volcan",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Dragon") },
        1,
        false);

    Lieux Montagnes = new Lieux(
        "Montagnes",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Dragon"), MonstreFactory.creerMonstre("Dragon") },
        2,
        false);

    Lieux HautesMontagnes = new Lieux(
        "Hautes Montagnes",
        new PNJ[0],
        new Monstres[0],
        2,
        false);

    Lieux PicduMonde = new Lieux(
        "Pic du Monde",
        new PNJ[0],
        new Monstres[] { MonstreFactory.creerMonstre("Dragon Vénérable") },
        1,
        false);


    //On implimente les lieux accéssibles à chaque lieu    
    Padhiver.LieuxImpl(new Lieux[] { RouteNord, RouteSud });
    RouteNord.LieuxImpl(new Lieux[] { Foret, Padhiver, Luskan });
    RouteSud.LieuxImpl(new Lieux[] { MaraisdesMorts, Padhiver, Eauprofonde, Montagnes });
    Foret.LieuxImpl(new Lieux[] { RouteNord, Volcan });

    Luskan.LieuxImpl(new Lieux[] { RouteNord, RouteRiviere });
    Eauprofonde.LieuxImpl(new Lieux[] { RouteSud, RouteSudEst });
    RouteRiviere.LieuxImpl(new Lieux[] { Luskan, Mirabar });
    RouteSudEst.LieuxImpl(new Lieux[] { Eauprofonde, RouteNordEst });

    Mirabar.LieuxImpl(new Lieux[] { RouteRiviere, RouteNordEst });
    MaraisdesMorts.LieuxImpl(new Lieux[] { Crypte, RouteSud });
    RouteNordEst.LieuxImpl(new Lieux[] { RouteSudEst, Mirabar });
    Crypte.LieuxImpl(new Lieux[] { MaraisdesMorts });

    Volcan.LieuxImpl(new Lieux[] { Foret });
    Montagnes.LieuxImpl(new Lieux[] { RouteSud, HautesMontagnes });
    HautesMontagnes.LieuxImpl(new Lieux[] { Montagnes, PicduMonde });
    PicduMonde.LieuxImpl(new Lieux[] { HautesMontagnes });

    
    return Padhiver; //On renvoie le lieu de départ (le lieu courrant) pour l'utiliser dans "Main"
  }
}
