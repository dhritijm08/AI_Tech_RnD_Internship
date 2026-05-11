import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const TOTAL = 20;
const COLORS = [
  { bg: "radial-gradient(circle, #2a78ff, #0d2a7a)", ring: "#3a9bff" },
  { bg: "radial-gradient(circle, #e9b350, #6d4811)", ring: "#ffb84d" },
  { bg: "radial-gradient(circle, #19a86b, #0a3a23)", ring: "#33d28b" },
  { bg: "radial-gradient(circle, #d63a7a, #4a0d2a)", ring: "#ff66a3" },
  { bg: "radial-gradient(circle, #2a78ff, #0d2a7a)", ring: "#c8e86a" },
];

const GAME_W = 750;
const GAME_H = 900;
const MIN_PX = 150;

function generate() {
  const arr = [];
  let attempts = 0;
  while (arr.length < 14 && attempts < 800) {
    attempts++;
    const x = 10 + Math.random() * 78;
    const y = 8 + Math.random() * 80;
    const px = (x / 100) * GAME_W;
    const py = (y / 100) * GAME_H;
    const tooClose = arr.some((b) => {
      const dx = (b.x / 100) * GAME_W - px;
      const dy = (b.y / 100) * GAME_H - py;
      return Math.sqrt(dx * dx + dy * dy) < MIN_PX;
    });
    if (tooClose) continue;
    arr.push({
      id: `${Date.now()}-${arr.length}-${Math.random()}`,
      x,
      y,
      filled: arr.length < 7,
      color: COLORS[arr.length % COLORS.length],
    });
  }
  return arr;
}

export default function ReactionPulse({ onFinish }) {
  const [bubbles, setBubbles] = useState(generate());
  const [tapped, setTapped] = useState(new Set());
  const [flashing, setFlashing] = useState({});
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
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

  useEffect(() => {
    const id = setInterval(() => { setBubbles(generate()); setTapped(new Set()); setFlashing({}); }, 3000);
    return () => clearInterval(id);
  }, []);

  const tap = (b) => {
    if (tapped.has(b.id)) return;
    setTapped((s) => new Set([...s, b.id]));
    setScore((sc) => Math.max(0, sc + (b.filled ? 4 : -2)));
    const type = b.filled ? "hit" : "miss";
    setFlashing((f) => ({ ...f, [b.id]: type }));
    setTimeout(() => setFlashing((f) => { const n = { ...f }; delete n[b.id]; return n; }), 350);
  };

  return (
    <Frame tall>
      <div className="relative z-10 h-full w-full flex flex-col p-5 sm:p-7" data-testid="game-reaction-pulse">
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">REACTION PULSE</h1>
        <ScoreTimer score={score} time={time} />

        {/* Frosted-glass outer card */}
        <div style={{
          flex: 1,
          marginTop: 16,
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          background: "rgba(180,230,100,0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "3px solid rgba(255,255,255,0.75)",
          boxShadow: "0 8px 32px rgba(13,34,64,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
          padding: 14,
          minHeight: 0,
        }}>
          {/* Dark inner board */}
          <div style={{ flex: 1, borderRadius: 16, position: "relative", background: "#0d2240", overflow: "hidden" }}>
            {bubbles.map((b) => {
              const isTapped = tapped.has(b.id);
              const flash = flashing[b.id];
              return (
                <div
                  key={b.id}
                  onClick={() => tap(b)}
                  className={`eos-bubble ${b.filled ? "" : "empty"}`}
                  style={{
                    position: "absolute",
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    background: b.filled
                      ? (flash === "hit" ? "radial-gradient(circle, #ffffff, #aaffaa)" : isTapped ? "rgba(255,255,255,0.15)" : b.color.bg)
                      : "transparent",
                    border: b.filled
                      ? (flash === "miss" ? "3px solid #ff4444" : "none")
                      : `2.5px solid ${flash === "miss" ? "#ff4444" : b.color.ring}`,
                    boxShadow: b.filled
                      ? flash === "hit"
                        ? "0 0 30px #ffffff, 0 0 15px #88ff88"
                        : flash === "miss"
                        ? "0 0 20px #ff4444"
                        : `0 0 20px ${b.color.ring}, 0 0 8px ${b.color.ring}cc`
                      : "none",
                    transform: `translate(-50%, -50%) scale(${flash ? (flash === "hit" ? 1.25 : 0.85) : 1})`,
                    transition: flash ? "transform 0.15s ease, box-shadow 0.15s ease" : "transform 0.2s ease",
                    opacity: isTapped && !flash ? 0.35 : 1,
                    pointerEvents: isTapped ? "none" : "auto",
                  }}
                  data-testid={`rp-bubble-${b.id}`}
                >
                  {b.filled ? (flash === "hit" ? "✓" : "TAP") : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Frame>
  );
}
