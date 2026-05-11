import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LOGOS } from "../lib/logos";
import { Facebook, Instagram, Twitter } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MiniDonut({ score }) {
  const pct = score / 100;
  const C = 2 * Math.PI * 42;
  const dash = pct * C;
  return (
    <svg viewBox="0 0 100 100" width="220" height="220">
      <defs>
        <linearGradient id="md" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8e86a" /><stop offset="0.5" stopColor="#4ecbca" /><stop offset="1" stopColor="#6fc7e0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#0d2240" strokeWidth="12" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#md)" strokeWidth="12" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={C * 0.25} transform="rotate(-90 50 50)" />
      <circle cx="50" cy="50" r="30" fill="white" />
      <text x="50" y="50" textAnchor="middle" fontSize="22" fontFamily="Archivo Black" fill="#5cb85c" dominantBaseline="middle">{score}</text>
      <text x="50" y="63" textAnchor="middle" fontSize="6" fill="#5cb85c">/100</text>
    </svg>
  );
}

export default function Share() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/sessions/${sessionId}`).then((r) => setData(r.data));
  }, [sessionId]);

  const url = `${window.location.origin}/results/${sessionId}`;
  const text = data ? `I scored ${data.total_score}/100 on the Echoes of Silence Cognitive Assessment! Try it.` : "";

  const shareTo = (platform) => {
    let target = "";
    if (platform === "twitter") target = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    if (platform === "facebook") target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === "instagram") { navigator.clipboard.writeText(url); alert("Link copied — paste on Instagram!"); return; }
    window.open(target, "_blank");
  };

  if (!data) return null;

  return (
    <div style={{ background: "#0d2240", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto p-6 sm:p-8 text-center">
        <h1 className="font-display text-white text-3xl sm:text-4xl mt-4" data-testid="share-title">SHARE & COMPETE</h1>
        <p className="text-white tracking-widest mt-1 text-sm">COME BACK TO BEAT YOUR SCORE!</p>

        {/* Card with lime border matching Results page */}
        <div className="mt-6 p-1" style={{ background: "linear-gradient(180deg, #c8e86a 0%, #4ecbca 100%)" }}>
          <div className="p-2 pb-4 flex flex-col items-center" style={{ background: "linear-gradient(160deg, #f0faf0 0%, #e0f5f0 50%, #d0f0f8 100%)" }}>
            <img src={LOGOS.cignaXEos} alt="Cigna x Echoes of Silence" className="w-[280px]" />
            <div className="-mt-3"><MiniDonut score={data.total_score} /></div>
            <h2 className="font-display text-xl mt-3" style={{ color: "#5cb85c" }}>COGNITIVE ASSESSMENT</h2>
            <p className="text-[#0d2240] text-sm">Insights today, better tomorrow.</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => shareTo("facebook")} className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{ background: "#3b5998" }} data-testid="share-fb"><Facebook /></button>
          <button onClick={() => shareTo("instagram")} className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)" }} data-testid="share-ig"><Instagram /></button>
          <button onClick={() => shareTo("twitter")} className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{ background: "#1da1f2" }} data-testid="share-tw"><Twitter /></button>
        </div>

        <button className="eos-btn-gradient mt-6 w-full max-w-[420px]" onClick={() => shareTo("twitter")} data-testid="share-cta">
          SHARE MY SCORE
        </button>
      </div>
    </div>
  );
}
