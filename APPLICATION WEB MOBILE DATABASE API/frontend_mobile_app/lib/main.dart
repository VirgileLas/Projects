import 'package:flutter/material.dart';
import 'package:sle_app/page_jeu.dart';
import 'package:sle_app/floating_bar.dart';
import 'package:sle_app/page_profil.dart';
import 'package:sle_app/menu.dart';
import 'API_fnc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

Future<void> cleanPreferencesIfNewDay() async {
  final prefs = await SharedPreferences.getInstance();
  final now = DateTime.now();
  final todayKey = '${now.year}-${now.month}-${now.day}';

  // On enregistre la dernière date de clean dans 'last_cleanup_date'
  final lastCleanupDate = prefs.getString('last_cleanup_date') ?? '';

  if (lastCleanupDate != todayKey) {

    await prefs.clear(); //tout nettoyer
    await prefs.setString('last_cleanup_date', todayKey);
    print("SharedPreferences nettoyé ce jour : $todayKey");
  }
}

void main() {
  cleanPreferencesIfNewDay();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white54,
      ),
      home: const MyHomePage(title: 'GUESSLE'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late Future<List<Map<String, dynamic>>> templatesFuture;



  @override
  void initState() {
    super.initState();
    templatesFuture = fetchTemplates();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
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
          SafeArea(
            child: FutureBuilder<List<Map<String, dynamic>>>( // construction dynamique des boutons de la page d'acceuil
              future: templatesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Erreur : ${snapshot.error}'));
                }
                final templates = snapshot.data ?? [];
                if (templates.isEmpty) {
                  return Center(child: Text('Aucun template trouvé'));
                }
                return ListView.builder(
                  padding: EdgeInsets.only(bottom: 120), // Pour ne pas cacher le contenu sous la barre
                  itemCount: templates.length,
                  itemBuilder: (context, index) {
                    final template = templates[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 25), // Ajuste si besoin
                      child: Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                padding: EdgeInsets.symmetric(vertical: 60), // Épais en hauteur
                                textStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(18),
                                ),
                              ),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => Menu(templateID: template['id']),
                                  ),
                                );
                              },
                              child: Text(template['name']),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Positioned(
            bottom: 100,
            left: MediaQuery.of(context).size.width * 0.05,
            right: MediaQuery.of(context).size.width * 0.05,
            child: FloatingBar(
              onPersonPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => PageProfil()),
                );
              },
              onHomePressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MyApp()),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}