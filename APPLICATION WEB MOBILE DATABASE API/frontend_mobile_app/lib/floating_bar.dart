import 'package:flutter/material.dart';

class FloatingBar extends StatelessWidget {
  final Function()? onHomePressed;
  final Function()? onPersonPressed;
  final Function()? onStarPressed;

  const FloatingBar({
    Key? key,
    this.onHomePressed,
    this.onPersonPressed,
    this.onStarPressed,
  }) : super(key: key);

  Widget build(BuildContext context) {
    return Positioned(
      bottom: 100,
      left: 20,
      right: 20,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white54,
          borderRadius: BorderRadius.circular(30), // Bordures arrondies
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 10,
              spreadRadius: 2,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildIconButton(Icons.home, onHomePressed),
            _buildIconButton(Icons.person, onPersonPressed),
            _buildIconButton(Icons.star, onStarPressed),
          ],
        ),
      ),
    );
  }

// Fonction pour créer un bouton
  Widget _buildIconButton(IconData icon, Function()? onPressed) {
    return IconButton(
      onPressed: onPressed,
      icon: Icon(icon, size: 30, color: Colors.white), // Icône blanche intégrée
      splashRadius: 30, // Effet au clic
    );
  }
}