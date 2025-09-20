import React, { useState, useContext } from "react";
import AuthContext from "../AuthContext.jsx";
import { data } from "react-router-dom";
import request from './API.js';

export default function TemplateCreationForm({ template }) {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({ name: "", wordSize: "" , maxTries: "", wordList: "", image: null, description: "" });
    const [attributes, setAttributes] = useState(["nom"]);
    const [newAttr, setNewAttr] = useState("");
    const [attributesLocked, setAttributesLocked] = useState(false);
    const [characters, setCharacters] = useState([]);
    const [currentCharacter, setCurrentCharacter] = useState({});

    const addAttribute = () => {
        if (attributesLocked) return;
        const attr = newAttr.trim();
        if (attr && !attributes.includes(attr)) {
            setAttributes([...attributes, attr]);
            setNewAttr("");
        }
    };

    const addCharacter = () => {
        if (attributes.every(attr => currentCharacter[attr])) {
            setCharacters([...characters, currentCharacter]);
            setCurrentCharacter({});
        } else {
            alert("Remplis tous les champs pour ce personnage.");
        }
    };

    const handleCharInput = (e) => {
        setCurrentCharacter({ ...currentCharacter, [e.target.name]: e.target.value });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // On transforme la liste de mots type (mot1 \n mot2 \n mot3) en tableau si jamais wordList existe (donc dans le cas du wordle)
        const words = form.wordList
            ?.split("\n")
            .map((w) => w.trim())
            .filter((w) => w.length > 0);

        const duplicates = words ? words.filter((w, i) => words.indexOf(w) !== i) : 0;
        if (duplicates.length > 0) {
            alert("Mots en double trouvés! Veuillez les supprimer.");
            return;
        }

        // On vérifie que tous les mots ont la bonne taille (dans le cas du wordle)
        const expectedLength = parseInt(form.wordSize);
        if (words && words.some((w) => w.length !== expectedLength)) {
            alert(`All words must be exactly ${expectedLength} letters long.`);
            return;
        }

        // Création du FormData pour l'envoi à l'API
        let formData = new FormData();
        formData.append("name", form.name);
        formData.append("template_id", template.id);
        formData.append("description", form.description || "");
        formData.append("number_of_guesses", form.maxTries || -1); // -1 si infini
        formData.append("data_schema", JSON.stringify(template.id === 1 ? ["nom", "wordSize"] : attributes));
        formData.append("wordSize", template.id === 1 ? parseInt(form.wordSize) : null);

        let gameTypeId = null;

        if (form.image) {
            formData.append("image", form.image);
        }

        try {
            const donnees = (await request(`create_game_type/${template.id}/${user.username}`, {
                method: "POST",
                body: formData,
            }));
            gameTypeId = donnees.gameTypeId;
            console.log("data:", donnees); //debug 

            if (donnees.success) {
                alert("Game mode created successfully!");
            } else {
                alert("Error: " + donnees.message);
                console.error("Error creating game type:", donnees.message); //debug
                return;
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Something went wrong.");
        }

        formData = new FormData();
        formData.append("data", JSON.stringify(template.id === 1 ? words.map(w => ({ nom: w, wordSize: parseInt(form.wordSize) })) : characters));
        formData.append("solutions", JSON.stringify(template.id === 1 ? words : characters.map(char => char.nom)))
        console.log("Characters:", characters); //debug
        console.log("solutions", characters.map(char => char.nom)) //debug
        console.log("Sending FormData:");
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const data = await request("add_challenges/" + gameTypeId, {
                method: "POST",
                body: formData,
            });

            if (data.success) {
                alert("Challenges created successfully!");
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Something went wrong.");
        }
    };


    return (
        <form onSubmit={handleSubmit} className="template-container">
            <h2 className="text-xl font-bold mb-4">Create your mode: {template.name}</h2>
            {template.id === 1 && <p className="text-sm mb-2 text-gray-400">La taille et le nombre d'essais doivent être entre 4 et 10. Rajouter les mots les uns après les autres dans un colonne. Il faut ajouter au moins 5 mots.</p>}
            {template.id === 2 && <p className="text-sm mb-2 text-gray-400">Il faut rajouter au moins 5 attributs et 5 personnages pour pouvoir crée le mode de jeu.</p>}
            <input
                name="name"
                placeholder="Game Mode Name"
                onChange={handleChange}
                required
                className="m-1 p-2 w-full rounded"
            />

            <textarea
                name="description"
                placeholder="Description du mode de jeu"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="m-1 p-2 w-full rounded bg-black bg-opacity-20 text-white"
            />

            {template.id === 1 && (
                <>
                    <input
                        name="wordSize"
                        type="number"
                        placeholder="Word size"
                        value={form.wordSize}
                        onChange={handleChange}
                        required
                        min={4}
                        max={10}
                        className="m-1 p-2 w-full rounded"
                    />
                    <input
                        name="maxTries"
                        type="number"
                        placeholder="Max tries"
                        onChange={handleChange}
                        required
                        min={4}
                        max={10}
                        className="m-1 p-2 w-full rounded"
                    />
                    <textarea
                        name="wordList"
                        placeholder="Enter possible words, one per line"
                        rows={5}
                        onChange={handleChange}
                        className="m-1 p-2 w-full rounded bg-black bg-opacity-20 text-white"
                    />
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                        className="m-1 p-2 w-full rounded bg-black bg-opacity-20 text-white"
                    />

                </>
            )}

            {template.id === 2 && (
                <>
                    <h3 className="text-lg font-bold">Attributs</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newAttr}
                            placeholder="ex: taille"
                            onChange={(e) => setNewAttr(e.target.value)}
                            disabled={attributesLocked}
                            className="p-1 rounded bg-gray-800 text-white"
                        />
                        <button
                            type="button"
                            onClick={addAttribute}
                            disabled={attributesLocked}
                            className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>

                    <h3 className="text-lg font-bold">Ajouter un personnage</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attributes.map(attr => (
                            <input
                                key={attr}
                                name={attr}
                                placeholder={attr}
                                value={currentCharacter[attr] || ""}
                                onChange={handleCharInput}
                                className="p-1 rounded"
                            />
                        ))}
                    </div>
                    {!attributesLocked && attributes.length >= 5 && (
                        <button
                            type="button"
                            className="px-2 py-1 bg-green-600 text-white rounded mt-2"
                            onClick={() => setAttributesLocked(true)}
                        >
                            Valider les attributs
                        </button>
                    )}
                    {attributesLocked && (
                        <button
                            type="button"
                            onClick={addCharacter}
                            className={'mt-2 px-2 py-1 rounded text-white bg-green-600 hover:bg-green-700 cursor-pointer'}
                        >
                            Ajouter personnage
                        </button>
                    )}

                    <ul className="text-sm mt-2">
                        {characters.map((char, i) => (
                            <li key={i}>{JSON.stringify(char)}</li>
                        ))}
                    </ul>

                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                        className="m-1 p-2 w-full rounded bg-black bg-opacity-20 text-white"
                    />

                </>
            )}

            {characters.length >= 5 && (
                <button
                    type="submit"
                    className={"m-2 p-2 bg-white text-black font-bold rounded"}
                >
                    Create Mode
                </button>
            )}
            {form.wordList && ((form.wordList.split("\n")).filter(line => line.trim() !== "")).length >= 5 && (
                <button
                    type="submit"
                    className={"m-2 p-2 bg-white text-black font-bold rounded"}
                >
                    Create Mode
                </button>
            )}
        </form >
    );
}
