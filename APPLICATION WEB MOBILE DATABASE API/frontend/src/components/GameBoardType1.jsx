import { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext.jsx";
import Cookies from "js-cookie";
import "./components.css";
import request from "./API.js"

export default function GameBoardType1({ gameTypeId }) {
  const [wordLength, setWordLength] = useState(5);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const { user, loading } = useContext(AuthContext);
  const [grid, setGrid] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [colors, setColors] = useState([]);
  const [gameStatus, setGameStatus] = useState("on-going");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchGameTypeData() {
      const data = await request("game_type_info/" + gameTypeId, { method: "GET" });
      setWordLength(data.wordSize);
      setMaxGuesses(data.number_of_guesses);
      console.log("Game Type Data:", data); // debug

    }
    fetchGameTypeData();
  }, [gameTypeId]);

  useEffect(() => {
    console.log("Max Guesses:", maxGuesses); // debug
    console.log("Word Length:", wordLength); // debug
    console.log("Game Type ID:", gameTypeId); // debug
    if (!gameTypeId) return;
    const initialize = async () => {
      // 1. Charger les infos du type de jeu
      const config = await request("game_type_info/" + gameTypeId, { method: "GET" });
      setWordLength(config.wordSize);
      setMaxGuesses(config.number_of_guesses);

      // 2. Attendre que les infos soient prêtes pour continuer
      const emptyGrid = Array(config.number_of_guesses).fill("").map(() => Array(config.wordSize).fill(""));
      setGrid(emptyGrid);
      setColors(emptyGrid.map(row => row.map(() => "")));

      // 3. Restaurer les données (en base ou cookies)
      if (loading) return;

      const restoreGameFromDatabase = async () => {
        const data = await request("restore/" + gameTypeId + "/" + user.username, { method: "GET" });
        if (data.success) {
          console.log(data.guesses)
          for (let i = 0; i < data.guesses.length; i++) { // Set the grid to the guesses from the database
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              newGrid[i] = data.guesses[i].guess.split("");
              return newGrid;
            });
            if (await verifyGuess(i, data.guesses[i].guess)) {
              setGameStatus("won");
              setShowPopup(true);
              return;
            }
            else if (i === maxGuesses - 1) {
              setGameStatus("lost");
              setShowPopup(true);
              return;
            }
          }
          setCurrentRow(data.guesses.length); // Set the current row to the length of guesses
          setCurrentWord("");
        }
        else {
          console.error("Failed to restore game:", data.message); // debug
        }
      };

      // Function to get the guesses from the cookies if the user is not logged in
      const restoreGameFromCookies = async () => {
        const guesses = JSON.parse(Cookies.get(gameTypeId) || "[]"); // Get the guesses from the cookies
        console.log(guesses); // debug
        for (let i = 0; i < guesses.length; i++) { // Set the grid to the guesses from the cookies
          console.log("Restoring guess:", guesses[i]); // debug
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            newGrid[i] = guesses[i].split("");
            console.log("Current grid:", grid); // debug
            return newGrid;
          });
          if (await verifyGuess(i, guesses[i])) {
            setGameStatus("won");
            setShowPopup(true);
            return;
          }
          else if (i === maxGuesses - 1) {
            setGameStatus("lost");
            setShowPopup(true);
            return;
          }
        }
        setCurrentRow(guesses.length); // Set the current row to the length of guesses
        setCurrentWord("");
      };

      if (user) {
        await restoreGameFromDatabase();
      } else {
        await restoreGameFromCookies();
      }
    };

    initialize();
  }, [user, loading, gameTypeId]);

  // Function to send and save the guess to the database if the user is logged in
  const sendGuess = async () => {
    const data = await request("guess/" + gameTypeId + "/" + user.username, { method: "POST", body: JSON.stringify({ guess: currentWord, guess_number: currentRow + 1 }) });
    if (data.success) {
      setColors((prevColors) => {
        const newColors = [...prevColors]; // Copy previous colors
        newColors[currentRow] = data.colors; // Update only the current row
        return newColors;
      });
      return data.correct;
    }
    else console.error("Failed to send guess..."); //debug
  }

  // Function to verify the guess if the user is not logged in
  const verifyGuess = async (row, word,) => {
    const data = await request("guess/" + gameTypeId, { method: "POST", body: JSON.stringify({ guess: word }) });
    console.log(data.colors); //debug
    if (data.success) {
      setColors((prevColors) => {
        const newColors = [...prevColors]; // Copy previous colors
        newColors[row] = data.colors; // Update only the current row
        return newColors;
      });
      return data.correct;
    }
    else console.error("Failed to verify guess..."); //debug
  }

  // Function to save the guess to the cookies if the user is not logged in
  const saveGuessToCookies = (guess) => {
    const key = `${gameTypeId}`;
    let guesses = JSON.parse(Cookies.get(key) || "[]");

    if (guesses.length >= maxGuesses) return;

    guesses.push(guess);
    Cookies.set(key, JSON.stringify(guesses), { expires: 1 }); // Cookie pour 1 jour
  };

  // Handle Key Press from Keyboard
  const handleKeyPress = async (key) => {
    if (!gameTypeId) {
      console.error("gameTypeId is undefined");
      return;
    }
    if (gameStatus !== "on-going") return; // Stop listening after game ends
    var correct = false; // Variable to store if the guess was correct or not
    key = key.toUpperCase(); // Ensure uppercase letters
    if (currentRow >= maxGuesses) {
      setGameStatus("lost");
      setShowPopup(true);
      return; // Stop when all rows are filled
    }
    if (key === "BACKSPACE" || key === "←") {
      setCurrentWord((prev) => prev.slice(0, -1)); // Remove last letter on backspace
    } else if (key === "ENTER" && currentWord.length === wordLength) {
      if (user !== null) {
        correct = await sendGuess()
      } else {
        correct = await verifyGuess(currentRow, currentWord);
        saveGuessToCookies(currentWord);
      }
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[currentRow] = [...currentWord];
        return newGrid;
      });
      if (correct) {
        setGameStatus("won");
        setShowPopup(true);
        return;
      } // Stop if the guess was correct
      setCurrentWord("");
      setCurrentRow((prev) => prev + 1);
    } else if (/^[A-Z]$/.test(key) && currentWord.length < wordLength) {
      setCurrentWord((prev) => prev + key);
    }
  };

  // Listen for physical keyboard input
  useEffect(() => {
    if (gameStatus !== "on-going") return; // Stop listening after game ends

    const handleKeyDown = (event) => {
      handleKeyPress(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord]);

  const getTileClass = (letter, rowIndex, index) => {
    if (letter === "") return "tile";
    if (colors[rowIndex][index] === "green") return "tile correct";
    if (colors[rowIndex][index] === "orange") return "tile present";
    return "tile absent";
  };

  return (
    <>
      {/* Word Grid */}
      <div className="grid-container">
        {grid.map((guess, rowIndex) => (
          <div key={rowIndex} className="word-row">
            {[...Array(wordLength)].map((_, colIndex) => (
              <div key={colIndex} className={getTileClass(guess[colIndex], rowIndex, colIndex)}>
                {guess[colIndex] || (rowIndex === currentRow ? currentWord[colIndex] || "" : "")}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="keyboard">
        {[
          ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
          ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
          ["←", "W", "X", "C", "V", "B", "N", "ENTER"]
        ].map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`key ${key === "←" ? "delete" : key === "ENTER" ? "enter" : ""}`}
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Game Status */}
      {gameStatus === "won" && showPopup && (
        <div className="popup-container">
          <div className="popup">
            <p className="m-1 p-2 text-emerald-600 font-extrabold " >You won!</p>
            <button className="m-1 p-2 text-blue-500 font-extrabold cursor-pointer" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>)
      }
      {gameStatus === "lost" && showPopup && (
        <div className="popup-container">
          <div className="popup">
            <p className="m-1 p-2 text-red-600 font-extrabold">You lost!</p>
            <button className="m-1 p-2 text-blue-500 font-extrabold cursor-pointer" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>)
      }
    </>
  );
}
