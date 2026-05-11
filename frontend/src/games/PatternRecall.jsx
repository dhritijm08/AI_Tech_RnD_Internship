import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const ROUNDS = 5;
const GRID = 16; // 4x4

function randomPattern(count) {
  const set = new Set();
  while (set.size < count) set.add(Math.floor(Math.random() * GRID));
  return [...set];
}

export default function PatternRecall({ onFinish }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("memorise");
  const [pattern, setPattern] = useState(() => randomPattern(8));
  const [picks, setPicks] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const tickRef = useRef();

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t - 1 <= 0) { clearInterval(id); onFinish(score); return 0; }
        return t - 1;
      });
    }, 1000);
    tickRef.current = id;
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== "memorise") return undefined;
    const id = setTimeout(() => setPhase("recall"), 4000);
    return () => clearTimeout(id);
  }, [phase, round]);

  const startNextRound = () => {
    if (round >= ROUNDS) { clearInterval(tickRef.current); onFinish(score); return; }
    const nextSize = 4 + round;
    setPattern(randomPattern(Math.min(nextSize, 8)));
    setPicks([]);
    setRound((r) => r + 1);
    setPhase("memorise");
  };

  const submit = () => {
    const correct = picks.filter((p) => pattern.includes(p)).length;
    const wrong = picks.length - correct;
    const gained = Math.max(0, correct * 2 - wrong);
    setScore((s) => s + gained);
    startNextRound();
  };

  const togglePick = (i) => {
    if (phase !== "recall") return;
    setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };

  return (
    <Frame tall>
      <div className="relative z-10 h-full w-full flex flex-col p-5 sm:p-7" data-testid="game-pattern-recall">
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">PATTERN RECALL</h1>
        <p className="text-center text-[#0d2240] text-sm">Memorise The Grid</p>
        <ScoreTimer score={score} time={time} />

        {/* Frosted-glass outer card */}
        <div style={{ flex: 1, marginTop: 16, borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(180,230,100,0.45)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "3px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px rgba(13,34,64,0.22), inset 0 1px 0 rgba(255,255,255,0.5)", padding: 14, minHeight: 0 }}>
          {/* Dark inner board */}
          <div className="flex-1 rounded-2xl p-4 sm:p-6" style={{ background: "#0d2240" }}>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {Array.from({ length: GRID }).map((_, i) => {
                const lit = phase === "memorise" && pattern.includes(i);
                const selected = phase === "recall" && picks.includes(i);
                return (
                  <div
                    key={i}
                    className={`eos-tile ${lit ? "lit" : ""} ${selected ? "lit selected" : ""}`}
                    onClick={() => togglePick(i)}
                    data-testid={`pr-tile-${i}`}
                  />
                );
              })}
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: ROUNDS }).map((_, i) => (
                <span key={i} className="w-3 h-3 rounded-full" style={{ background: i < round ? "#4ecbca" : "#0a1a30" }} />
              ))}
            </div>
            <p className="text-white text-center mt-2 text-sm">Round {round} of {ROUNDS}</p>

            <button
              className="eos-btn-white w-full mt-3"
              onClick={phase === "memorise" ? () => setPhase("recall") : submit}
              data-testid="pr-action-btn"
            >
              {phase === "memorise" ? "TAP TO RECALL" : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
