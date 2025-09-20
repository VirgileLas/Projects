import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'API_fnc.dart';
import 'dart:convert';

class LolIdle extends StatefulWidget {
  final int gameTypeId;
  final String? username;
  final String? token;

  LolIdle({
    required this.gameTypeId,
    this.username,
    this.token,
    Key? key,
  }) : super(key: key);

  @override
  _LolIdleState createState() => _LolIdleState();
}

class _LolIdleState extends State<LolIdle> {
  List<Map<String, dynamic>> solutions = [];
  List<String> attributes = [];
  int attributeCount = 0;
  int maxAttempts = 6;
  List<List<Color>> colors = [];
  List<Map<String, dynamic>?> guessDatas = [];
  int currentAttempt = 0;
  List<String> guessNames = [];
  String currentInput = '';
  TextEditingController controller = TextEditingController();
  bool isGameOver = false;
  String? username;
  String? token;


  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final String? sessionJson = prefs.getString('user_session');
    if (sessionJson != null) {
      final session = jsonDecode(sessionJson);
      setState(() {
        username = session['username'];
        token = session['token'];
        print('token relu: $token');
      });
    }
  }

  Future<void> restoreLolIdleGame() async {
    final partie = await loadGameState(widget.gameTypeId);
    if (partie != null) {
      final mots = List<String>.from(partie['tabDeMotEssayer']);

      List<List<String>> couleurStr = [];
      for (int i = 0; i < mots.length; i++) {
        final guess = mots[i];
        // Appel API sans user (anonyme)
        final url = Uri.parse('http://10.0.2.2:5000/guess/${widget.gameTypeId}');
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            "guess": guess,
            "guess_number": i + 1,
          }),
        );
        if (response.statusCode == 200) {
          final res = jsonDecode(response.body);
          // Résultat attendu : {'colors': ['green','orange','red',...]}
          final colorsForGuess = (res['colors'] as List).map((c) => c.toString()).toList();
          couleurStr.add(colorsForGuess);
        } else {
          // En cas d'erreur, on met des couleurs neutres (gris)
          couleurStr.add(List.filled(attributes.length, 'grey'));
        }
      }

      setState(() {
        guessNames = List.generate(maxAttempts, (i) => i < mots.length ? mots[i] : "");
        colors = List.generate(
          maxAttempts,
              (i) => i < couleurStr.length
              ? couleurStr[i].map(colorFromString).toList()
              : List.filled(attributes.length, Colors.grey.shade800),
        );
        currentAttempt = mots.length;
        for (int i = 0; i < mots.length; i++) {
          final sol = solutions.firstWhere(
                  (s) => s['solution'].toLowerCase() == mots[i].toLowerCase(),
              orElse: () => {});
          guessDatas[i] = sol.isNotEmpty ? sol : null;
        }
        // RESTAURE AUSSI L'ÉTAT DE FIN DE PARTIE :
        isGameOver = (partie['finished'] == true);   // <------ AJOUTE CETTE LIGNE
        print("LolIdle RESTORE: mots = $mots | couleurs = $couleurStr | isGameOver = $isGameOver");
      });
    } else {
      setState(() {
        guessNames = List.filled(maxAttempts, "");
        colors = List.generate(maxAttempts, (_) => List.filled(attributes.length, Colors.grey.shade800));
        currentAttempt = 0;
        guessDatas = List.filled(maxAttempts, null);
      });
    }
  }




  @override
  void initState() {
    super.initState();
    _loadUser().then((_) async {
      await fetchChallengeData();
      await restoreLolIdleGame();
    });
  }

  Future<void> fetchChallengeData() async {
    final url = Uri.parse('http://10.0.2.2:5000/challenges/${widget.gameTypeId}');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data is Map && data.containsKey('challenges')) {
        final List challenges = data['challenges'];
        final List<Map<String, dynamic>> sol = challenges
            .map<Map<String, dynamic>>((item) => {
          'solution': item['solution'] as String,
          'data': item['data']
        })
            .toList();

        print('Solutions List: $sol'); // Debug print solutions list

        if (challenges.isNotEmpty) {
          final challengeData = challenges.first['data'];
          if (challengeData is Map) {
            final keys = challengeData.keys.map((k) => k.toString()).toList();
            print('Attributes keys: $keys'); // Debug print keys

            setState(() {
              solutions = sol;
              attributes = keys;
              attributeCount = attributes.length;

              // uniquement si vide
              colors = colors.isEmpty
                  ? List.generate(maxAttempts, (_) => List.filled(attributeCount, Colors.grey.shade800))
                  : colors;

              guessDatas = guessDatas.isEmpty
                  ? List.filled(maxAttempts, null)
                  : guessDatas;

              guessNames = guessNames.isEmpty
                  ? List.filled(maxAttempts, '')
                  : guessNames;
            });
          }
        }
      } else {
        print('Erreur de format ou données manquantes');
      }
    } else {
      print('Erreur API : ${response.statusCode}');
    }
  }



  List<Map<String, dynamic>> getSuggestions(String input) {
    final lower = input.toLowerCase();
    return solutions
        .where((sol) => sol['solution'].toLowerCase().startsWith(lower))
        .toList();
  }

  Future<void> submitGuessLol(String guess) async {
    final isConnected = (username != null && username!.isNotEmpty && token != null && token!.isNotEmpty);
    final url = isConnected
        ? Uri.parse('http://10.0.2.2:5000/guess/${widget.gameTypeId}/$username')
        : Uri.parse('http://10.0.2.2:5000/guess/${widget.gameTypeId}');

    final response = await http.post(
      url,
      headers: isConnected
          ? {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      }
          : {'Content-Type': 'application/json'},
      body: jsonEncode({
        "guess": guess,
        "guess_number": currentAttempt + 1,
      }),
    );

    if (response.statusCode == 200) {
      final res = jsonDecode(response.body);

      // On prépare la détection de victoire/fin de partie AVANT le setState
      bool hasWon = res['correct'] == true || res['win'] == true;
      int nextAttempt = currentAttempt + 1;
      bool gameOver = hasWon || nextAttempt >= maxAttempts;

      setState(() {
        final solution = solutions.firstWhere(
              (s) => s['solution'].toLowerCase() == guess.toLowerCase(),
        );
        guessDatas[currentAttempt] = solution;
        guessNames[currentAttempt] = guess;

        final colorsRow = (res['colors'] as List).map((c) => c.toString()).toList();
        colors[currentAttempt] = colorsRow.map(colorFromString).toList();

        currentAttempt = nextAttempt;
        isGameOver = gameOver;
        print("Guess SUBMITTED: $guess ($currentAttempt), isGameOver = $isGameOver");
      });

      print("Sauvegarde: finished = $gameOver | hasWon = $hasWon");

      // Utilise les variables calculées, PAS celles du state qui ne seront mises à jour qu'après build !
      await saveGameState(
        gameTypeId: widget.gameTypeId,
        nombreEssaie: nextAttempt,
        tabDeMotEssayer: guessNames.sublist(0, nextAttempt),
        finished: gameOver,
        hasWon: hasWon,
      );
    }
  }


  Color colorFromString(String c) {
    switch (c) {
      case 'green':
        return Colors.green;
      case 'orange':
        return Colors.orange;
      case 'red':
        return Colors.red;
      default:
        return Colors.grey.shade700;
    }
  }

  Widget buildAutocompleteBar() {
    return Autocomplete<Map<String, dynamic>>(
      optionsBuilder: (TextEditingValue value) {
        if (value.text.isEmpty) return const Iterable<Map<String, dynamic>>.empty();
        return getSuggestions(value.text);
      },
      displayStringForOption: (opt) => opt['solution'],
      fieldViewBuilder: (context, controllerField, focusNode, onEditingComplete) {
        controller = controllerField;
        return TextField(
          controller: controllerField,
          focusNode: focusNode,
          style: TextStyle(color: Colors.white, fontSize: 20),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.grey.shade900,
            hintText: 'Écris un nom de champion...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            hintStyle: TextStyle(color: Colors.grey[400]),
          ),
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            color: Colors.grey[900],
            elevation: 8,
            child: Container(
              width: MediaQuery.of(context).size.width - 32,
              constraints: BoxConstraints(maxHeight: 250),
              child: ListView.builder(
                itemCount: options.length,
                itemBuilder: (context, index) {
                  final option = options.elementAt(index);
                  return ListTile(
                    leading: option['avatar'] != null
                        ? Image.network(option['avatar'], width: 36, height: 36)
                        : CircleAvatar(child: Text(option['solution'][0].toUpperCase())),
                    title: Text(option['solution'], style: TextStyle(color: Colors.white)),
                    onTap: () {
                      onSelected(option);
                    },
                  );
                },
              ),
            ),
          ),
        );
      },
      onSelected: (selected) {
        controller.text = selected['solution'];
      },
    );
  }

  Widget buildGrid() {
    return Column(
      children: [
        Row(
          children: attributes
              .map((attr) => Expanded(
              child: Container(
                height: 34,
                decoration: BoxDecoration(
                  color: Colors.white54,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                alignment: Alignment.center,
                child: Text(attr,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              )))
              .toList(),
        ),
        SizedBox(height: 8),
        for (int attempt = 0; attempt < currentAttempt; attempt++)
          Row(
            children: [
              for (int i = 0; i < attributeCount; i++)
                Expanded(
                  child: Container(
                    height: 46,
                    margin: EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: colors[attempt][i],
                      border: Border.all(color: Colors.white, width: 1),
                    ),
                    alignment: Alignment.center,
                    child: guessDatas[attempt] != null && guessNames[attempt].isNotEmpty
                        ? buildCellContent(guessDatas[attempt]!, attributes[i])
                        : null,
                  ),
                ),
            ],
          ),
      ],
    );
  }

  Widget buildCellContent(Map<String, dynamic> champ, String attr) {
    final challengeData = champ['data'] is String
        ? jsonDecode(champ['data'])
        : champ['data'];
    final value = challengeData[attr];

    if (attr == attributes.first && champ['avatar'] != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.network(champ['avatar'], width: 32, height: 32),
          SizedBox(height: 2),
          Text(champ['solution'],
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 10)),
        ],
      );
    }

    String displayValue = "";
    if (value is String) {
      displayValue = value;
    } else if (value is List) {
      displayValue = value.join(", ");
    } else if (value is Map) {
      displayValue = jsonEncode(value);
    } else if (value != null) {
      displayValue = value.toString();
    }

    return Text(
      displayValue,
      textAlign: TextAlign.center,
      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
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
      body: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            buildAutocompleteBar(),
            SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                icon: Icon(Icons.arrow_forward, color: Colors.white, size: 36),
                onPressed: isGameOver || currentAttempt >= maxAttempts
                    ? null
                    : () {
                  if (solutions.any((s) => s['solution'].toLowerCase() == controller.text.toLowerCase())) {
                    submitGuessLol(controller.text);
                    controller.clear();
                  }
                },
              ),
            ),
            SizedBox(height: 20),
            Expanded(child: SingleChildScrollView(child: buildGrid())),
          ],
        ),
      ),
    );
  }
}
