import 'package:flutter/material.dart';
import 'floating_bar.dart';
import 'page_profil.dart';
import 'main.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'API_fnc.dart';
import 'dart:convert';
import 'page_jeu.dart';
import 'Lolidle.dart';


class Menu extends StatelessWidget {
  final String title;
  final int templateID;

  Menu({this.title = "GUESSLE", required this.templateID});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 35,
            fontFamily: 'Roboto',
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white54,
      ),
      body: Stack(
        children: [
          // Grille de boutons game_types dynamiques
          Positioned(
            top: 270,
            left: MediaQuery.of(context).size.width * 0.12,
            right: MediaQuery.of(context).size.width * 0.12,
            child: SizedBox(
              height: 800,
              child: FutureBuilder<List<Map<String, dynamic>>>( //construction dynamique des boutons en fonction du template renseigné dans le builder menu
                future: fetchGameTypesByTemplate(templateID),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return Center(child: Text('Erreur : ${snapshot.error}'));
                  }
                  final gameTypes = snapshot.data ?? [];
                  if (gameTypes.isEmpty) {
                    return Center(child: Text('Aucun mode trouvé pour ce template'));
                  }
                  return GridView.count(
                    crossAxisCount: 2,
                    mainAxisSpacing: 24,
                    crossAxisSpacing: 24,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    children: gameTypes.map((gameType) {
                      return ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          backgroundColor: Colors.white70,
                          padding: EdgeInsets.zero,
                        ),
                        onPressed: () {
                          // appel conditionnel qui n'empêche pas la scalabilité car ce sont les créateurs qui code les templates 1 template = une page_jeu
                          if (gameType['template_id'] == 1) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PageJeu(gameTypeId: gameType['id']),
                              ),
                            );
                            print('${gameType['id']}');
                          } else if (gameType['template_id'] == 2) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => LolIdle(gameTypeId: gameType['id']),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Jeu non défini pour ce template_id : ${gameType['template_id']}')),
                            );
                          }
                        },
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              gameType['name'],
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black),
                              textAlign: TextAlign.center,
                            ),
                            if (gameType['description'] != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  gameType['description'],
                                  style: TextStyle(fontSize: 14, color: Colors.black54),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            left: MediaQuery.of(context).size.width * 0.05,
            right: MediaQuery.of(context).size.width * 0.05,
            child: FloatingBar(
              onPersonPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => PageProfil()));
              },
              onHomePressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => MyApp()));
              },
            ),
          ),
        ],
      ),
    );
  }
}
