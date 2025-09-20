import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import request from "../components/API.js"; // ou où est ta fonction
import GameBoardType1 from "../components/GameBoardType1.jsx";
import GameBoardType2 from "../components/GameBoardType2.jsx";
import BottomNav from "../components/BottomNav.jsx";
import "./pages.css";

function GamePage() {
  const { gameTypeId } = useParams();
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      const data = await request("template_info/" + gameTypeId);
      setTemplateId(data.template_id);
      setLoading(false);
    }
    fetchTemplate();
  }, [gameTypeId]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="app-container">
      <header>
        <img src="/logo.svg" alt="Logo" style={{ height: "60px", width: "auto", background: "transparent" }} />
      </header>
      <main>
        {templateId === 1 && <GameBoardType1 gameTypeId={parseInt(gameTypeId)} />}
        {templateId === 2 && <GameBoardType2 gameTypeId={parseInt(gameTypeId)} />}
        {!([1, 2].includes(templateId)) && <p>Type de jeu inconnu.</p>}
        {console.log("Template ID:", templateId)} //debug
      </main>
      <BottomNav />
    </div>
  );
}

export default GamePage;
