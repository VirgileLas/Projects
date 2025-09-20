import "./pages.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from "../components/BottomNav.jsx";
import request from "../components/API.js"

export default function HomePage() {
  const [gameTypes, setGameTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameTypes = async () => {
      try {
        const data = await request('game_types');
        setGameTypes(data.gameTypes || []);
      } catch (error) {
        console.error('Error fetching game types:', error);
      }
    };
    fetchGameTypes();
  }, []);

  const handleClick = (gameTypeId) => {
    navigate(`/game/${gameTypeId}`);  // ← redirige vers GamePage template spécifique
  };

  return (
    <>
      <div className="app-container">
        <header>
          <img src="/logo.svg" alt="Logo" style={{ height: "60px", width: "auto", background: "transparent" }} />
        </header>
        <h2 className="text-2xl font-bold mb-6">Choose a Game Mode</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4">
          {gameTypes.length > 0 && gameTypes.map((game) => (
            <button
              key={game.id}
              onClick={() => handleClick(game.id)}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-black font-semibold py-4 px-2 rounded-xl backdrop-blur-md border border-white border-opacity-20 shadow-md transition duration-200 transform hover:scale-105 flex flex-col items-center"
            >
              {game.image && (
                <img
                  src={`data:image/png;base64,${game.image}`}
                  alt={game.name}
                  className="w-full h-32 object-cover rounded-xl mb-2 shadow"
                />
              )}
              <p className="text-sm text-black opacity-80">{game.name}</p>
            </button>
          ))}
        </div>
        {gameTypes.length === 0 && (
          <div className="mt-[200px] flex flex-col items-center justify-center">
            <p className="text-white text-center">No game modes available at the moment.</p>
          </div>
        )}
        <main>

        </main>
        <BottomNav />
      </div>
    </>
  )
}