import React from "react";

export default function ScoreTimer({ score = 0, time = 0 }) {
  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");
  return (
    <div className="flex justify-center gap-3 mt-3" data-testid="score-timer-bar">
      <span className="eos-pill" data-testid="score-pill">Score :{score}</span>
      <span className="eos-pill" data-testid="time-pill">Time : {mm}:{ss}</span>
    </div>
  );
}
