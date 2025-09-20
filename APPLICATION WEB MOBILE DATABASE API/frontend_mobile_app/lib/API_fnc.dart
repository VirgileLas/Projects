import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<String>> fetchSolutionsForGameType(int gameTypeId) async {
  final url = Uri.parse('http://10.0.2.2:5000/challenges/$gameTypeId');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['success'] == true) {
      final List<dynamic> challenges = jsonResponse['challenges'];
      return challenges
          .map<String>((challenge) => challenge['solution'] as String)
          .toList();
    } else {
      throw Exception(jsonResponse['message']);
    }
  } else {
    throw Exception('Erreur serveur ${response.statusCode}');
  }
}


Future<List<Map<String, dynamic>>> fetchTemplates() async { // Récupère tout les templates
  final url = Uri.parse('http://10.0.2.2:5000/templates');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    print(response.body);
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['success'] == true) {
      final templatesData = jsonResponse['templates'];
      if (templatesData is List) {
        return List<Map<String, dynamic>>.from(templatesData);
      } else if (templatesData is Map) {
        return [Map<String, dynamic>.from(templatesData)];
      } else {
        return [];
      }
    } else {
      throw Exception(jsonResponse['message']);
    }
  } else {
    throw Exception('Erreur serveur ${response.statusCode}');
  }
}

Future<List<Map<String, dynamic>>> fetchGameTypesByTemplate(int templateID) async { // Récupère tout les gamestypes pour un template assigné
  final url = Uri.parse('http://10.0.2.2:5000/game_types');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['success'] == true) {
      final allGameTypes = jsonResponse['gameTypes'];
      print(allGameTypes);
      // Filtrer côté client pour les game_types avec le template_id souhaité
      return List<Map<String, dynamic>>.from(
        allGameTypes.where((e) => e['template_id'] == templateID),
      );
    } else {
      throw Exception(jsonResponse['message']);
    }
  } else {
    throw Exception('Erreur serveur ${response.statusCode}');
  }
}


Future<Map<String, dynamic>?> loadSession() async { // Charge la session local en cours
  SharedPreferences prefs = await SharedPreferences.getInstance();
  String? sessionJson = prefs.getString('user_session');
  print('Session lue : $sessionJson'); // ← ça doit s'afficher dans les logs !
  if (sessionJson != null) {
    return jsonDecode(sessionJson);
  }
  return null;
}

// Appelle l’API leaderboard (ne nécessite pas d’être connecté dans l’API actuelle)
Future<List<dynamic>> fetchLeaderboard() async {
  final url = Uri.parse('http://10.0.2.2:5000/leaderboard');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['success'] == true) {
      return jsonResponse['leaderboard'];
    } else {
      throw Exception(jsonResponse['message']);
    }
  } else {
    throw Exception('Erreur serveur ${response.statusCode}');
  }
}

Future<Map<String, dynamic>?> loadGameState(int gameTypeId) async {
  // Envoie sous forme de partie un Gamestate stocker dans SharedPreferences
  final prefs = await SharedPreferences.getInstance();
  final String? sessionJson = prefs.getString('user_session');
  if (sessionJson == null) return null;

  final session = jsonDecode(sessionJson);
  final List<dynamic> data = session['data'] ?? [];

  final partie = data.firstWhere(
        (p) => p['gameID'] == gameTypeId,
    orElse: () => null,
  );
  return partie;
}

Future<void> saveGameState({ // Enregistre le GameState dans les SharedPreferences
  required int gameTypeId,
  required int nombreEssaie,
  required List<String> tabDeMotEssayer,
  bool finished = false,
  bool hasWon = false,
}) async {
  final prefs = await SharedPreferences.getInstance();
  final String? sessionJson = prefs.getString('user_session');
  Map<String, dynamic> session =
  sessionJson != null ? jsonDecode(sessionJson) : {"token": "", "data": []};

  List<dynamic> data = session['data'] ?? [];

  int idx = data.indexWhere((p) => p['gameID'] == gameTypeId);
  Map<String, dynamic> partie = {
    "gameID": gameTypeId,
    "nombreEssaie": nombreEssaie,
    "tabDeMotEssayer": tabDeMotEssayer,
    "finished": finished,
    "hasWon": hasWon,
  };
  print("Sauvegarde: finished = $finished | hasWon = $hasWon");

  if (idx == -1) {
    data.add(partie);
  } else {
    data[idx] = partie;
  }
  session['data'] = data;
  await prefs.setString('user_session', jsonEncode(session));
}


