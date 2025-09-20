import 'package:flutter/material.dart';
import 'package:sle_app/main.dart';
import 'package:sle_app/floating_bar.dart';
import 'package:sle_app/page_jeu.dart';
import 'package:sle_app/login.dart';
import 'package:sle_app/API_fnc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PageProfil extends StatefulWidget {
  @override
  State<PageProfil> createState() => _PageProfilState();
}

class _PageProfilState extends State<PageProfil> {
  Future<Map<String, dynamic>?>? userSessionFuture;
  Future<List<dynamic>>? leaderboardFuture;

  @override
  void initState() {
    super.initState();
    userSessionFuture = loadSession();
  }

  void _logout() async { //retire tout les prefs
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    setState(() {
      userSessionFuture = loadSession();
      leaderboardFuture = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "GUESSLE",
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
          FutureBuilder<Map<String, dynamic>?>( // Construction dynamique de la page connexion
            future: userSessionFuture,
            builder: (context, sessionSnapshot) {
              print("REBUILD - sessionSnapshot.data: ${sessionSnapshot.data}");
              if (sessionSnapshot.connectionState == ConnectionState.waiting) {
                return Center(child: CircularProgressIndicator());
              }

              final session = sessionSnapshot.data;

              // Si la session est vide ou nulle OU si token ou username sont absents ou vides :
              if (session == null ||
                  session.isEmpty ||
                  session['token'] == null ||
                  session['token'].toString().isEmpty ||
                  session['username'] == null ||
                  session['username'].toString().isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Page profil", style: TextStyle(fontSize: 20)),
                      SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return Dialog(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Container(
                                  width: 300,
                                  height: 400,
                                  padding: EdgeInsets.all(16),
                                  child: LoginScreen(),
                                ),
                              );
                            },
                          ).then((_) {
                            setState(() {
                              userSessionFuture = loadSession();
                              leaderboardFuture = null;
                            });
                          });
                        },
                        child: Text("Se connecter"),
                      ),
                    ],
                  ),
                );
              }

              // Si la session existe, charger et afficher le leaderboard
              leaderboardFuture ??= fetchLeaderboard();

              return FutureBuilder<List<dynamic>>( //Construction dynamique du leaderboard
                future: leaderboardFuture,
                builder: (context, lbSnapshot) {
                  if (lbSnapshot.connectionState == ConnectionState.waiting) {
                    return Center(child: CircularProgressIndicator());
                  }
                  if (lbSnapshot.hasError) {
                    return Center(child: Text('Erreur leaderboard : ${lbSnapshot.error}'));
                  }
                  final leaderboard = lbSnapshot.data ?? [];
                  return Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Bienvenue ! Voici le leaderboard :",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 20),
                      Expanded(
                        child: ListView.separated(
                          itemCount: leaderboard.length,
                          separatorBuilder: (_, __) => Divider(),
                          itemBuilder: (context, index) {
                            final user = leaderboard[index];
                            return ListTile(
                              leading: Text('#${index + 1}'),
                              title: Text(user['username']),
                              subtitle: Text('Parties jouées : ${user['games_played']}, Gagnées : ${user['games_won']}'),
                            );
                          },
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 50),
                        child: ElevatedButton(
                          onPressed: _logout,
                          child: Text("Déconnexion"),
                        ),
                      ),
                    ],
                  );
                },
              );
            },
          ),
          FloatingBar(
            onPersonPressed: () {
              Navigator.push(context,
                  MaterialPageRoute(builder: (context) => PageProfil()));
            },
            onHomePressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => MyApp()),
              );
            },
          ),
        ],
      ),
    );
  }
}