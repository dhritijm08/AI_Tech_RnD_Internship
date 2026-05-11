import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const TOTAL = 20;
const SHAPES = ["star", "hex", "plus", "x", "halfmoon", "triangle", "circle"];

function rand(min, max) { return min + Math.random() * (max - min); }

function generate() {
  // Use a 5x6 grid, shuffle cells, place one shape per cell with jitter
  const COLS = 5, ROWS = 6;
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({ r, c });
    }
  }
  // shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const COUNT = 22;
  const items = [];
  // Track how many yellow stars placed — guarantee at least 4
  let yellowCount = 0;
  const MIN_YELLOW = 4;

  for (let i = 0; i < COUNT; i++) {
    const { r, c } = cells[i];
    // Increase star probability slightly so there are more to tap
    const shape = Math.random() < 0.28 ? "star" : SHAPES.filter(s => s !== "star")[Math.floor(Math.random() * (SHAPES.length - 1))];
    const isStar = shape === "star";
    // Force yellow if we haven't hit minimum yet and running out of slots
    const remainingSlots = COUNT - i;
    const needYellow = MIN_YELLOW - yellowCount;
    const forceYellow = isStar && needYellow > 0 && needYellow >= remainingSlots;
    const yellow = isStar && (forceYellow || Math.random() < 0.65);
    if (yellow) yellowCount++;

    const x = (c / COLS) * 82 + 4 + rand(-3, 3);
    const y = (r / ROWS) * 82 + 4 + rand(-3, 3);
    items.push({
      id: `${Date.now()}-${i}-${Math.random()}`,
      shape,
      yellow,
      x: Math.max(2, Math.min(88, x)),
      y: Math.max(2, Math.min(88, y)),
      size: rand(36, 48),
    });
  }
  return items;
}

function ShapeIcon({ shape, color, fill }) {
  const stroke = color;
  const f = fill || "none";
  switch (shape) {
    case "star": return <svg viewBox="0 0 24 24" width="100%" height="100%"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={color} stroke="#0d2240" strokeWidth="0.5" /></svg>;
    case "hex": return <svg viewBox="0 0 24 24" width="100%" height="100%"><polygon points="6,3 18,3 22,12 18,21 6,21 2,12" fill={f} stroke={stroke} strokeWidth="2" /></svg>;
    case "plus": return <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M9 3h6v6h6v6h-6v6h-6v-6H3V9h6V3z" fill={color} /></svg>;
    case "x": return <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M5 3l7 7 7-7 2 2-7 7 7 7-2 2-7-7-7 7-2-2 7-7-7-7z" fill={color} /></svg>;
    case "halfmoon": return <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M2 14a10 10 0 0 0 20 0z" fill={color} /></svg>;
    case "triangle": return <svg viewBox="0 0 24 24" width="100%" height="100%"><polygon points="12,3 22,21 2,21" fill={f} stroke={stroke} strokeWidth="2" /></svg>;
    default: return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="10" fill={color} /></svg>;
  }
}

export default function TapStars({ onFinish }) {
  const [items, setItems] = useState(generate());
  const [tapped, setTapped] = useState(new Set());
  const [feedback, setFeedback] = useState({});
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const scoreRef = useRef(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t - 1 <= 0) {
          clearInterval(id);
          onFinishRef.current(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => { setItems(generate()); setTapped(new Set()); setFeedback({}); }, 4000);
    return () => clearInterval(id);
  }, []);

  const onTap = (it) => {
    if (tapped.has(it.id)) return;
    setTapped((s) => new Set([...s, it.id]));
    const isStar = it.shape === "star";
    setScore((s) => Math.max(0, s + (isStar ? 4 : -2)));
    if (!isStar) {
      setFeedback((f) => ({ ...f, [it.id]: "miss" }));
      setTimeout(() => setFeedback((f) => { const n = { ...f }; delete n[it.id]; return n; }), 500);
    }
  };

  return (
    <Frame tall>
      <style>{`
        @keyframes ts-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes ts-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .ts-miss { animation: ts-shake 0.4s ease; }
        .ts-hit  { animation: ts-pop 0.25s ease; }
      `}</style>
      <div
        className="relative z-10 flex flex-col p-5 sm:p-7"
        style={{ position: "absolute", inset: 0 }}
        data-testid="game-tap-stars"
      >
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">TAP ONLY <span className="inline-block">★</span> STARS</h1>
        <p className="text-center text-[#0d2240] text-xs tracking-widest">IGNORE OTHER SHAPES</p>
        <ScoreTimer score={score} time={time} />

        {/* Frosted-glass outer card */}
        <div
          style={{
            flex: 1,
            marginTop: 16,
            borderRadius: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "rgba(180,230,100,0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "3px solid rgba(255,255,255,0.75)",
            boxShadow: "0 8px 32px rgba(13,34,64,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
            padding: 14,
            minHeight: 0,
          }}
        >
          {/* Dark inner board */}
          <div style={{ flex: 1, borderRadius: 16, position: "relative", background: "#0d2240", overflow: "hidden" }}>
            {items.map((it) => {
              const isTapped = tapped.has(it.id);
              const isStar = it.shape === "star";
              const isMiss = feedback[it.id] === "miss";

              return (
                <div
                  key={it.id}
                  className={`absolute ${isMiss ? "ts-miss" : isTapped && isStar ? "ts-hit" : ""}`}
                  style={{
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                    width: it.size,
                    height: it.size,
                    cursor: isTapped ? "default" : "pointer",
                    pointerEvents: isTapped ? "none" : "auto",
                  }}
                  onClick={() => onTap(it)}
                  data-testid={`ts-item-${it.id}`}
                >
                  {isStar ? (
                    it.yellow ? (
                      isTapped ? (
                        /* Selected yellow star — faded */
                        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#f5c91a", padding: 5, opacity: 0.45 }}>
                          <ShapeIcon shape="star" color="#0d2240" />
                        </div>
                      ) : (
                        /* Unselected yellow star */
                        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#f5c91a", padding: 5 }}>
                          <ShapeIcon shape="star" color="#0d2240" />
                        </div>
                      )
                    ) : (
                      isTapped ? (
                        /* Selected grey star — faded */
                        <ShapeIcon shape="star" color="#7d8794" />
                      ) : (
                        /* Unselected grey star */
                        <ShapeIcon shape="star" color="#7d8794" />
                      )
                    )
                  ) : (
                    isMiss ? (
                      /* Wrong tap — red X flash */
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="100%" height="100%">
                          <line x1="5" y1="5" x2="19" y2="19" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                          <line x1="19" y1="5" x2="5" y2="19" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      /* Normal non-star */
                      <ShapeIcon shape={it.shape} color="#7d8794" fill="none" />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Frame>
  );
}
