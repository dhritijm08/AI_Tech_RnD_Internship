import React, { createContext, useContext, useState } from "react";

const AssessmentCtx = createContext(null);

export const useAssessment = () => useContext(AssessmentCtx);

export const GAMES = [
  { id: "reaction_pulse", title: "REACTION PULSE", subtitle: "" },
  { id: "pattern_recall", title: "PATTERN RECALL", subtitle: "Memorise The Grid" },
  { id: "rule_changed", title: "RULE CHANGED!", subtitle: "NOW TAP: SHAPES ONLY" },
  { id: "find_odd", title: "FIND THE ODD ONE", subtitle: "" },
  { id: "decision_sprint", title: "DECISION SPRINT", subtitle: "" },
  { id: "tap_stars", title: "TAP ONLY \u2605 STARS", subtitle: "IGNORE OTHER SHAPES" },
];

export function AssessmentProvider({ children }) {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState({
    pattern_recall: 0,
    rule_changed: 0,
    reaction_pulse: 0,
    decision_sprint: 0,
    tap_stars: 0,
    find_odd: 0,
  });
  const [gameIndex, setGameIndex] = useState(0);

  const setScore = (id, val) => setScores((s) => ({ ...s, [id]: val }));

  const reset = () => {
    setUser(null);
    setGameIndex(0);
    setScores({
      pattern_recall: 0, rule_changed: 0, reaction_pulse: 0,
      decision_sprint: 0, tap_stars: 0, find_odd: 0,
    });
  };

  return (
    <AssessmentCtx.Provider value={{ user, setUser, scores, setScore, gameIndex, setGameIndex, reset }}>
      {children}
    </AssessmentCtx.Provider>
  );
}
