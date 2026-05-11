import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AssessmentProvider } from "./context/AssessmentContext";
import Welcome from "./pages/Welcome";
import Splash from "./pages/Splash";
import GameRunner from "./pages/GameRunner";
import Calculating from "./pages/Calculating";
import QrCodePage from "./pages/QrCodePage";
import Results from "./pages/Results";
import Share from "./pages/Share";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AssessmentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/register" element={<Welcome />} />
          <Route path="/game" element={<GameRunner />} />
          <Route path="/calculating" element={<Calculating />} />
          <Route path="/qr/:sessionId" element={<QrCodePage />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/share/:sessionId" element={<Share />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AssessmentProvider>
  );
}
