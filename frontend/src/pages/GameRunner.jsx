import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAssessment, GAMES } from "../context/AssessmentContext";
import PatternRecall from "../games/PatternRecall";
import RuleChanged from "../games/RuleChanged";
import ReactionPulse from "../games/ReactionPulse";
import DecisionSprint from "../games/DecisionSprint";
import TapStars from "../games/TapStars";
import FindOdd from "../games/FindOdd";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GameRunner() {
  const navigate = useNavigate();
  const { user, scores, setScore, gameIndex, setGameIndex } = useAssessment();
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!user) navigate("/register");
  }, [user, navigate]);

  const onFinishGame = (rawScore) => {
    const id = GAMES[gameIndex].id;
    setScore(id, rawScore);
    if (gameIndex + 1 < GAMES.length) {
      setGameIndex(gameIndex + 1);
    } else {
      // submit
      if (submittingRef.current) return;
      submittingRef.current = true;
      const finalScores = { ...scores, [id]: rawScore };
      navigate("/calculating");
      setTimeout(async () => {
        try {
          const { data } = await axios.post(`${API}/sessions`, {
            user_id: user.id,
            scores: finalScores,
          });
          navigate(`/qr/${data.id}`);
        } catch (e) {
          console.error(e);
          alert("Could not save your session.");
        }
      }, 2200);
      setSubmitted(true);
    }
  };

  if (!user || submitted) return null;

  const id = GAMES[gameIndex].id;
  const props = { onFinish: onFinishGame, key: id };
  switch (id) {
    case "pattern_recall": return <PatternRecall {...props} />;
    case "rule_changed": return <RuleChanged {...props} />;
    case "reaction_pulse": return <ReactionPulse {...props} />;
    case "decision_sprint": return <DecisionSprint {...props} />;
    case "tap_stars": return <TapStars {...props} />;
    case "find_odd": return <FindOdd {...props} />;
    default: return null;
  }
}