Future<Map<String, dynamic>> submitGuess({ // Envois un essais à Redis par l'APU et retourne le tableau de couleur
  required int gameTypeId,
  required String guess,
  required int guessNumber,
  String? username,
  String? token,

}) async {
  print('submitGuess called: gameTypeId=$gameTypeId, guess=$guess, guessNumber=$guessNumber, username=$username');
  if (username != null && username.isNotEmpty) {
    final url = Uri.parse('http://10.0.2.2:5000/guess/$gameTypeId/$username');
    final response = await http.post(
      url,
      headers: {
        "Content-Type": "application/json",
        if (token != null && token.isNotEmpty) "Authorization": "Bearer $token",
      },
      body: jsonEncode({"guess": guess, "guess_number": guessNumber}),
    );
    print("Status: ${response.statusCode}");
    print("Body: ${response.body}");
    return jsonDecode(response.body);
  } else {
    // Anonyme : utilise la route /guess/:gameTypeId
    final url = Uri.parse('http://10.0.2.2:5000/guess/$gameTypeId');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"guess": guess, "guess_number": guessNumber}),
    );
    print('Status: ${response.statusCode}');
    print('Body: ${response.body}');
    print("Appel API connecté/anonymous : $url");
    return jsonDecode(response.body);
  }
}

Future<void> updateUserStatsAPI({ // Envoie une game perdu par l'API
  required String username,
  required String token,
  required int played_game,
  required int won_game,
}) async {
  final url = Uri.parse('http://10.0.2.2:5000/users/$username');
  print('Envoi PUT user stats\nUsername: $username\nToken: $token\nURL: $url');

  final response = await http.put(
    url,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    },
    body: jsonEncode({
      "played_game": played_game,
      "won_game": won_game,
    }),
  );
  print('Status: ${response.statusCode}');
  print('Body: ${response.body}');
}

Future<Map<String, dynamic>?> fetchRestoreGame(String username, int gameTypeId) async {
  final url = Uri.parse('http://10.0.2.2:5000/restore/$gameTypeId/$username');
  final response = await http.get(url, headers: {
    "Accept": "application/json",
  });

  if (response.statusCode == 200) {
    final jsonResponse = jsonDecode(response.body);
    if (jsonResponse['success'] == true) {
      return jsonResponse; // Contient guesses
    }
  }
  return null; // Pas de partie pour ce type (ou erreur)
}

Future<void> handleGameRestorationOnLogin(String username, int templateID) async {
  final prefs = await SharedPreferences.getInstance();

  // Récupérer tous les gameTypes pour ce templateID
  final gameTypes = await fetchGameTypesByTemplate(templateID);

  // Pour chaque gameType, essayer de restaurer la game sur le serveur
  for (final gameType in gameTypes) {
    final gameTypeId = gameType['id'];

    // Cherche la sauvegarde locale (shared preferences)
    final localKey = 'gameState_$gameTypeId';
    final localGameRaw = prefs.getString(localKey);
    final localGame = localGameRaw != null ? jsonDecode(localGameRaw) : null;

    // Appel /restore/:gameTypeId/:username
    final serverGame = await fetchRestoreGame(username, gameTypeId);

    if (serverGame == null) {
      // Si rien en BDD, mais il y a une sauvegarde locale => load local
      if (localGame != null) {
        loadGameState(localGame); // Ta fonction déjà définie
      }
    } else {
      // Si la BDD a une partie (statut in_progress/won/lost), stocke/remplace le local
      await prefs.setString(localKey, jsonEncode(serverGame));
      loadGameState(gameTypeId); // Ta fonction déjà définie
    }
  }
}

