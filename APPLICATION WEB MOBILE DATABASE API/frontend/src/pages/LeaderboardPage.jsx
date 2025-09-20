import { useState, useEffect } from "react";
import request from "../components/API.js";
import BottomNav from "../components/BottomNav.jsx";
import "./pages.css";

function LeaderboardPage() {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const data = await request("leaderboard");
            if (data.success) {
                setLeaders(data.leaderboard);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="app-container">
            <header>
                <img src="/logo.svg" alt="Logo" style={{ height: "60px", width: "auto", background: "transparent" }} />
            </header>

            <main>
                <div className="mt-[200px] flex flex-col items-center justify-center">

                    <h2 className="text-white font-bold text-3xl">Leaderboard 🏆</h2>

                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Games Won</th>
                                <th>Games Played</th>
                                <th>Win Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((player, index) => (
                                <tr key={player.username}>
                                    <td>{index + 1}</td>
                                    <td>{player.username}</td>
                                    <td>{player.games_won}</td>
                                    <td>{player.games_played}</td>
                                    <td>
                                        {Number.isNaN(player.games_won / player.games_played)
                                            ? 0
                                            : ((player.games_won / player.games_played) * 100).toFixed(1)}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}

export default LeaderboardPage;