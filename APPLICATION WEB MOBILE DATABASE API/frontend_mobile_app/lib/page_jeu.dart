import 'package:flutter/material.dart';
import 'package:sle_app/API_fnc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class PageJeu extends StatefulWidget {
  final int gameTypeId;
  final int maxAttempts;
  final int wordLength;

  PageJeu({
    required this.gameTypeId,
    this.maxAttempts = 5,
    this.wordLength = 5,
  });

  @override
  State<PageJeu> createState() => _PageJeuState();
}

class _PageJeuState extends State<PageJeu> {
  List<String> guesses = [];
  List<List<Color>> colors = [];
  String currentGuess = "";
  bool isLoading = false;
  bool hasWon = false;
  String? username;
  String? token;
  bool isFinished = false;

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final String? sessionJson = prefs.getString('user_session');
    if (sessionJson != null) {
      final session = jsonDecode(sessionJson);
      username = session['username'];
      token = session['token'];
      print('token relu: $token');
    }
  }


  Future<void> _restoreGame() async {
    final partie = await loadGameState(widget.gameTypeId);
    if (partie != null) {
      List<String> mots = List<String>.from(partie['tabDeMotEssayer']);
      // On appelle l’API pour chaque guess
      List<List<String>> couleurStr = await fetchColorsForGuesses(widget.gameTypeId, mots);

      setState(() {
        guesses = List.generate(widget.maxAttempts, (i) => i < mots.length ? mots[i].toUpperCase() : "");
        colors = List.generate(widget.maxAttempts, (i) => i < couleurStr.length
            ? couleurStr[i].map(_stringToColor).toList()
            : List.filled(widget.wordLength, Colors.white));
        hasWon = partie['hasWon'] == true;
        currentGuess = "";
        isFinished = partie['finished'] == true;
      });
    } else {
      // Partie vierge
      setState(() {
        guesses = List.generate(widget.maxAttempts, (_) => "");
        colors = List.generate(widget.maxAttempts, (_) => List.filled(widget.wordLength, Colors.white));
        hasWon = false;
        currentGuess = "";
      });
    }
  }


  Color _stringToColor(String color) {
    switch (color) {
      case "green":
        return Colors.green;
      case "orange":
        return Colors.orange;
      case "gray":
        return Colors.grey;
      case "red":
        return Colors.red;
      default:
        return Colors.white;
    }
  }

  String _colorToString(Color color) {
    if (color == Colors.green) return "green";
    if (color == Colors.orange) return "orange";
    if (color == Colors.grey) return "gray";
    if (color == Colors.red) return "red";
    return "white";
  }

  @override
  void initState() {
    super.initState();
    _loadUser();
    _restoreGame();
    guesses = List.generate(widget.maxAttempts, (_) => "");
    colors = List.generate(widget.maxAttempts, (_) => List.filled(widget.wordLength, Colors.white));
  }

  void onLetterPressed(String letter) {
    if (isFinished) return;
    setState(() {
      if (currentGuess.length < widget.wordLength && !hasWon) {
        currentGuess += letter;
      }
    });
  }

  void onBackspace() {
    setState(() {
      if (currentGuess.isNotEmpty && !hasWon) {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
      }
    });
  }

  Future<void> onSubmit() async {
    if (currentGuess.length != widget.wordLength || isLoading || hasWon|| isFinished) return;
    setState(() => isLoading = true);

    try {
      // Envoie le guess à l’API
      print('token utilisé pour submitGuess: $token');
      final response = await submitGuess(
        gameTypeId: widget.gameTypeId,
        guess: currentGuess,
        guessNumber: guesses.indexWhere((g) => g.isEmpty) + 1,
        username: username,
        token: token,
      );


      final colorsFromApi = (response['colors'] as List)
          .map((color) => color == "green"
          ? Colors.green
          : color == "orange"
          ? Colors.orange
          : color == "gray"
          ? Colors.grey
          : Colors.red)
          .toList();

      int lineIndex = guesses.indexWhere((g) => g.isEmpty);
      if (lineIndex != -1) {
        // On prépare les variables à jour AVANT setState
        final updatedGuesses = List<String>.from(guesses);
        updatedGuesses[lineIndex] = currentGuess.toUpperCase();

        final updatedColors = List<List<Color>>.from(colors);
        updatedColors[lineIndex] = List<Color>.from(colorsFromApi);

        //On met à jour l’UI
        setState(() {
          guesses = updatedGuesses;
          colors = updatedColors;
          currentGuess = "";
          hasWon = response['correct'] == true;
        });

        // On sauvegarde l’état local (en utilisant les variables à jour)
        await saveGameState(

          gameTypeId: widget.gameTypeId,
          nombreEssaie: updatedGuesses.where((g) => g.isNotEmpty).length,
          tabDeMotEssayer: updatedGuesses.where((g) => g.isNotEmpty).toList(),
          finished: true,
          hasWon: response['correct'] == true,
        );

        //On détecte la victoire ou la défaite
        final essaisUtilises = updatedGuesses.where((g) => g.isNotEmpty).length;

        if (response['correct'] == true) {
          print('${token}');
          if (username != null && token != null) {
            print('victoire');
          }
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              title: Text('Bravo !'),
              content: Text('Tu as trouvé le mot !'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('OK'),
                ),
              ],
            ),
          );
        } else if (essaisUtilises == widget.maxAttempts) {
          if (username != null && token != null) {
            await updateUserStatsAPI(
              username: username!,
              token: token!,
              played_game: 1,
              won_game: 0,
            );
          }
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              title: Text('Perdu !'),
              content: Text('Tu as utilisé tous tes essais'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur : $e')),
      );
    }

    setState(() => isLoading = false);
  }


  List<Color> getRowColors(int rowIndex) => colors[rowIndex];

  @override
  Widget build(BuildContext context) {
    double caseWidth = MediaQuery.of(context).size.width / (widget.wordLength + 2);

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
      body: LayoutBuilder(
        builder: (context, constraints) {
          return Column(
            children: [
              Spacer(flex: 2),

              // Grille de jeu
              Column(
                children: List.generate(widget.maxAttempts, (rowIndex) {
                  List<Color> rowColors = getRowColors(rowIndex);
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(widget.wordLength, (index) {
                      String letter = guesses[rowIndex].length > index ? guesses[rowIndex][index] : "";
                      // Affiche la lettre tapée en direct si c’est la ligne en cours
                      if (rowIndex == guesses.indexWhere((g) => g.isEmpty) && index < currentGuess.length) {
                        letter = currentGuess[index];
                      }
                      return Container(
                        width: caseWidth,
                        height: caseWidth,
                        alignment: Alignment.center,
                        margin: EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: rowColors[index],
                          border: Border.all(color: Colors.black, width: 2),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          letter,
                          style: TextStyle(fontSize: caseWidth / 2, fontWeight: FontWeight.bold),
                        ),
                      );
                    }),
                  );
                }),
              ),

              Spacer(flex: 2),

              // Clavier et bouton
              Column(
                children: [
                  buildKeyboard(),
                  SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: onSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white54,
                    ),
                    child: isLoading
                        ? CircularProgressIndicator()
                        : Text("Valider", style: TextStyle(color: Colors.black)),
                  ),
                  SizedBox(height: 50),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Widget buildKeyboard() {
    List<String> letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 4,
      runSpacing: 4,
      children: letters
          .map((letter) => ElevatedButton(
        onPressed: () => onLetterPressed(letter),
        style: ElevatedButton.styleFrom(
          shape: CircleBorder(),
          backgroundColor: Colors.white54,
          padding: EdgeInsets.all(10),
          minimumSize: Size(40, 40),
        ),
        child: Text(letter, style: TextStyle(fontSize: 16, color: Colors.black)),
      ))
          .toList()
        ..add(ElevatedButton(
          onPressed: onBackspace,
          style: ElevatedButton.styleFrom(
            shape: CircleBorder(),
            backgroundColor: Colors.white54,
            padding: EdgeInsets.all(10),
            minimumSize: Size(40, 40),
          ),
          child: Icon(Icons.backspace, color: Colors.black, size: 16),
        )),
    );
  }
}
