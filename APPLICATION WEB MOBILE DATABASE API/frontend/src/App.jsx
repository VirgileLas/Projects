import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GamePage from "./pages/GamePage.jsx";  // Import the home page
import HomePage from "./pages/HomePage.jsx";  // Import the home page
import ProfilePage from "./pages/ProfilePage.jsx";  // Import the home page
import AuthPage from "./pages/AuthPage.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CreatorPage from "./pages/CreatorPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/game/:gameTypeId" element={<GamePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<ProfilePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
