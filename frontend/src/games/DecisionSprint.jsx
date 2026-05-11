import React, { useState, useEffect, useRef } from "react";
import Frame from "../components/Frame";
import ScoreTimer from "../components/ScoreTimer";

const TOTAL_TIME = 20;
const TOTAL_QUESTIONS = 12;

function nextNumber() { return 1 + Math.floor(Math.random() * 99); }

export default function DecisionSprint({ onFinish }) {
  const [num, setNum] = useState(nextNumber());
  const [askEven, setAskEven] = useState(true); // alternates each question
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [answered, setAnswered] = useState(0); // questions answered
  const [flash, setFlash] = useState(null); // 'right' | 'wrong' | null
  const scoreRef = useRef(0);
  const onFinishRef = useRef(onFinish);
  const doneRef = useRef(false);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        if (t - 1 <= 0) {
          clearInterval(id);
          if (!doneRef.current) {
            doneRef.current = true;
            onFinishRef.current(scoreRef.current);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const answer = (val) => {
    if (flash !== null) return; // debounce
    const correct = (num % 2 === 0) === (askEven ? val : !val);
    const newScore = Math.max(0, scoreRef.current + (correct ? 5 : -1));
    setScore(newScore);
    scoreRef.current = newScore;
    setFlash(correct ? "right" : "wrong");

    const newAnswered = answered + 1;
    setTimeout(() => {
      setFlash(null);
      setNum(nextNumber());
      setAskEven((e) => !e); // alternate question type
      setAnswered(newAnswered);
      if (newAnswered >= TOTAL_QUESTIONS && !doneRef.current) {
        doneRef.current = true;
        onFinishRef.current(scoreRef.current);
      }
    }, 250);
  };

  const progress = answered / TOTAL_QUESTIONS;

  return (
    <Frame tall>
      <div
        className="relative z-10 flex flex-col p-5 sm:p-7"
        style={{ position: "absolute", inset: 0, minHeight: 0 }}
        data-testid="game-decision-sprint"
      >
        <h1 className="font-display text-2xl sm:text-3xl text-center text-[#0d2240]">DECISION SPRINT</h1>
        <ScoreTimer score={score} time={time} />

        {/* Frosted-glass outer card */}
        <div
          style={{
            flex: 1,
            marginTop: 16,
            borderRadius: 24,
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            background: "rgba(200,232,106,0.28)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "2.5px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(13,34,64,0.22), inset 0 1px 0 rgba(255,255,255,0.5)",
            padding: 10,
            minHeight: 0,
          }}
        >
          {/* Dark inner board */}
          <div style={{ flex: 1, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", background: "#0d2240", minHeight: 0 }}>

            {/* Progress bar — tracks questions answered */}
            <div style={{ position: "relative", width: "100%", height: 12, borderRadius: 999, background: "rgba(255,255,255,0.1)", margin: "8px 0", flexShrink: 0 }}>
              <div style={{ height: 12, borderRadius: 999, width: `${progress * 100}%`, background: "linear-gradient(90deg,#c8e86a,#4ecbca,#6fc7e0)", transition: "width 0.3s ease" }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#3aa9e0", border: "2px solid #0d2240", position: "absolute", top: -4, left: `calc(${progress * 100}% - 10px)`, transition: "left 0.3s ease" }} />
            </div>

            {/* Question card — fixed height so buttons never get pushed out */}
            <div
              className={flash === "wrong" ? "shake" : ""}
              style={{ flex: 1, minHeight: 0, margin: "8px 0", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#bfe89c,#5cc5b5)" }}
            >
              <p className="font-display text-white text-sm sm:text-base tracking-widest">
                IS THIS NUMBER {askEven ? "EVEN" : "ODD"}?
              </p>
              <div className="font-display text-white text-7xl sm:text-8xl mt-2" data-testid="ds-number">{num}</div>
            </div>

            {/* Buttons — always visible at bottom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8, flexShrink: 0 }}>
              <button onClick={() => answer(true)} className="font-display text-white text-2xl tracking-wider" style={{ background: "#1f9a4a", borderRadius: 12, padding: "16px 0" }} data-testid="ds-true">TRUE</button>
              <button onClick={() => answer(false)} className="font-display text-white text-2xl tracking-wider" style={{ background: "#d6342f", borderRadius: 12, padding: "16px 0" }} data-testid="ds-false">FALSE</button>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

