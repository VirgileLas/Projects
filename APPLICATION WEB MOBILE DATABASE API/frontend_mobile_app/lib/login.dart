import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
  import 'dart:convert';
import 'API_fnc.dart';

class LoginScreen extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<void> login(BuildContext context) async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:5000/login'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "username": emailController.text,
        "password": passwordController.text,
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 200 && responseData['success']) {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      final oldSessionJson = prefs.getString('user_session');
      List<dynamic> oldData = [];
      if (oldSessionJson != null) {
        final oldSession = jsonDecode(oldSessionJson);
        oldData = oldSession['data'] ?? [];
      }

      await prefs.setString('user_session', jsonEncode({
        'token': responseData['token'] ?? '',
        'username': emailController.text,
        'data': oldData // On CONSERVE la sauvegarde locale ici !
      }));

      await restoreAllGamesForUser(emailController.text);

      print('Réponse du backend : $responseData');
      print('Session sauvegardée : ${prefs.getString('user_session')}');
      print('Session enregistrée !');
      Navigator.of(context).pop(); // ferme le login
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(responseData['message'] ?? "Erreur de connexion")),
      );
    }
  }





  Future<void> signUp(BuildContext context) async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:5000/signup'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "username": emailController.text,
        "email": emailController.text,
        "password": passwordController.text
      }),
    );

    final responseData = jsonDecode(response.body);

    if (response.statusCode == 201 && responseData['success']) {
      await login(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Compte créé avec succès.")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(responseData['message'])),
      );
    }
  }
  final buttonSize = Size(150, 48);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: Colors.grey[200], // la couleur d'arrière-plan
      body: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,  // on colle tout en haut
          child: SingleChildScrollView(
            reverse: true,  // inverse le scroll pour rester au bas du child
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 24,
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            ), // on tient compte de la hauteur du clavier
            child: Container(
              width: 300,
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Connexion", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 20),

                  TextField(
                    controller: emailController,
                    decoration: InputDecoration(
                      labelText: "Email",
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                  ),
                  SizedBox(height: 16),

                  TextField(
                    controller: passwordController,
                    decoration: InputDecoration(
                      labelText: "Mot de passe",
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                  ),
                  SizedBox(height: 20),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      minimumSize: buttonSize,
                    ),
                    onPressed: () => signUp(context),
                    child: Text("Créer un compte"),
                  ),
                  SizedBox(height: 10),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      minimumSize: buttonSize,
                    ),
                    onPressed: () => login(context),
                    child: Text("Se connecter"),
                  ),
                  SizedBox(height: 10),

                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text("Fermer"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
