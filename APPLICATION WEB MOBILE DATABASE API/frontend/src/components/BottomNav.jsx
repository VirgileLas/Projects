import { Home, Book, PencilRuler, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// Composant pour la navigation en bas de page
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/");

  // Pour que le button soit actif sur les 2 pages
  useEffect(() => {
    setActiveTab(location.pathname.startsWith("/auth") ? "/profile" : location.pathname);
  }, [location]);

  function buttonColor(activeTab, path) {
    const base = "p-3 mx-3 cursor-pointer rounded-full flex items-center justify-center";
    const active = "bg-white text-black";
    const inactive = "text-white";

    return activeTab === path ? `${base} ${active}` : `${base} ${inactive}`;
}

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-black text-white px-4 py-2 rounded-full shadow-lg">
      <button className={buttonColor(location.pathname, "/")} onClick={() => navigate("/")}>
        <Home size={24} />
      </button>
      <button className={buttonColor(location.pathname, "/Leaderboard")} onClick={() => navigate("/Leaderboard")}>
        <Trophy size={24} />
      </button>
      <button className={buttonColor(location.pathname, "/Creator")} onClick={() => navigate("/Creator")}>
        <PencilRuler size={24} />
      </button>
      <button className={buttonColor(activeTab, "/profile")} onClick={() => navigate("/Profile")}>
        <Book size={24} />
      </button>
    </div>
  );
}
