import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const TOTAL_TIME = 20;
const RULE_INTERVAL = 6000;
const RULES = ["shape", "number"];

function makeGrid() {
  const pool = [];
  for (let i = 0; i < 4; i++)
    pool.push({ type: "shape", icon: i % 2 === 0 ? "triangle" : "dot" });
  for (let i = 0; i < 5; i++)
    pool.push({ type: "number", value: 5 + Math.floor(Math.random() * 5) });
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function cellLabel(cell) {
  if (cell.type === "number") return cell.value;
  return cell.icon === "triangle" ? "▲" : "●";
}

export default function RuleChanged({ onFinish }) {
  const [cells, setCells] = useState(makeGrid());
  const [tappedSet, setTappedSet] = useState(new Set());
  const [wrongSet, setWrongSet] = useState(new Set());
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [ruleFlash, setRuleFlash] = useState(false);
  const scoreRef = useRef(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Countdown timer
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

  // Every 6s: switch rule AND reshuffle grid
  useEffect(() => {
    const id = setInterval(() => {
      setCells(makeGrid());
      setTappedSet(new Set());
      setWrongSet(new Set());
      setRuleIndex((r) => (r + 1) % RULES.length);
      setRuleFlash(true);
      setTimeout(() => setRuleFlash(false), 600);
    }, RULE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const currentRule = RULES[ruleIndex];

  const onTap = (i) => {
    if (tappedSet.has(i)) return;
    const cell = cells[i];
    const correct = cell.type === currentRule;
    const newTapped = new Set([...tappedSet, i]);
    setTappedSet(newTapped);
    if (!correct) {
      setWrongSet((s) => new Set([...s, i]));
      setTimeout(() => {
        setWrongSet((s) => { const n = new Set(s); n.delete(i); return n; });
      }, 600);
    }
    setScore((sc) => Math.max(0, sc + (correct ? 5 : -2)));

    // If all 9 cells tapped, reshuffle immediately
    if (newTapped.size >= cells.length) {
      setTimeout(() => {
        setCells(makeGrid());
        setTappedSet(new Set());
        setWrongSet(new Set());
      }, 300);
    }
  };

  const SHAPE_COLORS = [
    "linear-gradient(135deg, #3aa9e0, #1a6fa0)",
    "linear-gradient(135deg, #5de0a0, #0fa18a)",
    "linear-gradient(135deg, #8ae05d, #4caf20)",
    "linear-gradient(135deg, #f07060, #c03040)",
  ];
  const NUMBER_COLORS = [
    "linear-gradient(135deg, #8ae05d, #4caf20)",
    "linear-gradient(135deg, #f07060, #c03040)",
    "linear-gradient(135deg, #5de0a0, #0fa18a)",
  ];

  const colorFor = (cell, i) => {
    if (cell.type === "shape") return { bg: SHAPE_COLORS[i % SHAPE_COLORS.length] };
    return { bg: NUMBER_COLORS[i % NUMBER_COLORS.length] };
  };

  const ruleLabel = currentRule === "shape" ? "SHAPES ONLY" : "NUMBERS ONLY";

  return (
    <Frame tall>
      {/* Shake keyframe injected once */}
      <style>{`
        @keyframes rc-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .rc-wrong { animation: rc-shake 0.4s ease; }
      `}</style>

      <div className="relative z-10 h-full w-full flex flex-col p-5 sm:p-7" data-testid="game-rule-changed">
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">RULE CHANGED!</h1>
        <p
          className="text-center text-xs tracking-widest font-bold"
          style={{
            color: ruleFlash ? "#e53e3e" : "#0d2240",
            transform: ruleFlash ? "scale(1.12)" : "scale(1)",
            transition: "color 0.3s, transform 0.3s",
          }}
        >
          NOW TAP: {ruleLabel}
        </p>
        <ScoreTimer score={score} time={time} />

        <div className="flex-1 mt-4 rounded-2xl p-5 sm:p-7" style={{ background: "#0d2240" }}>
          <div className="grid grid-cols-3 gap-y-6 place-items-center h-full">
            {cells.map((c, i) => {
              const col = colorFor(c, i);
              const correct = tappedSet.has(i) && cells[i].type === currentRule;
              const isWrong = wrongSet.has(i);
              return (
                <div
                  key={i}
                  className={isWrong ? "rc-wrong" : ""}
                  style={{
                    width: 118,
                    height: 118,
                    borderRadius: "50%",
                    border: correct ? "4px solid #ffffff" : "4px solid transparent",
                    background: "#0d2240",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border 0.15s",
                    padding: 4,
                  }}
                >
                  <button
                    onClick={() => onTap(i)}
                    data-testid={`rc-cell-${i}`}
                    style={{
                      background: col.bg,
                      width: 106,
                      height: 106,
                      borderRadius: "50%",
                      border: "none",
                      outline: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Archivo Black', sans-serif",
                      color: "#fff",
                      fontSize: c.type === "number" ? 28 : 24,
                      cursor: tappedSet.has(i) ? "default" : "pointer",
                      opacity: 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {cellLabel(c)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Frame>
  );
}
