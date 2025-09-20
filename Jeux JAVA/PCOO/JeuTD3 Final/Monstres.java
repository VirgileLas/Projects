/*Classe "Monstres" pour les monstres, classe fille de la classe "EntitesJM". 
Elle n'a rien de plus à EntitesJM, mais on l'a créé dans l'idéé de la continuation du jeu.
Si quelqu'un voudrait ajouter des méthodes ou valeurs propres aux Monstres, il pourra le faire plus facilement.*/
public class Monstres extends EntitesJM {
    public Monstres(String Nom, int PV, int Mana, int Degats, Sorts[] Sorts){
        super(Nom, PV, Mana, Degats, Sorts);
    }
}