Future<void> restoreAllGamesForUser(String username) async { //Restore tout les games qu'on a en db pour un user à la connexion
  final prefs = await SharedPreferences.getInstance();
  final sessionJson = prefs.getString('user_session');
  final session = sessionJson != null ? jsonDecode(sessionJson) : {};
  final token = session['token'] ?? "";

  // Récupérer tous les templates
  print('Templates fetch...');
  final templates = await fetchTemplates();
  print('Templates récupérés : $templates');
  for (final template in templates) {
    final templateId = template['id'];
    // Récupérer tous les gameTypes de ce template
    print('Traitement templateId : $templateId');
    final gameTypes = await fetchGameTypesByTemplate(templateId);
    print('GameTypes trouvés : $gameTypes');

    for (final gameType in gameTypes) {
      final gameTypeId = gameType['id'];
      print('Restore pour gameTypeId : $gameTypeId');

      // Appel RESTORE sur l'API pour chaque gameTypeId
      final url = Uri.parse('http://10.0.2.2:5000/restore/$gameTypeId/$username');
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      print('StatusCode pour $gameTypeId : ${response.statusCode}');
      print('Body : ${response.body}');

      if (response.statusCode == 200) {
        // Partie serveur existe : on synchronise local
        final res = jsonDecode(response.body);
        if (res['success'] == true) {
          final guesses = res['guesses'] as List<dynamic>;
          bool hasWon = false;
          bool finished = false;
          final maxAttempts = 6; // adapte si tu as max dynamique

          if (guesses.isNotEmpty) {
            final lastGuess = guesses.last['guess'] as String;
            final guessResponse = await http.post(
              Uri.parse('http://10.0.2.2:5000/guess/$gameTypeId'),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({"guess": lastGuess, "guess_number": guesses.length}),
            );
            if (guessResponse.statusCode == 200) {
              final guessRes = jsonDecode(guessResponse.body);
              final colors = (guessRes['colors'] as List).map((c) => c.toString()).toList();
              final allGreen = colors.isNotEmpty && colors.every((c) => c == 'green');
              hasWon = guessRes['correct'] == true || allGreen;
            }
          }
          finished = hasWon || guesses.length >= maxAttempts;

          Map<String, dynamic> partie = {
            "gameID": gameTypeId,
            "nombreEssaie": guesses.length,
            "tabDeMotEssayer": guesses.map((g) => (g["guess"] as String).toUpperCase()).toList(),
            "finished": finished,
            "hasWon": hasWon,
          };
          // MAJ dans la session "data"
          final sessionJson = prefs.getString('user_session');
          final session = sessionJson != null ? jsonDecode(sessionJson) : {};
          List<dynamic> data = session['data'] ?? [];
          data.removeWhere((p) => p['gameID'] == gameTypeId);
          data.add(partie);
          session['data'] = data;
          await prefs.setString('user_session', jsonEncode(session));
        }
      }
      else {
        // 404 : pas de partie sur le serveur, essaie de resync la partie locale
        Map<String, dynamic>? localGame;
        // fallback user_session.data
        final sessionJson = prefs.getString('user_session');
        if (sessionJson != null) {
          final session = jsonDecode(sessionJson);
          final List<dynamic> data = session['data'] ?? [];
          localGame = data.firstWhere(
                (p) => p['gameID'] == gameTypeId,
            orElse: () => null,
          );
          print('Partie trouvée dans user_session.data pour $gameTypeId: $localGame');
        }

        if (response.statusCode == 404) {
          if (localGame != null) {
            print('Aucune partie serveur mais une sauvegarde locale trouvée !');
            await syncLocalGameToServer(gameTypeId, username);
            // ... et tu peux aussi la re-sauvegarder côté session, si besoin ...
          } else {
            print('Aucune partie locale ni serveur pour $gameTypeId');
          }
        }

        if (localGame != null) {
          print('Aucune partie sur le serveur mais une sauvegarde locale trouvée. Sync...');
          await syncLocalGameToServer(gameTypeId, username);
          final sessionJson = prefs.getString('user_session');
          final session = sessionJson != null ? jsonDecode(sessionJson) : {};
          List<dynamic> data = session['data'] ?? [];
          data.removeWhere((p) => p['gameID'] == gameTypeId);
          data.add(localGame);
          session['data'] = data;
          await prefs.setString('user_session', jsonEncode(session));
          print('Partie locale sauvegardée dans user_session.data pour gameType $gameTypeId');
        }
      }
    }
  }
}

Future<List<List<String>>> fetchColorsForGuesses(int gameTypeId, List<String> guesses) async {
  // Retourne le tableau Redis pour une ancienne partie en jouant en off

  final List<List<String>> colorsList = [];
  for (final guess in guesses) {
    final url = Uri.parse('http://10.0.2.2:5000/guess/$gameTypeId');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'guess': guess.toLowerCase()}),
    );
    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      final colors = List<String>.from(jsonResponse['colors']);
      colorsList.add(colors);
    } else {
      // En cas d’erreur, on remplit de blancs
      colorsList.add(List.filled(guess.length, 'white'));
    }
  }
  return colorsList;
}

Future<void> syncLocalGameToServer(int gameTypeId, String username) async {
  final prefs = await SharedPreferences.getInstance();
  final sessionJson = prefs.getString('user_session');
  if (sessionJson == null) return;

  final session = jsonDecode(sessionJson);
  final List<dynamic> data = session['data'] ?? [];
  final token = session['token'] ?? "";

  // Récupérer la partie locale correspondante
  final partie = data.firstWhere(
        (p) => p['gameID'] == gameTypeId,
    orElse: () => null,
  );
  if (partie == null) return; // Rien à synchroniser

  final List<String> mots = List<String>.from(partie['tabDeMotEssayer']);
  for (int i = 0; i < mots.length; i++) {
    final guess = mots[i].toLowerCase();
    final guessNumber = i + 1;

    final url = Uri.parse('http://10.0.2.2:5000/guess/$gameTypeId/$username');
    final response = await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "guess": guess,
        "guess_number": guessNumber,
      }),
    );
    print('Sync guess $guess ($guessNumber): ${response.statusCode} ${response.body}');
  }
}

Future<List<String>> fetchChallengeSolutions(int gameTypeId) async {// Récupère tout les solutions des challenges de gameTypeId
  final url = Uri.parse('http://10.0.2.2:5000/challenges/$gameTypeId');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data as List).map((item) => item['solution'] as String).toList();
  } else {
    throw Exception('Erreur récupération challenge data');
  }
}


Future<Map<String, dynamic>> fetchChallengeAttributes(int gameTypeId) async { // Récupère aussi les attributs et leur nombre
  final url = Uri.parse('http://10.0.2.2:5000/challenges/$gameTypeId');
  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final challengeData = jsonDecode(data.first['data']);
    return {
      "attributes": challengeData.keys.toList(),
      "attributeCount": challengeData.keys.length,
    };
  } else {
    throw Exception('Erreur récupération attributs');
  }
}

