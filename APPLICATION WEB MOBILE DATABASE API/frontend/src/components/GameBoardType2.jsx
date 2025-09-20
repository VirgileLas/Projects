import { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext.jsx";
import Cookies from "js-cookie";
import request from "./API.js";
import "./components2.css";
import { use } from "react";

export default function GameBoardType2({ gameTypeId }) {
    const { user, loading } = useContext(AuthContext);
    const [characters, setCharacters] = useState([]);
    const [guessList, setGuessList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredChars, setFilteredChars] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchcharacters = async () => {
            const data = await request(`challenges/${gameTypeId}`);
            setCharacters(data.challenges);
        };

        fetchcharacters();
    }, [gameTypeId]);

    useEffect(() => {
        if (loading) return;

        const restoreGameFromDatabase = async (gameTypeId) => {
            const data = await request("restore/" + gameTypeId + "/" + user.username, { method: "GET" });
            if (data.success) {
                console.log(data.guesses)
                for (let i = 0; i < data.guesses.length; i++) { // Set the grid to the guesses from the database
                    if (await verifyGuess({"solution" : data.guesses[i].guess})) {
                        setGameOver(true);
                        setShowPopup(true);
                        return;
                    }
                }
            }
            else {
                console.error("Failed to restore game:", data.message); // debug
            }
        };

        const restoreGameFromCookies = async (gameTypeId) => {
            const guesses = JSON.parse(Cookies.get(gameTypeId) || "[]"); // Get the guesses from the cookies
            console.log(guesses); // debug
            for (let i = 0; i < guesses.length; i++) { // Set the grid to the guesses from the cookies
                if (await verifyGuess({"solution" :guesses[i]})) {
                    setGameOver(true);
                    setShowPopup(true);
                    return;
                }
            }
        };

        const restoreGame = async () => {
            if (user) {
                await restoreGameFromDatabase(gameTypeId);
            } else {
                await restoreGameFromCookies(gameTypeId);
            }
        }
        restoreGame();

    }, [user, loading, gameTypeId]);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredChars([]);
        } else {
            const guessedNames = guessList.map((g) => g.nom);
            setFilteredChars(
                characters
                    .filter((char) => !guessedNames.includes(char.solution))
                    .filter((char) =>
                        char.solution.toLowerCase().startsWith(searchTerm.toLowerCase())
                    )
            );
        }
    }, [searchTerm, characters, guessList]);



    const verifyGuess = async (character) => {
        const data = await request(`guess/${gameTypeId}`, {
            method: "POST",
            body: JSON.stringify({ guess: character.solution }),
        });

        if (data.success) {
            setGuessList((prev) => [...prev, { nom: character.solution, colors: data.colors }]);
            console.log("Guess verified:", data.colors);
            if (data.colors.every((c) => c === "green")) {
                setGameOver(true);
                setShowPopup(true);
            }
        } else {
            console.error("Failed to verify guess:", data.message);
        }

        setSearchTerm("");
    };

    const sendGuess = async (character) => {
        const data = await request("guess/" + gameTypeId + "/" + user.username, { method: "POST", body: JSON.stringify({ guess: character.solution, guess_number: guessList.length+1 }) });
        if (data.success) {
            setGuessList((prev) => [...prev, { nom: character.solution, colors: data.colors }]);
            console.log("Guess verified:", data.colors);
            if (data.colors.every((c) => c === "green")) {
                setGameOver(true);
                setShowPopup(true);
            }
        } else console.error("Failed to send guess..."); //debug
        setSearchTerm("");
    }

    const saveGuessToCookies = (character) => {
        const key = `${gameTypeId}`;
        let guesses = JSON.parse(Cookies.get(key) || "[]");
        guesses.push(character.solution);
        Cookies.set(key, JSON.stringify(guesses), { expires: 1 }); // Cookie pour 1 jour
      };

    const handleGuess = async (character) => {
        if (gameOver) return;

        // Check if the character is already guessed
        const alreadyGuessed = guessList.some((g) => g.nom === character.solution);
        if (alreadyGuessed) {
            console.warn("Character already guessed:", character.solution);
            return;
        } 

        if (!user){
            await verifyGuess(character);
            saveGuessToCookies(character);
        } else {
            console.log("Sending guess to server:", character.solution);
            await sendGuess(character);
        }
    }

    return (
        <>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Type character name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={gameOver}
                />
                {filteredChars.length > 0 && !gameOver && (
                    <ul className="autocomplete-list">
                        {filteredChars.map((char) => (
                            <li
                                key={char.id}
                                onClick={async () => await handleGuess(char)}
                                className="autocomplete-item"
                            >
                                <span>{char.solution}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="guess-grid">
                {characters[0]?.data && (
                    <div className="guess-row header">
                        {Object.keys(characters[0].data).map((attribute, i) => (
                            <div key={i} className="guess-cell header-cell">
                                {attribute}
                            </div>
                        ))}
                    </div>
                )}
                {guessList.map((guess, idx) => {
                    const char = characters.find((c) => c.solution === guess.nom);
                    const attributes = Object.keys(characters[0].data);
                    return (
                        <div key={idx} className="guess-row">
                            {guess.colors.map((color, i) => (
                                <div key={i} className={`guess-cell ${color}`}>
                                    {char.data[attributes[i]]}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {gameOver && showPopup && (
                <div className="popup-container">
                    <div className="popup">
                        <p className="m-1 p-2 text-emerald-600 font-extrabold " >You won!</p>
                        <button className="m-1 p-2 text-blue-500 font-extrabold cursor-pointer" onClick={() => setShowPopup(false)}>Close</button>
                    </div>
                </div>)
            }

        </>
    );
}
