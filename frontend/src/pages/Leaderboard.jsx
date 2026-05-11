import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LOGOS } from "../lib/logos";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/leaderboard?limit=10`).then((r) => {
      setRows(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#0d2240", minHeight: "100vh" }}>
      <div className="max-w-[640px] mx-auto p-5 sm:p-6" data-testid="leaderboard-screen">
        <button onClick={() => navigate(-1)} className="text-white/80 text-sm mb-3" data-testid="lb-back">← Back</button>

        {/* Lime→teal gradient header pill */}
        <div className="rounded-3xl p-1" style={{ background: "linear-gradient(90deg,#c8e86a 0%,#4ecbca 60%,#6fc7e0 100%)" }}>
          <h1 className="font-display text-2xl sm:text-3xl text-center text-white py-3 tracking-widest">LEADERBOARD</h1>
        </div>

        <div className="mt-4 space-y-3" data-testid="lb-list">
          {loading && <p className="text-white/70 text-center">Loading…</p>}
          {!loading && rows.length === 0 && <p className="text-white/70 text-center">No scores yet — be the first!</p>}
          {rows.map((r, i) => (
            <div
              key={`${r.score}-${r.name}-${i}`}
              className="rounded-full bg-[#eef0d6] flex items-center justify-between px-3 sm:px-4 py-3"
              data-testid={`lb-row-${i}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #e8f5a0, #a8d840 50%, #7ab020)",
                    boxShadow: "0 0 0 3px #6a9a18, inset 0 -3px 6px rgba(0,0,0,0.2)",
                  }}
                />
                <span className="font-display text-lg sm:text-xl tracking-wide" style={{ color: "#0d2240" }}>{r.name}</span>
              </div>
              <span className="font-display text-xl sm:text-2xl pr-3" style={{ color: "#0d2240" }}>{r.score}</span>
            </div>
          ))}

          {/* Empty placeholder rows like the reference image */}
          {!loading && Array.from({ length: Math.max(0, 4 - Math.max(0, rows.length - 6)) }).map((_, i) => (
            <div key={`empty-${i}`} className="rounded-full h-14" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>

        <img src={LOGOS.cignaXEosWhite} alt="" className="w-[200px] mx-auto mt-6 opacity-90" />
      </div>
    </div>
  );
}
