import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const TOTAL = 20;
const ROWS = 5, COLS = 5;

function chooseOdd() { return Math.floor(Math.random() * (ROWS * COLS)); }

function Star({ outline }) {
  if (outline) {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c8e86a" />
            <stop offset="1" stopColor="#4ecbca" />
          </linearGradient>
        </defs>
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#fff" stroke="url(#sg)" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#fff" />
    </svg>
  );
}

export default function FindOdd({ onFinish }) {
  const [oddIdx, setOddIdx] = useState(chooseOdd());
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [wrongIdx, setWrongIdx] = useState(null);
  const scoreRef = useRef(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t - 1 <= 0) { clearInterval(id); onFinishRef.current(scoreRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const onPick = (i) => {
    if (i === oddIdx) {
      setScore((s) => s + 8);
      setOddIdx(chooseOdd());
    } else {
      setScore((s) => Math.max(0, s - 2));
      setWrongIdx(i);
      setTimeout(() => setWrongIdx(null), 400);
    }
  };

  return (
    <Frame tall>
      <style>{`
        @keyframes fo-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .fo-wrong { animation: fo-shake 0.35s ease; }
      `}</style>

      <div className="relative z-10 h-full w-full flex flex-col p-5 sm:p-7" data-testid="game-find-odd">
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">FIND THE ODD ONE</h1>
        <ScoreTimer score={score} time={time} />

        {/* Frosted-glass outer card */}
        <div style={{ flex: 1, marginTop: 16, borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(180,230,100,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "3px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px rgba(13,34,64,0.22), inset 0 1px 0 rgba(255,255,255,0.5)", padding: 14, minHeight: 0 }}>
          {/* Dark inner board */}
          <div className="flex-1 rounded-2xl p-3 sm:p-4 overflow-hidden" style={{ background: "#0d2240" }}>
            <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS}, minmax(0,1fr))`, gap: 2 }}>
              {Array.from({ length: ROWS * COLS }).map((_, i) => (
                <button key={i} className={`flex items-center justify-center min-w-0 min-h-0 ${wrongIdx === i ? "fo-wrong" : ""}`} style={{ background: "none", border: "none", outline: "none", cursor: "pointer", padding: 0 }} onClick={() => onPick(i)} data-testid={`fo-cell-${i}`}>
                  <Star outline={i === oddIdx} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
