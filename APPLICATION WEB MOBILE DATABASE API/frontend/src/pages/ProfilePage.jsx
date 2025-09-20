import { useContext, useEffect, useState } from "react";
import AuthContext from "../AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";
import "./pages.css";

// Profile page component
const profilePage = () => {
    const { user, logout, fetchUser } = useContext(AuthContext);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) setError("No user logged in.");
    }, [user]);
    
    if (error) {
        return (
            <div className="app-container">
                <header>
                    <img src="/logo.svg" alt="Logo" className="h-16" />
                </header>
                <div className="w-full max-w-md bg-neutral-800 p-6 rounded-lg shadow-md mt-[200px]">
                    <h2 className="text-3xl font-anton text-white text-center mb-6">Error</h2>
                    <p className="text-red-500 text-center">{error}</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="app-container">
            <header >
                <img src="/logo.svg" alt="Logo" className="h-16" />
            </header>

            <div className="w-full max-w-md bg-neutral-800 p-6 rounded-lg shadow-md mt-[200px]">
                <h2 className="text-3xl font-anton text-white text-center mb-6">PROFILE</h2>
                <div className="space-y-4 text-white">
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-left">
                            <span className="text-purple-400">👤</span> Username:
                        </span>
                        <span className="bg-neutral-700 px-4 py-1 rounded text-right font-semibold">
                            {user.username}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-left">
                            <span className="text-blue-400">📧</span> Email:
                        </span>
                        <span className="bg-neutral-700 px-4 py-1 rounded text-right font-semibold">
                            {user.email}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-left">
                            <span className="text-indigo-400">🎮</span> Games Played:
                        </span>
                        <span className="bg-neutral-700 px-4 py-1 rounded text-right font-semibold">
                            {user.games_played}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-left">
                            <span className="text-yellow-400">🏆</span> Games Won:
                        </span>
                        <span className="bg-neutral-700 px-4 py-1 rounded text-right font-semibold">
                            {user.games_won}
                        </span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={logout}
                        className="cursor-pointer mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>


            <BottomNav />
        </div>
    );
};

export default profilePage;